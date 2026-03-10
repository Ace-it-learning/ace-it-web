require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

// Out-of-syllabus question IDs identified in audit
const OOS_IDS = [
    '0d6f8ced14735fb21a8b841436201c35',  // GP with complex terms
    '148c9b38d29c77caa1c4f85a37c65ec6',  // Argand diagram midpoint
    '628a2f91fdff2636551ccb4e28e9574e',  // Conjugate root of cubic
    '91e9e4f955cbbcb45b9fac6f6ffdc96e',  // Principal argument
    'a1d880fccf67d1b7af360271332bdda0',  // Modulus |z|
    'fd84b2b42b43814758ad0b3c8a095cf4',  // Polar form division
];

async function wipeOOS() {
    console.log(`Wiping ${OOS_IDS.length} out-of-syllabus Complex Numbers questions...`);

    const batch = db.batch();
    for (const id of OOS_IDS) {
        const ref = db.collection('question_bank').doc(id);
        const doc = await ref.get();
        if (doc.exists) {
            console.log(`  Deleting: ${id} — "${doc.data().question?.substring(0, 60)}..."`);
            batch.delete(ref);
        } else {
            console.log(`  Not found (already deleted?): ${id}`);
        }
    }

    await batch.commit();
    console.log('\nWipe complete. Remaining questions are HKDSE-compliant.');

    // Verify remaining count
    const remaining = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_complex_numbers')
        .get();
    console.log(`Remaining Complex Numbers questions in bank: ${remaining.size}`);
    process.exit(0);
}

wipeOOS().catch(err => {
    console.error('Wipe failed:', err);
    process.exit(1);
});
