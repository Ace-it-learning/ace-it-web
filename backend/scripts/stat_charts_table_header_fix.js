const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const fixTableHeaders = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. Identify all \begin{array} ... \end{array} blocks
    s = s.replace(/(\\begin\{array\}\{.*?\})(.*?)(\\end\{array\})/gs, (match, prefix, content, suffix) => {
        // Remove orphan breaks that appear immediately after an & in the header
        // e.g. & \\ \text -> & \text
        let fixed = content
            .replace(/(&)\s*\\\\(\s*?)(?=\\text|\d)/g, '$1 $2')
            // Also remove orphan breaks right after \hline at the start
            .replace(/(\\hline)\s*\\\\(\s*?)(?=\\text|&)/g, '$1 $2')
            // Also remove orphan breaks right at the start of the content
            .replace(/^\s*\\\\(\s*?)(?=\\text|&|\\hline)/g, '$1');
            
        return `${prefix}${fixed}${suffix}`;
    });

    return s;
};

if (!fs.existsSync(targetFile)) {
    console.error(`Missing target: ${targetFile}`);
    process.exit(1);
}

console.log(`Fixing table headers in ${targetFile}...`);
const raw = fs.readFileSync(targetFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = fixTableHeaders(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => fixTableHeaders(item));
        } else if (q[field]) {
            q[field] = fixTableHeaders(q[field]);
        }
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Table headers fixed. Orphan empty rows removed.');
