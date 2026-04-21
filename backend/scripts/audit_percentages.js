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

async function checkPercentages() {
    console.log('--- PERCENTAGES & INTEREST AUDIT ---');

    const snapshot = await db.collection('question_bank').get();
    
    snapshot.forEach(doc => {
        const d = doc.data();
        const id = doc.id;
        const topic = String(d.topic || '').toLowerCase();
        const topic_id = String(d.topic_id || '').toLowerCase();
        
        if (topic.includes('interest') || topic.includes('percent') || topic_id.includes('interest') || topic_id.includes('percent')) {
            console.log(`--- PERCENTAGE DOC FOUND ---`);
            console.log(`ID: ${id}`);
            console.log(`topic: "${d.topic}"`);
            console.log(`topic_id: "${d.topic_id}"`);
            console.log(`level: ${d.level}`);
            console.log(`is_approved: ${d.is_approved}`);
        }
    });

    console.log('=== AUDIT COMPLETE ===');
}

checkPercentages().then(() => process.exit(0)).catch(console.error);
