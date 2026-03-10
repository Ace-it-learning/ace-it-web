const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function cleanCollection(collectionName) {
    console.log(`Cleaning collection: ${collectionName}...`);
    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
        console.log(`Collection ${collectionName} is already empty.`);
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} documents from ${collectionName}.`);
}

async function startCleanup() {
    try {
        // Clean the new question bank (just in case of stale test data)
        await cleanCollection('question_bank');

        // Optionally clean legacy quests if requested (User specifically said "clean up question bank")
        // await cleanCollection('quests'); 

        console.log('Database cleanup complete and ready for Factory Model migration.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

startCleanup();
