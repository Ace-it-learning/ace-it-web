const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateListeningMock(topic = "Cultural Festival") {
    console.log(`🎧 Generating Listening Mock for topic: ${topic}...`);

    try {
        const GenerativeAIService = require('./services/GenerativeAIService');
        const model = GenerativeAIService.getModel({ model: 'gemini-2.0-flash', generationConfig: { responseMimeType: "application/json" } });

        const blueprintPath = path.join(__dirname, 'blueprints', 'Eng_Listening_Blueprint.json');
        const blueprint = fs.readFileSync(blueprintPath, 'utf8');

        const prompt = `
        You are an expert HKDSE English Paper 3 (Listening) Examiner.
        Create a full Listening Exam Mock on the topic: "${topic}".
        
        STRICTLY follow the "Eng_Listening_Blueprint" rules below:
        ${blueprint}

        **IMPORTANT: TIMING & PAUSES**
        - You MUST include "Tidy up" time.
        - After each Task in Part A, include a entry: { "speaker": "Announcer", "text": "(60-second pause to tidy up answers)" }.
        - At the end of Part A, include: { "speaker": "Announcer", "text": "(3-minute pause)" }.

        **OUTPUT FORMAT (STRICT JSON)**
        Return a single JSON object with this structure:
        {
            "metadata": {
                "title": "Mock Exam: ${topic}",
                "generated_at": "${new Date().toISOString()}",
                "difficulty": "Level 4"
            },
            "Part_A": {
                "tasks": [
                    {
                        "id": "Task_1", 
                        "instructions": "Write the information in the spaces provided.",
                        "questions": [
                            { "id": "Q1", "type": "fill_in_blank", "label": "Venue:", "answer": "City Hall" },
                            { "id": "Q2", "type": "multiple_choice", "label": "Date:", "options": ["Monday", "Friday", "Sunday"], "answer": "Friday" }
                        ]
                    },
                    // ... Generate 3-4 Tasks total for Part A
                ],
                "script": [
                    { "speaker": "Announcer", "text": "Hong Kong Diploma of Secondary Education Examination. English Language Paper 3. Listening and Integrated Skills." },
                    { "speaker": "Announcer", "text": "Part A. Task 1. Please look at page 1 of your Question Papers. Write your answers in the spaces provided." },
                    { "speaker": "Announcer", "text": "(5-second pause)" },
                    { "speaker": "Chris", "text": "Hi Sarah, have you booked the venue yet?" },
                    { "speaker": "Sarah", "text": "Yes, Chris. We are going to City Hall this year." },
                    // ... Full script for ALL Tasks in Part A
                    { "speaker": "Announcer", "text": "That is the end of Part A." }
                ]
            },
            "Part_B": {
                "data_file": "<h1>Welcome Packet</h1><p>Dear details...</p>", // HTML content for the Data File
                "tasks": [
                    {
                        "id": "Task_5",
                        "type": "email",
                        "instructions": "Write an email to the club president...",
                        "requirements": ["Mention the date", "Explain usage"]
                    }
                    // ... Generate 3 Tasks for Part B
                ],
                "script": [
                    { "speaker": "Announcer", "text": "Part B. Please look at the Data File." },
                    { "speaker": "Boss", "text": "Make sure you read the email from the council..." }
                    // ... Script regarding Part B instructions or meeting recording
                ]
            }
        }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;

        // Log Usage
        if (response.usageMetadata) {
            const TokenService = require('./services/TokenService');
            TokenService.logUsage('system', 'listening_mock_gen', response.usageMetadata);
        }

        const mockData = JSON.parse(response.text());

        // Save file
        const filename = `Listening_${topic.replace(/\s+/g, '_')}_${Date.now()}.json`;
        const savePath = path.join(__dirname, 'generated_mocks', 'listening', filename);

        // Ensure dir exists
        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(savePath, JSON.stringify(mockData, null, 2));
        console.log(`✅ Listening Mock Saved: ${filename}`);

        // Sync to Firestore (if DB is passed or available globally)
        try {
            const admin = require('firebase-admin');
            if (admin.apps.length > 0) {
                const db = admin.firestore();
                await db.collection('listening_mocks').doc(filename.replace('.json', '')).set({
                    ...mockData,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`☁️  Synced to Firestore: listening_mocks/${filename.replace('.json', '')}`);
            }
        } catch (err) {
            console.error("⚠️ Firestore Sync Warning:", err.message);
        }

        return { success: true, filename, path: savePath, data: mockData };

    } catch (error) {
        console.error("❌ Failed to generate listening mock:", error);
        return { success: false, error: error.message };
    }
}

// Allow direct execution
if (require.main === module) {
    const topic = process.argv[2] || "School Open Day";
    generateListeningMock(topic);
}

module.exports = { generateListeningMock };
