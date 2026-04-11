const admin = require('firebase-admin');
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

async function seedComplexNumbers() {
    const topicId = 'math_alg_complex_numbers';
    const questionsPath = path.join(__dirname, '..', 'data', 'math_content', 'math_alg_complex_questions_seed.json');
    const briefingPath = path.join(__dirname, '..', 'data', 'math_content', 'math_alg_complex.json');

    console.log('🚀 Starting Complex Numbers seeding...');

    // 1. Sync Briefing
    if (fs.existsSync(briefingPath)) {
        try {
            const rawBriefing = fs.readFileSync(briefingPath, 'utf8').replace(/^\uFEFF/, '');
            const briefingData = JSON.parse(rawBriefing);
            console.log(`Syncing briefing for ${topicId}...`);
            await db.collection('learning_content').doc(topicId).set(briefingData);
            console.log('✅ Briefing synced!');
        } catch (err) {
            console.error('❌ Failed to sync briefing:', err);
        }
    } else {
        console.warn('⚠️ Briefing file not found!');
    }

    // 2. Sync Questions
    if (fs.existsSync(questionsPath)) {
        try {
            const rawQuestions = fs.readFileSync(questionsPath, 'utf8').replace(/^\uFEFF/, '');
            const questions = JSON.parse(rawQuestions);
            console.log(`Syncing ${questions.length} questions for ${topicId}...`);

            // Clear old questions for this topic
            console.log('Cleaning old questions...');
            const oldQuests = await db.collection('question_bank')
                .where('topic_id', '==', topicId)
                .get();
            
            const deleteBatch = db.batch();
            oldQuests.forEach(doc => deleteBatch.delete(doc.ref));

            // Also clean up shorter topic ID if it exists
            const shortTopicQuests = await db.collection('question_bank')
                .where('topic_id', '==', 'math_alg_complex')
                .get();
            shortTopicQuests.forEach(doc => deleteBatch.delete(doc.ref));

            await deleteBatch.commit();
            console.log(`Deleted ${oldQuests.size + shortTopicQuests.size} old questions.`);

            // Upload new questions
            const batch = db.batch();
            questions.forEach(q => {
                const ref = db.collection('question_bank').doc(q.id);
                const quest = {
                    ...q,
                    topic_id: topicId,
                    is_approved: true,
                    is_factory: true,
                    created_at: new Date().toISOString(),
                    visual_version: "3.1-Elite",
                    standard_version: "3.1-Elite",
                    answer_logic: q.solution_steps.join('\n'),
                    answer_logic_zh: q.solution_steps_zh.join('\n')
                };
                batch.set(ref, quest);
            });
            await batch.commit();
            console.log(`✅ Successfully uploaded ${questions.length} questions!`);
        } catch (err) {
            console.error('❌ Failed to seed questions:', err);
        }
    } else {
        console.warn('⚠️ Questions file not found!');
    }

    console.log('🏁 Seeding complete!');
    process.exit(0);
}

seedComplexNumbers();
