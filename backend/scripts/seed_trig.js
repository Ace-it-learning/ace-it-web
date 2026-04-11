const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function seedTrig() {
    try {
        console.log('🚀 Starting Trigonometry Seeding...');

        // 1. Seed Briefing Content
        const briefingPath = path.join(__dirname, '../data/math_content/math_trig_ratios_briefing.json');
        const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
        const topicId = 'math_trig_ratios';
        
        await db.collection('learning_content').doc(topicId).set(briefingData);
        console.log(`✅ Seeded learning_content/${topicId}`);

        // 2. Seed Question Bank
        const questionsPath = path.join(__dirname, '../data/math_content/math_trig_ratios_questions.json');
        const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

        const batch = db.batch();
        for (const q of questionsData) {
            // Map our JSON schema to the Firestore question_bank schema
            const firestoreQ = {
                topic_id: q.topic_id,
                level: q.level,
                is_approved: true,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                difficulty: `Level ${q.level}${q.level === 3 ? ' (Easy)' : q.level === 4 ? ' (Medium)' : q.level === 5 ? ' (Standard)' : ' (Elite)'}`,
                question: q.question,
                question_zh: q.question_zh,
                diagram_svg: q.visual || "",
                solution_steps: q.solution_steps,
                solution_steps_zh: q.solution_steps_zh,
                final_answer: q.correct_answer,
                marks: q.marks,
                type: q.type,
                subject: q.subject
            };

            const docRef = db.collection('question_bank').doc(q.id);
            batch.set(docRef, firestoreQ);
        }

        await batch.commit();
        console.log(`✅ Seeded ${questionsData.length} questions to question_bank`);

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedTrig();
