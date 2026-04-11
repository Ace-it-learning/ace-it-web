const fs = require('fs');
const path = require('path');

const batch1Path = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_q1_10.json');
const batch2Path = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_q11_20.json');
const batch3Path = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_q21_30.json');
const outputPath = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_questions.json');

try {
    const batch1 = JSON.parse(fs.readFileSync(batch1Path, 'utf8'));
    const batch2 = JSON.parse(fs.readFileSync(batch2Path, 'utf8'));
    const batch3 = JSON.parse(fs.readFileSync(batch3Path, 'utf8'));

    const allQuestions = [...batch1, ...batch2, ...batch3];

    fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf8');
    console.log(`✅ Successfully merged ${allQuestions.length} questions into ${outputPath}`);
} catch (error) {
    console.error('❌ Error merging questions:', error);
    process.exit(1);
}
