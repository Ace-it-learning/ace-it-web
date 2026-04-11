const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  const serviceAccount = require('../../backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function wipeFunctions() {
  const topicId = 'math_alg_functions';
  console.log(`Starting wipe for topic: ${topicId}...`);

  try {
    // 1. Wipe the learning_content document
    console.log(`Deleting learning_content/${topicId}...`);
    await db.collection('learning_content').doc(topicId).delete();

    // 2. Wipe all questions in the question_bank for this topic
    const questionsSnapshot = await db.collection('question_bank')
      .where('topic_id', '==', topicId)
      .get();

    console.log(`Found ${questionsSnapshot.size} questions to delete.`);

    if (!questionsSnapshot.empty) {
      const batch = db.batch();
      questionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
        console.log(`Deleting question: ${doc.id}`);
      });
      await batch.commit();
      console.log(`Successfully deleted ${questionsSnapshot.size} questions.`);
    }

    console.log(`--- Success: ${topicId} wiped from Firestore ---`);
  } catch (error) {
    console.error('Error during wipe:', error);
    process.exit(1);
  }
}

wipeFunctions().then(() => process.exit(0));
