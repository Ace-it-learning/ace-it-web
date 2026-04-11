const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  const serviceAccount = require('../../backend/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const topicId = 'math_trig_applications';

async function wipeTrigApp() {
  console.log(`Wiping data for topic: ${topicId}...`);
  
  try {
    // 1. Delete learning content
    console.log('Deleting learning_content...');
    await db.collection('learning_content').doc(topicId).delete();
    
    // 2. Delete questions from question_bank
    console.log('Searching for questions to delete...');
    const snapshot = await db.collection('question_bank')
      .where('topic_id', '==', topicId)
      .get();
    
    if (snapshot.empty) {
      console.log('No questions found to delete.');
    } else {
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        console.log(`Queued for deletion: ${doc.id}`);
      });
      await batch.commit();
      console.log(`Deleted ${snapshot.size} questions.`);
    }
    
    console.log('--- Wipe Complete ---');
  } catch (error) {
    console.error('Error wiping data:', error);
    process.exit(1);
  }
}

wipeTrigApp().then(() => process.exit(0));
