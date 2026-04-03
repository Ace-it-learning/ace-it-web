const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function verifySync() {
    console.log('--- Verification: math_mensuration status ---');
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_mensuration')
        .get();
        
    console.log(`Total questions for math_mensuration: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
        const q20 = snapshot.docs.find(doc => doc.id === 'v1_mensuration_20');
        if (q20) {
            console.log('Q20 Found. Checking diagram_svg...');
            console.log('SVG:', q20.data().diagram_svg);
        } else {
            console.log('v1_mensuration_20 NOT FOUND in question_bank collection');
        }
    }
    process.exit(0);
}

verifySync().catch(console.error);
