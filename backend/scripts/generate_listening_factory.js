const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');
const LabService = require('../services/LabService');
const TTSService = require('../services/TTSService');

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// LISTENING TOPICS
const TOPICS = [
    { title: "Campus Radio Proposal", level: "4" },
    { title: "Complaint Hotline", level: "5" },
    { title: "University Interview", level: "5*" }
];

async function generateAudioSegments(script) {
    const segments = [];
    const lines = script.split('\n').filter(line => line.trim().length > 0);

    console.log(`[AudioGen] Processing ${lines.length} lines...`);

    for (const line of lines) {
        // Parse Speaker and Text
        // Expected format: "Speaker 1 [British, Fast]: text..." or "John: text..."
        const match = line.match(/^([^:]+):\s*(.+)$/);

        if (match) {
            let speakerInfo = match[1].trim(); // "Speaker 1 [British, Fast]"
            let text = match[2].trim();

            // Determine Voice Settings
            let lang = 'en-US';
            let gender = 'FEMALE';
            let voiceName = 'en-US-Neural2-F'; // Default

            if (speakerInfo.toLowerCase().includes('british')) {
                lang = 'en-GB';
                voiceName = 'en-GB-Neural2-A';
                if (speakerInfo.toLowerCase().includes('male')) {
                    gender = 'MALE';
                    voiceName = 'en-GB-Neural2-B';
                }
            } else if (speakerInfo.toLowerCase().includes('australian')) {
                lang = 'en-AU';
                voiceName = 'en-AU-Neural2-A';
                if (speakerInfo.toLowerCase().includes('male')) {
                    gender = 'MALE';
                    voiceName = 'en-AU-Neural2-B';
                }
            } else if (speakerInfo.toLowerCase().includes('local') || speakerInfo.toLowerCase().includes('hk')) {
                // Approximate HK accent with en-GB or specialized zh-HK mixed?
                // TTSService handles 'zh-HK' logic (creates mixed SSML)
                lang = 'en-GB';  // Using GB as base for HK usually works better than US for DSE
                if (speakerInfo.toLowerCase().includes('male')) {
                    gender = 'MALE';
                }
            } else {
                if (speakerInfo.toLowerCase().includes('male') || speakerInfo.includes('Speaker 2')) {
                    gender = 'MALE';
                    voiceName = 'en-US-Neural2-D';
                }
            }

            console.log(`   -> Generating: [${lang}/${gender}] "${text.substring(0, 30)}..."`);
            try {
                // Call TTS
                const audioBase64 = await TTSService.generateSpeech(text, lang, gender);
                segments.push({
                    speaker: speakerInfo,
                    text: text,
                    audio: audioBase64
                });
            } catch (err) {
                console.error(`      ERROR generating audio line: ${err.message}`);
                // Fallback: Push text without audio? Or assume silence.
            }
        }
    }
    return segments;
}

async function runFactory() {
    console.log("=== LISTENING QUEST FACTORY START ===");

    for (const t of TOPICS) {
        console.log(`\nGenerating Topic: ${t.title} [Level ${t.level}]`);

        // 1. Generate Text Content (Script + Tasks)
        // We use LabService.generateLesson directly? 
        // LabService.generateLesson calls AI and returns JSON. 
        // We need to inject the LISTENING_LAB_PROMPT logic if it's not default.
        // Actually LabService determines prompt based on params.

        // Mock the params for LabService
        const params = {
            topic: 'listening_comprehension', // Triggers "General" listening logic? 
            // Wait, LabService checks `isListening` based on "topic" string usually?
            // "listening_quest_syllabus.json" has mapped topics?
            // Let's pass a special flag or just use 'listening' in topic name.
            topic: `Listening: ${t.title}`,
            level: t.level,
            focus: "Integrated Skills",
            targetCount: 4,
            uid: "FACTORY_ADMIN"
        };

        // Note: We need to ensure LabService uses LISTENING_LAB_PROMPT
        // In LabService.js: } else if (isListening) { ... }
        // isListening = topic.toLowerCase().includes('listening')
        // So passing "Listening: ..." should work.

        try {
            const questJson = await LabService.generateLesson(params);

            if (!questJson || !questJson.reading_passage) {
                console.error("FAILED to generate valid quest JSON.");
                continue;
            }

            console.log("Script Generated. Length:", questJson.reading_passage.length);

            // 2. Synthesize Audio
            const audioSegments = await generateAudioSegments(questJson.reading_passage);

            // 3. Construct Final Object
            const factoryQuest = {
                ...questJson,
                title: t.title,
                level: t.level,
                type: 'listening_mission',
                audio_segments: audioSegments, // Array of {speaker, text, audio(base64)}
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                is_approved: true,
                factory_generated: true
            };

            // 4. Save to Firestore
            const docRef = await db.collection('question_bank').add(factoryQuest);
            console.log(`SAVED to Firestore: ${docRef.id}`);

        } catch (err) {
            console.error("Critical Error during generation:", err);
        }
    }

    console.log("\n=== FACTORY COMPLETE ===");
}

runFactory();
