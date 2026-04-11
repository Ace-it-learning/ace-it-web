const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function findUser() {
  const snapshot = await db.collection('users').limit(5).get();
  if (snapshot.empty) {
    console.log('No users found.');
    return;
  }
  snapshot.docs.forEach(doc => {
    console.log(`UID: ${doc.id}`);
    console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
  });
}

findUser();
