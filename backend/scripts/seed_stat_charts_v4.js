const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seedStatChartsQuestions() {
    console.log("🚀 Seeding 30 Statistical Charts questions to Firestore...");
    
    // Path to our merged JSON
    const questionsPath = path.join(__dirname, '..', 'data', 'math_content', 'math_stat_charts_questions.json');
    
    if (!fs.existsSync(questionsPath)) {
        console.error("❌ Error: math_stat_charts_questions.json not found at", questionsPath);
        process.exit(1);
    }

    try {
        const questionsString = fs.readFileSync(questionsPath, 'utf8');
        const questions = JSON.parse(questionsString);
        
        const collectionRef = db.collection('question_bank');
        const batch = db.batch();

        questions.forEach((q) => {
            const docRef = collectionRef.doc(q.id);
            const finalDoc = {
                ...q,
                is_approved: true,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
                difficulty_level: q.level,
                category: 'math_stat_charts'
            };
            batch.set(docRef, finalDoc);
            console.log(`Adding ${q.id} to batch...`);
        });

        await batch.commit();
        console.log(`✅ Successfully seeded ${questions.length} questions to question_bank.`);

    } catch (error) {
        console.error("❌ Error seeding questions:", error);
    }
}

seedStatChartsQuestions().then(() => {
    console.log("--- Seeding Complete ---");
    process.exit(0);
});
