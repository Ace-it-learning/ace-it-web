const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const uid = 'fQO24oXqTcSWLiJJagQd5s1IpEZ2';

async function check() {
    const doc = await db.collection('users').doc(uid).collection('progress').doc('english').get();
    if (doc.exists) {
        console.log('Skill Map Found:', JSON.stringify(doc.data(), null, 2));
    } else {
        console.log('Skill Map NOT Found');
    }
    process.exit();
}

check();
