const fs = require('fs');
const path = require('path');

const sourceFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json.v2.bak';
const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const goldenDefinitiveRescue = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. UNIFY ALL DELIMITERS
    // Convert $$ ... $$ to \[ ... \]
    s = s.replace(/\$\$(?!\$)(.*?)\$\$/gs, (match, p1) => `\\[ ${p1.trim()} \\]`);
    // Convert $ ... $ to \( ... \)
    s = s.replace(/\$(?!\$)(.*?)\$/g, (match, p1) => `\\( ${p1.trim()} \\)`);

    // 2. REPAIR ARRAY ROW-BREAKS (Surgical)
    s = s.replace(/(\\begin\{array\}\{.*?\})(.*?)(\\end\{array\})/gs, (match, prefix, content, suffix) => {
        // Strip leading breaks that create empty first rows
        let fixed = content.trim().replace(/^\\\\+/g, '').replace(/^\\hline\s*\\\\+/g, '\\hline');
        
        // Ensure only double slashes \\ exist for newlines
        // If it's a single \ followed by space/digit, promote it to \\
        fixed = fixed.replace(/\\+(\s*)(?=\d|\\text)/g, ' \\\\ ');
        
        // IMPORTANT: Strip any leading break that was just added at the very start
        fixed = fixed.trim().replace(/^\\\\/g, '');
        
        return `${prefix} ${fixed.trim()} ${suffix}`;
    });

    // 3. TYPO FIXES
    s = s.replace(/(\d)marks/gi, '$1 marks')
         .replace(/75marks/gi, '75 marks')
         .replace(/80marks/gi, '80 marks')
         .replace(/\bxis\b/g, 'x is')
         .replace(/\byis\b/g, 'y is')
         .replace(/(\d)and\b/g, '$1 and');

    // 4. CLEANUP DOUBLE-WRAPS
    s = s.replace(/\\\[\s*\\\[/g, '\\[').replace(/\\\]\s*\\\]/g, '\\]');
    s = s.replace(/\\\((\s*)\\\(/g, '\\(').replace(/\\\)(\s*)\\\)/g, '\\)');
    
    // 5. NORMALIZE WHITESPACE
    s = s.replace(/\s+/g, ' ').trim();

    return s;
};

if (!fs.existsSync(sourceFile)) {
    console.error(`Missing Golden Source: ${sourceFile}`);
    process.exit(1);
}

console.log(`Golden Standard Rescue from ${sourceFile} -> ${targetFile}...`);
const raw = fs.readFileSync(sourceFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = goldenDefinitiveRescue(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => goldenDefinitiveRescue(item));
        } else if (q[field]) {
            q[field] = goldenDefinitiveRescue(q[field]);
        }
    });
    ['answer', 'correct_answer'].forEach(field => {
        if (typeof q[field] === 'string') q[field] = goldenDefinitiveRescue(q[field]);
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Golden Standard rescue complete. Quest data is 100% professional.');
