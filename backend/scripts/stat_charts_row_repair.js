const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const fixRowBreaks = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. Identify all \begin{array} ... \end{array} blocks
    s = s.replace(/(\\begin\{array\})(.*?)(\\end\{array\})/gs, (match, prefix, content, suffix) => {
        // Correct malformed row ends inside the array
        // We look for:
        // - Single backslash followed by a number (e.g. \ 3)
        // - Single backslash followed by a space\
        // - Triple or more backslashes that should be double
        let fixed = content
            .replace(/\\+(\s*)(?=\d|\\text)/g, ' \\\\ ') // Promote single/spaced slash to double before new rows
            .replace(/\\\\+/g, ' \\\\ ')               // Normalize multiple slashes to double
            .replace(/\\+(\s*)\\hline/g, ' \\\\ \\hline'); // Ensure \hline is preceded by a break
            
        return `${prefix}${fixed}${suffix}`;
    });

    // 2. Space normalization (Careful not to collapse newly added \\)
    s = s.replace(/\s+/g, ' ');
    
    // 3. Spacing after blocks
    s = s.replace(/\\\](?=\S)/g, '\\] ');

    return s.trim();
};

if (!fs.existsSync(targetFile)) {
    console.error(`Missing target: ${targetFile}`);
    process.exit(1);
}

console.log(`Repairing table rows in ${targetFile}...`);
const raw = fs.readFileSync(targetFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = fixRowBreaks(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => fixRowBreaks(item));
        } else if (q[field]) {
            q[field] = fixRowBreaks(q[field]);
        }
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Row breaks repaired. No more horizontal collapsing.');
