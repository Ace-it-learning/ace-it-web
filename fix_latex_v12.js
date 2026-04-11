const fs = require('fs');
const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const fixArray = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // 1. Remove the mangled delimiters from v11
    // Removing the mess like "$ \n $$" or "$\n\n$$"
    result = result.replace(/\n*\$\n*\n*\$\$\n*/g, '\n\n$$\n');
    result = result.replace(/\n*\$\$\n*\n*\$\n*/g, '\n$$\n\n');

    // 2. Clean the array body
    result = result.replace(/\\begin\{array\}[\s\S]*?\\end\{array\}/g, (match) => {
        return match
            // a. Fix the "too many backslashes" error
            // Replace literal \\\\ (4 in memory) or \\ (2 in memory) with \ (1 in memory) for commands
            .replace(/\\{2,4}(hline|begin|end|text)/g, '\\$1')
            // b. Replace literal \\\\ (4 in memory) with \\ (2 in memory) for newlines
            .replace(/\\{4,}/g, '\\\\')
            // c. Ensure \\ exists before \hline ONLY if it's missing and not at start
            .replace(/([^\\])\s*\\hline/g, '$1 \\\\ \\hline')
            // d. Remove illegal newlines after &
            .replace(/&\s*\\\\+/g, ' & ')
            // e. Remove messy newlines at start
            .replace(/(\{array\}\{.*?\}\s*)\\hline\s*\\\\+/g, '$1 \\hline ')
            // f. Normalize spaces
            .replace(/\s+/g, ' ');
    });
    
    return result;
};

const fixed = data.map(q => {
    q.question_en = fixArray(q.question_en);
    q.question_zh = fixArray(q.question_zh);
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Surgical LaTeX Fix v12: Exact Backslash Normalization Complete.');
