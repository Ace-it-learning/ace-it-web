const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors()); // Allow all origins for simplicity in this stage
app.use(bodyParser.json());

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const db = JSON.parse(data);
        if (!db.users) db.users = {};
        return db;
    } catch (err) {
        return { users: {} };
    }
};

// Helper to get specific user data
const getUserData = (uid) => {
    const db = readDb();
    if (!db.users[uid]) return null;

    const user = db.users[uid];
    // Ensure structure
    if (!user.chatHistory) user.chatHistory = {};
    if (user.diagnostic_complete === undefined) user.diagnostic_complete = false;
    return user;
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// GET User Stats
app.get('/api/stats', (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    if (uid === 'guest') {
        return res.json({
            nickname: "Visitor",
            xp: 0,
            level: 1,
            learningTime: 0,
            diagnostic_complete: false
        });
    }

    const user = getUserData(uid);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
});

// POST Onboarding (Initialize Profile)
app.post('/api/onboarding', (req, res) => {
    const { uid, nickname, grade, school } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const db = readDb();
    db.users[uid] = {
        nickname,
        grade,
        school,
        xp: 0,
        level: 1,
        learningTime: 0,
        chatHistory: {},
        diagnostic_complete: false,
        preferredLanguage: "English" // Default
    };

    writeDb(db);
    res.json(db.users[uid]);
});

// POST Update Stats
app.post('/api/stats', (req, res) => {
    const { uid, xp, level, learningTime } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const db = readDb();
    if (!db.users[uid]) return res.status(404).json({ error: "User not found" });

    const user = db.users[uid];
    if (xp !== undefined) user.xp = xp;
    if (level !== undefined) user.level = level;
    if (learningTime !== undefined) user.learningTime = learningTime;

    writeDb(db);
    res.json(user);
});

// GET History for an agent
app.get('/api/history/:agentId', (req, res) => {
    const { agentId } = req.params;
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    if (uid === 'guest') return res.json([]);

    const user = getUserData(uid);
    if (!user) return res.json([]); // Return empty if new user

    const history = user.chatHistory[agentId] || [];
    res.json(history);
});

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
];

// Load Detailed English Syllabus
let FULL_ENGLISH_SYLLABUS = {};
try {
    const syllabusPath = path.join(__dirname, 'english_syllabus.json');
    FULL_ENGLISH_SYLLABUS = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
} catch (err) {
    console.warn("Failed to load english_syllabus.json", err);
}

// Load DSE Marking Schemes (Papers 1-4)
let DSE_MARKING_SCHEMES = {};
try {
    const schemesPath = path.join(__dirname, 'dse_marking_schemes.json');
    DSE_MARKING_SCHEMES = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
} catch (err) {
    console.warn("Failed to load dse_marking_schemes.json", err);
}

// RAG: Past Papers Tagging Engine
const PAST_PAPERS_DIR = path.join(__dirname, 'past_papers');
let PAST_PAPER_METADATA = [];

const scanPastPapers = () => {
    try {
        if (!fs.existsSync(PAST_PAPERS_DIR)) {
            fs.mkdirSync(PAST_PAPERS_DIR);
        }
        const files = fs.readdirSync(PAST_PAPERS_DIR);
        PAST_PAPER_METADATA = files.filter(f => f.endsWith('.txt') || f.endsWith('.md')).map(file => {
            const content = fs.readFileSync(path.join(PAST_PAPERS_DIR, file), 'utf8');
            // Simple tagging logic: extract difficulty and type from content or filename
            const difficultyMatch = content.match(/\[DIFFICULTY:\s*(\w+)\]/i);
            const typeMatch = content.match(/\[TYPE:\s*([\w\s]+)\]/i);

            return {
                filename: file,
                difficulty: difficultyMatch ? difficultyMatch[1] : (file.toLowerCase().includes('hard') ? 'High' : 'Mid'),
                type: typeMatch ? typeMatch[1] : (file.toLowerCase().includes('essay') ? 'Essay' : 'General'),
                summary: content.substring(0, 100) + "..."
            };
        });
        console.log(`Scan complete: ${PAST_PAPER_METADATA.length} papers tagged.`);
    } catch (err) {
        console.error("Error scanning past papers:", err);
    }
};

