/**
 * Pregenerate Grammar Lab JSON files to save tokens and improve load times.
 * This script iterates through all grammar topics and difficulty levels,
 * calling LabService.generateLesson and saving the results to backend/data/grammar_labs.
 */

const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// --- INITIALIZE FIREBASE ADMIN (Local Development Mode) ---
const serviceAccountPath = path.join(__dirname, '..', 'config', 'antigravity-tutor-dev-key.json');
if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
        global.db = admin.firestore();
        console.log(`✅ Firebase Admin initialized. Project: ${admin.app().options.credential.projectId}`);
    } catch (error) {
        console.error("❌ Firebase Admin initialization failed:", error);
        process.exit(1);
    }
} else {
    console.error(`❌ No Firebase Service Account found at ${serviceAccountPath}.`);
    process.exit(1);
}

// Import services AFTER firebase init
const LabService = require('../services/LabService');
const { MICRO_SKILLS } = require('../constants/microSkills');

const GRAMMAR_TOPICS = Object.keys(MICRO_SKILLS).filter(id => id.startsWith('grammar_'));
const LEVELS = ['3', '4', '5', '6', '7'];
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'grammar_labs');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
    console.log(`🚀 Starting pre-generation for ${GRAMMAR_TOPICS.length} topics and ${LEVELS.length} levels...`);
    
    for (const topic of GRAMMAR_TOPICS) {
        for (const level of LEVELS) {
            const filename = `${topic}_level_${level}.json`;
            const filepath = path.join(OUTPUT_DIR, filename);
            
            if (fs.existsSync(filepath)) {
                console.log(`⏩ Skipping ${filename} (Already exists)`);
                continue;
            }
            
            console.log(`\n💎 Generating: ${topic} (Level ${level})...`);
            try {
                // We use 'placeholder' UID to avoid checking real user history
                // We use isFactory: true to ensure full generation if bank is empty
                const lesson = await LabService.generateLesson({
                    topic: topic,
                    level: level,
                    uid: 'FACTORY_ADMIN',
                    isFactory: true,
                    forceHighQuality: true // Use Pro model for pre-generation
                });
                
                if (lesson) {
                    fs.writeFileSync(filepath, JSON.stringify(lesson, null, 2));
                    console.log(`✅ Saved ${filename}`);
                } else {
                    console.error(`❌ Failed to generate ${topic} (Level ${level}): No data returned.`);
                }
            } catch (err) {
                console.error(`❌ Error generating ${topic} (Level ${level}):`, err.message);
                // Wait a bit before retrying next one to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
            // Cool down between generations to avoid API rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n✨ Pre-generation complete!');
    process.exit(0);
}

run();
