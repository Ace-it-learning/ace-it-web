const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspect(uid) {
    try {
        const mathProgressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
        const doc = await mathProgressRef.get();
        if (!doc.exists) {
            console.log('No math progress document found.');
            return;
        }
        console.log(JSON.stringify(doc.data(), null, 2));
    } catch (e) { console.error(e); }
}

inspect('EDZNtvh1RIXSpboSkcBE3Y6D8c12');
