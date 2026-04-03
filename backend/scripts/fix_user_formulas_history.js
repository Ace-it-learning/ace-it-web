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

async function fixUserHistory() {
    const uid = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12';
    console.log(`--- Fixing History for UID: ${uid} ---`);
    
    // 1. Get ALL Formulas Questions in Bank
    const formulasQuestions = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_formulas')
        .get();
    const formulaQids = formulasQuestions.docs.map(doc => doc.id);
    console.log(`Total Formulas Questions in Bank: ${formulaQids.length}`);
    
    // 2. Batch update/insert history records
    const batch = db.batch();
    formulaQids.forEach(qid => {
        const ref = db.collection('users').doc(uid).collection('practice_history').doc(qid);
        batch.set(ref, {
            topic_id: 'math_alg_formulas',
            completed: true,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            last_practiced: admin.firestore.FieldValue.serverTimestamp(),
            subject: 'maths'
        }, { merge: true });
    });
    
    await batch.commit();
    console.log(`✅ Successfully updated all ${formulaQids.length} question states for user.`);

    process.exit(0);
}

fixUserHistory().catch(console.error);
