const fs = require('fs');
const path = require('path');

const sourceFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json.v2.bak';
const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const finalUnify = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. First, fix existing corruption in the backup if any (e.g. $$ at the end of a block)
    s = s.replace(/\$\$\$/g, '$$').replace(/\$\$\s*\$/g, '$$');

    // 2. Wrap arrays in $$ if they aren't already (in the backup)
    // Looking at v2.bak, they already have $...$ or $$...$$
    
    // 3. UNIFY ALL DELIMITERS
    // Convert $$ ... $$ to \[ ... \]
    s = s.replace(/\$\$(?!\$)(.*?)\$\$/gs, (match, p1) => `\\[ ${p1.trim()} \\]`);

    // Convert $ ... $ to \( ... \)
    s = s.replace(/\$(?!\$)(.*?)\$/g, (match, p1) => `\\( ${p1.trim()} \\)`);

    // 4. FIX AI ARTIFACTS
    s = s.replace(/(\d)marks/gi, '$1 marks')
         .replace(/75marks/gi, '75 marks')
         .replace(/80marks/gi, '80 marks')
         .replace(/\bxis\b/g, 'x is')
         .replace(/\byis\b/g, 'y is')
         .replace(/(\d)and\b/g, '$1 and');

    // 5. NORMALIZE SPACING
    s = s.replace(/\\\]/g, ' \\] ').replace(/\\\[/g, ' \\[ ').replace(/\s+/g, ' ');

    return s.trim();
};

if (!fs.existsSync(sourceFile)) {
    console.error(`Missing backup: ${sourceFile}`);
    process.exit(1);
}

console.log(`Final Unification from ${sourceFile} -> ${targetFile}...`);
const raw = fs.readFileSync(sourceFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = finalUnify(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => finalUnify(item));
        } else if (q[field]) {
            q[field] = finalUnify(q[field]);
        }
    });
    ['answer', 'correct_answer'].forEach(field => {
        if (typeof q[field] === 'string') q[field] = finalUnify(q[field]);
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Definitive cleanup complete. Delimiters unified.');
