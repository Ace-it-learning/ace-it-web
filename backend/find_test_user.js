const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

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
    const data = doc.data();
    console.log(`Nickname: ${data.nickname || 'N/A'}`);
    console.log(`Email: ${data.email || 'N/A'}`);
    console.log(`Is New: ${data.is_new_student}`);
    console.log(`---`);
  });
}

findUser();
