const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspectBankFields() {
    console.log('--- Bank Field Inspection ---');
    const snapshot = await db.collection('question_bank')
        .limit(10)
        .get();

    const allFields = new Set();
    snapshot.forEach(doc => {
        Object.keys(doc.data()).forEach(field => allFields.add(field));
    });

    console.log('Fields found in question_bank documents:');
    console.log(Array.from(allFields).join(', '));

    // Check specifically for released
    const releasedSnapshot = await db.collection('question_bank')
        .where('is_released', '==', true)
        .limit(1)
        .get();

    console.log('is_released exists:', !releasedSnapshot.empty);
    if (!releasedSnapshot.empty) {
        console.log('Sample released question ID:', releasedSnapshot.docs[0].id);
    }

    const releasedStatusSnapshot = await db.collection('question_bank')
        .where('status', '==', 'released')
        .limit(1)
        .get();
    console.log('status == released exists:', !releasedStatusSnapshot.empty);

    process.exit(0);
}

inspectBankFields().catch((err) => {
    console.error(err);
    process.exit(1);
});
