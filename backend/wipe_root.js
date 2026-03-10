const admin = require('firebase-admin');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(keyPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function wipe() {
    console.log('Wiping Maths questions...');
    const snapshot = await db.collection('question_bank')
        .where('subject', '==', 'Maths')
        .get();

    console.log(`Found ${snapshot.size} docs`);
    if (snapshot.empty) process.exit(0);

    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('Wiped.');
    process.exit(0);
}
wipe();
