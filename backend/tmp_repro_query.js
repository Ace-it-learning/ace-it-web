const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function reproduceQuery() {
  const topic = 'math_alg_variations';
  const numericLevel = 3;
  
  console.log(`Attempting reproduction of query:`);
  console.log(`topic_id == ${topic}`);
  console.log(`level == ${numericLevel}`);
  console.log(`is_approved == true`);
  
  const bankSnapshot = await db.collection('question_bank')
    .where('topic_id', '==', topic)
    .where('level', '==', numericLevel)
    .where('is_approved', '==', true)
    .limit(50)
    .get();
    
  console.log(`Results: ${bankSnapshot.size} questions found.`);
}

reproduceQuery().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
