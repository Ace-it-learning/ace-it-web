// Test script to verify MathsDiagnosticService AI grading
require('dotenv').config();
const MathsDiagnosticService = require('./services/maths/MathsDiagnosticService');

async function testGrading() {
    console.log('🧪 Testing MathsDiagnosticService...\n');

    // Check API key
    if (!process.env.GOOGLE_API_KEY) {
        console.error('❌ GOOGLE_API_KEY not found in environment!');
        return;
    }
    console.log('✅ GOOGLE_API_KEY found');

    // Create a simple test submission
    const testSubmission = {
        paperId: 'A',
        answers: {
            'm_p1_1': 'A = 2πr² + 2πrh\nA - 2πr² = 2πrh\nh = (A - 2πr²)/(2πr) = A/(2πr) - r',
            'm_p2_1': '0.0459',
            'm_p2_2': '2:3'
        }
    };

    console.log('\n📝 Test submission:', JSON.stringify(testSubmission, null, 2));

    try {
        console.log('\n⏳ Calling gradeMaths...');
        const results = await MathsDiagnosticService.gradeMaths(testSubmission);

        console.log('\n✅ Grading completed!');
        console.log('\n📊 Results:');
        console.log('Total Score:', results.totalScore, '/', results.maxScore);
        console.log('Percentage:', results.percentage.toFixed(2) + '%');
        console.log('Level:', results.level);

        console.log('\n📋 Details:');
        results.details.forEach(d => {
            console.log(`\n${d.id}:`);
            console.log(`  Score: ${d.score}/${d.max}`);
            console.log(`  Explanation: ${d.explanation?.substring(0, 100)}...`);
        });

    } catch (error) {
        console.error('\n❌ Error during grading:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }
}

testGrading();
