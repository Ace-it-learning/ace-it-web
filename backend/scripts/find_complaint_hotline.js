const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function findQuest() {
    const snapshot = await db.collection('question_bank')
        .where('title', '==', 'Complaint Hotline')
        .get();

    if (snapshot.empty) {
        console.log('No quest found with title "Complaint Hotline"');
        return;
    }

    snapshot.forEach(doc => {
        console.log(`FOUND: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
    });
}

findQuest();
