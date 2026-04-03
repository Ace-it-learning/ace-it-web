const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function fixSpacing() {
    console.log("[Update] Fixing bilingual spacing for 10 questions...");
    const batch = db.batch();
    
    for (let i = 1; i <= 10; i++) {
        const qid = `math-pinc-elite-${i}`;
        const docRef = db.collection('question_bank').doc(qid);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            if (data.question && data.question.includes('\n') && !data.question.includes('\n\n')) {
                const newQuestion = data.question.replace('\n', '\n\n');
                batch.update(docRef, {
                    question: newQuestion,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    }
    
    await batch.commit();
    console.log("[Update] SUCCESS: Bilingual spacing fixed.");
}

fixSpacing().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
