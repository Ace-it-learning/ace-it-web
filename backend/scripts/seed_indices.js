const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("❌ Service Account Key missing. Ensure serviceAccountKey.json exists in backend root.");
    process.exit(1);
  }
}

const db = admin.firestore();
const collectionName = 'question_bank';

async function seedIndices() {
  const fileName = 'indices_final.json';
  const dataPath = path.join(__dirname, `../data/maths/${fileName}`);
  
  if (!fs.existsSync(dataPath)) {
    console.log(`⚠️ File not found: ${fileName}. Skipping.`);
    return;
  }

  console.log(`🚀 Seeding Indices into ${collectionName}...`);
  const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const q of questions) {
    const questionData = {
      ...q,
      is_approved: true,
      is_factory: true,
      updated_at: new Date(),
      created_at: new Date()
    };
    
    try {
      await db.collection(collectionName).doc(q.id).set(questionData);
      console.log(`  ✅ [${q.id}] synced.`);
    } catch (err) {
      console.error(`  ❌ [${q.id}] failed:`, err.message);
    }
  }
}

seedIndices().then(() => {
  console.log("\n--- ✨ Seeding Process Complete ---");
  process.exit(0);
}).catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
