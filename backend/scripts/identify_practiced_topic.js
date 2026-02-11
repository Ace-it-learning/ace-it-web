const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function identifyPractice(email) {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) return;
    const uid = userSnapshot.docs[0].id;

    const historySnap = await db.collection('users').doc(uid).collection('practice_history').get();
    if (historySnap.empty) {
        console.log('No practice history found.');
        return;
    }

    const qids = historySnap.docs.map(doc => doc.id);
    console.log(`Found ${qids.length} questions in history.`);

    const topics = new Set();
    for (const qid of qids) {
        const qDoc = await db.collection('question_bank').doc(qid).get();
        if (qDoc.exists) {
            topics.add(qDoc.data().topic);
        }
    }

    console.log('Detected Topics from Question Bank:', Array.from(topics));
    process.exit(0);
}

identifyPractice('fungtam@gmail.com');
