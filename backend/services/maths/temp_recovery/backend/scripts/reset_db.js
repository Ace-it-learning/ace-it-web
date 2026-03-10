const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function resetDatabase() {
    console.log("⚠️  STARTING DATABASE RESET: Deleting all 'mock_exams'...");

    const collectionRef = db.collection('mock_exams');
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log("No exams found to delete.");
        return;
    }

    // Using bulkWriter to delete documents is efficient, but we need recursive delete for subcollections (questions)
    // admin.firestore().recursiveDelete(ref) is the best way.

    const batchSize = 10;
    let deletedCount = 0;

    // We can just call recursiveDelete on the collection reference? No, usually on doc refs or query refs.
    // Actually, recursiveDelete works on CollectionReference too in newer SDKs, or we iterate docs.

    // Safer approach: Iterate docs and recursive delete each exam.
    // This ensures subcollections (questions, marking_keys) are gone.

    for (const doc of snapshot.docs) {
        console.log(`Deleting exam: ${doc.id} (${doc.data().title})...`);
        await db.recursiveDelete(doc.ref);
        deletedCount++;
    }

    console.log(`✅  RESET COMPLETE. Deleted ${deletedCount} exams.`);
}

resetDatabase().catch(console.error);
