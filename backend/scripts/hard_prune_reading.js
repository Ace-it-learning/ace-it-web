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

async function hardPrune() {
    console.log('🔨 Hard Pruning Reading Bank (Limit: Exactly 12 per L5/L7 topic)...\n');

    for (const topic of READING_TOPICS) {
        for (const level of LEVELS) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .where('level', '==', level)
                .get();

            if (snapshot.size > 12) {
                console.log(`✂️  Pruning ${topic} [${level}]: ${snapshot.size} -> 12`);
                
                // Sort by ID (usually newest first in Firestore for custom IDs) or creation date
                const sortedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                // In this case, we'll just keep the first 12 we find to maintain local consistency
                const toDelete = sortedDocs.slice(12);

                const batch = db.batch();
                toDelete.forEach(docEntry => {
                    batch.delete(db.collection('question_bank').doc(docEntry.id));
                });
                await batch.commit();
            }
        }
    }

    console.log('\n✅ Hard Pruning Complete.');
    process.exit(0);
}

hardPrune().catch(console.error);
