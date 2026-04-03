const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkBank() {
    console.log('--- Checking Formulas & Substitution Bank ---');
    
    // Check both plural and singular just in case
    const topics = ['math_alg_formula', 'math_alg_formulas'];
    
    for (const topicId of topics) {
        const snapshot = await db.collection('question_bank')
            .where('topic_id', '==', topicId)
            .get();
            
        console.log(`Topic ID [${topicId}]: Found ${snapshot.size} questions.`);
        
        if (snapshot.size > 0) {
            const doc = snapshot.docs[0].data();
            console.log(`- Sample ID: ${snapshot.docs[0].id}`);
            console.log(`- Sample Subject: ${doc.subject}`);
            console.log(`- Sample Level: ${doc.level} (Type: ${typeof doc.level})`);
            console.log(`- Sample Approved: ${doc.is_approved}`);
        }
    }

    process.exit(0);
}

checkBank().catch(console.error);
