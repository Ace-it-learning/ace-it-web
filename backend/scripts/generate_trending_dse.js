/**
 * GENERATION SCRIPT: Trending DSE English Content
 * Topics: Labubu Trend, Tai Po Fire, US-Iran Conflict
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
    } else {
        admin.initializeApp();
    }
}

const db = admin.firestore();
const WritingLabService = require('../services/WritingLabService');
const SpeakingQuestService = require('../services/SpeakingQuestService');
const GenerativeAIService = require('../services/GenerativeAIService');

const TRENDING_TOPICS = [
    {
        id: 'labubu_trend',
        name: 'Labubu & Collectible Culture',
        writing_theme: 'The Labubu phenomenon: How art toys changed youth consumerism in Hong Kong.',
        speaking_theme: 'Collectibles and Lifestyle',
        reading_theme: 'Consumer psychology and the rise of blind boxes.'
    },
    {
        id: 'taipo_fire',
        name: 'Tai Po Fire Incident & Safety',
        writing_theme: 'A formal report on fire safety measures in aging residential districts like Tai Po.',
        speaking_theme: 'Community Safety and Urban Planning',
        reading_theme: 'Analyzing the societal response to local emergencies and fire prevention.'
    },
    {
        id: 'global_conflict',
        name: 'Geopolitical Tensions (US-Iran)',
        writing_theme: 'An argumentative essay on whether international diplomacy is still effective in preventing global conflicts.',
        speaking_theme: 'Global Affairs and Diplomacy',
        reading_theme: 'The ripple effect of regional conflicts on global energy prices and economic stability.'
    }
];

async function generateAll() {
    console.log("🚀 Starting Trending DSE Content Generation...");

    for (const topic of TRENDING_TOPICS) {
        console.log(`\n🔥 FOCUSING ON: ${topic.name}`);

        // 1. WRITING EXEMPLAR (5**)
        try {
            console.log("  - Generating 5** Writing Exemplar...");
            const genre = topic.id === 'taipo_fire' ? 'report' : 'arg_essay';
            const writing = await WritingLabService.generateEliteExemplar(genre, topic.writing_theme);
            const wId = `exemplar_${topic.id}_${Date.now()}`;
            await db.collection('writing_exemplars').doc(wId).set({
                ...writing,
                id: wId,
                is_approved: true,
                created_at: new Date().toISOString(),
                difficulty: "ELITE"
            });
            console.log(`    ✅ Writing: ${writing.title}`);
        } catch (e) {
            console.error("    ❌ Writing Failed:", e.message);
        }

        // 2. SPEAKING PASSAGE (Delivery)
        try {
            console.log("  - Generating Speaking Delivery Passage...");
            const speaking = await SpeakingQuestService.generateQuest('system', 'delivery', 7, topic.speaking_theme); // LEVEL 7 = 5**
            const sId = `speaking_delivery_${topic.id}_${Date.now()}`;
            await db.collection('question_bank').doc(sId).set({
                ...speaking,
                topic: topic.id,
                level: "Elite (5**)",
                is_approved: true,
                created_at: new Date().toISOString(),
                type: "SPEAKING_DELIVERY"
            });
            console.log(`    ✅ Speaking Delivery: ${speaking.scenario}`);
        } catch (e) {
            console.error("    ❌ Speaking Failed:", e.message);
        }

        // 3. READING LAB (Mock-style)
        try {
            console.log("  - Generating Reading Mock Passage...");
            const prompt = `Generate a Level 5** HKDSE English Reading Passage and 5 Reading Comprehension questions.
            TOPIC: ${topic.reading_theme}
            FORMAT: JSON as per Ace-It Reading Lab schema.
            SCHEMA: {
                "reading_passage": "The text...",
                "title": "A headline",
                "interactive_tasks": [
                    { "id": "q1", "type": "MCQ", "question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..." },
                    ... (4 more)
                ]
            }
            CRITICAL: The vocabulary must be at the highest 5** level, comparable to The Economist or elite academic texts.
            `;
            const { data: reading } = await GenerativeAIService.generateJson(prompt, { model: "gemini-2.5-flash" });
            const rId = `reading_mock_${topic.id}_${Date.now()}`;
            await db.collection('question_bank').doc(rId).set({
                ...reading,
                id: rId,
                topic: topic.id,
                level: "Elite (5**)",
                is_approved: true,
                created_at: new Date().toISOString(),
                type: "READING_COMPREHENSION"
            });
            console.log(`    ✅ Reading Mock: ${reading.title}`);
        } catch (e) {
            console.error("    ❌ Reading Failed:", e.message);
        }

        console.log("Waiting 10s for next topic...");
        await new Promise(r => setTimeout(r, 10000));
    }

    console.log("\n🏁 ALL TRENDING CONTENT GENERATED!");
    process.exit(0);
}

generateAll();
