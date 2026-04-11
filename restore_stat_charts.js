const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'backend', 'data', 'math_content');
const segments = [
    'math_stat_charts_q1_10.json',
    'math_stat_charts_q11_20.json',
    'math_stat_charts_q21_30.json'
];

let allQuestions = [];
segments.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(baseDir, file), 'utf8'));
    allQuestions = allQuestions.concat(data);
});

// Surgical formatting fixes
const hardenedQuestions = allQuestions.map(q => {
    let qStr = JSON.stringify(q);

    // 1. Safe array formatting (compact spacing)
    qStr = qStr.replace(/\\\\begin\{array\}([\s\S]*?)\\\\end\{array\}/g, (match, body) => {
        let cleanedBody = body.replace(/\\\\n/g, ' ').replace(/\s+/g, ' ');
        // Ensure \hline has a row break before it
        cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)*\\\\hline/g, ' \\\\\\\\ \\\\hline');
        // Standardize column breaks
        cleanedBody = cleanedBody.replace(/\\+(\s|\\\\)+/g, ' \\\\\\\\ ');
        // Final cleanup of extra breaks
        cleanedBody = cleanedBody.replace(/^(\\+(\s|\\\\)*)+/, ' ');
        cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)+$/, ' ');
        return `\\\\begin{array}${cleanedBody}\\\\end{array}`;
    });

    return JSON.parse(qStr);
});

const outputPath = path.join(baseDir, 'math_stat_charts_questions.json');
fs.writeFileSync(outputPath, JSON.stringify(hardenedQuestions, null, 2));
console.log("✅ Statistical Charts restored from segments and safely hardened.");
