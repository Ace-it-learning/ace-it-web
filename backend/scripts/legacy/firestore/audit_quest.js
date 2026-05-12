const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
  const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function auditCollection() {
  const snapshot = await db.collection('integrated_challenges').get();
  console.log('--- FIRESTORE AUDIT ---');
  console.log('Total Count:', snapshot.size);
  console.log('IDs:', snapshot.docs.map(d => d.id).sort());
  process.exit(0);
}

auditCollection();
