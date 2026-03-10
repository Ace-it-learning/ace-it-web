const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkApprovedMissingTopicId() {
    console.log('--- Approved Questions Audit ---');
    const snapshot = await db.collection('question_bank')
        .where('is_approved', '==', true)
        .get();

    let missingTopicIdCount = 0;
    const topics = new Set();

    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.topic_id) {
            missingTopicIdCount++;
            if (data.topic) topics.add(data.topic);
        }
    });

    console.log(`Total approved: ${snapshot.size}`);
    console.log(`Approved but missing topic_id: ${missingTopicIdCount}`);
    if (missingTopicIdCount > 0) {
        console.log('Topics missing topic_id:', Array.from(topics));
    }

    process.exit(0);
}

checkApprovedMissingTopicId().catch(console.error);
