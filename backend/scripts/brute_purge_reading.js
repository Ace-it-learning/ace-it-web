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

async function brutePurgeReading() {
    console.log('--- 🛡️ BRUTE-FORCE PURGING SUB-STANDARD READING DATA ---');

    const snapshot = await db.collection('question_bank').get();
    
    console.log(`Analyzing ${snapshot.size} total bank documents...`);

    // We group by passage to identify "unhealthy clusters"
    const passageGroups = {}; // hash -> { count: 0, docs: [] }
    const crypto = require('crypto');

    snapshot.forEach(doc => {
        const d = doc.data();
        const topic = String(d.topic || '').toLowerCase();
        const topic_id = String(d.topic_id || '').toLowerCase();
        const paper = String(d.paper || d.paper_type || '').toLowerCase();
        
        // Target ONLY Reading topics/paper
        const isReading = topic.includes('reading') || topic.includes('comprehension') || 
                          topic_id.includes('reading') || topic_id.includes('comprehension') ||
                          paper === 'reading';
        
        if (!isReading) return;

        console.log(`Checking [${doc.id}] Topic: [${d.topic}] ID: [${d.topic_id}] Paper: [${paper}]`);

        if (!d.passage) {
            console.log(`🗑️ Deleting broken Reading doc (no passage): ${doc.id}`);
            db.collection('question_bank').doc(doc.id).delete();
            return;
        }

        const pHash = crypto.createHash('md5').update(d.passage.trim()).digest('hex');
        if (!passageGroups[pHash]) {
            passageGroups[pHash] = { count: 0, docs: [] };
        }
        passageGroups[pHash].count++;
        passageGroups[pHash].docs.push(doc.id);
    });

    let deletedCount = 0;
    for (const [hash, info] of Object.entries(passageGroups)) {
        if (info.count < 8) {
            console.log(`⚠️ Unhealthy Reading Cluster Found (${info.count} questions). Purging 🗑️...`);
            for (const id of info.docs) {
                await db.collection('question_bank').doc(id).delete();
                deletedCount++;
            }
        }
    }

    console.log(`=== 🏁 BRUTE PURGE COMPLETE: Removed ${deletedCount} sub-standard questions. ===`);
}

brutePurgeReading()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
