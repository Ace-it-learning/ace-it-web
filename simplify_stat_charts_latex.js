const fs = require('fs');
const path = require('path');

const inputFile = 'backend/data/math_content/math_stat_charts_questions.json';
const backupFile = 'backend/data/math_content/math_stat_charts_questions.json.bak';

console.log(`Reading ${inputFile}...`);
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Create backup
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`Backup saved to ${backupFile}`);

function simplifyLatex(str) {
    if (typeof str !== 'string') return str;

    // Step 1: Normalize double backslashes for row breaks: \\\\ (four backslashes in JSON) -> \\
    // In the JSON string, we see "\\\\\\\\" (four backslashes) which represents two literal backslashes.
    // We want to keep exactly two backslashes as LaTeX row break, but we need to escape them for JSON.
    // We'll replace quadruple with double, then JSON.stringify will escape each backslash again.
    // However, we are working on the already parsed string where backslashes are already interpreted.
    // The string contains literal backslashes: "\\\\begin{array}" is four characters: \, \, b, e, ...
    // Let's use regex on the raw string.

    // Replace any sequence of backslashes that is a multiple of 2 with half count (but keep at least two for row break)
    let result = str.replace(/\\\\+/g, (match) => {
        const count = match.length;
        // If count is 4 (i.e., "\\\\") -> that's two literal backslashes, we want to keep as two.
        // Actually, "\\\\\\\\" in source is four backslashes, which after JSON parse becomes two.
        // We'll just keep as is for row breaks, but we need to ensure consistency.
        // For simplicity, reduce any count > 2 to 2.
        if (count > 2) {
            return '\\\\';
        }
        return match;
    });

    // Step 2: Ensure array environment uses correct column specification and row breaks.
    // We'll also ensure that \text{...} has single backslash.
    result = result.replace(/\\\\text\{/g, '\\text{');
    result = result.replace(/\\\\hline/g, '\\hline');
    result = result.replace(/\\\\begin\{array\}/g, '\\begin{array}');
    result = result.replace(/\\\\end\{array\}/g, '\\end{array}');

    // Step 3: Ensure that there are proper spaces after row breaks.
    result = result.replace(/\\\\\s*&/g, '\\\\ &');

    return result;
}

const updated = data.map(q => {
    const fields = ['question_en', 'question_zh', 'solution_steps_en', 'solution_steps_zh'];
    fields.forEach(field => {
        if (q[field]) {
            if (Array.isArray(q[field])) {
                q[field] = q[field].map(s => simplifyLatex(s));
            } else {
                q[field] = simplifyLatex(q[field]);
            }
        }
    });
    return q;
});

fs.writeFileSync(inputFile, JSON.stringify(updated, null, 2), 'utf8');
console.log(`✅ Updated ${inputFile} with simplified LaTeX.`);
console.log('Sample of first question_en:');
console.log(updated[0].question_en.substring(0, 300));