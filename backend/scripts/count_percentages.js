const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function count() {
    console.log("--- Counting Percentages & Interest Questions ---");
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_num_percentages')
        .get();

    console.log(`Total Found: ${snapshot.size}`);
    
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Question: ${data.question.substring(0, 40).replace(/\n/g, ' ')}...`);
    });
    
    process.exit();
}

count().catch(err => {
    console.error(err);
    process.exit(1);
});
