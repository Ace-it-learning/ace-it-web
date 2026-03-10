const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function findPassage() {
    const topic = 'University Interview';
    console.log(`Scanning for passage in topic: ${topic}`);

    const snapshot = await db.collection('question_bank')
        .where('topic', '==', topic)
        .get();

    let found = false;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.reading_passage && data.reading_passage.length > 50) {
            console.log(`FOUND PASSAGE in ID: ${doc.id}`);
            console.log(`Type: ${data.type}`);
            console.log(`Preview: ${data.reading_passage.substring(0, 100)}...`);
            found = true;
        }
    });

    if (!found) {
        console.log('No passage found in any document for this topic.');
    }
}

findPassage();
