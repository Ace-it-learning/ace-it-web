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

async function countPerPassage() {
    const snapshot = await db.collection('question_bank')
        .where('topic', '==', 'Literal Comprehension')
        .where('level', '==', 'HKDSE Level 5 (Strong)')
        .get();

    const passageMap = {}; // hash -> count
    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.passage) return;
        const hash = crypto.createHash('md5').update(data.passage.trim()).digest('hex');
        passageMap[hash] = (passageMap[hash] || 0) + 1;
    });

    console.log('--- Questions Per Passage (Literal Comprehension L5) ---');
    Object.entries(passageMap).forEach(([hash, count]) => {
        console.log(`Passage ${hash.substring(0, 8)}: ${count} questions`);
    });

    process.exit(0);
}

countPerPassage().catch(console.error);
