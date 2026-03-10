const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function debug() {
    console.log("🕵️ Peeking into question_bank...");
    try {
        const snapshot = await db.collection('question_bank').get();
        console.log(`Total documents: ${snapshot.size}`);

        const topics = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const t = data.topic || 'no_topic';
            const approved = data.is_approved === true;

            if (!topics[t]) topics[t] = { approved: 0, unapproved: 0 };
            if (approved) topics[t].approved++;
            else topics[t].unapproved++;
        });

        console.log("\nTopic Breakdown:");
        for (const [topic, counts] of Object.entries(topics)) {
            console.log(`${topic.padEnd(30)} | Approved: ${counts.approved} | Unapproved: ${counts.unapproved}`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

debug();
