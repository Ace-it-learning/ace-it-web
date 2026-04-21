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

async function checkAdmin() {
    console.log('--- 🛡️ SEARCHING FOR FACTORY_ADMIN MISSIONS ---');

    // We can't query by UID directly in question_bank as it might not be indexed or field name might be different.
    // In LabService, UID is NOT saved by default in the bank entry.
    // However, I updated the factory script to add 'is_factory: true' and 'is_premium: true'.

    const snapshot = await db.collection('question_bank')
        .where('is_factory', '==', true)
        .where('is_premium', '==', true)
        .get();
    
    if (snapshot.empty) {
        console.log('No factory premium missions found.');
    } else {
        console.log(`Found ${snapshot.size} premium factory questions.`);
        
        // Let's see some details
        const sample = snapshot.docs[0].data();
        console.log(`Sample: ${sample.topic} (Level: ${sample.level})`);
        console.log(`Passage: ${sample.passage?.substring(0, 100)}...`);
    }
}

checkAdmin()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
