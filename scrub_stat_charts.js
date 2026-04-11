const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_questions.json');

if (!fs.existsSync(questionsPath)) {
    console.error("File not found:", questionsPath);
    process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const cleanedQuestions = questions.map(q => {
    let qStr = JSON.stringify(q);

    // 1. Scrub array environments for excessive spacing
    qStr = qStr.replace(/\\\\begin\{array\}([\s\S]*?)\\\\end\{array\}/g, (match, body) => {
        let cleanedBody = body;
        
        // Remove sequences of whitespace and redundant breaks
        cleanedBody = cleanedBody.replace(/\\\\n/g, ' ');
        cleanedBody = cleanedBody.replace(/\s+/g, ' ');

        // MANDATORY: KaTeX array requires \\ before \hline
        // We ensure exactly ONE \\ followed by a space before each \hline
        cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)*\\\\hline/g, ' \\\\\\\\ \\\\hline');
        
        // Remove trailing breaks at the end of the array
        cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)+$/, ' ');
        
        // Remove extra breaks at the start of the array (before the first content/hline)
        // If it starts with an hline, ensure no leading break
        cleanedBody = cleanedBody.replace(/^(\\+(\s|\\\\)*)+/, ' ');

        // Fix double-row breaks that might have been introduced
        cleanedBody = cleanedBody.replace(/\\\\\\\\ \\\\\\\\/g, ' \\\\\\\\');

        return `\\\\begin{array}${cleanedBody}\\\\end{array}`;
    });

    return JSON.parse(qStr);
});

fs.writeFileSync(questionsPath, JSON.stringify(cleanedQuestions, null, 2));
console.log("✅ Successfully scrubbed 30 questions with hardened KaTeX compatibility.");
