const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'backend', 'serviceAccountKey.json');
const altServiceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let finalPath = '';
if (fs.existsSync(serviceAccountPath)) {
  finalPath = serviceAccountPath;
} else if (fs.existsSync(altServiceAccountPath)) {
  finalPath = altServiceAccountPath;
} else {
  console.error('Could not find serviceAccountKey.json');
  process.exit(1);
}

if (admin.apps.length === 0) {
  const serviceAccount = require(finalPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkBank() {
  const pluralId = 'math_alg_variations';
  const singularId = 'math_alg_variation';

  console.log(`--- Checking question_bank ---`);
  
  const pluralSnapshot = await db.collection('question_bank')
    .where('topic_id', '==', pluralId)
    .get();
  console.log(`Topic ID '${pluralId}': ${pluralSnapshot.size} questions found.`);

  const singularSnapshot = await db.collection('question_bank')
    .where('topic_id', '==', singularId)
    .get();
  console.log(`Topic ID '${singularId}': ${singularSnapshot.size} questions found.`);

  if (pluralSnapshot.size > 0) {
    const data = pluralSnapshot.docs[0].data();
    console.log(`\nSample Data from '${pluralId}':`);
    console.log(`- ID: ${pluralSnapshot.docs[0].id}`);
    console.log(`- topic_id: ${data.topic_id}`);
    console.log(`- level: ${data.level} (Type: ${typeof data.level})`);
    console.log(`- is_approved: ${data.is_approved} (Type: ${typeof data.is_approved})`);
    console.log(`- subject: ${data.subject}`);
  } else if (singularSnapshot.size > 0) {
    const data = singularSnapshot.docs[0].data();
    console.log(`\nSample Data from '${singularId}':`);
    console.log(`- ID: ${singularSnapshot.docs[0].id}`);
    console.log(`- topic_id: ${data.topic_id}`);
    console.log(`- level: ${data.level} (Type: ${typeof data.level})`);
    console.log(`- is_approved: ${data.is_approved} (Type: ${typeof data.is_approved})`);
    console.log(`- subject: ${data.subject}`);
  }
}

checkBank().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
