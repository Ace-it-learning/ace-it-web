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

async function deduplicate() {
    console.log('🧹 Starting Professional Deduplication (Target: 1 Premium Passage per Topic/Level)\n');

    for (const topic of READING_TOPICS) {
        for (const level of LEVELS) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .where('level', '==', level)
                .get();

            if (snapshot.empty) continue;

            // Group by passage text
            const passageGroups = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const passageText = data.passage || "";
                if (!passageGroups[passageText]) {
                    passageGroups[passageText] = [];
                }
                passageGroups[passageText].push({ id: doc.id, ...data });
            });

            const uniquePassages = Object.keys(passageGroups);
            if (uniquePassages.length === 1 && passageGroups[uniquePassages[0]].length === 12) {
                // Already perfect
                continue;
            }

            console.log(`Processing ${topic} [${level}]... Found ${uniquePassages.length} passages.`);

            // Selection Priority:
            // 1. A passage with exactly 12 questions.
            // 2. If multiple, the one with the most recent creation or highest IDs.
            // 3. If none with 12, the one closest to 12.
            
            let bestPassageText = null;
            let bestCount = -1;

            uniquePassages.forEach(pText => {
                const count = passageGroups[pText].length;
                // Favor 12 exactly
                if (count === 12) {
                    bestPassageText = pText;
                    bestCount = 12;
                } else if (bestCount !== 12 && count > bestCount) {
                    bestPassageText = pText;
                    bestCount = count;
                }
            });

            // If no clear winner, just pick the first one from the list as fallback
            if (!bestPassageText) bestPassageText = uniquePassages[0];

            console.log(`  🏆 Winner: ${bestPassageText.substring(0, 50)}... (${passageGroups[bestPassageText].length} questions)`);

            // DELETE everything else
            let deleteCount = 0;
            const batch = db.batch();
            
            uniquePassages.forEach(pText => {
                if (pText !== bestPassageText) {
                    passageGroups[pText].forEach(docEntry => {
                        batch.delete(db.collection('question_bank').doc(docEntry.id));
                        deleteCount++;
                    });
                } else if (passageGroups[pText].length > 12) {
                    // If the "winner" has more than 12 questions (e.g. 23), prune it down to the first 12
                    const extras = passageGroups[pText].slice(12);
                    extras.forEach(docEntry => {
                        batch.delete(db.collection('question_bank').doc(docEntry.id));
                        deleteCount++;
                    });
                    console.log(`  ✂️  Pruned winning passage from ${passageGroups[pText].length} to 12 questions.`);
                }
            });

            if (deleteCount > 0) {
                await batch.commit();
                console.log(`  ✅ Deleted ${deleteCount} redundant/sub-standard documents.`);
            }
        }
    }

    console.log('\n🏁 Deduplication complete.');
    process.exit(0);
}

deduplicate().catch(console.error);
