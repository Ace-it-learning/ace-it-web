const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'firestore');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const collections = [
    'exam_submissions',
    'learning_content',
    'meta_schools',
    'micro_skill_landing',
    'mock_exams',
    'past_papers',
    'question_bank',
    'users',
    'writing_mocks'
];

async function backup() {
    console.log(`--- FIRESTORE BACKUP START ---`);
    for (const colName of collections) {
        console.log(`Backing up collection: ${colName}...`);
        const snapshot = await db.collection(colName).get();
        const data = {};
        snapshot.forEach(doc => {
            data[doc.id] = doc.data();
        });

        const filePath = path.join(BACKUP_DIR, `${colName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved ${snapshot.size} documents to ${colName}.json`);
    }
    console.log(`--- FIRESTORE BACKUP COMPLETE ---`);
    console.log(`Files saved to: ${BACKUP_DIR}`);
}

backup().then(() => process.exit(0)).catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
});
