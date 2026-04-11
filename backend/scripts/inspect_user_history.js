const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspectHistory(uid) {
    const historyRef = db.collection('users').doc(uid).collection('practice_history');
    const snapshot = await historyRef.limit(10).get();
    
    if (snapshot.empty) {
        console.log('No history found for user:', uid);
        return;
    }

    snapshot.forEach(doc => {
        console.log('Doc ID:', doc.id, 'Data:', JSON.stringify(doc.data()));
    });
}

inspectHistory('EDZNtvh1RIXSpboSkcBE3Y6D8c12');
