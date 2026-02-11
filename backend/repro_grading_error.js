require('dotenv').config();
const MathsDiagnosticService = require('./services/maths/MathsDiagnosticService');

async function testGrading() {
    console.log("🧪 Testing Maths Grading (Expecting gemini-1.5-pro)...");

    const submission = {
        paperId: 'A',
        answers: {
            // Correct answer for m_p1_1
            'm_p1_1': "A = 2\\pi r^2 + 2\\pi rh \\\\ A - 2\\pi r^2 = 2\\pi rh \\\\ h = (A - 2\\pi r^2) / (2\\pi r)",
            // Correct answer for m_p1_2
            'm_p1_2': "x^2 y^5",
            // Some wrong answers
            'm_p1_3': "I don't know",
            // MCQs
            'm_p2_1': '0.0459',
            'm_p2_2': '2:3'
        }
    };

    try {
        const result = await MathsDiagnosticService.gradeMaths(submission, 'test_user_uid');
        console.log("✅ Grading Completed!");

        // Check for error message
        const failedQuestions = result.details.filter(d => d.explanation.includes("Grading unavailable"));
        if (failedQuestions.length > 0) {
            console.error("⚠️  Found 'Grading unavailable' messages:", failedQuestions.length);
            failedQuestions.forEach(q => {
                console.log(`- ${q.id}: ${q.explanation}`);
            });
        } else {
            console.log("🎉 No grading failures detected.");
            if (result.details.length > 0) {
                const sample = result.details.find(d => d.id === 'm_p1_1');
                if (sample) {
                    console.log("Sample Explanation (m_p1_1):", sample.explanation.substring(0, 100) + "...");
                }
            }
        }

    } catch (e) {
        console.error("❌ Grading Script Crashed:", JSON.stringify(e, null, 2));
        if (e.message) console.error("Message:", e.message);
    }
}

testGrading();
