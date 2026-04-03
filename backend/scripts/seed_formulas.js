const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seedFormulas() {
    // Correct paths for the root directory
    const rootDir = path.join(__dirname, '..', '..');
    const inputPath = path.join(rootDir, 'formulas_questions_final.json');
    
    console.log(`Reading ${inputPath}...`);
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const questions = JSON.parse(rawData);

    // Note: The questions already have the official schema from the fixer script
    const topicId = 'math_alg_formula';
    const collectionName = 'question_bank';

    console.log(`Preparing to seed ${questions.length} questions for topic: ${topicId}`);

    // Clear existing questions for this topic
    const existingQs = await db.collection(collectionName)
        .where('topic_id', '==', topicId)
        .get();
    
    if (existingQs.size > 0) {
        console.log(`Found ${existingQs.size} existing questions. Deleting...`);
        const batch = db.batch();
        existingQs.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log("Cleanup complete.");
    }

    // Seed new questions
    const batch = db.batch();
    questions.forEach((q) => {
        const qRef = db.collection(collectionName).doc();
        batch.set(qRef, {
            ...q,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            is_approved: true
        });
    });

    await batch.commit();
    console.log(`Successfully seeded ${questions.length} questions to Firestore.`);
}

seedFormulas().catch(err => {
    console.error("Error seeding formulas:", err);
    process.exit(1);
});
