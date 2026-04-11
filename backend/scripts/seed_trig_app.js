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
const topicId = 'math_trig_applications';

async function seedTrigApp() {
  console.log(`Seeding data for topic: ${topicId}...`);
  
  try {
    // 1. Seed Learning Content (Briefing)
    console.log('Seeding learning_content...');
    const briefingPath = path.join(__dirname, '../data/math_content/math_trig_app_briefing.json');
    const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
    
    await db.collection('learning_content').doc(topicId).set({
      ...briefingData,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Briefing seeded successfully.');

    // 2. Seed Question Bank
    console.log('Seeding questions...');
    const questionsPath = path.join(__dirname, '../data/math_content/math_trig_app_questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    const batch = db.batch();
    const collectionRef = db.collection('question_bank');

    questions.forEach(q => {
      const docRef = collectionRef.doc(q.id);
      const questionData = {
        ...q,
        topic: 'Trigonometry Applications',
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
    
    console.log('--- Seeding Complete: Trigonometry Applications Module Live ---');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedTrigApp().then(() => process.exit(0));
