const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugSeed() {
  console.log('Attempting to seed ONE question...');
  try {
    await db.collection('integrated_challenges').doc('debug_test').set({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Debug seed successful!');
  } catch (error) {
    console.error('Debug seed failed!');
    console.error(error);
  }
}

debugSeed().then(() => process.exit(0));
