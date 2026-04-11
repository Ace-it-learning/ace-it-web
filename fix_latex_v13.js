const fs = require('fs');
const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const fixBackslashes = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // 1. First, handle all LaTeX commands: \hline, \text, \begin, \end
    // We want these to have ONE backslash in memory (which is TWO in JSON).
    // If they have 2 or more, we reduce them to 1.
    result = result.replace(/\\+(hline|text|begin|end|frac|sqrt|pm|approx|leq|geq|mu|sigma|sum|times)/g, '\\$1');
    
    // 2. Handle the Row Breaks (Newlines) \\ in the array.
    // We want these to have TWO backslashes in memory (which is FOUR in JSON).
    // In our JSON string as read by JS, \\\\ (4) became \\ (2).
    // So we look for any row break sequence.
    // We first identify array environments.
    result = result.replace(/\\begin\{array\}[\s\S]*?\\end\{array\}/g, (match) => {
        let arrayBody = match;
        
        // Ensure \hline is preceded by a row break \\
        // (Unless it's the very first hline after \begin{array})
        arrayBody = arrayBody.replace(/([^\\])\s*\\hline/g, '$1 \\\\ \\hline');
        
        // Remove illegal row breaks after column separators &
        arrayBody = arrayBody.replace(/&\s*\\\\+/g, ' & ');
        
        // Clean up any triple/quadruple backslashes that might have been created
        // We want exactly TWO backslashes for a newline in the memory string.
        // In the JS string literal, that is "\\\\".
        arrayBody = arrayBody.replace(/\\{2,}/g, '\\\\');
        
        // BUT, make sure commands like \hline still only have ONE backslash.
        arrayBody = arrayBody.replace(/\\\\(hline|text|begin|end|sum|mu|sigma)/g, '\\$1');
        
        return arrayBody;
    });

    return result;
};

const fixed = data.map(q => {
    q.question_en = fixBackslashes(q.question_en);
    q.question_zh = fixBackslashes(q.question_zh);
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Surgical LaTeX Fix v13: Dual-Mode Backslash Normalization Complete.');
