const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function findPassage() {
    console.log("Searching for 'burgeoning zero-waste' passage content...");
    const snapshot = await db.collection('question_bank').get();
    
    let found = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        // Check both 'passage' and 'reading_passage' fields
        const content = data.passage || data.reading_passage || "";
        if (content.toLowerCase().includes('burgeoning zero-waste movement')) {
            found.push({ id: doc.id, ...data });
        }
    });

    console.log(`Found ${found.length} documents matching the content.`);
    
    if (found.length > 0) {
        found.forEach((doc, i) => {
            console.log(`\nDoc ${i+1}: ${doc.id}`);
            console.log(`Type: ${doc.type} | TopicID: ${doc.topic_id} | Topic: ${doc.topic}`);
            console.log(`Level: ${doc.level}`);
            console.log(`Has Passage: ${!!doc.passage} | Has Reading Passage: ${!!doc.reading_passage}`);
        });
    }

    process.exit(0);
}

findPassage().catch(console.error);
