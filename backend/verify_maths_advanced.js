const MathsLabService = require('./services/maths/MathsLabService');
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function verifySpecificTopics() {
    const topics = ['math_geo_circles', 'math_stat_charts'];
    console.log("Starting Advanced Verification for Geometry and Data Handling...");

    for (const topic of topics) {
        console.log(`\n--- Testing Topic: ${topic} ---`);
        try {
            const lesson = await MathsLabService.generateLesson({
                topic: topic,
                level: '5',
                uid: 'test_user_advanced',
                language: 'zh' // Testing Chinese support too
            });
            console.log(`Success: Generated ${lesson.interactive_tasks.length} tasks for ${topic}`);

            // Check if first task has a question that sounds like a diagram description
            const firstTask = lesson.interactive_tasks[0];
            console.log("Sample Question text:", firstTask.question);

            // Validate mapping
            const normalizedType = (firstTask.type || '').toLowerCase().includes('mc') ? 'mc' : 'short_answer';
            console.log("Normalized Type:", normalizedType);

            fs.writeFileSync(`verify_${topic}.json`, JSON.stringify(lesson, null, 2));
        } catch (e) {
            console.error(`FAILED for ${topic}:`, e);
        }
    }
}

verifySpecificTopics();
