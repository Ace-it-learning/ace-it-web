const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'backend', 'data', 'math_content');
const segments = [
    'math_stat_charts_q1_10.json',
    'math_stat_charts_q11_20.json',
    'math_stat_charts_q21_30.json'
];

let allQuestions = [];
segments.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(baseDir, file), 'utf8'));
    allQuestions = allQuestions.concat(data);
});

const v7Questions = allQuestions.map(q => {
    // 1. VERBATIM Question Stems - Do not touch diagrams at all.
    // 2. Surgical Solution Step hardening
    const fixSolutions = (steps) => {
        if (!steps || !Array.isArray(steps)) return steps;
        return steps.map(step => {
            let s = step;
            
            // Fix \implies and \sigma in prose (common dashboard issue)
            // Wrap in delimiters if they are naked
            if (s.includes('\\implies') && !s.includes('$')) s = s.replace(/(\\implies)/g, '$$$1$$');
            if (s.includes('\\sigma') && !s.includes('$')) s = s.replace(/(\\sigma_[a-zA-Z0-9]+|\\sigma)/g, '$$$1$$');
            if (s.includes('\\mu') && !s.includes('$')) s = s.replace(/(\\mu)/g, '$$$1$$');

            // Balance $
            const dollarCount = (s.match(/\$/g) || []).length;
            if (dollarCount % 2 !== 0) {
                 if (s.trim().endsWith('.') || s.trim().endsWith('。')) {
                    s = s.replace(/([\.\。])$/, '$$$1');
                } else {
                    s = s + '$';
                }
            }
            
            return s;
        });
    }

    q.solution_steps_en = fixSolutions(q.solution_steps_en);
    q.solution_steps_zh = fixSolutions(q.solution_steps_zh);

    return q;
});

const outputPath = path.join(baseDir, 'math_stat_charts_questions.json');
fs.writeFileSync(outputPath, JSON.stringify(v7Questions, null, 2));
console.log("✅ Statistical Charts V7 RESTORED VERBATIM.");
