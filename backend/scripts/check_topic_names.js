const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkTopicNames() {
    const snapshot = await db.collection('question_bank').get();
    const topics = new Set();
    snapshot.forEach(doc => {
        topics.add(doc.data().topic);
    });
    console.log('Unique Topics in DB:', Array.from(topics).sort());
    process.exit(0);
}

checkTopicNames().catch(console.error);
