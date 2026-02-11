require('dotenv').config();
const MathsDiagnosticService = require('./services/maths/MathsDiagnosticService');

// Patch console.log to capture AI Service output
const originalLog = console.log;
console.log = function (...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('[GenerativeAIService]')) {
        // Log AI service messages to stderr for visibility
        console.error(...args);
    }
    originalLog.apply(console, args);
};

async function testGradingV2() {
    console.error("🧪 Testing Maths Grading V2 (Deep Dive) - Expecting gemini-1.5-pro");
    const startTime = Date.now();

    const submission = {
        paperId: 'A',
        answers: {
            'm_p1_1': "A = 2\\pi r^2 + 2\\pi rh \\\\ A - 2\\pi r^2 = 2\\pi rh \\\\ h = (A - 2\\pi r^2) / (2\\pi r)",
            'm_p1_2': "x^2 y^5",
            'm_p1_3': "(x+3)(x-3)",
            'm_p1_4': "x = 5",
            'm_p2_1': '0.0459',
            'm_p2_2': '2:3'
        }
    };

    try {
        console.error("⏳ Calling gradeMaths... (This uses AI)");

        // Timeout race
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT_LIMIT_EXCEEDED (360s)")), 360000)
        );

        // Heartbeat to track duration
        const heartbeat = setInterval(() => {
            console.error(`... waiting (${Math.floor((Date.now() - startTime) / 1000)}s)`);
        }, 10000);

        const result = await Promise.race([
            MathsDiagnosticService.gradeMaths(submission, 'test_user_uid'),
            timeoutPromise
        ]);

        const duration = (Date.now() - startTime) / 1000;
        console.error(`✅ Grading Completed in ${duration}s`);

        // specific check for the error message
        const failedQuestions = result.details.filter(d => d.explanation.includes("Grading unavailable"));

        if (failedQuestions.length > 0) {
            console.error(`❌ FAILURE: Found ${failedQuestions.length} 'Grading unavailable' messages.`);
            failedQuestions.forEach(q => {
                console.error(`   - ${q.id}: ${q.explanation}`);
            });
            process.exit(1);
        } else {
            console.error("🎉 SUCCESS: No grading failures detected.");
            console.error("   - Total Score:", result.totalScore);
            console.error("   - Level:", result.level);

            if (result.details.length > 0) {
                const sample = result.details.find(d => d.id === 'm_p1_1');
                if (sample) {
                    console.error("   - Sample Explanation (m_p1_1):");
                    console.error(sample.explanation.substring(0, 200) + "...");
                }
            }
            process.exit(0);
        }

    } catch (e) {
        console.error("❌ CRASH: Grading Script Error:", e.message);
        if (e.cause) console.error("Cause:", e.cause);
        process.exit(1);
    }
}

testGradingV2();
