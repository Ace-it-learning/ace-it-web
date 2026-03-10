const admin = require('firebase-admin');
const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkQuestionBank() {
    const topics = [
        'math_alg_apgp',
        'math_num_percentages',
        'math_alg_formulas',
        'math_alg_polynomials',
        'math_alg_quadratics',
        'math_alg_functions',
        'math_alg_variations'
    ];

    console.log('--- Question Bank Audit ---');
    for (const topic of topics) {
        for (const level of [3, 4, 5, 7]) {
            const snapshot = await db.collection('question_bank')
                .where('topic_id', '==', topic)
                .where('level', '==', level)
                .where('is_approved', '==', true)
                .get();

            const totalSnapshot = await db.collection('question_bank')
                .where('topic_id', '==', topic)
                .where('level', '==', level)
                .get();

            if (totalSnapshot.size > 0) {
                console.log(`${topic} Level ${level}: ${snapshot.size} approved / ${totalSnapshot.size} total`);
            }
        }
    }
}

checkQuestionBank().catch(console.error);
