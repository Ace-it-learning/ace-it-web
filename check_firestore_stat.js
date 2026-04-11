const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkBank() {
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_stat_charts')
        .get();
    
    console.log(`Found ${snapshot.size} questions.`);
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.question_en && (data.question_en.includes('a, b') || data.question_en.includes('hline'))) {
            console.log(`--- [${doc.id}] ---`);
            console.log(data.question_en);
        }
    });
}

checkBank().then(() => process.exit(0));
