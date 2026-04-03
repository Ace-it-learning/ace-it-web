const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}
const db = admin.firestore();

async function wipe() {
    console.log("[Wipe] Fetching all Percentage questions for topic_id: math_num_percentages...");
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_num_percentages')
        .get();

    console.log(`[Wipe] Found ${snapshot.size} questions to delete.`);

    if (snapshot.size === 0) return;

    const batch = db.batch();
    snapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("[Wipe] Wiped math_num_percentages successfully.");
}

wipe().catch(console.error);
