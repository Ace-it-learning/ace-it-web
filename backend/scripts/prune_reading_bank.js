const admin = require('firebase-admin');
const path = require('path');
const crypto = require('crypto');

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

async function pruneBank() {
    console.log('🚀 Starting Data Cleanup: Pruning sub-standard Reading passages...');

    for (const topic of READING_TOPICS) {
        console.log(`\n📂 Cleaning Topic: ${topic}`);

        for (const level of ['HKDSE Level 5 (Strong)', 'HKDSE Level 5** (Mastery)']) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .where('level', '==', level)
                .get();

            if (snapshot.empty) {
                console.log(`  - No content found for ${level}.`);
                continue;
            }

            const passageGroups = {}; // hash -> [docIds]
            const passageContent = {}; // hash -> text

            snapshot.forEach(doc => {
                const data = doc.data();
                const text = data.passage || data.reading_passage || "";
                if (!text) return;
                const hash = crypto.createHash('md5').update(text.trim()).digest('hex');
                if (!passageGroups[hash]) {
                    passageGroups[hash] = [];
                    passageContent[hash] = text;
                }
                passageGroups[hash].push(doc.id);
            });

            const hashes = Object.keys(passageGroups);
            console.log(`  - Found ${hashes.length} passages for ${level}.`);

            let premiumKept = false;
            let deletedCount = 0;

            for (const hash of hashes) {
                const docIds = passageGroups[hash];
                const count = docIds.length;

                // Rule: If count < 12, DELETE.
                // Rule: If count >= 12 and we already Kept one, DELETE (Keep 1 only).
                if (count < 12 || (count >= 12 && premiumKept)) {
                    console.log(`    ❌ Deleting passage ${hash.substring(0,8)} (${count} questions)`);
                    const batch = db.batch();
                    docIds.forEach(id => {
                        batch.delete(db.collection('question_bank').doc(id));
                    });
                    await batch.commit();
                    deletedCount += count;
                } else if (count >= 12 && !premiumKept) {
                    console.log(`    ✅ KEEPING passage ${hash.substring(0,8)} (PREMIUM 12)`);
                    premiumKept = true;
                }
            }
            
            if (deletedCount > 0) console.log(`  ✅ Done. Deleted ${deletedCount} questions.`);
        }
    }

    console.log('\n🏁 Cleanup Completed.');
    process.exit(0);
}

pruneBank().catch(console.error);
