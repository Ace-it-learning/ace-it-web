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

async function inspectDetail() {
    const uid = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12';
    console.log(`--- Inspecting Detail for UID: ${uid} ---`);
    
    // Get ALL history items
    const historySnap = await db.collection('users').doc(uid).collection('practice_history').get();
    console.log(`Found ${historySnap.size} history items.`);
    
    // Check if any of the 30 Formulas quest IDs are in history
    const formulasQuestions = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_formulas')
        .get();
    const formulaQids = formulasQuestions.docs.map(doc => doc.id);
    console.log(`Formulas Questions in Bank: ${formulaQids.length}`);
    
    let seenInHistory = 0;
    const historyIds = new Set();
    historySnap.forEach(doc => {
        historyIds.add(doc.id);
        const data = doc.data();
        if (formulaQids.includes(doc.id)) {
            seenInHistory++;
            if (data.topic_id !== 'math_alg_formulas') {
                console.log(`Mismatch: QID ${doc.id} has topic_id [${data.topic_id}] instead of [math_alg_formulas]`);
            }
        }
    });
    
    console.log(`Matching Formulas Questions in History: ${seenInHistory}`);
    
    // If fewer than 30 are found, let's see which ones are missing
    if (seenInHistory < formulaQids.length) {
        console.log(`Missing ${formulaQids.length - seenInHistory} questions from history.`);
    }

    process.exit(0);
}

inspectDetail().catch(console.error);
