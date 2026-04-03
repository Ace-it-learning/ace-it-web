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

async function seedProbStatQuestions() {
    console.log("🚀 Seeding 30 Probability & Statistics questions to Firestore...");
    
    const questionsPath = path.join(__dirname, '..', 'math_engine', 'bank_assets', 'math_stat_prob_final.json');
    
    if (!fs.existsSync(questionsPath)) {
        console.error("❌ Error: math_stat_prob_final.json not found at", questionsPath);
        process.exit(1);
    }

    try {
        const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
        const batch = db.batch();
        const collectionRef = db.collection('question_bank');

        // 1. Optional: Clear old questions for this topic to avoid duplicates
        // (Actually, our cleanup step should have handled this, but we'll do it safely by ID)
        
        questions.forEach((q) => {
            const docRef = collectionRef.doc(q.id);
            // Ensure additional metadata for MathsLab indexing
            const finalDoc = {
                ...q,
                is_approved: true,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
                // Metadata for filtering
                difficulty_level: q.level,
                category: 'math_stat_prob'
            };
            batch.set(docRef, finalDoc);
        });

        await batch.commit();
        console.log(`✅ Successfully seeded ${questions.length} questions to question_bank.`);

    } catch (error) {
        console.error("❌ Error seeding questions:", error);
    }
}

seedProbStatQuestions().then(() => {
    console.log("--- Seeding Complete ---");
    process.exit(0);
});
