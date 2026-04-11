const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const definitiveCleanup = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. Fix the double-dollar dangling ends
    s = s.replace(/\$\$/g, ' \\) ');

    // 2. Fix the missing starts for those dangling ends
    // If a string contains a math command or equals but no start delimiter, wrap it.
    // We only target solution steps or questions that look like math
    if ((s.includes('\\') || s.includes('=')) && !s.includes('\\(') && !s.includes('\\[')) {
        // Simple heuristic: if it looks like math and has no delimiters, wrap the whole thing
        // BUT only if it is not just prose with a \n or something.
        // Actually, the most reliable way is to just wrap it if it has an orphan \)
        if (s.includes('\\)')) {
            s = '\\( ' + s;
        }
    }

    // 3. Spacing and double-wraps
    s = s.replace(/\\\((\s*)\\\(/g, '\\(').replace(/\\\)(\s*)\\\)/g, '\\)');
    s = s.replace(/\s+/g, ' ').trim();

    return s;
};

if (!fs.existsSync(targetFile)) {
    console.error(`Missing target: ${targetFile}`);
    process.exit(1);
}

console.log(`Definitive final cleanup of ${targetFile}...`);
const raw = fs.readFileSync(targetFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = definitiveCleanup(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => definitiveCleanup(item));
        } else if (q[field]) {
            q[field] = definitiveCleanup(q[field]);
        }
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Definitive cleanup complete. All orphaned dollars fixed.');