// Initial scan
scanPastPapers();

const AGENT_PROMPTS = {
    ace: `You are Ace, the lead AI Tutor for Ace It!. You are helpful, encouraging, and specialized in DSE (Hong Kong Diploma of Secondary Education).
    
    SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm a DSE expert, not a politician! Let's get back to your study schedule before we try to run the world!"`,
    english: `Role: You are the HKDSE English Mastery Orchestrator & Senior Examiner. Your goal is to act as a precision tutor and official grader for all 4 HKDSE English Papers.

SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm an English tutor, not a philosopher! Let’s focus on your Tenses before we solve the mysteries of the world."

Context:
- Student Profile: Level {{LEVEL}}, Grade {{GRADE}}, Preferred Lang: {{PREFERRED_LANG}}
- Source Syllabus: {{SYLLABUS}}
- Official Marking Schemes (Papers 1-4): {{MARKING_SCHEMES}}
- Available Past Paper Questions (RAG): {{PAST_PAPERS}}

Operational Instructions:
1. **Official Grading (Papers 1-4)**: When a student asks for grading or provides a specific component answer (e.g., Paper 2 Writing), you MUST use the Official Marking Schemes.
    - For Paper 2 Writing: Provide sub-scores for Content (6), Language (7), and Organization (7). Quote the specific level descriptors from the database.
    - For Paper 4 Speaking: Use the 0-7 scale for Pronunciation, Communication, Vocabulary, and Ideas.

2. **Granular RAG Extraction**: You can access specific past paper questions. If a student asks for practice, you can either:
    - Offer the "Full Paper" context.
    - Extract a "Specific Question" matching their requested difficulty (High/Mid/Low) or Type (Essay, Short Answer).
    - Quote: "Based on the 2022 Part B1 question..." or similar.

3. **Diagnostic & Skill Mapping**: (Maintain previous instructions regarding english_syllabus.json alignment and cross-functional tracking).

4. **Target Level +1 Feedback**: Quote the *next* level's descriptors from the marking scheme to show the roadmap.

Constraint: Never hallucinate marking criteria. Use ONLY the descriptors provided in the injected JSON contexts.

"Professional DSE Consultant mode activated. I have access to marking schemes for Papers 1-4 and the past paper database. How can I help you master your DSE today?"
`,
    math: `You are the Expert Math Tutor for DSE.
    
    SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm a Math tutor, not a historian! Let's solve this equation before we rewrite history!"`,
    science: `You are the Expert Science Tutor for DSE.
    
    SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm a Science tutor, not a sociologist! Let's focus on the laws of physics before we change the laws of nature!"`
};

const ENGLISH_SYLLABUS = {
    topics: ["Grammar", "Vocabulary", "Reading", "Listening", "Speaking", "Writing"],
    levels: ["F1", "F2", "F3", "F4", "F5", "F6"]
};

