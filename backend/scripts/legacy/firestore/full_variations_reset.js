const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fullAuditAndWipe(email) {
    console.log(`--- Starting Variations Audit & Wipe for ${email} ---`);
    try {
        // 1. Audit Question Bank
        const topicIds = ['math_alg_variation', 'math_alg_variations'];
        const questionsSnap = await db.collection('question_bank')
            .where('topic_id', 'in', topicIds)
            .get();
        
        console.log(`Question Bank Audit: Found ${questionsSnap.size} total Variation-related docs.`);
        
        const ids = [];
        questionsSnap.forEach(doc => ids.push({ id: doc.id, topic_id: doc.data().topic_id }));
        console.log(`Bank IDs:`, JSON.stringify(ids, null, 2));

        // 2. Find User
        const userSnap = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (userSnap.empty) {
            console.log(`User ${email} not found.`);
            return;
        }
        
        const userId = userSnap.docs[0].id;
        console.log(`User ID: ${userId}`);

        // 3. Wipe Practice History
        const historySnap = await db.collection('users').doc(userId)
            .collection('practice_history')
            .where('topic_id', 'in', topicIds)
            .get();
        
        console.log(`Practice History: Found ${historySnap.size} entries to delete.`);
        
        if (historySnap.size > 0) {
            const batch = db.batch();
            historySnap.forEach(doc => {
                console.log(`Deleting History Doc: ${doc.id}`);
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`History wiped.`);
        }

        // 4. Wipe Topic Progress
        const progressSnap = await db.collection('users').doc(userId)
            .collection('topic_progress')
            .get();
        
        const progressBatch = db.batch();
        let deletedProgress = 0;
        progressSnap.forEach(doc => {
            if (topicIds.includes(doc.id)) {
                console.log(`Deleting Topic Progress Doc: ${doc.id}`);
                progressBatch.delete(doc.ref);
                deletedProgress++;
            }
        });
        
        if (deletedProgress > 0) {
            await progressBatch.commit();
            console.log(`Topic Progress wiped.`);
        }

        console.log(`--- Reset Complete ---`);

    } catch (error) {
        console.error('Error:', error);
    }
}

fullAuditAndWipe('fungtam@gmail.com').then(() => process.exit(0));
