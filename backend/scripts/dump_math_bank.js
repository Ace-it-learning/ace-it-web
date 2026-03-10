const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function dumpBank() {
    console.log("Fetching questions from question_bank...");

    // Fetch all questions
    const qSnap = await db.collection('question_bank')
        .limit(100)
        .get();

    console.log(`Found ${qSnap.size} questions.`);

    const data = qSnap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            topic: d.topic,
            topic_id: d.topic_id,
            level: d.level,
            text: d.text,
            answer: d.answer,
            solution_steps: d.solution_steps,
            explanation: d.explanation
        };
    });

    fs.writeFileSync('math_bank_dump.json', JSON.stringify(data, null, 2));
    console.log("Dumped to math_bank_dump.json");
}

dumpBank().catch(console.error);
