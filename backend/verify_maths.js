const MathsLabService = require('./services/maths/MathsLabService');
require('dotenv').config();

// Mock Firebase if needed or just let it fail on DB (we just want Generation)
// But LabService uses admin.firestore().
// We need to initialize admin.
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const fs = require('fs');

async function testMathsLab() {
    console.log("Testing MathsLabService in Backend context...");
    try {
        const lesson = await MathsLabService.generateLesson({
            topic: 'math_alg_quadratics',
            level: '4',
            uid: 'test_user_local'
        });
        console.log("Successfully generated lesson.");
        fs.writeFileSync('verify_output.json', JSON.stringify(lesson, null, 2));
    } catch (e) {
        console.error("FAILED:", e);
    }
}

testMathsLab();
