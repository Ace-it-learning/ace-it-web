const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
    console.log("Firebase Admin initialized.");
} else {
    console.error("❌ Service account key not found!");
    process.exit(1);
}

const db = admin.firestore();

async function wipeMathQuests() {
    console.log("Searching for Maths quests with topic: 'Percentages & Interest'...");

    try {
        const snapshot = await db.collection('question_bank')
            .where('subject', '==', 'Maths')
            .where('topic', '==', 'Percentages & Interest')
            .get();

        if (snapshot.empty) {
            console.log("No matching Math questions found to wipe.");
            return;
        }

        console.log(`Found ${snapshot.size} documents. Starting deletion...`);

        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            console.log(`  Deleting doc ID: ${doc.id}`);
        });

        await batch.commit();
        console.log(`\n✅ Successfully wiped ${snapshot.size} Math questions.`);

    } catch (err) {
        console.error("Error during wipe:", err);
    }
}

wipeMathQuests();
