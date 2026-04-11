const admin = require('firebase-admin');
const fs = require('fs');

if (admin.apps.length === 0) {
  const serviceAccount = require('./backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkBank() {
  const snapshot = await db.collection('question_bank')
    .where('topic_id', '==', 'math_num_ratio')
    .get();

  console.log(`\n--- Firestore Question Bank Audit for 'math_num_ratio' ---`);
  console.log(`Total questions found: ${snapshot.size}`);

  const ids = snapshot.docs.map(doc => doc.id).sort();
  console.log(`\nDocument IDs:`);
  console.log(ids.join(', '));

  // Identify redundant IDs (those not in math_num_ratio_01 to math_num_ratio_30)
  const officialIds = Array.from({length: 30}, (_, i) => `math_num_ratio_${(i+1).toString().padStart(2, '0')}`);
  const redundant = ids.filter(id => !officialIds.includes(id));

  if (redundant.length > 0) {
    console.log(`\n[WARNING] Found ${redundant.length} redundant/old questions:`);
    console.log(redundant.join(', '));
  } else if (snapshot.size === 30) {
    console.log(`\n[SUCCESS] The bank is clean. Only the 30 official questions exist.`);
  }

  process.exit(0);
}

checkBank().catch(err => {
  console.error(err);
  process.exit(1);
});
