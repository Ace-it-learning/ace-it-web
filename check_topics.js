const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
  const serviceAccount = require('./backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkAllTopics() {
  const snapshot = await db.collection('question_bank').get();
  const topics = new Set();
  snapshot.forEach(doc => {
    topics.add(doc.data().topic_id);
  });
  console.log('Found topics in question_bank:');
  Array.from(topics).sort().forEach(t => console.log(`- ${t}`));
}

checkAllTopics().then(() => process.exit(0));
