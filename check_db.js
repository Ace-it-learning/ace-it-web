const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkQuests() {
  const snapshot = await db.collection('question_bank').get();
  console.log(`Total quests in question_bank: ${snapshot.size}`);
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | Type: ${data.type} | Title: ${data.title}`);
  });
}

checkQuests();
