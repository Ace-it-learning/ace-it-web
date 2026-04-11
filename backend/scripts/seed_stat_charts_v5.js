const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seed() {
    const filePath = path.join(__dirname, '../data/math_content/math_stat_charts_questions.json');
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`Seeding ${questions.length} questions to Firestore...`);
    
    const batch = db.batch();
    questions.forEach(q => {
        const docRef = db.collection('question_bank').doc(q.id);
        batch.set(docRef, {
            ...q,
            is_approved: true, // Ensure they are visible
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    });
    
    await batch.commit();
    console.log('✅ Seeding complete.');
}

seed().catch(console.error);
