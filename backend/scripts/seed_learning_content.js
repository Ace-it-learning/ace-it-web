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

async function seedLearningContent() {
  try {
    const contentPath = path.join(__dirname, '../data/math_content/math_alg_quadratics.json');
    const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

    const topicId = 'math_alg_quadratics';
    const docRef = db.collection('learning_content').doc(topicId);

    await docRef.set(contentData);

    console.log(`Successfully seeded learning_content for ${topicId}!`);
  } catch (error) {
    console.error('Error seeding learning content:', error);
    process.exit(1);
  }
}

seedLearningContent();
