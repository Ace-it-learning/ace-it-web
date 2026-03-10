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
    console.log("🕵️ Listing all unique topics in question_bank...");
    try {
        const snapshot = await db.collection('question_bank').get();
        const topics = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.topic) topics.add(data.topic);
        });

        console.log("\nTopics Found:");
        Array.from(topics).forEach(t => {
            console.log(`[${t}] (Length: ${t.length})`);
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

debug();
