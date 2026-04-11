const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();
const email = 'fungtam@gmail.com';
const topicId = 'math_num_inequalities';

async function wipeUserProgress() {
    console.log(`🧹 Wiping progress for user ${email} on topic: ${topicId}...`);

    // 1. Find User UID
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
        console.error(`❌ User not found: ${email}`);
        return;
    }
    const uid = userSnapshot.docs[0].id;
    console.log(`✅ Found UID: ${uid}`);

    // 2. Clear practice_history for this topic
    // First, get all question IDs for this topic
    const questionSnapshot = await db.collection('question_bank').where('topic_id', '==', topicId).get();
    const questionIds = questionSnapshot.docs.map(doc => doc.id);
    console.log(`Found ${questionIds.length} questions in bank for this topic.`);

    const historyRef = db.collection('users').doc(uid).collection('practice_history');
    let deletedCount = 0;
    
    if (questionIds.length > 0) {
        // Since we don't know which specific questions they completed, we can also check their history collection directly
        const historySnapshot = await historyRef.get();
        const batch = db.batch();
        let count = 0;
        
        historySnapshot.forEach(doc => {
            // practice_history docs have qid as ID.
            // We only delete if the qid is in our topic's questionIds
            if (questionIds.includes(doc.id)) {
                batch.delete(doc.ref);
                count++;
            }
        });
        
        if (count > 0) {
            await batch.commit();
        }
        deletedCount = count;
    }
    console.log(`✅ Deleted ${deletedCount} history entries.`);

    // 3. Update mastery progress
    const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const progressDoc = await progressRef.get();
    if (progressDoc.exists) {
        const data = progressDoc.data();
        let updated = false;

        if (data.microSkills && data.microSkills[topicId]) {
            delete data.microSkills[topicId];
            updated = true;
            console.log(`✅ Removed ${topicId} from microSkills.`);
        }

        if (data.practicedSkills && data.practicedSkills.includes(topicId)) {
            data.practicedSkills = data.practicedSkills.filter(s => s !== topicId);
            updated = true;
            console.log(`✅ Removed ${topicId} from practicedSkills.`);
        }

        if (updated) {
            await progressRef.set(data);
            console.log('✅ Progress document updated.');
        }
    }

    // 4. Also clear from recent activity if needed (optional)
    
    console.log(`🚀 Successfully wiped all Inequalities progress for ${email}.`);
}

wipeUserProgress().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
