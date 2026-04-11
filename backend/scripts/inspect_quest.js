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

async function inspect() {
    console.log('--- Inspecting Complex Numbers in question_bank ---');
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_complex_numbers')
        .limit(5)
        .get();

    if (snapshot.empty) {
        console.log('❌ No questions found for math_alg_complex_numbers!');
    } else {
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id} | Topic: ${data.topic_id} | Level: ${data.level} | Approved: ${data.is_approved}`);
        });
    }
    console.log('--- End ---');
    process.exit(0);
}

inspect();
