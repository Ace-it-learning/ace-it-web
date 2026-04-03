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
    { title: "University Interview", level: "5*" },
    { title: "Technology Podcast", level: "5**" },
    { title: "Police Report", level: "4" },
    { title: "School Heritage Tour Itinerary", level: "3" },
    { title: "Student Union Election Campaign", level: "5" },
    { title: "Library Renovation Proposal", level: "4" },
    { title: "Drama Club Annual Production", level: "3" },
    { title: "International Exchange Student Welcoming", level: "5" },
    { title: "School Canteen Quality Survey", level: "4" },
    { title: "Community Garden Project", level: "3" },
    { title: "Heritage Building Conservation", level: "5" },
    { title: "Sustainable Living Workshop", level: "4" },
    { title: "Street Performance (Busking) Regulation", level: "5*" },
    { title: "Charity Marathon Logistics", level: "5" },
    { title: "Summer Internship Orientation", level: "4" },
    { title: "Career Fair Preparation", level: "5" },
    { title: "Workplace Safety Training", level: "4" },
    { title: "Staff Well-being Seminar", level: "5" },
    { title: "Local Food Culture Documentary", level: "5**" },
    { title: "Music Festival Volunteer Info", level: "4" },
    { title: "Modern Art Museum Audio Guide", level: "5" },
    { title: "Travel Agency Itinerary Planning", level: "4" }
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

        // Resolve level
        let resolvedLevel = t.level;
        if (resolvedLevel === "5*") resolvedLevel = "6";
        if (resolvedLevel === "5**") resolvedLevel = "7";

        // Mock the params for LabService
        const params = {
            topic: `Listening: ${t.title}`,
            level: resolvedLevel,
            focus: "Integrated Skills",
            targetCount: 4,
            uid: "FACTORY_ADMIN",
            isFactory: true
        };

        // Note: We need to ensure LabService uses LISTENING_LAB_PROMPT
        // In LabService.js: } else if (isListening) { ... }
        // isListening = topic.toLowerCase().includes('listening')
        // So passing "Listening: ..." should work.

        try {
            console.log(`[FACTORY] Starting generation for: ${t.title} (${resolvedLevel})`);
            const questJson = await LabService.generateLesson(params);

            if (!questJson || !questJson.reading_passage) {
                console.error(`[FACTORY] FAILED to generate valid JSON for: ${t.title}`);
                continue;
            }

            console.log(`[FACTORY] Script Generated. Passage Length: ${questJson.reading_passage.length}`);

            // 2. Synthesize Audio
            console.log(`[FACTORY] Synthesizing Audio for: ${t.title}...`);
            const audioSegments = await generateAudioSegments(questJson.reading_passage);
            console.log(`[FACTORY] Audio Segments: ${audioSegments.length}`);

            // 3. Construct Final Object
            const factoryQuest = {
                ...questJson,
                title: t.title,
                level: resolvedLevel,
                levelLabel: t.level,
                type: 'listening_mission',
                paper: 'Listening', 
                audio_segments: audioSegments,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                is_approved: true,
                factory_generated: true
            };

            // 4. Save to Firestore
            const docRef = await db.collection('question_bank').add(factoryQuest);
            console.log(`[FACTORY] SUCCESS! Saved with ID: ${docRef.id}`);

        } catch (err) {
            console.error(`[FACTORY] CRITICAL ERROR for ${t.title}:`, err);
        }
    }

    console.log("\n=== FACTORY COMPLETE ===");
}

runFactory();
