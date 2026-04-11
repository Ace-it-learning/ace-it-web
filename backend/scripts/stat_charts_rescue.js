const fs = require('fs');
const path = require('path');

const sourceFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json.v2.bak';
const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const rescuePolish = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. TYPO CLEANUP
    s = s.replace(/(\d)marks/gi, '$1 marks')
         .replace(/xis\b/g, 'x is')
         .replace(/yis\b/g, 'y is')
         .replace(/(\d)and\b/g, '$1 and')
         .replace(/(\d)is\b/g, '$1 is')
         .replace(/(\d)cm/g, '$1 cm')
         .replace(/(\d)boys/g, '$1 boys')
         .replace(/(\d)girls/g, '$1 girls');

    // 2. ARRAY WRAPPING - BLOCK MODE
    // Must handle double backslashes stored in JSON
    s = s.replace(/(?<!\\\[\s*)\\begin\{array\}(.*?)\\end\{array\}(?!\s*\\\])/gs, (match) => {
        return `\\[ ${match} \\]`;
    });

    // 3. VARIABLE PROTECTION - INLINE MODE (STRICT boundaries)
    // Use \b to ensure we don't hit "multiplied" (mu) or "maximum" (x)
    
    // Q_1, Q_3
    s = s.replace(/(?<!\\\(|\\\[|[\$])\b(Q_[13])\b/g, '\\($1\\)');
    
    // sigma, mu (with or without backslash)
    s = s.replace(/(?<!\\\(|\\\[|[\$])\b\\\\?sigma\b/g, '\\(\\sigma\\)');
    s = s.replace(/(?<!\\\(|\\\[|[\$])\b\\\\?mu\b/gi, (match) => {
        // If it was part of a word like "multiplied", \b will prevent it.
        // But let's be double sure it's at least one char away from alphabets
        return `\\(\\mu\\)`;
    });

    // Single letters x, y
    s = s.replace(/(?<!\\\(|\\\[|[\$]|[\w])([xy])(?![\w])/g, '\\($1\\)');

    // 4. SPACING ENFORCEMENT
    s = s.replace(/\\\](?=\S)/g, '\\] ');
    
    // 5. CLEANUP DOUBLE WRAPS (Safety)
    s = s.replace(/\\\((\s*)\\\(/g, '\\(').replace(/\\\)(\s*)\\\)/g, '\\)');

    return s;
};

if (!fs.existsSync(sourceFile)) {
    console.error(`Missing backup: ${sourceFile}`);
    process.exit(1);
}

console.log(`Rescuing from ${sourceFile} -> ${targetFile}...`);
const raw = fs.readFileSync(sourceFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = rescuePolish(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => rescuePolish(item));
        } else if (q[field]) {
            q[field] = rescuePolish(q[field]);
        }
    });
    // Also check answer field for variables
    if (typeof q.answer === 'string') q.answer = rescuePolish(q.answer);
    if (typeof q.correct_answer === 'string') q.correct_answer = rescuePolish(q.correct_answer);
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Rescue complete. No more mangled words.');
