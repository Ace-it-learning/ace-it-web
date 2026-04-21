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

async function checkSpecific() {
    console.log('--- 🛡️ SEARCHING FOR PREMIUM LITERAL COMPREHENSION ---');

    const snapshot = await db.collection('question_bank')
        .get();
    
    console.log(`Checking ${snapshot.size} documents...`);

    snapshot.forEach(doc => {
        const d = doc.data();
        if (String(d.topic).toLowerCase().includes('literal')) {
            console.log(`ID: [${doc.id}] Topic: [${d.topic}] Level: [${d.level}] Premium: [${d.is_premium}] Approved: [${d.is_approved}] Tasks: ${d.interactive_tasks?.length || 0}`);
        }
    });
}

checkSpecific()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
