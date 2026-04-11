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
    if (!fs.existsSync(fullPath)) return;

    console.log(`Processing ${file}...`);
    const raw = fs.readFileSync(fullPath, 'utf8');
    let questions;
    try {
        questions = JSON.parse(raw);
    } catch (e) {
        console.error(`Failed to parse ${file}. Error: ${e.message}`);
        return;
    }

    const processText = (text) => {
        if (typeof text !== 'string') return text;
        
        let s = text;

        // Pattern 1: Standard Commands ensure single backslash in JS string 
        // (which becomes double in JSON)
        // If it sees more than 2 slashes, reduce to 1.
        // Note: In a JS string literal in this script, \ is \\. 
        // So s.replace(/\\{2,}/g, '\\') means replace 2+ literal slashes with 1.
        
        // However, we must be careful with array row breaks which NEED 2 slashes.
        
        // Strategy: 
        // 1. Target array environments
        s = s.replace(/\\begin\{array\}(.*?)\\end\{array\}/gs, (match, p1) => {
            // In the array body, standardize row breaks to exactly 2 backslashes in the JS string
            // match any sequence of backslashes and spaces that separated rows
            let fixedBody = p1.replace(/\\+\s*\\+/g, '\\\\');
            fixedBody = fixedBody.replace(/\\+(?=\s*\\hline)/g, '\\\\');
            fixedBody = fixedBody.replace(/\\+(?=\s*\d)/g, '\\\\');
            
            // Fix commands inside array to have 1 backslash
            fixedBody = fixedBody.replace(/\\{2,}(text|hline)/g, '\\$1');
            
            return `\\begin{array}${fixedBody}\\end{array}`;
        });

        // 2. Wrap in $$ if not already, and ensure spaces
        // If it starts with $$ or \n$$, normalize
        if (s.includes('\\begin{array}')) {
            if (!s.includes('$$')) {
                s = s.replace(/(\\begin\{array\}.*?\\end\{array\})/s, '\n$$ $1 $$\n');
            } else {
                s = s.replace(/\$\$\s*\\begin\{array\}/g, '$$ \\begin{array}');
                s = s.replace(/\\end\{array\}\s*\$\$/g, '\\end{array} $$');
            }
        }

        // 3. Fix standard commands outside array (like \sum, \implies)
        const cmds = ['sum', 'implies', 'frac', 'sigma', 'mu', 'alpha', 'beta', 'text'];
        cmds.forEach(cmd => {
            const regex = new RegExp(`\\\\{2,}${cmd}`, 'g');
            s = s.replace(regex, `\\${cmd}`);
        });

        return s;
    };

    questions.forEach(q => {
        ['question_en', 'question_zh'].forEach(field => {
            if (q[field]) q[field] = processText(q[field]);
        });
        ['solution_steps_en', 'solution_steps_zh'].forEach(field => {
            if (Array.isArray(q[field])) {
                q[field] = q[field].map(s => processText(s));
            }
        });
    });

    fs.writeFileSync(fullPath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ Completed ${file}`);
});
