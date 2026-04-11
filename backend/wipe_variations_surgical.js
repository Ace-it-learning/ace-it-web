const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function cleanVariations() {
    console.log(`Surgical wipe of all Variations-related questions...`);
    try {
        // Find ALL questions that have variation in the ID or topic_id
        const topicIds = ['math_alg_variation', 'math_alg_variations'];
        
        const questionsSnap = await db.collection('question_bank')
            .where('topic_id', 'in', topicIds)
            .get();
        
        console.log(`Found ${questionsSnap.size} documents to delete.`);
        
        if (questionsSnap.size > 0) {
            const batch = db.batch();
            questionsSnap.forEach(doc => {
                console.log(`Deleting ${doc.id}`);
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Wipe complete.`);
        }
    } catch (error) {
        console.error('Error during wipe:', error);
    }
}

cleanVariations().then(() => process.exit(0));
