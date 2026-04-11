const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const finalPolish = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. TYPO CLEANUP (Fixed across the bank)
    s = s.replace(/(\d)marks/gi, '$1 marks')
         .replace(/xis\b/g, 'x is')
         .replace(/yis\b/g, 'y is')
         .replace(/(\d)and\b/g, '$1 and')
         .replace(/(\d)is\b/g, '$1 is')
         .replace(/(\d)cm/g, '$1 cm')
         .replace(/bin\s+stem-leaf/gi, 'in stem-leaf')
         .replace(/(\d)boys/g, '$1 boys')
         .replace(/(\d)girls/g, '$1 girls')
         .replace(/(\d)children/g, '$1 children')
         .replace(/(\d)students/g, '$1 students');

    // 2. ARRAY WRAPPING (The "Red Text" Killer)
    // Wrap any array environment in \[ ... \] IF it isn't already wrapped.
    // Use non-capturing lookahead/lookbehind to avoid double wrapping.
    s = s.replace(/(?<!\\\[\s*)\\begin\{array\}(.*?)\\end\{array\}(?!\s*\\\])/gs, (match) => {
        return `\\[ ${match} \\]`;
    });

    // 3. VARIABLE PROTECTION (The "Mashed Prose" Killer)
    // Wrap lone variables x, y, \sigma, Q_1, Q_3 in \( ... \) if they are in prose.
    
    // Protect Q_1, Q_3, \sigma, \mu
    const vars = [
        { raw: 'Q_[13]', latex: 'Q_1|Q_3' },
        { raw: '\\\\?sigma', latex: '\\\\sigma' },
        { raw: '\\\\?mu', latex: '\\\\mu' }
    ];

    vars.forEach(v => {
        const regex = new RegExp(`(?<!\\\\\\(|\\\\\\[|[\$]|\\\\text\\{)${v.raw}(?![^\\}]*\\})`, 'g');
        s = s.replace(regex, (match) => `\\(${match}\\)`);
    });

    // Protect single x, y when surrounded by word boundaries or punctuation
    s = s.replace(/(?<=[\s,;.])([xy])(?=[\s,;.])/g, (match) => `\\(${match}\\)`);

    // 4. SPACING ENFORCEMENT
    // Ensure a space or newline after every \] if followed by non-whitespace
    s = s.replace(/\\\](?=\S)/g, '\\] ');
    
    // 5. NESTED DELIMITER PURGE (Safety)
    s = s.replace(/\\\((\s*)\\\(/g, '\\(').replace(/\\\)(\s*)\\\)/g, '\\)');
    
    // 6. SLASH NORMALIZATION (Single-escaped in JS string)
    s = s.replace(/\\{3,}/g, '\\\\');

    return s;
};

if (!fs.existsSync(targetFile)) {
    console.error(`Missing target: ${targetFile}`);
    process.exit(1);
}

console.log(`Applying final polish to ${targetFile}...`);
const raw = fs.readFileSync(targetFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = finalPolish(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => finalPolish(item));
        } else if (q[field]) {
            q[field] = finalPolish(q[field]);
        }
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Final polish complete. All arrays delimited and variables wrapped.');
