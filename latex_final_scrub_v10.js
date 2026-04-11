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
        return match
            // Remove the illegal newline inserted after columns
            // BEFORE: "Stem} & \\\\text{Leaf"  AFTER: "Stem} & \text{Leaf"
            .replace(/&\s*\\\\+\s*(\\text)/g, '& $1')
            // Remove illegal newline before any hline
            .replace(/&\s*\\\\+\s*(\\hline)/g, '& $1')
            // Also fix the case where there is just a space
            .replace(/&\s*\\\\+\s*/g, ' & ')
            // Normalize spaces
            .replace(/\s+/g, ' ');
    });
    
    return result;
};

const fixed = data.map(q => {
    q.question_en = finalScrub(q.question_en);
    q.question_zh = finalScrub(q.question_zh);
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Surgical LaTeX Scrub v10 Complete.');
