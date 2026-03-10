const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspectBank() {
    console.log('--- Bank Inspection (AP & GP) ---');
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_apgp')
        .limit(3)
        .get();

    snapshot.forEach(doc => {
        console.log(`ID: ${doc.id}`);
        console.log(`Title: ${doc.data().topic}`);
        console.log(`Level: ${doc.data().level} (Type: ${typeof doc.data().level})`);
        console.log(`Approved: ${doc.data().is_approved} (Type: ${typeof doc.data().is_approved})`);
        console.log(`Factory: ${doc.data().is_factory}`);
        console.log('---');
    });

    process.exit(0);
}

inspectBank().catch((err) => {
    console.error(err);
    process.exit(1);
});
