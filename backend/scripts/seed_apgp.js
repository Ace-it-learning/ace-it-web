const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seedAPGP() {
    try {
        // 1. Seed the Briefing (Learning Content)
        const briefingPath = path.join(__dirname, '../data/math_content/math_alg_apgp.json');
        let briefingRaw = fs.readFileSync(briefingPath, 'utf8');
        // Remove BOM if present
        briefingRaw = briefingRaw.replace(/^\uFEFF/, '');
        const briefing = JSON.parse(briefingRaw);
        const topicId = 'math_alg_apgp';
        
        console.log(`Seeding briefing for ${topicId}...`);
        await db.collection('learning_content').doc(topicId).set({
            ...briefing,
            topic_id: topicId,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. Seed the Questions (Question Bank)
        const questionsPath = path.join(__dirname, '../data/math_content/math_alg_apgp_questions_utf8.json');
        let questionsRaw = fs.readFileSync(questionsPath, 'utf8');
        // Remove BOM if present
        questionsRaw = questionsRaw.replace(/^\uFEFF/, '');
        const questions = JSON.parse(questionsRaw);

        const batch = db.batch();
        const collectionRef = db.collection('question_bank');

        console.log(`Seeding ${questions.length} questions for topic: ${topicId} into question_bank...`);

        for (const q of questions) {
            const docRef = collectionRef.doc(q.id);

            const questionData = {
                ...q,
                topic: 'AP & GP (Sequences & Series)',
                is_approved: true,
                is_factory: true,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };

            batch.set(docRef, questionData, { merge: true });
        }

        await batch.commit();
        console.log(`--- Success: ${questions.length} AP & GP Questions Seeded to question_bank ---`);
    } catch (error) {
        console.error('Error seeding AP & GP:', error);
        process.exit(1);
    }
}

seedAPGP().then(() => process.exit(0));
