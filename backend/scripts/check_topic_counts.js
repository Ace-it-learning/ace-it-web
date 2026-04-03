const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const topicsToCheck = [
    { id: 'math_num_num_systems', name: 'Number Systems' },
    { id: 'math_num_percentages', name: 'Percentages & Interest' },
    { id: 'math_geo_rectilinear', name: 'Rectilinear Figures' },
    { id: 'math_geo_circles', name: 'Circle Properties' }
];

async function checkDatabase() {
    let output = '--- Firestore Question Bank Audit ---\n';
    for (const topic of topicsToCheck) {
        try {
            const snapshot = await db.collection('question_bank')
                .where('topic_id', '==', topic.id)
                .get();
            
            output += `${topic.name} (${topic.id}): ${snapshot.size} questions found.\n`;
        } catch (err) {
            output += `Error checking ${topic.id}: ${err.message}\n`;
        }
    }
    output += '------------------------------------\n';
    fs.writeFileSync('topic_audit.log', output);
    console.log('Audit complete. Check topic_audit.log');
}

checkDatabase().then(() => process.exit(0));
