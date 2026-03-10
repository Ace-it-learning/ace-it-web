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
    console.log("🕵️ Checking approval status of 'Skimming & Scanning'...");
    try {
        const snapshot = await db.collection('question_bank')
            .where('topic', '==', 'Skimming & Scanning')
            .get();

        if (snapshot.empty) {
            console.log("No quests found for 'Skimming & Scanning'.");
            return;
        }

        let approved = 0;
        let unapproved = 0;
        const levels = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.is_approved === true) approved++;
            else unapproved++;

            const lvl = data.level || 'Unknown';
            if (!levels[lvl]) levels[lvl] = { approved: 0, unapproved: 0 };
            if (data.is_approved === true) levels[lvl].approved++;
            else levels[lvl].unapproved++;
        });

        console.log(`Total Found: ${snapshot.size}`);
        console.log(`Approved: ${approved}`);
        console.log(`Unapproved: ${unapproved}`);
        console.log("\nLevel Breakdown:");
        for (const [lvl, counts] of Object.entries(levels)) {
            console.log(`${lvl}: Approved=${counts.approved}, Unapproved=${counts.unapproved}`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

debug();
