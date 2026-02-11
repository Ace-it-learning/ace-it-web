const MathsLabService = require('../services/maths/MathsLabService');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function verify() {
    console.log("Starting Maths Quest Verification...");
    try {
        const result = await MathsLabService.generateLesson({
            topic: 'math_alg_quadratics',
            level: 4,
            language: 'zh'
        });

        console.log("Generation Successful!");
        console.log("Topic:", result.topic);
        console.log("Level:", result.level);
        console.log("Question Count:", result.interactive_tasks.length);
        console.log("First Question:", result.interactive_tasks[0].text);

    } catch (error) {
        console.error("Verification Failed:", error);
    }
}

verify();
