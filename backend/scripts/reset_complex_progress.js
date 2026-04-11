const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function resetProgress() {
    const email = 'fungtam@gmail.com';
    const topicId = 'math_alg_complex_numbers';

    console.log(`🔍 Finding user with email: ${email}...`);
    const userSnap = await db.collection('users').where('email', '==', email).get();

    if (userSnap.empty) {
        console.error('❌ User not found!');
        process.exit(1);
    }

    const userDoc = userSnap.docs[0];
    const uid = userDoc.id;
    console.log(`✅ Found user: ${email} (UID: ${uid})`);

    // 1. Clear practice_history for complex numbers
    console.log(`🧹 Clearing practice history for ${topicId}...`);
    const historyRef = db.collection('users').doc(uid).collection('practice_history');
    
    // We need to find which questions belong to this topic in the history
    // Since practice_history docs are named by question ID, we first get all question IDs for this topic
    const questSnap = await db.collection('question_bank').where('topic_id', '==', topicId).get();
    const topicQuestIds = questSnap.docs.map(doc => doc.id);
    console.log(`Found ${topicQuestIds.length} questions in bank for this topic.`);

    let deletedCount = 0;
    for (const qid of topicQuestIds) {
        const docRef = historyRef.doc(qid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            await docRef.delete();
            deletedCount++;
        }
    }
    console.log(`✅ Deleted ${deletedCount} history records!`);

    // 2. Also reset topic mastery/completion if it exists in the main progress/maths document
    console.log(`🧹 Resetting mastery in progress/maths...`);
    const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const progSnap = await progressRef.get();
    if (progSnap.exists) {
        const data = progSnap.data();
        if (data.microSkills && data.microSkills[topicId]) {
            console.log(`Resetting ${topicId} microSkill metrics...`);
            await progressRef.set({
                microSkills: {
                    [topicId]: admin.firestore.FieldValue.delete()
                }
            }, { merge: true });
        }
    }
    console.log('✅ Progress document cleaned!');

    console.log('🏁 Reset complete! The user should now be able to see the 30 new questions.');
    process.exit(0);
}

resetProgress();
