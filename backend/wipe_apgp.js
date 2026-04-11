const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function findUserAndWipe(email) {
    console.log(`Searching for user: ${email}...`);
    const users = await db.collection('users').where('email', '==', email).get();
    
    if (users.empty) {
        console.error("User not found.");
        return;
    }

    const userDoc = users.docs[0];
    const uid = userDoc.id;
    console.log(`Found UID: ${uid}`);

    // 1. Wipe Practice History for AP & GP
    const historyRef = db.collection('users').doc(uid).collection('practice_history');
    const apgpHistory = await historyRef
        .where('topic_id', 'in', ['math_alg_apgp', 'seq_series']) // include old IDs if any
        .get();
        
    const batch = db.batch();
    apgpHistory.forEach(doc => batch.delete(doc.ref));
    
    // Also delete by ID pattern for the new ones
    const allHistory = await historyRef.get();
    allHistory.forEach(doc => {
        if (doc.id.startsWith('math_alg_apgp_') || doc.id.startsWith('seq_series_')) {
            batch.delete(doc.ref);
        }
    });

    await batch.commit();
    console.log(`Deleted ${apgpHistory.size} explicit history records (and pattern-matched ones).`);

    // 2. Reset Mastery Progress
    const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const progressDoc = await progressRef.get();
    if (progressDoc.exists) {
        const data = progressDoc.data();
        if (data.microSkills && data.microSkills.math_alg_apgp) {
            console.log("Resetting math_alg_apgp skill level...");
            await progressRef.update({
                'microSkills.math_alg_apgp': 0,
                'microSkills.seq_series': admin.firestore.FieldValue.delete()
            });
        }
    }

    console.log(`--- SUCCESS: AP & GP history wiped for ${email} ---`);
}

const targetEmail = 'fungtam@gmail.com';
findUserAndWipe(targetEmail).then(() => process.exit(0));
