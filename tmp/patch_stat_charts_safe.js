const fs = require('fs');
const path = require('path');

const files = [
    'backend/data/math_content/math_stat_charts_questions.json',
    'backend/data/math_content/math_stat_charts_q1_10.json',
    'backend/data/math_content/math_stat_charts_q11_20.json',
    'backend/data/math_content/math_stat_charts_q21_30.json'
];

const basePath = 'c:/Users/user/Documents/ace-it-web';

files.forEach(file => {
    const fullPath = path.join(basePath, file);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping missing file: ${file}`);
        return;
    }

    let questions;
    try {
        const rawContent = fs.readFileSync(fullPath, 'utf8');
        // If it's already invalid JSON, we need to fix it as text first
        try {
            questions = JSON.parse(rawContent);
        } catch (e) {
            console.log(`File ${file} has invalid JSON, fixing basic escaping first...`);
            let fixedRaw = rawContent.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\');
            questions = JSON.parse(fixedRaw);
        }
    } catch (e) {
        console.error(`Fatal error reading/parsing ${file}:`, e);
        return;
    }

    const fields = ['question_en', 'question_zh', 'solution_steps_en', 'solution_steps_zh'];

    questions.forEach(q => {
        fields.forEach(field => {
            if (!q[field]) return;

            const process = (str) => {
                if (typeof str !== 'string') return str;
                
                // 1. Normalize array environments
                // In JS strings (from JSON.parse), a single backslash is \. 
                // A LaTeX command \begin starts with one backslash.
                // A LaTeX row break \\ starts with two backslashes.
                
                let s = str;
                
                // Fix standard commands: ensure only 1 backslash in the JS string
                // (which will be JSON-encoded as 2)
                // If it currently has 2 (from JSON over-escaping), normalize to 1.
                s = s.replace(/\\{2,}(begin|end|text|hline|sum|implies|frac)/g, '\\$1');
                
                // Fix array row breaks: ensure exactly 2 backslashes in the JS string
                // (which will be JSON-encoded as 4)
                s = s.replace(/\\begin\{array\}(.*?)\\end\{array\}/gs, (match, p1) => {
                    // Match any sequence of slashes and spaces that should be a row break
                    // Typically \\, \ \, \\ \\, etc.
                    let fixed = p1.replace(/\\+\s*\\+/g, '\\\\');
                    fixed = fixed.replace(/\\{2,}/g, '\\\\');
                    
                    // Specific fix for header to hline connection
                    fixed = fixed.replace(/\\\\\s*\\hline/g, '\\\\ \\hline');
                    
                    return `\\begin{array}${fixed}\\end{array}`;
                });

                // 2. Block Math delimiters: wrap in $$ with spaces
                s = s.replace(/\$\$\s*\\begin\{array\}/g, '$$ \\begin{array}');
                s = s.replace(/\\end\{array\}\s*\$\$/g, '\\end{array} $$');
                
                return s;
            };

            if (Array.isArray(q[field])) {
                q[field] = q[field].map(item => process(item));
            } else {
                q[field] = process(q[field]);
            }
        });
    });

    fs.writeFileSync(fullPath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ Patched and validated ${file}`);
});
