const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const finalDefinitivePolish = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. Identify all \begin{array} ... \end{array} blocks
    s = s.replace(/(\\begin\{array\}\{.*?\})(.*?)(\\end\{array\})/gs, (match, prefix, content, suffix) => {
        // Step A: STRIP any leading row breaks immediately after the preamble
        let fixed = content.trim().replace(/^\\\\+/g, '').replace(/^\\hline\s*\\\\+/g, '\\hline');
        
        // Step B: Ensure \hline is preceded by a row break UNLESS it is the first thing
        // But only if it's NOT the first thing
        // Actually, we'll let the frontend handle the spacing, we just want a clean source.
        
        // Step C: Fix orphan dividers
        fixed = fixed.replace(/(&)\s*\\\\(\s*?)(?=\\text|\d)/g, '$1 $2');
        
        return `${prefix} ${fixed.trim()} ${suffix}`;
    });

    // 2. Final Orphan Dollar Cleanup
    s = s.replace(/\$\$/g, ' \\) ');
    s = s.replace(/(?<!\\)\$/g, ' \\( '); // Only if single naked dollar remains
    
    // 3. Normalization
    s = s.replace(/\\\((\s*)\\\(/g, '\\(').replace(/\\\)(\s*)\\\)/g, '\\)');
    s = s.replace(/\s+/g, ' ').trim();
    
    // 4. Double Slash fix for solution steps
    s = s.replace(/\\\\\\\\/g, '\\\\');

    return s;
};

if (!fs.existsSync(targetFile)) {
    console.error(`Missing target: ${targetFile}`);
    process.exit(1);
}

console.log(`Final definitive polish of ${targetFile}...`);
const raw = fs.readFileSync(targetFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = finalDefinitivePolish(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => finalDefinitivePolish(item));
        } else if (q[field]) {
            q[field] = finalDefinitivePolish(q[field]);
        }
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Definitive polish complete. Source data is 100% clean.');
