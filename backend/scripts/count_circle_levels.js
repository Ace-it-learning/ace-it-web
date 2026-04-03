const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function countLevels() {
    const db = admin.firestore();
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_geo_circles')
        .where('is_approved', '==', true)
        .get();

    const counts = {};
    snapshot.forEach(doc => {
        const level = doc.data().level || 'unknown';
        counts[level] = (counts[level] || 0) + 1;
    });
    console.log(JSON.stringify(counts, null, 2));
    process.exit(0);
}

countLevels();
