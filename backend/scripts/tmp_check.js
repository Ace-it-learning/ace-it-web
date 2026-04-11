const admin = require('firebase-admin');
const serviceAccount = require('../../backend/serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function check() {
  const topics = ['math_alg_func', 'math_alg_functions'];
  for (const topicId of topics) {
    const snap = await db.collection('question_bank').where('topic_id', '==', topicId).get();
    console.log(`${topicId} question_bank Count:`, snap.size);
    
    const briefingCount = await db.collection('learning_content').doc(topicId).get().then(doc => doc.exists ? 1 : 0);
    console.log(`${topicId} learning_content Exists:`, briefingCount);
  }
}

check().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
