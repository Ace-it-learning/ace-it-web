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

async function debugMissions() {
    console.log('--- 🛡️  DEBUGGING LITERAL COMPREHENSION EASY ---');

    const snapshot = await db.collection('question_bank')
        .where('is_premium', '==', true)
        .get();
    
    console.log(`Found ${snapshot.size} total premium documents.`);

    const passageCounts = {}; 

    snapshot.forEach(doc => {
        const d = doc.data();
        if (String(d.topic).toLowerCase().includes('literal')) {
           const p = d.passage || 'NO_PASSAGE';
           const key = `${d.level || 'NO_LVL'} | Topic: ${d.topic} | Passage: ${p.substring(0, 40)}...`;
           if (!passageCounts[key]) passageCounts[key] = { count: 0, is_premium: d.is_premium, is_approved: d.is_approved };
           passageCounts[key].count++;
        }
    });

    Object.entries(passageCounts).forEach(([key, info], i) => {
        console.log(`\nCluster ${i+1} [${key}]:`);
        console.log(`  Questions: ${info.count}`);
        console.log(`  Premium: ${info.is_premium} | Approved: ${info.is_approved}`);
    });
}

debugMissions()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
