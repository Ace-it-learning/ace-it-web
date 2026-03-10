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
    console.log("🕵️ Inspecting 'Reading Strategy' quests...");
    try {
        const snapshot = await db.collection('question_bank')
            .where('topic', '==', 'Reading Strategy')
            .limit(2)
            .get();

        if (snapshot.empty) {
            console.log("No quests found for 'Reading Strategy'.");
            return;
        }

        snapshot.forEach(doc => {
            console.log(`\n--- Document ID: ${doc.id} ---`);
            const data = doc.data();
            console.log(`Topic: ${data.topic}`);
            console.log(`Level: ${data.level}`);
            console.log(`Question: ${data.question || data.text || 'N/A'}`);
            console.log(`Passage Preview: ${data.passage ? data.passage.substring(0, 100) + '...' : 'N/A'}`);
            console.log(`Is Approved: ${data.is_approved}`);
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

debug();
