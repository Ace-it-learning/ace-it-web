const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const topicId = 'math_stat_charts';

async function wipeQuestions() {
    console.log(`🧹 Wiping all questions in question_bank for topic: ${topicId}...`);
    
    try {
        const snapshot = await db.collection('question_bank')
            .where('category', '==', topicId)
            .get();
            
        if (snapshot.empty) {
            console.log("No questions found for this topic.");
        } else {
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
                console.log(`Deleting ${doc.id}...`);
            });
            await batch.commit();
            console.log(`✅ Successfully deleted ${snapshot.size} questions.`);
        }
        
    } catch (err) {
        console.error("Error wiping questions:", err);
    }
    process.exit(0);
}

wipeQuestions();
