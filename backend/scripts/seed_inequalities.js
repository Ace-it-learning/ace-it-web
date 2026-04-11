const admin = require('firebase-admin');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const generateQuestionHash = (topic_id, type, questionText, level) => {
    const str = `${topic_id.toLowerCase()}-${type}-${level}-${questionText.trim().substring(0, 500)}`;
    return crypto.createHash('md5').update(str).digest('hex');
};

async function seedInequalities() {
    const topicId = 'math_num_inequalities';
    const topicName = 'Inequalities';
    
    console.log(`🚀 Starting seed for ${topicName}...`);

    // 1. Seed Learning Content (Briefing Page)
    const briefingPath = path.join(__dirname, '..', 'data', 'math_content', 'math_num_inequalities.json');
    if (fs.existsSync(briefingPath)) {
        const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf-8'));
        await db.collection('learning_content').doc(topicId).set({
            ...briefingData,
            topic_id: topicId,
            last_updated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ Briefing page updated.');
    }

    // 2. Seed Questions
    const questionsPath = path.join(__dirname, '..', 'data', 'math_content', 'math_num_inequalities_questions.json');
    if (!fs.existsSync(questionsPath)) {
        console.error('❌ Questions file not found!');
        process.exit(1);
    }

    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8').replace(/^\uFEFF/, ''));
    console.log(`Found ${questionsData.length} questions. Preparing batch...`);

    const batch = db.batch();
    for (const q of questionsData) {
        const qHash = generateQuestionHash(topicId, 'factory', q.question, q.level);
        const ref = db.collection('question_bank').doc(qHash);
        
        const quest = {
            id: qHash,
            topic: topicName,
            topic_id: topicId,
            subject: 'Maths',
            type: 'conventional',
            level: q.level,
            question: q.question,
            question_zh: q.question_zh,
            answer: q.answer,
            solution_steps: q.steps,
            solution_steps_zh: q.steps_zh,
            answer_logic: q.steps.join('\n'),
            answer_logic_zh: q.steps_zh.join('\n'),
            is_approved: true,
            is_factory: true,
            created_at: new Date().toISOString(),
            marks: 3,
            visual_version: "3.1-Premium",
            standard_version: "3.1-Premium"
        };
        
        batch.set(ref, quest);
    }

    try {
        await batch.commit();
        console.log('✅ Successfully seeded all questions to question_bank!');
    } catch (err) {
        console.error('❌ Failed to seed questions:', err);
    } finally {
        process.exit(0);
    }
}

seedInequalities().catch(err => {
    console.error(err);
    process.exit(1);
});
