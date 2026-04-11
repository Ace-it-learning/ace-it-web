const admin = require('firebase-admin');
const path = require('path');

// CORRECT PATH: backend/serviceAccountKey.json
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const email = 'fungtam@gmail.com';
const topicId = 'math_stat_charts';

async function wipeProgress() {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
        console.log(`User ${email} not found.`);
        return;
    }

    const userId = userSnapshot.docs[0].id;
    console.log(`Wiping progress for user ${userId} (${email}) on topic ${topicId}...`);

    try {
        await db.collection('users').doc(userId).collection('quest_progress').doc(topicId).delete();
        await db.collection('users').doc(userId).collection('mastery').doc(topicId).delete();
        
        const historySnapshot = await db.collection('users').doc(userId).collection('practice_history')
            .where('topic_id', '==', topicId).get();
        
        const batch = db.batch();
        historySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        console.log("✅ Progress wiped successfully.");
    } catch (err) {
        console.error("Error wiping progress:", err);
    }
    process.exit(0);
}

wipeProgress();
