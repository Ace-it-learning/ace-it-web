const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const TOPICS_TO_WIPE = ['math_alg_apgp', 'math_num_percentages'];

async function wipeTopics() {
    for (const topicId of TOPICS_TO_WIPE) {
        console.log(`[Wipe] Cleaning ${topicId}...`);
        const snapshot = await db.collection('question_bank')
            .where('topic_id', '==', topicId)
            .get();

        if (snapshot.empty) {
            console.log(`[Wipe] No questions found for ${topicId}.`);
            continue;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`[Wipe] Deleted ${snapshot.size} questions from ${topicId}.`);
    }
}

wipeTopics().catch(console.error);
