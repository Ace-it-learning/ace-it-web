const admin = require('firebase-admin');
const path = require('path');

// Re-pathing for root execution
const serviceAccount = require('./backend/serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function check() {
  const topics = ['math_alg_functions', 'math_alg_func'];
  for (const t of topics) {
    console.log(`\nChecking topic: ${t}`);
    const snapshot = await db.collection('question_bank')
      .where('topic_id', '==', t)
      .limit(3)
      .get();
    
    console.log(`Found ${snapshot.size} questions.`);
    snapshot.forEach(doc => {
      const d = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Keys: ${Object.keys(d).join(', ')}`);
      if (d.diagram_svg) console.log(`  diagram_svg: ${d.diagram_svg.substring(0, 50)}...`);
      if (d.visual) console.log(`  visual: ${d.visual.substring(0, 50)}...`);
    });
  }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
