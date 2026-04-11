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

const finalQuestions = allQuestions.map(q => {
    const fixDiagrams = (str) => {
        if (!str || typeof str !== 'string') return str;
        let s = str;
        // Fix the specific 'missing backslash' in diagrams
        // e.g. "Leaf (1) \ \hline" => "Leaf (1) \\ \hline"
        s = s.replace(/\\ \s*\\hline/g, '\\\\ \\\\hline');
        s = s.replace(/(?<!\\)\\hline/g, '\\\\hline'); // Ensure \hline is escaped
        
        // Compact tables (Q7, Q10, Q27 favorite)
        s = s.replace(/\\begin\{array\}([\s\S]*?)\\end\{array\}/g, (match, body) => {
             let cleanedBody = body.replace(/\s+/g, ' ');
             // Standardize row breaks
             cleanedBody = cleanedBody.replace(/\\ \\\\hline/g, ' \\\\ \\hline');
             return `\\begin{array}${cleanedBody}\\end{array}`;
        });
        return s;
    };

    const fixSolutions = (steps) => {
        if (!steps || !Array.isArray(steps)) return steps;
        return steps.map(step => {
            let s = step;
            // Balance $
            const dollarCount = (s.match(/\$/g) || []).length;
            if (dollarCount % 2 !== 0) {
                 if (s.trim().endsWith('.') || s.trim().endsWith('。')) {
                    s = s.replace(/([\.\。])$/, '$$$1');
                } else {
                    s = s + '$';
                }
            }
            // Math commands in prose => wrap
            if (s.includes('\\') && !s.includes('$')) {
                if (/(\\implies|\\sigma|\\mu|\\mathrm|\\sum|\\frac)/.test(s)) {
                    s = `$${s.trim()}$`;
                }
            }
            return s;
        });
    }

    q.question_en = fixDiagrams(q.question_en);
    q.question_zh = fixDiagrams(q.question_zh);
    q.solution_steps_en = fixSolutions(q.solution_steps_en);
    q.solution_steps_zh = fixSolutions(q.solution_steps_zh);

    return q;
});

const outputPath = path.join(baseDir, 'math_stat_charts_questions.json');
fs.writeFileSync(outputPath, JSON.stringify(finalQuestions, null, 2));
console.log("✅ Final confirmation fix applied.");
