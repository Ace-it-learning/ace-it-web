const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const READING_TOPICS = [
    'Literal Comprehension', 'Inference', 'Main Idea Identification', 
    'Detail Recognition', 'Sequencing', 'Synthesis', 'Fact vs Opinion', 
    'Author\'s Purpose', 'Tone & Attitude', 'Register & Style', 
    'Metaphorical Language', 'Text Organisation', 'Skimming & Scanning', 
    'Paraphrasing', 'Cohesion & Reference'
];

const CONFIG = {
    'Level 3': 'HKDSE Level 3 (Adequate)',
    'Level 4': 'HKDSE Level 4 (Good)',
    'Level 5': 'HKDSE Level 5 (Strong)',
    'Level 7': 'HKDSE Level 5** (Mastery)'
};

async function audit() {
    console.log('📊 Audit of 15 Core Reading Topics\n');
    console.log(`${'Topic'.padEnd(30)} | L3 (8) | L4 (10) | L5 (12) | L7 (12)`);
    console.log('-'.repeat(70));

    for (const topic of READING_TOPICS) {
        let counts = [];
        for (const [key, levelName] of Object.entries(CONFIG)) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .where('level', '==', levelName)
                .get();
            counts.push(snapshot.size);
        }
        console.log(`${topic.padEnd(30)} | ${String(counts[0]).padEnd(6)} | ${String(counts[1]).padEnd(7)} | ${String(counts[2]).padEnd(7)} | ${String(counts[3]).padEnd(7)}`);
    }

    console.log('\n(Target counts in brackets)');
    process.exit(0);
}

audit().catch(console.error);
