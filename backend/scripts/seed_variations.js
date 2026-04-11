const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (admin.apps.length === 0) {
  const serviceAccount = require('../../backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function seedVariations() {
  try {
    const questionsPath = path.join(__dirname, '../data/math_content/math_alg_variations_questions_utf8.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    // Consolidating to plural only as per frontend standard and user request
    const tid = 'math_alg_variations';

    console.log(`Clearing existing Variation questions...`);
    const existingQuestions = await db.collection('question_bank')
      .where('topic_id', 'in', ['math_alg_variation', 'math_alg_variations'])
      .get();
    
    if (existingQuestions.size > 0) {
      const deleteBatch = db.batch();
      existingQuestions.forEach(doc => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
      console.log(`Cleared ${existingQuestions.size} questions.`);
    }

    console.log(`Seeding questions and briefing for Variations...`);
    const batch = db.batch();
    const collectionRef = db.collection('question_bank');

    for (const q of questions) {
      // Use the original question ID from JSON as the document ID
      const docRef = collectionRef.doc(q.id);
      const questionData = {
        ...q,
        topic: 'Variations',
        topic_id: tid,
        subject: 'Maths',
        is_approved: true,
        is_factory: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      batch.set(docRef, questionData, { merge: true });
    }

    const briefingPath = path.join(__dirname, '../data/math_content/math_alg_variations.json');
    const briefing = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
    
    const briefingRef = db.collection('learning_content').doc(tid);
    batch.set(briefingRef, {
      ...briefing,
      id: tid,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await batch.commit();
    console.log('--- Success: Variations Seeded (Singular & Plural IDs) ---');
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seedVariations().then(() => process.exit(0));
