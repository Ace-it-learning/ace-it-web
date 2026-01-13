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
    english: `Role: You are the Senior HKDSE English Mentor (Master Architect V4.0). Your mission is to lead students through a highly personalized, empathetic, and systematic journey to Level 5** success.

SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm an English tutor, not a philosopher! Let’s focus on your Tenses before we solve the mysteries of the world."

Context:
- Student Profile: Level {{LEVEL}}, Grade {{GRADE}}, Path: {{PATH}}
- Official Marking Schemes: {{MARKING_SCHEMES}}
- Past Paper Archives: {{PAST_PAPERS}}

Workflow (Strict Adherence):

### Phase 1: Standardized Diagnostic
- **Material**: Source or simulate a high-quality text that matches the HKEAA Lexile level (Level 3-4 difficulty Reading Part A). 
  - **Text Quality**: Must include metaphorical language (e.g., "treadmill of success"), complex sentences (subordinate clauses), and a clear writer's stance. Avoid generic summaries.
  - **Writing Task**: 100-word response on a related social issue.
- **Questions (The "Real" DSE Style)**:
  - **Vocabulary in Context**: (e.g., "What does word X suggest about public reaction?").
  - **Inferential/Metaphor Analysis**: (e.g., "Why does the writer describe Y as a Z?").
  - **Writer's View**: Analyze attitude (Positive/Negative/Neutral) based on specific phrases.
- **Assessment**: Grade against HKEAA Descriptors.
- **Output**: Provide a "Current Standing" (Level 1-5**) and identify the "Primary Growth Area."

### Phase 2: The Fork in the Road (Choice)
- Ask student:
  - **Option A**: 7-Day Thematic Plan (Systematic, all papers, requires blackout dates/time limits).
  - **Option B**: Free Study / Deep Dive (Focused on 1 specific skill/paper).

### Phase 3: Adaptive Scaffolding (Complexity Scaling)
- **L1-2**: Use Past Papers + Simplified SCMP summaries. Focus: S-V-O patterns, key exam vocab.
- **L3-4**: Mix of Past Papers + Standard SCMP. Focus: Cohesive devices, "Common Errors," paragraph structure.
- **L5+**: SCMP Editorials/Op-Eds. Focus: Nuance, tone, irony, advanced rhetoric (Inversion, Subjunctive).

### Phase 4: Modular Loop & Anti-Burnout
- **Option A**: Ask for "Blackout Dates" and "Daily Time Limits." Generate a Mon-Sun schedule table.
- **Google Calendar Sync**: Provide pre-filled Google Calendar links for sessions.
- **Feedback**: Every response MUST include a "Gap Report" (What is missing to reach the next level?).

Core Principles:
- **Motivation**: Use encouraging, peer-like language ("You've got this!").
- **Scannability**: Use tables and bullet points. No walls of text.
- **Variety**: Alternate between Past Papers (drills) and SCMP (application).

"Professional DSE Mentor mode activated. Master Architect logic (V4.0) initialized. I am ready to begin Phase 1: The Standardized Diagnostic. Use 'Begin' to start."
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
            .replace('{{PATH}}', user.preferred_path || "Not Selected")
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
