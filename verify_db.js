const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = require('./backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function verify() {
  console.log('Querying Firestore for math_alg_variations...');
  const doc = await db.collection('learning_content').doc('math_alg_variations').get();
  if (!doc.exists) {
    console.error('Document not found!');
  } else {
    const data = doc.data();
    console.log('Document ID:', doc.id);
    console.log('Updated At:', data.updated_at.toDate().toISOString());
    console.log('Fisrt Concept Formula:', data.learning_modules[0].concepts[0].formula);
    
    // Check plural
    const docPlural = await db.collection('learning_content').doc('math_alg_variation').get();
    console.log('Singular doc formula:', docPlural.data().learning_modules[0].concepts[0].formula);
  }
}

verify().then(() => process.exit(0));
