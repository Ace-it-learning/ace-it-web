const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const collectionName = 'integrated_challenges';

async function seedIntegratedBatch1() {
  console.log(`🚀 Seeding Elite Integrated Challenges Batch 1 into collection: ${collectionName}...`);
  
  try {
    const dataPath = path.join(__dirname, '../data/maths/integrated_batch_1.json');
    const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    for (const q of questions) {
      console.log(`📡 Sending [${q.id}]...`);
      const questionData = {
        ...q,
        topic: 'Weekly Quest',
        subject: 'Maths',
        status: 'approved',
        is_factory: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      if (!questionData.topic_id) questionData.topic_id = 'integrated_challenge';
      
      try {
        await db.collection(collectionName).doc(q.id).set(questionData, { merge: true });
        console.log(`✅ SUCCESS: ${q.id}`);
      } catch (innerError) {
        console.error(`❌ FAILED ${q.id}:`, innerError.message);
      }
    }
    
    console.log('\n--- ✨ Seeding Complete: Elite Integrated Challenge Batch 1 is LIVE ---');
  } catch (error) {
    console.error('❌ SEEDING FATAL ERROR:', error.message);
    process.exit(1);
  }
}

seedIntegratedBatch1().then(() => process.exit(0));
