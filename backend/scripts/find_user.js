const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function findUserByEmail(email) {
  const snapshot = await db.collection('users').where('email', '==', email).get();
  if (snapshot.empty) {
    console.log('No user found with email:', email);
    return;
  }
  snapshot.forEach(doc => {
    console.log('Found User:', doc.id, doc.data().nickname || doc.data().displayName);
  });
}

findUserByEmail('fungtam@gmail.com');
