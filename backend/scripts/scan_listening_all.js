const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function scanListening() {
    const snapshot = await db.collection('question_bank')
        .where('paper', '==', 'Listening')
        .get();

    const stats = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        const type = data.type || "Unknown Type";
        const topic = data.topic || "Unknown Topic";
        const approved = data.is_approved || false;
        const key = `${type} | ${topic} | Approved: ${approved}`;
        stats[key] = (stats[key] || 0) + 1;
    });

    console.log("All Listening Documents in Bank:");
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
}

scanListening();
