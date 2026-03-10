const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkQuestionById(id) {
    const doc = await db.collection('question_bank').doc(id).get();
    if (!doc.exists) {
        console.log("No such document!");
        return;
    }
    console.log(JSON.stringify(doc.data(), null, 2));
}

checkQuestionById('06e44f223ac988ac9a422a7b3aca5d75').catch(console.error);
