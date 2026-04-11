const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkUserProgress(email) {
    console.log(`Checking progress for ${email}...`);
    try {
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
        
        // Check practice history for Variations
        const topicIds = ['math_alg_variation', 'math_alg_variations'];
        const progressSnap = await db.collection('users').doc(userId)
            .collection('practice_history')
            .where('topic_id', 'in', topicIds)
            .get();
        
        console.log(`Found ${progressSnap.size} practice entries for Variations.`);
        
        const completedQuestions = new Set();
        progressSnap.forEach(doc => {
            const data = doc.data();
            if (data.is_correct || data.marks > 0) {
                completedQuestions.add(data.question_id);
            }
        });
        
        console.log(`Unique completed question IDs: ${completedQuestions.size}`);
        console.log(`Typical Question ID: ${[...completedQuestions][0] || 'None'}`);
        
        // Check topic progress
        const topicProgressSnap = await db.collection('users').doc(userId)
            .collection('topic_progress')
            .get();
        
        topicProgressSnap.forEach(doc => {
            if (topicIds.includes(doc.id)) {
                console.log(`Topic Progress for ${doc.id}:`, doc.data());
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkUserProgress('fungtam@gmail.com').then(() => process.exit(0));
