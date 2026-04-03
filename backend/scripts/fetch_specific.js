const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function getQuestionById() {
    const db = admin.firestore();
    const qid = 'f750aa473b153ae0d050d2b8b154b5fa';
    const doc = await db.collection('question_bank').doc(qid).get();

    const fs = require('fs');
    if (doc.exists) {
        fs.writeFileSync('elite_question_detail.json', JSON.stringify(doc.data(), null, 2));
        console.log("Saved to elite_question_detail.json");
    } else {
        console.log("Not found");
    }
    process.exit(0);
}

getQuestionById();
