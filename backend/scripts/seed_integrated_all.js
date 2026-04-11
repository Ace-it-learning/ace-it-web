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
const collectionName = 'integrated_challenges';

async function seedBatch(batchNumber) {
  const fileName = `integrated_batch_${batchNumber}.json`;
  const dataPath = path.join(__dirname, `../data/maths/${fileName}`);
  
  if (!fs.existsSync(dataPath)) {
    console.log(`⚠️ Batch file not found: ${fileName}. Skipping.`);
    return;
  }

  console.log(`🚀 Seeding Batch ${batchNumber} into ${collectionName}...`);
  const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const q of questions) {
    const questionData = {
      ...q,
      target_collection: collectionName, // Metadata
      topic: 'Weekly Quest',
      subject: 'Maths',
      status: 'approved',
      is_factory: true,
      updated_at: new Date()
    };
    
    if (!questionData.created_at) questionData.created_at = new Date();
    if (!questionData.topic_id) questionData.topic_id = 'integrated_challenge';

    try {
      await db.collection(collectionName).doc(q.id).set(questionData);
      console.log(`  ✅ [${q.id}] synced.`);
    } catch (err) {
      console.error(`  ❌ [${q.id}] failed:`, err.message);
    }
  }
}

async function run() {
  const args = process.argv.slice(2);
  const targetBatch = args[0]; // e.g. "1", "2", "all"

  if (targetBatch === 'all') {
    for (let i = 1; i <= 25; i++) { // Support up to 25 batches (250 questions)
      await seedBatch(i);
    }
  } else if (targetBatch) {
    await seedBatch(targetBatch);
  } else {
    console.log("Usage: node seed_integrated_all.js [1|2|3|...|all]");
  }
  
  console.log("\n--- ✨ Seeding Process Complete ---");
  process.exit(0);
}

run();
