const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const UID = 'HUJ6CtxNOAdWv7q7sTIwrlotF8B2'; // User: Jack Tam
const TOPIC_ID = 'math_num_percentages';

async function resetProgress() {
    console.log(`[Reset] Clearing ALL progress for topic: ${TOPIC_ID} for user: ${UID}...`);

    const batch = db.batch();

    // 1. Delete skill node
    const skillRef = db.collection('users').doc(UID).collection('skills').doc(TOPIC_ID);
    batch.delete(skillRef);

    // 2. Find and delete practice history for this topic
    const historyRef = db.collection('user_practice_history')
        .where('uid', '==', UID)
        .where('topic_id', '==', TOPIC_ID);
    
    const historySnapshot = await historyRef.get();
    console.log(`[Reset] Found ${historySnapshot.size} history entries to delete.`);
    historySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // 3. Optional: Clear quest stats if they exist (using a safe update)
    const userRef = db.collection('users').doc(UID);
    batch.set(userRef, {
        quest_stats: { [TOPIC_ID]: admin.firestore.FieldValue.delete() },
        milestones: { [TOPIC_ID]: admin.firestore.FieldValue.delete() }
    }, { merge: true });

    await batch.commit();
    console.log(`[Reset] SUCCESS: User progress for ${TOPIC_ID} has been completely reset.`);
}

resetProgress().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
