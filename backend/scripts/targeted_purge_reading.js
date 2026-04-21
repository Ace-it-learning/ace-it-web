const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function purgeLiteralCompL3() {
    console.log('--- PURGE: LITERAL COMPREHENSION (Level 3) ---');

    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'reading_literalComprehension')
        .where('level', '==', 'HKDSE Level 3 (Adequate)')
        .get();
    
    console.log(`Found ${snapshot.size} documents for this topic/level.`);

    const clusters = {}; // passage snippet -> docs
    const crypto = require('crypto');

    snapshot.forEach(doc => {
        const d = doc.data();
        const snippet = (d.passage || '').trim();
        const hash = crypto.createHash('md5').update(snippet).digest('hex');
        if (!clusters[hash]) clusters[hash] = [];
        clusters[hash].push(doc.id);
    });

    let deletedCount = 0;
    for (const [hash, docs] of Object.entries(clusters)) {
        if (docs.length < 8) {
            console.log(`Cluster ${hash.substring(0,8)} has only ${docs.length} questions. DELETING...`);
            for (const id of docs) {
                await db.collection('question_bank').doc(id).delete();
                deletedCount++;
            }
        } else {
            console.log(`Cluster ${hash.substring(0,8)} is healthy (${docs.length} questions). Keeping.`);
        }
    }

    console.log(`PURGE COMPLETE. Deleted ${deletedCount} sub-standard questions.`);
}

purgeLiteralCompL3().then(() => process.exit(0)).catch(console.error);
