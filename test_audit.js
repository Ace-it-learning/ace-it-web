const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./backend/serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testAudit() {
  const topicId = 'math_alg_functions';
  console.log(`Auditing topic: ${topicId}`);
  
  const snapshot = await db.collection('question_bank')
    .where('topic_id', '==', topicId)
    .get();
    
  console.log(`Found ${snapshot.size} questions.`);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}, Answer: [${data.answer}], Visual: [${data.visual ? 'present' : 'missing'}]`);
  });
}

testAudit().then(() => process.exit(0));
