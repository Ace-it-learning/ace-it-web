const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../config/antigravity-tutor-dev-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backup() {
  const collections = [
    'exam_submissions',
    'integrated_challenges',
    'learning_content',
    'math_questions',
    'math_topics',
    'meta_schools',
    'micro_skill_landing',
    'mock_exams',
    'past_papers',
    'question_bank',
    'users',
    'writing_exemplars',
    'writing_mocks'
  ];

  const backupData = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  console.log(`Starting backup of ace-it-learning Firestore...`);

  for (const colName of collections) {
    console.log(`Backing up collection: ${colName}...`);
    const snapshot = await db.collection(colName).get();
    backupData[colName] = {};
    
    snapshot.forEach(doc => {
      backupData[colName][doc.id] = doc.data();
    });
    
    console.log(`- Saved ${snapshot.size} documents.`);
  }

  const filename = `firestore_backup_${timestamp}.json`;
  const filePath = path.join(backupDir, filename);
  
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
  console.log(`\nSUCCESS: Backup saved to ${filePath}`);
}

backup().catch(console.error);
