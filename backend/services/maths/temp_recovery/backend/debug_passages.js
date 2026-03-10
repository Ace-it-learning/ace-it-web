const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkPassages() {
    const topic = "Literal Comprehension";
    console.log(`Checking questions for topic: ${topic}`);

    const snapshot = await db.collection('question_bank')
        .where('topic', '==', topic)
        .get();

    if (snapshot.empty) {
        console.log("No questions found.");
        return;
    }

    console.log(`Found ${snapshot.size} questions.`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Q: ${doc.id} | Has Passage: ${!!data.passage} | Snippet: ${data.passage?.substring(0, 50) || 'N/A'}`);
    });
}

checkPassages().catch(err => console.error(err));
