const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function auditQuestions() {
    console.log('--- Auditing Rectilinear Figures Questions ---');
    try {
        const snapshot = await db.collection('question_bank')
            .where('topic_id', '==', 'math_geo_rectilinear')
            .get();

        console.log(`Total found: ${snapshot.size}`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id} | Level: ${data.level} | Approved: ${data.is_approved} | TopicID: ${data.topic_id || 'MISSING'} | Question: ${data.question.substring(0, 50)}...`);
        });
    } catch (err) {
        console.error('Audit failed:', err);
    }
    process.exit(0);
}

auditQuestions();
