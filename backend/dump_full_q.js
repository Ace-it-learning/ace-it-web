const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function dumpFullQuestion() {
    const db = admin.firestore();
    const qid = 'fc142c5761ec4c3500dcb8972ae06f55';
    const doc = await db.collection('question_bank').doc(qid).get();

    if (!doc.exists) {
        console.log("Question not found");
        process.exit(1);
    }

    const data = doc.data();
    fs.writeFileSync('full_q_dump.json', JSON.stringify(data, null, 2));
    console.log("Full question dumped to full_q_dump.json");
    process.exit(0);
}

dumpFullQuestion();
