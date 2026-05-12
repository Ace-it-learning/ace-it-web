const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function dump() {
    const uid = '7h71hRPkurhvcivrNki4HSCLzQU2';
    const doc = await db.collection('users').doc(uid).collection('progress').doc('english').get();
    if (!doc.exists) {
        console.log('No progress document for english');
        return;
    }
    console.log(JSON.stringify(doc.data(), null, 2));
}

dump().then(() => process.exit());
