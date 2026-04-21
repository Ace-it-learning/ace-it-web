const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkZeroWaste() {
    const snapshot = await db.collection('question_bank').get();
    
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.passage && data.passage.includes('burgeoning zero-waste movement')) {
            console.log(JSON.stringify({
                id: doc.id,
                topic: data.topic,
                level: data.level,
                is_approved: data.is_approved
            }, null, 2));
        }
    });

    // Check counts for Literal Comprehension L3
    const l3Snapshot = await db.collection('question_bank')
        .where('topic', '==', 'Literal Comprehension')
        .where('level', '==', 'HKDSE Level 3 (Adequate)')
        .get();

    console.log(`\nLiteral Comprehension Level 3 Docs: ${l3Snapshot.size}`);

    process.exit(0);
}

checkZeroWaste().catch(console.error);
