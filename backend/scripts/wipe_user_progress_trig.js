const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const uid = 'fungtam@gmail.com'; // Hardcoded target UID from user context
const topicId = 'math_trig_applications';

async function wipeUserProgress() {
    console.log(`Wiping progress for ${uid} on topic ${topicId}...`);
    
    // 1. Wipe from progress/maths document
    const progressRef = db.collection('progress').doc('maths');
    const doc = await progressRef.get();
    
    if (doc.exists) {
        const data = doc.data();
        if (data[uid] && data[uid][topicId]) {
            delete data[uid][topicId];
            await progressRef.set(data);
            console.log(`- Removed ${topicId} from progress/maths`);
        }
    }

    // 2. Wipe from quizzes collection (History)
    const quizzesSnapshot = await db.collection('quizzes')
        .where('uid', '==', uid)
        .where('topic', '==', topicId)
        .get();
        
    const batch = db.batch();
    quizzesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`- Deleted ${quizzesSnapshot.size} quiz history records`);

    console.log("Success: Progress wiped for Trig Applications.");
    process.exit(0);
}

wipeUserProgress().catch(err => {
    console.error(err);
    process.exit(1);
});
