/**
 * Specialized script to fix the schema mismatch by regenerating a single grammar lab.
 */
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// --- INITIALIZE FIREBASE ADMIN (Local Development Mode) ---
const serviceAccountPath = path.join(__dirname, 'backend', 'config', 'antigravity-tutor-dev-key.json');
if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
        global.db = admin.firestore();
        console.log(`✅ Firebase Admin initialized.`);
    } catch (error) {
        console.error("❌ Firebase Admin initialization failed:", error);
        process.exit(1);
    }
} else {
    console.error(`❌ No Firebase Service Account found.`);
    process.exit(1);
}

const LabService = require('./backend/services/LabService');
const topic = 'grammar_accuracy_sva';
const level = '5';
const OUTPUT_DIR = path.join(__dirname, 'backend', 'data', 'grammar_labs');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
    console.log(`\n💎 Regenerating: ${topic} (Level ${level})...`);
    try {
        const lesson = await LabService.generateLesson({
            topic: topic,
            level: level,
            uid: 'FACTORY_ADMIN',
            isFactory: true,
            forceHighQuality: true
        });
        
        if (lesson) {
            const filepath = path.join(OUTPUT_DIR, `${topic}_level_${level}.json`);
            fs.writeFileSync(filepath, JSON.stringify(lesson, null, 2));
            console.log(`✅ Saved ${topic}_level_${level}.json`);
        }
    } catch (err) {
        console.error(`❌ Error:`, err.message);
    }
    process.exit(0);
}

run();
