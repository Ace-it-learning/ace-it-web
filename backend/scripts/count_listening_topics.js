const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function countTopics() {
    const snapshot = await db.collection('question_bank')
        .where('type', '==', 'listening_mission')
        .where('is_approved', '==', true)
        .get();

    const stats = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        const topic = data.topic || "Unknown";
        stats[topic] = (stats[topic] || 0) + 1;
    });

    console.log("Listening Mission Stats (Approved):");
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
}

countTopics();
