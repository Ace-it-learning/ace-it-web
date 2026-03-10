const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function flushPending() {
    console.log("--- Flushing Pending Questions for math_geo_circles ---");
    try {
        const snapshot = await db.collection('question_bank')
            .where('topic_id', '==', 'math_geo_circles')
            .where('is_approved', '==', false)
            .get();

        if (snapshot.empty) {
            console.log("No pending questions found.");
            process.exit(0);
        }

        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            console.log(`Deleting: ${doc.id}`);
        });

        await batch.commit();
        console.log(`Successfully deleted ${snapshot.size} stale pending questions.`);

    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

flushPending();
