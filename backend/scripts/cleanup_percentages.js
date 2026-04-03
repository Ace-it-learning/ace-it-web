const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function cleanup() {
    console.log("[Cleanup] Fetching all Percentage questions...");
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_num_percentages')
        .get();

    console.log(`[Cleanup] Found ${snapshot.size} total questions.`);

    let toDelete = [];
    let toKeep = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        // A "good" question must have question_zh and is_approved: true
        // And it should be part of the latest batch (using the IDs from the insertion script)
        if (!data.question_zh) {
            console.log(`[Cleanup] ❌ Marking for deletion (Missing ZH): ${doc.id} - ${data.question.substring(0, 50)}...`);
            toDelete.push(doc.id);
        } else {
            // Check for duplicates (same question text + level)
            const key = `${data.question}-${data.level}`;
            if (toKeep.includes(key)) {
                console.log(`[Cleanup] ❌ Marking for deletion (Duplicate): ${doc.id} - ${data.question.substring(0, 50)}...`);
                toDelete.push(doc.id);
            } else {
                toKeep.push(key);
                console.log(`[Cleanup] ✅ Keeping: ${doc.id} - Level ${data.level}`);
            }
        }
    });

    if (toDelete.length > 0) {
        console.log(`[Cleanup] Deleting ${toDelete.length} questions...`);
        const batch = db.batch();
        toDelete.forEach(id => {
            batch.delete(db.collection('question_bank').doc(id));
        });
        await batch.commit();
        console.log("[Cleanup] Deletion complete.");
    } else {
        console.log("[Cleanup] Nothing to delete.");
    }
}

cleanup().catch(console.error);
