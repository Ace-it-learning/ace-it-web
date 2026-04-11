const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function seedLogExp() {
  try {
    const topicId = 'math_alg_log_exp'; // MATCHING mathsMicroSkills.js
    
    // 1. Seed Questions
    const questionsPath = path.join(__dirname, '../data/math_content/math_alg_log_exp_questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    const batch = db.batch();
    const collectionRef = db.collection('question_bank');

    console.log(`Seeding ${questions.length} questions for topic: ${topicId} into question_bank...`);

    for (const q of questions) {
      const docRef = collectionRef.doc(q.id);
      const questionData = {
        ...q,
        topic: 'Log & Exp Functions',
        topic_id: topicId,
        subject: 'Maths',
        is_approved: true,
        is_factory: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      batch.set(docRef, questionData, { merge: true });
    }

    // 2. Seed Topic Metadata (Briefing) - REDIRECTED TO learning_content
    const topicPath = path.join(__dirname, '../data/math_content/math_alg_log_exp.json');
    const topicData = JSON.parse(fs.readFileSync(topicPath, 'utf8'));
    
    // Set in TWO locations for backward compatibility and current service logic
    const learningContentRef = db.collection('learning_content').doc(topicId);
    const mathTopicsRef = db.collection('math_topics').doc(topicId);

    console.log(`Updating topic metadata for: ${topicId} in learning_content and math_topics...`);
    
    const finalMetadata = {
      ...topicData,
      topic_id: topicId,
      is_modular: true, // ENSURE THIS FLAG IS SET
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    batch.set(learningContentRef, finalMetadata, { merge: true });
    batch.set(mathTopicsRef, finalMetadata, { merge: true });

    await batch.commit();
    console.log('--- Success: Questions and Metadata Seeded (Corrected ID and Collection) ---');
  } catch (error) {
    console.error('Error seeding Log & Exp:', error);
    process.exit(1);
  }
}

seedLogExp().then(() => process.exit(0));
