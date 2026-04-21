const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkLevelNames() {
    console.log('--- 🛡️ UNIQUE LEVEL NAMES IN PREMIUM BANK ---');

    const snapshot = await db.collection('question_bank')
        .where('is_factory', '==', true)
        .get();
    
    const levels = new Set();
    const topics = new Set();

    snapshot.forEach(doc => {
        const d = doc.data();
        levels.add(d.level);
        topics.add(d.topic);
    });

    console.log('Levels found:', Array.from(levels));
    console.log('Topics found:', Array.from(topics));
}

checkLevelNames()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
