const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const fixProse = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. Fix AI-generated mashing
    s = s.replace(/\bxis\b/g, 'x is')
         .replace(/\byis\b/g, 'y is')
         .replace(/(\d)marks/gi, '$1 marks')
         .replace(/(\d)and\b/g, '$1 and')
         .replace(/(\d)is\b/g, '$1 is')
         .replace(/(\d)cm/g, '$1 cm')
         .replace(/bin\s+stem-leaf/gi, 'in stem-leaf')
         .replace(/(\d)boys/g, '$1 boys')
         .replace(/(\d)girls/g, '$1 girls')
         .replace(/(\d)children/g, '$1 children')
         .replace(/(\d)students/g, '$1 students');

    // 2. Wrap singleton variables in \( ... \) if they are not already delimited
    // We target common stat variables: x, y, Q_1, Q_3, \sigma, \mu
    
    // Replace \sigma (and variants)
    s = s.replace(/(?<!\\\(|\\\[|[\$])\\?sigma\b(?!\s*=)/gi, '\\(\\sigma\\)');
    s = s.replace(/(?<!\\\(|\\\[|[\$])\\?sigma\s*=\s*(\d+)/gi, '\\(\\sigma = $1\\)');

    // Replace Q_1, Q_3
    s = s.replace(/(?<!\\\(|\\\[|[\$])Q_[13](?!\s*=)/g, (match) => `\\(${match}\\)`);
    s = s.replace(/(?<!\\\(|\\\[|[\$])Q_([13])\s*=\s*(\d+)/g, (match, d, v) => `\\(Q_${d} = ${v}\\)`);

    // Replace single letter variables x, y when surrounded by prose but NOT already in LaTeX
    // Look for space before/after or punctuation
    s = s.replace(/(?<=[\s,;.])([xy])(?=[\s,;.])/g, (match) => `\\(${match}\\)`);

    // 3. Double-check delimiters (Ensure no nested delimiters like \(\(x\)\))
    s = s.replace(/\\\((\s*)\\\(/g, '\\(').replace(/\\\)(\s*)\\\)/g, '\\)');

    return s;
};

if (!fs.existsSync(targetFile)) {
    console.error(`Missing target: ${targetFile}`);
    process.exit(1);
}

console.log(`Fixing prose and variables in ${targetFile}...`);
const raw = fs.readFileSync(targetFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = fixProse(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => fixProse(item));
        } else if (q[field]) {
            q[field] = fixProse(q[field]);
        }
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Surgical prose fix complete.');
