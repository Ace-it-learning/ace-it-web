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
        return JSON.parse(data);
    } catch (err) {
        return { user: { xp: 0, level: 1, learningTime: 0 } };
    }
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// GET User Stats
app.get('/api/stats', (req, res) => {
    const db = readDb();
    res.json(db.user);
});

// POST Update Stats
app.post('/api/stats', (req, res) => {
    const db = readDb();
    const { xp, level, learningTime } = req.body;

    if (xp !== undefined) db.user.xp = xp;
    if (level !== undefined) db.user.level = level;
    if (learningTime !== undefined) db.user.learningTime = learningTime;

    writeDb(db);
    res.json(db.user);
});

// Chat Endpoint
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

// List of models to try in order of preference
const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

const AGENT_PROMPTS = {
    english: "You are the English Tutor for DSE students. Focus on Paper 1 (Reading) and Paper 2 (Writing). Be professional, articulate, and encouraging. Use British English spelling. Explain effective reading strategies like previewing structure, topic sentences, and keywords.",
    math: "You are the Math Tutor for DSE students. I specialize in Geometry and Algebra. Be logical, precise, and step-by-step. emphasizing showing steps for method marks. Help with geometric proofs and algebraic manipulation.",
    chinese: "You are the Chinese Tutor. Focus on the 12 specified classical texts (範文), writing flow, and rhetoric devices. Be cultured, deep, and poetic but accessible. Challenge students with recitation and explain deeper meanings.",
    ace: "You are Ace Sir, a general study strategist. Focus on motivation, time management, exam tactics, and stress management. Be energetic, confident, and coach-like. Say things like 'Trust the process!' and 'You got this!'."
};

// ... MOCK_DATABASES and getMockResponse remain same ...
const MOCK_DATABASES = {
    english: [
        { keywords: ['grammar', 'verb', 'tense'], text: "For Grammar, remember that subject-verb agreement is the most common error in DSE. Let's practice: 'The group of students ___ (is/are) waiting.' What do you think?" },
        { keywords: ['vocab', 'word'], text: "To improve Vocabulary, don't just memorize definitions. Use the word in a sentence. Try creating a sentence with 'meticulous'." },
        { keywords: ['writing', 'paper 2'], text: "In Paper 2, structure is everything. Ensure you have a clear topic sentence for every paragraph. What genre are you practicing today?" },
        { keywords: ['hello', 'hi', 'hey'], text: "Hello! usage of English is my passion. How can I help you ace your exam today?" }
    ],
    math: [
        { keywords: ['geometry', 'circle', 'angle'], text: "For Geometry, always look for the 'butterfly' (angles in the same segment) or cyclic quadrilaterals. Do you see any 4 points on a circle?" },
        { keywords: ['algebra', 'equation', 'x'], text: "In Algebra, balance is key. Whatever you do to one side, do to the other. Want to try a quadratic equation?" },
    ],
    chinese: [
        { keywords: ['fan wen', 'text', 'classic'], text: "文言文首重「字詞解讀」。試著把句子翻譯成現代漢語。哪一篇範文讓你覺得最困難？" },
    ],
    ace: [
        { keywords: ['tired', 'stress', 'give up'], text: "It's normal to feel tired! That just means you're working hard. Take a 5-minute break, drink some water, and come back stronger. You got this!" },
    ]
};

const getMockResponse = (agentId, message) => {
    const db = MOCK_DATABASES[agentId] || [];
    const lowerMsg = message.toLowerCase();

    // Find matching keyword
    const match = db.find(entry => entry.keywords.some(k => lowerMsg.includes(k)));

    if (match) return match.text;

    // Default Fallbacks
    const defaults = {
        english: "That's a great question. In the context of DSE English, we should focus on clarity. Can you rephrase that using specific exam terminology?",
        math: "I see. To solve this, breaks it down into known variables and unknown variables. What are we trying to find?",
        chinese: "這個觀點很有趣。在DSE中文科中，表達能力和文化內涵同樣重要。",
        ace: "I hear you. The path to Level 5** is a marathon, not a sprint. What is your Main Goal for today?"
    };
    return defaults[agentId] || defaults.ace;
};

app.post('/api/chat', async (req, res) => {
    console.log("Received chat request:", req.body);
    const { message, agentId } = req.body;
    const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace;

    // Try models in sequence
    for (const modelName of MODELS) {
        try {
            console.log(`Attempting model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(`${systemPrompt}\n\nStudent: ${message}\nTutor:`);
            const response = result.response;
            const text = response.text();

            // If successful, send response and exit loop
            res.json({ reply: text });
            return;
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            // Continue to next model
        }
    }

    // If loop finishes, all models failed
    console.error("All models failed. Switching to Offline Mode.");
    const mockReply = getMockResponse(agentId, message);
    const fallbackMessage = `[Offline Mode] ${mockReply} (All AI models busy/overloaded)`;
    res.json({ reply: fallbackMessage });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
