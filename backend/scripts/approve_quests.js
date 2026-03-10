const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function approveUserQuests() {
    console.log("🔍 APPROVING USER-GENERATED QUESTS...");

    // We'll target the "Letter to the Editor" quest IDs identified in the audit
    const idsToApprove = [
        "0d32f3bd1e43c3c8fb6f1b8d8bcb805c",
        "9dfdb891e74821edcd7a4ab1b9d56e59",
        "b3a9d318b21fba896975260c54bc1345",
        "f457d8cdec81920346612dac4390311c"
    ];

    let count = 0;
    for (const id of idsToApprove) {
        console.log(`Approving ${id}...`);
        await db.collection('question_bank').doc(id).update({
            is_approved: true
        });
        count++;
    }

    console.log(`✅ Approved ${count} records.`);
}

approveUserQuests().catch(console.error);
