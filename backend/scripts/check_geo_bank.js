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

async function check() {
    const topic = 'math_geo_rectilinear';
    const snap = await db.collection('question_bank').where('topic_id', '==', topic).get();
    console.log(`Found ${snap.size} questions for topic: ${topic}`);
    if (snap.size > 0) {
        const first = snap.docs[0].data();
        console.log('Sample Question ID:', first.id);
        console.log('Sample Question topic_id:', first.topic_id);
        console.log('Sample Question is_approved:', first.is_approved);
        console.log('Sample Question level:', first.level);
    } else {
       // Search for ANY question to see if I typed it wrong
       const all = await db.collection('question_bank').limit(5).get();
       console.log('Existing topic_ids in bank:');
       all.forEach(d => console.log(' - ', d.data().topic_id));
    }
    process.exit(0);
}
check();