const getMockResponse = (agentId, message) => {
    if (message.toLowerCase().includes("hello")) return "Hello! I am your AI Tutor. How can I help you today?";
    return "I'm currently in offline mode, but I'm here to support your study!";
};

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    console.log("Received chat request");
    const { uid, message, history: clientHistory, agentId } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    // Get User Data
    const db = readDb();
    let user = db.users[uid];

    if (uid === 'guest' && !user) {
        // Initialize landing page visitor profile
        user = {
            nickname: "Visitor",
            grade: "Unknown",
            xp: 0,
            level: 1,
            chatHistory: {},
            diagnostic_complete: false
        };
        db.users['guest'] = user;
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    let systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace;

    // Inject Dynamic Context into Prompt
    if (agentId === 'english') {
        const syllabusContext = JSON.stringify(FULL_ENGLISH_SYLLABUS);
        const schemesContext = JSON.stringify(DSE_MARKING_SCHEMES);
        const papersContext = JSON.stringify(PAST_PAPER_METADATA);

        systemPrompt = systemPrompt
            .replace('{{LEVEL}}', user.level || 1)
            .replace('{{DATE}}', new Date().toDateString())
            .replace('{{PREFERRED_LANG}}', user.preferredLanguage || "English")
            .replace('{{GRADE}}', user.grade || "Unknown")
            .replace('{{SYLLABUS}}', syllabusContext)
            .replace('{{MARKING_SCHEMES}}', schemesContext)
            .replace('{{PAST_PAPERS}}', papersContext);

        // Add Resumption Instructions
        if (user.diagnostic_complete) {
            systemPrompt += "\n**IMPORTANT:** The student has already completed the diagnostic. Do NOT start another diagnostic. Welcome them back based on their Level and recent focus.";
        }
    }

    // Initialize history for this agent if not exists
    if (!user.chatHistory[agentId]) user.chatHistory[agentId] = [];

    // Save User message immediately
    user.chatHistory[agentId].push({ role: 'user', content: message, timestamp: new Date().toISOString() });
    writeDb(db);

    // Try models in sequence
    for (const modelName of MODELS) {
        try {
            console.log(`Attempting model: ${modelName}`);

            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemPrompt
            });

            const chat = model.startChat({
                history: clientHistory || [],
                generationConfig: { maxOutputTokens: 500 },
            });

            const result = await chat.sendMessage(message);
            const response = result.response;
            let text = response.text();

            // --- TAG PARSING LOGIC ---
            let dbUpdated = false;

            // *   **Final Output:** Assign DSE Level 1-5 via `[SET_LEVEL: X]`. Once the **entire** 5-part diagnostic is finished, you MUST include the tag `[DIAGNOSTIC_COMPLETE]` in your final summary response.
            // 1. Check [SET_LEVEL: X]
            const levelMatch = text.match(/\[SET_LEVEL:\s*(\d+)\]/);
            if (levelMatch) {
                user.level = parseInt(levelMatch[1]);
                user.xp += 100;
                dbUpdated = true;
                text = text.replace(levelMatch[0], "");
            }

            // [DIAGNOSTIC_COMPLETE]
            if (text.includes('[DIAGNOSTIC_COMPLETE]')) {
                user.diagnostic_complete = true;
                dbUpdated = true;
                text = text.replace('[DIAGNOSTIC_COMPLETE]', "");
            }

            // (Languge/Grade matches...)
            const langMatch = text.match(/\[SET_LANG:\s*(\w+)\]/);
            if (langMatch) {
                user.preferredLanguage = langMatch[1];
                dbUpdated = true;
                text = text.replace(langMatch[0], "");
            }
            const gradeMatch = text.match(/\[SET_GRADE:\s*(\d+)\]/);
            if (gradeMatch) {
                user.grade = parseInt(gradeMatch[1]);
                dbUpdated = true;
                text = text.replace(gradeMatch[0], "");
            }

            // Save AI reply to history
            const cleanText = text.trim();
            user.chatHistory[agentId].push({ role: 'assistant', content: cleanText, timestamp: new Date().toISOString() });

            writeDb(db);
            res.json({ reply: cleanText });
            return;
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            if (error.response) console.error("Error Response:", JSON.stringify(error.response, null, 2));
        }
    }

    // Fallback...
    const mockReply = getMockResponse(agentId, message);
    user.chatHistory[agentId].push({ role: 'assistant', content: mockReply, timestamp: new Date().toISOString(), offline: true });
    writeDb(db);
    res.json({ reply: `[Offline Mode] ${mockReply}` });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
