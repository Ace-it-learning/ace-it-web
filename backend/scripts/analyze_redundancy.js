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

const LEVELS = ['HKDSE Level 5 (Strong)', 'HKDSE Level 5** (Mastery)'];

async function listRedundant() {
    console.log('🔍 Analyzing redundant passages in L5/L7...\n');

    for (const topic of READING_TOPICS) {
        for (const level of LEVELS) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .where('level', '==', level)
                .get();

            if (snapshot.size > 12) {
                // Group by passage text to identify unique passages
                const passages = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const passageKey = data.passage ? data.passage.substring(0, 100) : 'no-passage';
                    if (!passages[passageKey]) passages[passageKey] = [];
                    passages[passageKey].push({ id: doc.id, count: data.question });
                });

                const uniquePassageCount = Object.keys(passages).length;
                console.log(`Topic: ${topic} | ${level}`);
                console.log(`  Total Docs: ${snapshot.size} | Unique Passages: ${uniquePassageCount}`);
                Object.keys(passages).forEach((p, i) => {
                    console.log(`    [Passage ${i+1}] ${p}... (${passages[p].length} questions)`);
                });
                console.log('');
            }
        }
    }
    process.exit(0);
}

listRedundant().catch(console.error);
