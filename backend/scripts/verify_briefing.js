const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function verify() {
    const doc = await db.collection('learning_content').doc('math_alg_complex_numbers').get();
    const data = doc.data();
    
    console.log(`Topic: ${data.name}`);
    data.learning_modules.forEach(m => {
        m.concepts.forEach(c => {
            console.log(`Concept: ${c.name} | Has visual_aid: ${c.visual_aid !== undefined}`);
        });
    });
    process.exit(0);
}

verify();
