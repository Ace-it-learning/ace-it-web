const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function wipeTopic(topicId) {
    console.log(`🧹 Wiping all questions for topic: ${topicId}`);
    const snapshotTopic = await db.collection('question_bank')
        .where('topic', '==', topicId)
        .get();
    
    const snapshotTopicId = await db.collection('question_bank')
        .where('topic_id', '==', topicId)
        .get();
        
    const allDocs = [...snapshotTopic.docs, ...snapshotTopicId.docs];
    const uniqueDocs = Array.from(new Set(allDocs.map(d => d.id))).map(id => allDocs.find(d => d.id === id));

    if (uniqueDocs.length === 0) {
        console.log('No questions found to delete.');
        return;
    }

    const batch = db.batch();
    uniqueDocs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Deleted ${uniqueDocs.length} questions.`);
}

wipeTopic('math_trig_ratios');
