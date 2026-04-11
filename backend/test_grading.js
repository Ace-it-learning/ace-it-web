const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Mocking some necessary services if they are not modular
// Actually, we can just require the service directly if it's imported
const MathsLabService = require('./services/maths/MathsLabService');

async function testGrading() {
    const questionsPath = path.join(__dirname, '../backend/data/math_content/math_alg_apgp_questions_utf8.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8').replace(/^\uFEFF/, ''));

    const sampleQuestion = questions[0]; // "In an arithmetic progression (AP), the first term is $10$ and the common difference is $3$. Find the $9$-th term."
    const sampleUserAnswer = "34";
    const answers = { [sampleQuestion.id]: sampleUserAnswer };

    console.log("Testing Grading for Q1...");
    console.log("Expected Answer:", sampleQuestion.answer);
    console.log("User Answer:", sampleUserAnswer);

    try {
        const results = await MathsLabService.gradeShortAnswers([sampleQuestion], answers, 'en');
        console.log("Grading Result:", JSON.stringify(results, null, 2));
    } catch (err) {
        console.error("Grading failed with error:", err);
    }
}

testGrading().then(() => process.exit(0));
