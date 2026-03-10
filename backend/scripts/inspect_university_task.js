const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function inspectTask() {
    const taskId = '02702b755af6ef7a3fff26f084cd918c'; // ID from previous scan
    console.log(`Inspecting Task ID: ${taskId}`);

    const doc = await db.collection('question_bank').doc(taskId).get();
    if (!doc.exists) {
        console.log('Document not found.');
        return;
    }

    const data = doc.data();
    console.log('--- Data ---');
    console.log(`Topic: ${data.topic}`);
    console.log(`Type: ${data.type}`);
    console.log(`Passage Length: ${data.reading_passage ? data.reading_passage.length : 0}`);
    if (data.reading_passage) {
        console.log(`Passage Preview: ${data.reading_passage.substring(0, 100)}...`);
    }
    console.log(`Prediction Metadata:`, JSON.stringify(data.prediction_metadata, null, 2));
}

inspectTask();
