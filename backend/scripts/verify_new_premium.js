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

async function verifyNew() {
    console.log('--- 🛡️ VERIFYING NEW PREMIUM MISSIONS ---');

    const snapshot = await db.collection('question_bank')
        .where('is_premium', '==', true)
        .limit(5)
        .get();
    
    if (snapshot.empty) {
        console.log('No premium missions found yet.');
        return;
    }

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`[${doc.id}]`);
        console.log(`  Title: ${data.title}`);
        console.log(`  Theme: ${data.theme}`);
        console.log(`  Topic: ${data.topic}`);
        console.log(`  Level: ${data.level}`);
        console.log(`  Tasks: ${data.interactive_tasks?.length}`);
        console.log(`  Factory: ${data.is_factory}`);
    });
}

verifyNew()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
