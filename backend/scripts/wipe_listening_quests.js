const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function wipeListeningQuests() {
    console.log("Starting wipe of Listening Missions...");
    const snapshot = await db.collection('question_bank')
        .where('type', '==', 'listening_mission')
        .get();

    if (snapshot.empty) {
        console.log("No listening quests found.");
        return;
    }

    const batch = db.batch();
    let count = 0;
    snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
    });

    await batch.commit();
    console.log(`Successfully deleted ${count} listening quests.`);
}

wipeListeningQuests();
