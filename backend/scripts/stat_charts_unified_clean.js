const fs = require('fs');
const path = require('path');

const sourceFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json.v2.bak';
const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const unifiedClean = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. UNIFY DELIMITERS
    // Convert $$ ... $$ to \[ ... \]
    s = s.replace(/\$\$(?!\$)(.*?)\$\$/gs, (match, p1) => `\\[ ${p1.trim()} \\]`);

    // Convert $ ... $ to \( ... \)
    // Be careful with escaped \$ in prose (not common here)
    s = s.replace(/\$(?!\$)(.*?)\$/g, (match, p1) => `\\( ${p1.trim()} \\)`);

    // 2. TYPO CLEANUP
    s = s.replace(/(\d)marks/gi, '$1 marks')
         .replace(/\bxis\b/g, 'x is')
         .replace(/\byis\b/g, 'y is')
         .replace(/(\d)and\b/g, '$1 and')
         .replace(/(\d)is\b/g, '$1 is')
         .replace(/(\d)cm/g, '$1 cm');

    // 3. VARIABLE PROTECTION (Strict with word boundaries)
    // Wrap x, y, \sigma, \mu, Q_1, Q_3 ONLY if not already delimited
    const vars = [
        { raw: 'Q_[13]', latex: 'Q_1|Q_3' },
        { raw: '\\\\?sigma', latex: '\\\\sigma' },
        { raw: '\\\\?mu', latex: '\\\\mu' }
    ];
    vars.forEach(v => {
        const regex = new RegExp(`(?<!\\\\\\(|\\\\\\[|[\$]|\\\\text\\{)\\b${v.raw}\\b(?![^\\}]*\\})`, 'g');
        s = s.replace(regex, (match) => `\\(${match}\\)`);
    });
    // Protect lone x, y
    s = s.replace(/(?<!\\\(|\\\[|[\$]|[\w])([xy])(?![\w])/g, (match) => `\\(${match}\\)`);

    // 4. SPACING ENFORCEMENT
    s = s.replace(/\\\]/g, ' \\] ').replace(/\s+/g, ' ');

    return s.trim();
};

if (!fs.existsSync(sourceFile)) {
    console.error(`Missing backup: ${sourceFile}`);
    process.exit(1);
}

console.log(`Unifying and Polishing from ${sourceFile} -> ${targetFile}...`);
const raw = fs.readFileSync(sourceFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = unifiedClean(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => unifiedClean(item));
        } else if (q[field]) {
            q[field] = unifiedClean(q[field]);
        }
    });
    if (typeof q.answer === 'string') q.answer = unifiedClean(q.answer);
    if (typeof q.correct_answer === 'string') q.correct_answer = unifiedClean(q.correct_answer);
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Definitive cleanup complete. All delimiters unified to \( and \].');
