const fs = require('fs');
const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const finalScrub = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // 1. Clean up doubled delimiters: $ \n\n $$ ... $$ \n $
    result = result.replace(/\$\s*\n?\n?\$\$([\s\S]*?)\$\$\s*\n?\$/g, '\n\n$$\n$1\n$$\n');
    
    // 2. Surgical Array Fix
    result = result.replace(/(\\+begin\{array\}[\s\S]*?\\+end\{array\})/g, (match) => {
        let arrayBody = match;
        
        // Fix 1: Ensure \\ before \hline (except when \hline is at the very start of the array)
        // Looking for [anything but \\ or {] followed by \hline
        // We handle JSON escaping (\\\\hline)
        arrayBody = arrayBody.replace(/([^\\](?:\\\\)*)\\hline/g, (m, p1) => {
            // If the preceding char is a brace or start of array, don't add \\
            if (p1.trim().endsWith('{') || p1.trim().endsWith('|')) return m;
            return p1 + ' \\\\\\\\ \\\\hline';
        });

        // Fix 2: Remove illegal newlines after column separators &
        arrayBody = arrayBody.replace(/&\s*\\\\+/g, ' & ');

        // Fix 3: Remove illegal newlines at the very start of the array body
        // e.g., \begin{array}{|c|c|} \hline \\ \\\\
        arrayBody = arrayBody.replace(/(\\+begin\{array\}\{.*?\})\s*(\\+hline)?\s*\\\\+/g, '$1 $2');

        // Fix 4: Normalize spaces
        arrayBody = arrayBody.replace(/\s+/g, ' ');
        
        return arrayBody;
    });
    
    return result;
};

const fixed = data.map(q => {
    q.question_en = finalScrub(q.question_en);
    q.question_zh = finalScrub(q.question_zh);
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Surgical LaTeX Scrubber v11: Hline & Spacing Fix Complete.');
