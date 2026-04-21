const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function verifyCounts() {
    const topicId = 'math_num_percentages';
    console.log(`Checking counts for topic: ${topicId}`);
    
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', topicId)
        .get();
    
    const counts = {};
    snapshot.forEach(doc => {
        const level = doc.data().level;
        counts[level] = (counts[level] || 0) + 1;
    });
    
    console.log('--- COUNTS BY LEVEL ---');
    console.log(JSON.stringify(counts, null, 2));
    console.log(`TOTAL: ${snapshot.size}`);
    
    process.exit(0);
}

verifyCounts().catch(console.error);
