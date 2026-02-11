const fs = require('fs');
const path = require('path');
const GenerativeAIService = require('./services/GenerativeAIService');
require('dotenv').config();

async function generateListeningMock(topic = "Cultural Festival") {
    console.log(`🎧 Generating Listening Mock for topic: ${topic}...`);

    try {
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
                "data_file": [
                    {
                        "id": "doc1",
                        "title": "Email from Chris Wong",
                        "type": "email",
                        "content": "<div class='email'><p><strong>From:</strong> Chris Wong</p><p><strong>To:</strong> Sarah Lee</p><p><strong>Subject:</strong> Venue Booking Confirmation</p><p>Dear Sarah,</p><p>I am writing to confirm...</p></div>"
                    },
                    {
                        "id": "doc2",
                        "title": "Meeting Minutes",
                        "type": "minutes",
                        "content": "<div class='minutes'><h3>Planning Committee Meeting</h3><p><strong>Date:</strong> 15 Jan 2026</p><ul><li>Venue confirmed: City Hall</li><li>Budget approved: $5000</li></ul></div>"
                    },
                    {
                        "id": "doc3",
                        "title": "Event Poster",
                        "type": "poster",
                        "content": "<div class='poster' style='border: 2px solid #333; padding: 20px; text-align: center;'><h2>Annual Cultural Festival</h2><p>Date: 20 March 2026</p><p>Venue: City Hall</p></div>"
                    }
                ],
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

        **CRITICAL REQUIREMENTS FOR DATA FILE:**
        - Generate 3-5 distinct documents in the data_file array
        - Document types MUST vary: email, minutes, poster, webpage, note, memo
        - Each document must have realistic, detailed HTML content (150-300 words each)
        - Documents should be interconnected (e.g., email references the meeting, poster shows event details)
        - Use proper HTML formatting with semantic tags
        `;

        const mockData = await GenerativeAIService.generateJson(prompt, {
            model: 'gemini-flash-latest'
        });

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
    generateListeningMock(topic).catch(console.error);
}

module.exports = { generateListeningMock };
