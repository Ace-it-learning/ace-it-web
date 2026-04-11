const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  const serviceAccount = require('../../backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function seedQuadratics() {
  try {
    const questionsPath = path.join(__dirname, '../data/math_content/math_alg_quadratics_final_mapped.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    const topicId = 'math_alg_quadratics';
    const batch = db.batch();
    const collectionRef = db.collection('question_bank');

    console.log(`Seeding ${questions.length} questions for topic: ${topicId} into question_bank...`);

    for (const q of questions) {
      // Use the ID from the mapped JSON (quad_eq_01, etc.)
      const docRef = collectionRef.doc(q.id);

      const questionData = {
        ...q,
        topic: 'Quadratic Equations',
        topic_id: topicId,
        subject: 'Maths',
        is_approved: true, // MANDATORY for generator fetch
        is_factory: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(docRef, questionData, { merge: true });
      console.log(`Prepared: ${q.id} (DSE Standard)`);
    }

    await batch.commit();
    console.log('--- Success: 30 Quadratic Equations Questions Seeded to question_bank ---');
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

seedQuadratics().then(() => process.exit(0));
