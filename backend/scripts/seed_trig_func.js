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

async function seedTrigFunc() {
    try {
        console.log('🚀 Starting "Trig Functions & Graphs" Seeding...');

        const topicId = 'math_geo_trig_func';

        // 1. Seed Briefing Content
        const briefingPath = path.join(__dirname, '../data/math_content/math_geo_trig_func_briefing.json');
        if (!fs.existsSync(briefingPath)) {
            throw new Error(`Briefing file not found at ${briefingPath}`);
        }
        const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
        
        await db.collection('learning_content').doc(topicId).set({
            ...briefingData,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Seeded learning_content/${topicId}`);

        // 2. Seed Question Bank
        const questionsPath = path.join(__dirname, '../data/math_content/math_geo_trig_func_questions.json');
        if (!fs.existsSync(questionsPath)) {
            throw new Error(`Questions file not found at ${questionsPath}`);
        }
        const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

        console.log(`📦 Preparing to seed ${questionsData.length} questions...`);

        const batch = db.batch();
        for (const q of questionsData) {
            const firestoreQ = {
                topic_id: q.topic_id,
                level: q.level,
                is_approved: true,
                is_factory: true,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
            batch.set(docRef, firestoreQ, { merge: true });
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

seedTrigFunc();
