const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkDiscrepancies() {
    console.log('--- Topic ID Discrepancy Check ---');

    const apgpSnapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_apgp')
        .get();
    console.log(`math_alg_apgp count: ${apgpSnapshot.size}`);

    const seqSnapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_sequences')
        .get();
    console.log(`math_alg_sequences count: ${seqSnapshot.size}`);

    const sampleApgp = apgpSnapshot.empty ? null : apgpSnapshot.docs[0].data();
    if (sampleApgp) console.log('Sample math_alg_apgp topic name:', sampleApgp.topic);

    const sampleSeq = seqSnapshot.empty ? null : seqSnapshot.docs[0].data();
    if (sampleSeq) console.log('Sample math_alg_sequences topic name:', sampleSeq.topic);

    process.exit(0);
}

checkDiscrepancies().catch(console.error);
