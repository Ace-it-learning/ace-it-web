const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (admin.apps.length === 0) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function seedRatioBriefing() {
  try {
    const contentPath = path.join(__dirname, '../data/math_content/math_num_ratio.json');
    if (!fs.existsSync(contentPath)) {
        throw new Error(`File not found: ${contentPath}`);
    }
    const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

    const topicId = 'math_num_ratio';
    const docRef = db.collection('learning_content').doc(topicId);

    await docRef.set({
        ...contentData,
        updated_at: new Date().toISOString()
    });

    console.log(`Successfully seeded learning_content for ${topicId} with embedded SVGs!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding ratio briefing content:', error);
    process.exit(1);
  }
}

seedRatioBriefing();
