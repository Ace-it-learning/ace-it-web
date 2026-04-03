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

async function checkUserHistory() {
    console.log('--- Checking History for fungtam@gmail.com ---');
    const userSnap = await db.collection('users').where('email', '==', 'fungtam@gmail.com').get();
    
    if (userSnap.empty) {
        console.log('User not found');
        process.exit(1);
    }
    
    const user = userSnap.docs[0];
    const uid = user.id;
    console.log(`User UID: ${uid}`);
    
    const historySnap = await db.collection('users').doc(uid).collection('practice_history').get();
    console.log(`Total history items: ${historySnap.size}`);
    
    const counts = {};
    historySnap.forEach(doc => {
        const data = doc.data();
        const tid = data.topic_id || 'unknown';
        counts[tid] = (counts[tid] || 0) + 1;
    });
    
    console.log('Topic Counts:', counts);
    
    if (counts['math_alg_formula'] > 0) {
        console.log('Found singular history! Migrating to plural...');
        const batch = db.batch();
        const singularDocs = await db.collection('users').doc(uid).collection('practice_history')
            .where('topic_id', '==', 'math_alg_formula')
            .get();
        
        singularDocs.docs.forEach(doc => {
            batch.update(doc.ref, { topic_id: 'math_alg_formulas' });
        });
        await batch.commit();
        console.log(`✅ Migrated ${singularDocs.size} records for user.`);
    }

    process.exit(0);
}

checkUserHistory().catch(console.error);
