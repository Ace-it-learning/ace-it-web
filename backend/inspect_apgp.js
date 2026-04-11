const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspect() {
    const topicId = 'math_alg_apgp';
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', topicId)
        .get();

    console.log(`Found ${snapshot.size} questions for ${topicId}`);
    
    const levels = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        const lv = data.level;
        levels[lv] = (levels[lv] || 0) + 1;
        if (Object.keys(levels).length === 1 && levels[lv] === 1) {
            console.log('Sample question:', { id: doc.id, topic_id: data.topic_id, level: data.level, is_approved: data.is_approved });
        }
    });
    console.log('Levels distribution:', levels);
    
    // Check practice history for a specific user if possible
    const uid = 'B7s8UfM5r3RfG8e2u8tO5vY2'; // Just a guess at a UID or need to find fungtam's
}

inspect().then(() => process.exit(0));
