const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkBankDeep() {
  const ids = ['math_alg_variation', 'math_alg_variations'];
  
  for (const id of ids) {
    const snap = await db.collection('question_bank').where('topic_id', '==', id).get();
    console.log(`Topic ID '${id}': ${snap.size} questions.`);
    if (snap.size > 0) {
        const data = snap.docs[0].data();
        console.log(`- Sample: id=${snap.docs[0].id}, level=${data.level}, is_approved=${data.is_approved} (Type: ${typeof data.is_approved})`);
        
        // Count by level
        const levels = {};
        snap.forEach(doc => {
            const l = doc.data().level;
            levels[l] = (levels[l] || 0) + 1;
        });
        console.log(`- Level distribution: ${JSON.stringify(levels)}`);
    }
  }
}

checkBankDeep().then(() => process.exit(0));
