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

async function findLiteral() {
    console.log('--- 🔎 DEEP SEARCH: LIBERAL COMPREHENSION ---');

    // Search by title containing "Literal"
    const snapshot = await db.collection('question_bank')
        .where('topic', '!=', null) 
        .get();
    
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        const title = (data.title || '').toLowerCase();
        const topic = (data.topic || '').toLowerCase();
        const paper = (data.paper || '').toLowerCase();
        
        if (title.includes('literal') || topic.includes('literal') || topic === 'reading_literalComprehension') {
            console.log(`[${id}] Topic: ${data.topic}, Title: ${data.title}, Paper: ${data.paper}, Tasks: ${data.interactive_tasks?.length || 0}`);
        }
    });
}

findLiteral()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
