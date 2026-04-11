const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  // Assuming the serviceAccountKey.json is in the backend root
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function seedRatio() {
  try {
    const questionsPath = path.join(__dirname, '../data/math_content/math_num_ratio_final.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    const topicId = 'math_num_ratio';
    const batch = db.batch();
    const collectionRef = db.collection('question_bank');

    console.log(`Seeding ${questions.length} questions for topic: ${topicId} into question_bank...`);

    for (const q of questions) {
      const docRef = collectionRef.doc(q.id);

      const questionData = {
        ...q,
        topic: 'Ratio & Proportion',
        topic_id: topicId,
        subject: 'Maths',
        is_approved: true,
        is_factory: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(docRef, questionData, { merge: true });
      console.log(`Prepared: ${q.id} (Level ${q.level})`);
    }

    await batch.commit();
    console.log('--- Success: 30 Ratio & Proportion Questions Seeded to question_bank ---');
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

seedRatio().then(() => process.exit(0));
