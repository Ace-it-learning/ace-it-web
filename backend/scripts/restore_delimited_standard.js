const fs = require('fs');
const path = require('path');

const backupFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json.v2.bak';
const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const processText = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. STRIP redundant wrappers ($$ and \[)
    s = s.replace(/\$\$?\s*/g, '').replace(/\\\[\s*/g, '').replace(/\s*\\\]/g, '');

    // 2. Standardize array environments
    s = s.replace(/\\begin\{array\}(.*?)\\end\{array\}/gs, (match, p1) => {
        // Step A: Force row breaks to have exactly TWO backslashes (JS string)
        let fixedBody = p1.replace(/\\{2,}/g, '\\\\');
        
        // Step B: Ensure words like "text" or "hline" have exactly ONE backslash
        fixedBody = fixedBody.replace(/\\+(text|hline|begin|end|sigma|mu|alpha|beta|implies|frac|sqrt|mathrm|times|div|sum|prod)/g, '\\$1');
        
        // Step C: Clean up any double spaces
        fixedBody = fixedBody.replace(/\s{2,}/g, ' ');
        
        // Step D: WRAP in block delimiters
        return `\\[ \\begin{array}${fixedBody}\\end{array} \\]`;
    });

    // 3. Global Command Normalization (Single Backslash in JS string)
    const cmds = ['begin', 'end', 'sum', 'implies', 'frac', 'sigma', 'mu', 'alpha', 'beta', 'text', 'hline'];
    cmds.forEach(cmd => {
        const regex = new RegExp(`\\\\+(?=${cmd})`, 'g');
        s = s.replace(regex, '\\');
    });

    return s.trim();
};

const standardizeFile = (srcPath, destPath) => {
    if (!fs.existsSync(srcPath)) {
        console.log(`Skipping missing source: ${srcPath}`);
        return;
    }
    console.log(`Standardizing ${srcPath} -> ${destPath}...`);
    
    // SAFE PARSE: Replace invalid JSON backslashes from previous turns
    let raw = fs.readFileSync(srcPath, 'utf8');
    raw = raw.replace(/\\(?![/"\\bfnrtu])/g, '\\\\');
    
    let questions;
    try {
        questions = JSON.parse(raw);
    } catch (e) {
        console.error(`FAILED to parse ${srcPath}:`, e.message);
        return;
    }

    questions.forEach(q => {
        ['question_en', 'question_zh'].forEach(field => {
            if (q[field]) q[field] = processText(q[field]);
        });
        ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
            if (Array.isArray(q[field])) {
                q[field] = q[field].map(item => processText(item));
            } else if (q[field]) {
                q[field] = processText(q[field]);
            }
        });
    });

    fs.writeFileSync(destPath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ Standardized and saved to ${destPath}`);
};

// Start FRESH from backup
standardizeFile(backupFile, targetFile);

// Also try to fix the split files in place (Optional, but good for local dev)
[
    'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_q1_10.json',
    'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_q11_20.json',
    'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_q21_30.json'
].forEach(f => standardizeFile(f, f));
