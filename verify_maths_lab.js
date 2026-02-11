const MathsLabService = require('./backend/services/maths/MathsLabService');
require('dotenv').config({ path: './backend/.env' });

async function testMathsLab() {
    console.log("Testing MathsLabService...");
    try {
        const lesson = await MathsLabService.generateLesson({
            topic: 'math_alg_quadratics',
            level: '4', // Non-Foundation
            uid: 'test_user'
        });
        console.log("Successfully generated lesson:");
        console.log(JSON.stringify(lesson, null, 2));
    } catch (e) {
        console.error("FAILED:", e);
    }
}

testMathsLab();
