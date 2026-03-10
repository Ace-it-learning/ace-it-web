const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function wipeAllMathsQuests() {
    console.log('--- Wiping All Maths Questions from question_bank ---');

    // Using subject == 'Maths' to catch everything (approved, unapproved, factory)
    const snapshot = await db.collection('question_bank')
        .where('subject', '==', 'Maths')
        .get();

    console.log(`Found ${snapshot.size} questions to delete.`);

    if (snapshot.empty) {
        console.log('No questions found. Nothing to delete.');
        process.exit(0);
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('Successfully deleted all Maths questions.');
    process.exit(0);
}

wipeAllMathsQuests().catch(err => {
    console.error('Wipe failed:', err);
    process.exit(1);
});
