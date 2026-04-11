const fs = require('fs');
const path = require('path');

const inputFile = 'backend/data/math_content/math_stat_charts_questions.json';
const backupFile = 'backend/data/math_content/math_stat_charts_questions.json.v2.bak';

console.log(`Reading ${inputFile}...`);
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Create backup
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`Backup saved to ${backupFile}`);

/**
 * Standardizes Stem-and-Leaf diagrams.
 * Goal: Ensure double row breaks \\ (which appear as \\\\ in JS string) are preserved.
 */
function normalizeLatex(str) {
    if (typeof str !== 'string') return str;
    
    // Check if it contains an array environment
    if (!str.includes('begin{array}')) return str;
    
    let result = str;

    // Step 1: Ensure the array has the correct column spec for stem-and-leaf: {r|l}
    result = result.replace(/\\begin\{array\}\{.*?\}/g, '\\begin{array}{r|l}');
    
    // Step 2: Extract the array block and normalize it
    result = result.replace(/\\begin\{array\}.*?\\end\{array\}/gs, (match) => {
        let arrayBlock = match;
        // Normalize backslashes (Step A: all to single)
        arrayBlock = arrayBlock.replace(/\\+/g, '\\');
        // Re-inject double slashes (Step B: re-inject for row breaks)
        arrayBlock = arrayBlock.replace(/\\(?=[ \t\d\|])/g, '\\\\');
        arrayBlock = arrayBlock.replace(/\\hline/g, '\\\\ \\hline');
        arrayBlock = arrayBlock.replace(/\\text/g, '\\text'); // Keep \text single prefix for command
        
        // Wrap in $$ if not already inside one
        return `\n$$\n${arrayBlock.trim()}\n$$\n`;
    });

    // Step 3: Clean up any redundant delimiters created by the wrap
    result = result.replace(/\$\$\s*\$\$/g, '$$$$');
    
    return result.trim();
}

const updated = data.map(q => {
    const fields = ['question_en', 'question_zh', 'solution_steps_en', 'solution_steps_zh'];
    fields.forEach(field => {
        if (q[field]) {
            if (Array.isArray(q[field])) {
                q[field] = q[field].map(s => normalizeLatex(s));
            } else {
                q[field] = normalizeLatex(q[field]);
            }
        }
    });
    return q;
});

fs.writeFileSync(inputFile, JSON.stringify(updated, null, 2), 'utf8');
console.log(`✅ Updated ${inputFile} with robust LaTeX formatting.`);
console.log('Sample of first question_en:');
console.log(updated[0].question_en);
