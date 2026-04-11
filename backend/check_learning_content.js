const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function check() {
  console.log('Checking learning_content collection...');
  const snapshot = await db.collection('learning_content').get();
  snapshot.forEach(doc => {
    console.log(`- ${doc.id}`);
  });
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
