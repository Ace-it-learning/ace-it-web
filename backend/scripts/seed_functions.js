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

async function seedFunctions() {
  const topicId = 'math_alg_functions';
  
  try {
    // 1. Seed Learning Content (Briefing)
    console.log(`Seeding learning_content for ${topicId}...`);
    const briefingPath = path.join(__dirname, '../data/math_content/math_alg_functions.json');
    const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
    
    await db.collection('learning_content').doc(topicId).set({
      ...briefingData,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Briefing seeded successfully.');

    // 2. Seed Question Bank
    console.log(`Seeding questions for ${topicId}...`);
    const questionsPath = path.join(__dirname, '../../functions_graphs.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    const batch = db.batch();
    const collectionRef = db.collection('question_bank');

    questions.forEach(q => {
      const docRef = collectionRef.doc(q.id);
      const questionData = {
        ...q,
        topic: 'Functions & Graphs',
        subject: 'Maths',
        is_approved: true,
        is_factory: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      batch.set(docRef, questionData, { merge: true });
      console.log(`Prepared: ${q.id}`);
    });

    await batch.commit();
    console.log(`Successfully seeded ${questions.length} questions.`);
    
    console.log('--- Success: Functions & Graphs Module Live ---');
  } catch (error) {
    console.error('Error seeding Functions & Graphs:', error);
    process.exit(1);
  }
}

seedFunctions().then(() => process.exit(0));
