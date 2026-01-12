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
// path is already imported at top of file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

// List of models to try in order of preference (User requested Latest only)
// Note: "Gemini 3" is not released yet; gemini-2.0-flash-exp is the latest available.
const MODELS = ["gemini-2.0-flash-exp"];

// Startup Log to verify model order
console.log("Server initialized. Model priority list:", MODELS);

// Load English Syllabus
const ENGLISH_SYLLABUS = require('./english_syllabus.json');

const AGENT_PROMPTS = {
    english: `**Role:** You are an empathetic, professional HKDSE English Tutor capable of hearing and speaking. Your goal is to bridge the "oral/aural gap" using Socratic coaching.
**Current Date:** {{DATE}}.
**Language Mode:** Explain in **{{PREFERRED_LANG}}**, assess in **English**.
**Target Grade:** Form {{GRADE}}.
**Official HKDSE Syllabus:** {{SYLLABUS}}

**Voice Interaction Logic:**
*   You are voice-enabled (STT/TTS).
*   **TTS Output:** Write naturally as if speaking. Use an "empathetic, British-English tutor" tone.
*   **Listening Logic:** When you conduct a Listening check, write out the script (the system will read it aloud).

**The Adaptive Diagnostic (5-Part):**
1.  **Reading/Writing/Usage:** (Standard Diagnostic).
2.  **Listening (Paper 3):** Generate a short 45-second script (approx 60-80 words). Tell the student: "Listen to this clip, then tell me the speaker's hidden motive."
3.  **Speaking (Paper 4):** Prompt: "Some say DSE is too stressful. What do you think?" (Encourage them to use the Mic).

**Scoring & Feedback:**
*   **Oral Assessment:** Grade on Fluency, Pronunciation (simulated based on transcription clarity), and Pragmatic Appropriateness.
*   **The Gap Rule:** If their writing_level > speaking_level + 1, mention "Let's trigger 'Fluency Booster' mode next time!"
*   **Level Assignment:** After all 5 parts, assign DSE Level 1-5 and save via \`[SET_LEVEL: X]\`.

**Safety & Tone:**
*   If a student uses foul language or sensitive topics (sex/politics), deflect with a humorous voice note: "My digital ears are burning! Let's swap the controversy for some solid DSE vocabulary, shall we?".

**XP Scheme Integration:**
*   **Voice Bonus:** If they provide a long answer, mention "+20 XP for fluency stability!".
*   **Shadowing Bonus:** Encourage them to mimic your intonation.

**Conciseness:** Keep turns brief (2-3 sentences) unless delivering the Listening Clip.`,
    math: "You are the Math Tutor for DSE students. I specialize in Geometry and Algebra. Be logical, precise, and step-by-step. emphasizing showing steps for method marks. Help with geometric proofs and algebraic manipulation.",
    chinese: "You are the Chinese Tutor. Focus on the 12 specified classical texts (範文), writing flow, and rhetoric devices. Be cultured, deep, and poetic but accessible. Challenge students with recitation and explain deeper meanings.",
    ace: "You are Ace Sir, a general study strategist. Focus on motivation, time management, exam tactics, and stress management. Be energetic, confident, and coach-like. Say things like 'Trust the process!' and 'You got this!'."
};

// ... MOCK_DATABASES and getMockResponse remain same ...
const MOCK_DATABASES = {
    english: [
        { keywords: ['grammar', 'verb', 'tense'], text: "For Grammar, remember that subject-verb agreement is the most common error in DSE. \n\nLet's practice: 'The group of students ___ (is/are) waiting.' What do you think?" },
        { keywords: ['vocab', 'word'], text: "To improve Vocabulary, don't just memorize definitions. Use the word in a sentence. \n\nTry creating a sentence with 'meticulous'." },
        { keywords: ['writing', 'paper 2'], text: "In Paper 2, structure is everything. Ensure you have a clear topic sentence for every paragraph. \n\nWhat genre are you practicing today?" },
        { keywords: ['hello', 'hi', 'hey'], text: "Hello! I'm here to help you Ace the DSE English. \n\nBefore we start, do you prefer explanations in English or Chinese?" }
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
        english: "That's a great question. But first, are you Form 4, 5, or 6?",
        math: "I see. To solve this, breaks it down into known variables and unknown variables. What are we trying to find?",
        chinese: "這個觀點很有趣。在DSE中文科中，表達能力和文化內涵同樣重要。",
        ace: "I hear you. The path to Level 5** is a marathon, not a sprint. What is your Main Goal for today?"
    };
    return defaults[agentId] || defaults.ace;
};

app.post('/api/chat', async (req, res) => {
    console.log("Received chat request:", req.body);
    const { message, agentId } = req.body;

    // Get User Data
    const db = readDb();
    const user = db.user;

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
    }

    // Try models in sequence
    for (const modelName of MODELS) {
        try {
            console.log(`Attempting model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(`${systemPrompt}\n\nStudent: ${message}\nTutor (Max 3 sentences):`);
            const response = result.response;
            let text = response.text();

            // --- TAG PARSING LOGIC ---
            let dbUpdated = false;

            // 1. Check [SET_LEVEL: X]
            const levelMatch = text.match(/\[SET_LEVEL:\s*(\d+)\]/);
            if (levelMatch) {
                user.level = parseInt(levelMatch[1]);
                user.xp += 100; // Bonus
                dbUpdated = true;
                text = text.replace(levelMatch[0], "");
            }

            // 2. Check [SET_LANG: X]
            const langMatch = text.match(/\[SET_LANG:\s*(\w+)\]/);
            if (langMatch) {
                user.preferredLanguage = langMatch[1]; // English or Chinese
                dbUpdated = true;
                text = text.replace(langMatch[0], "");
            }

            // 3. Check [SET_GRADE: X]
            const gradeMatch = text.match(/\[SET_GRADE:\s*(\d+)\]/);
            if (gradeMatch) {
                user.grade = parseInt(gradeMatch[1]);
                dbUpdated = true;
                text = text.replace(gradeMatch[0], "");
            }

            // Save DB if changed
            if (dbUpdated) {
                writeDb(db);
                console.log("Updated User Stats:", user);
            }

            // If successful, send response and exit loop
            res.json({ reply: text.trim() });
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
