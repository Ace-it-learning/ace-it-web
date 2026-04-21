const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const TARGETS = {
    'HKDSE Level 3 (Adequate)': 8,
    'HKDSE Level 4 (Good)': 10,
    'HKDSE Level 5 (Strong)': 12,
    'HKDSE Level 5** (Mastery)': 12
};

const READING_TOPICS = [
    'Literal Comprehension', 'Inference', 'Main Idea Identification', 
    'Detail Recognition', 'Sequencing', 'Synthesis', 'Fact vs Opinion', 
    'Author\'s Purpose', 'Tone & Attitude', 'Register & Style', 
    'Metaphorical Language', 'Text Organisation', 'Skimming & Scanning', 
    'Paraphrasing', 'Cohesion & Reference'
];

async function finalScrub() {
    console.log('🧼 FINAL SCRUB: Enforcing exact counts using Audit-Compatible Strings...');

    for (const topic of READING_TOPICS) {
        for (const [levelKey, target] of Object.entries(TARGETS)) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .where('level', '==', levelKey)
                .get();

            if (snapshot.size > target) {
                console.log(`  Cleaning ${topic} [${levelKey}]: ${snapshot.size} -> ${target}`);
                const docs = snapshot.docs;
                // Delete everything AFTER the first 'target' docs
                const batch = db.batch();
                docs.slice(target).forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }
        }
    }

    console.log('\n✅ FINAL SCRUB COMPLETE.');
    process.exit(0);
}

finalScrub().catch(console.error);
