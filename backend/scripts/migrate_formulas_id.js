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

async function migrateTopicIds() {
    console.log('--- Migrating Formulas Topic IDs ---');
    
    // 1. Update question_bank: math_alg_formula -> math_alg_formulas
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_alg_formula')
        .get();
        
    console.log(`Found ${snapshot.size} questions to migrate.`);
    
    if (snapshot.size > 0) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { topic_id: 'math_alg_formulas' });
        });
        await batch.commit();
        console.log('✅ Migration of question_bank complete.');
    } else {
        console.log('No questions found with singular topic_id.');
    }

    // 2. Clear progress for any user who might have "finished" it (just in case)
    // For now, I'll just check if there are any progress docs for the singular ID
    const progressSnapshot = await db.collectionGroup('practice_history')
        .where('topic_id', '==', 'math_alg_formula')
        .get();
        
    if (progressSnapshot.size > 0) {
        console.log(`Clearing ${progressSnapshot.size} singular progress records...`);
        const batch = db.batch();
        progressSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }

    process.exit(0);
}

migrateTopicIds().catch(console.error);
