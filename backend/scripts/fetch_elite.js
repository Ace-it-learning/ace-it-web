const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function getEliteQuestions() {
    const db = admin.firestore();
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_geo_circles')
        .where('level', '==', 7)
        .where('is_approved', '==', true)
        .get();

    const results = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}

getEliteQuestions();
