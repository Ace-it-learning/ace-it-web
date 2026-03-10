const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspect() {
    console.log("--- Inspecting Approved Questions ---");
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_num_inequalities')
        .get();

    if (snapshot.empty) {
        console.log("No approved questions found.");
        process.exit();
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`  Topic: ${data.topic} (ID: ${data.topic_id})`);
        console.log(`  Level: ${data.level}`);
        console.log(`  ApprovedAt: ${data.approved_at?.toDate()}`);
        console.log(`  IsApproved: ${data.is_approved}`);
        console.log("--------------------");
    });

    console.log("\n--- Inspecting PENDING Questions (Unapproved) ---");
    const pending = await db.collection('question_bank')
        .where('is_approved', '==', false)
        .limit(5)
        .get();

    pending.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`  Topic: ${data.topic} (ID: ${data.topic_id})`);
        console.log(`  Level: ${data.level}`);
        console.log("--------------------");
    });

    process.exit();
}

inspect();
