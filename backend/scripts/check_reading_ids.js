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

async function checkReading() {
    console.log('--- 🔍 INSPECTING READING BANK ---');

    const snapshot = await db.collection('question_bank').limit(500).get();
    
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        const topic = data.topic;
        const paper = data.paper;
        
        if (topic?.includes('reading') || paper?.includes('Reading') || paper?.includes('Paper 1')) {
            console.log(`[${id}] Topic: ${topic}, Paper: ${paper}, Premium: ${data.is_premium}, Factory: ${data.is_factory}`);
        }
    });
}

checkReading()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
