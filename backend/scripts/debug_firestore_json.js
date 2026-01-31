const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function debugQuestions() {
    const examsSnap = await db.collection('mock_exams').get();
    if (examsSnap.empty) return;

    const examId = examsSnap.docs[0].id;
    const qRef = db.collection('mock_exams').doc(examId).collection('questions');
    const qSnap = await qRef.orderBy('order_index').get();

    const data = qSnap.docs.map(doc => ({
        id: doc.id,
        part: doc.data().part,
        type: doc.data().type
    }));

    fs.writeFileSync('debug_data.json', JSON.stringify(data, null, 2));
    console.log("Done.");
}

debugQuestions().catch(console.error);
