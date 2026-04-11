const MathsLabService = require('./services/maths/MathsLabService');
const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function debugContent() {
  try {
    const content = await MathsLabService.getLearningContent('math_num_ratio');
    console.log('--- DEBUG: math_num_ratio content ---');
    console.log(JSON.stringify(content, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debugContent();
