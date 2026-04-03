const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function inspect() {
    const snap = await db.collection('question_bank')
        .where('topic_id', '==', 'math_num_percentages')
        .limit(10)
        .get();
    
    snap.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        if (data.question.includes('HK')) {
            console.log(`HK found: ${data.question}`);
        }
        if (data.question.includes('sup')) {
            console.log(`SUP found: ${data.question}`);
        }
        console.log('-------------------');
    });
}
inspect().then(() => process.exit(0));
