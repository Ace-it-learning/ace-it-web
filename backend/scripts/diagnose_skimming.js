const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function listSkimming() {
    console.log('--- Skimming & Scanning Level 5 Diagnosis ---');
    const snapshot = await db.collection('question_bank')
        .where('topic', '==', 'Skimming & Scanning')
        .where('level', '==', 'HKDSE Level 5 (Strong)')
        .get();

    console.log(`Snapshot Size: ${snapshot.size}`);
    snapshot.forEach(doc => {
        console.log(`ID: ${doc.id} | Topic: "${doc.data().topic}" | Level: "${doc.data().level}"`);
    });
    process.exit(0);
}

listSkimming().catch(console.error);
