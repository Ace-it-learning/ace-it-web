const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const MathsLabService = require('../services/maths/MathsLabService');

async function testGeneration() {
    const topics = ['math_geo_rectilinear', 'math_alg_complex_numbers'];
    const level = 4; // Medium
    const uid = 'placeholder';

    for (const topic of topics) {
        console.log(`\n--- Testing Generation for Topic: ${topic} (Factory: true) ---`);
        try {
            const params = {
                topic,
                level,
                uid,
                language: 'en',
                targetCount: 1,
                isFactory: true
            };

            const result = await MathsLabService.generateLesson(params);
            console.log(`Success: Generated ${result.interactive_tasks.length} questions.`);
            if (result.interactive_tasks.length > 0) {
                const q = result.interactive_tasks[0];
                console.log(`Question Preview: ${q.question.substring(0, 100)}...`);
                console.log(`Diagram URL: ${q.diagram_url}`);
                console.log(`Diagram JSON exists: ${!!q.diagram_json}`);
            } else {
                console.error(`Error: ${result.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(`Failed to generate for ${topic}:`, err);
        }
    }

    process.exit(0);
}

testGeneration();
