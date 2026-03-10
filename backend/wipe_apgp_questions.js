const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function wipeApgpQuestions() {
    console.log("Searching for AP & GP questions in question_bank...");
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_apgp')
        .get();

    if (snapshot.empty) {
        console.log("No AP & GP questions found to delete.");
        return;
    }

    console.log(`Found ${snapshot.size} questions. Deleting...`);

    const batch = db.batch();
    snapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("Successfully wiped all AP & GP questions.");
}

wipeApgpQuestions().catch(console.error);
