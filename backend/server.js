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

    const user = getUserData(uid);
    if (!user) return res.json([]); // Return empty if new user

    const history = user.chatHistory[agentId] || [];
    res.json(history);
});

// Chat Endpoint
// ...
app.post('/api/chat', async (req, res) => {
    console.log("Received chat request");
    const { uid, message, history: clientHistory, agentId } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    // Get User Data
    const db = readDb();
    const user = db.users[uid];
    if (!user) return res.status(404).json({ error: "User not found" });

    let systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace;

    // Inject Dynamic Context into Prompt
    if (agentId === 'english') {
        const syllabusContext = JSON.stringify(ENGLISH_SYLLABUS);
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
