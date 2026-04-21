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

async function finalVerify() {
    console.log('--- 🛡️ FINAL VERIFICATION: NEW PREMIUM MISSIONS ---');

    const snapshot = await db.collection('question_bank')
        .where('topic', '==', 'reading_literalComprehension')
        .get();
    
    if (snapshot.empty) {
        console.log('No premium Literal Comprehension missions found.');
    } else {
        console.log(`Found ${snapshot.size} questions for Literal Comprehension.`);
        // Note: Remember Reading questions are saved individually in the bank.
        // A "Mission" is a cluster of questions with the same passage.
        
        const passages = new Set();
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.passage) passages.add(data.passage.substring(0, 50));
        });
        
        console.log(`Unique Mission Passages Found: ${passages.size}`);
    }
}

finalVerify()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
