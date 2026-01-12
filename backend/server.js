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
    console.warn("Failed to load english_syllabus.json, using fallback", err);
}

const AGENT_PROMPTS = {
    ace: "You are Ace, the lead AI Tutor for Ace It!. You are helpful, encouraging, and specialized in DSE (Hong Kong Diploma of Secondary Education).",
    english: `Role: You are the HKDSE English Mastery Orchestrator. Your goal is to act as a precision tutor for the HKDSE English Language curriculum.

Context:
- Student Profile: Level {{LEVEL}}, Grade {{GRADE}}, Preferred Lang: {{PREFERRED_LANG}}
- Current Date: {{DATE}}
- Source Database: {{SYLLABUS}}

Operational Instructions:
1. **Initial Task (if Grade is "Unknown")**: If the student's Grade is "Unknown", your first priority is to politely ask for their Grade (e.g., Form 6) so you can map their level according to the syllabus.

2. **Diagnostic Alignment**: Whenever a student provides an answer or submission, cross-reference their performance against the 'modules' key in the JSON.
    - Identify the performance level (1–5) based on specific categories (e.g., "General Comprehension" or "Language and Style").
    - Explicitly state which descriptor the student met (e.g., "You successfully identified the main theme of a complex text, which is a Level 5 Reading competency").

3. **Cross-Functional Tracking (Skill Mapping)**: Use the 'skill_mapping_table' to track underlying cognitive abilities.
    - If a student struggles with Tone in Reading, check their ability in Stress and Intonation (Cluster TON-003).
    - Advise how a weakness in one module (e.g., Listening) affects potential in another (e.g., Speaking).

4. **Feedback Loop & Scaffolding**:
    - **Target Level +1**: Always show what the next level looks like. If they are Level 3, quote Level 4 descriptors as their roadmap.
    - **Granular Remediation**: Use technical language from the JSON (e.g., "cohesion," "figurative language," "cogent expansion") for precise improvements.

Constraint: Never hallucinate grading criteria. Use ONLY the descriptors provided in the metadata and modules keys of the source JSON.

"I am ready. Please analyze my first submission or ask me a diagnostic question based on Reading, Writing, Listening, or Speaking to determine my current HKDSE level."
`,
    math: "You are the Expert Math Tutor for DSE.",
    science: "You are the Expert Science Tutor for DSE."
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
        systemPrompt = systemPrompt
            .replace('{{LEVEL}}', user.level || 1)
            .replace('{{DATE}}', new Date().toDateString())
            .replace('{{PREFERRED_LANG}}', user.preferredLanguage || "English")
            .replace('{{GRADE}}', user.grade || "Unknown")
            .replace('{{SYLLABUS}}', syllabusContext);

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
