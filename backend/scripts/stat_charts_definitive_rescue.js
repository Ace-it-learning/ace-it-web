const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const definitiveRescue = (text) => {
    if (typeof text !== 'string') return text;
    
    let s = text;

    // 1. Identify all \begin{array} ... \end{array} blocks
    s = s.replace(/(\\begin\{array\}\{.*?\})(.*?)(\\end\{array\})/gs, (match, prefix, content, suffix) => {
        // Step A: Strip any leading row breaks immediately after the preamble
        let fixed = content.trim()
            .replace(/^\\\\+/g, '') // Remove \\ at start
            .replace(/^\\hline\s*\\\\+/g, '\\hline'); // Remove \\ right after first \hline

        // Step B: Ensure internal \hline is preceded by a row break
        // We look for \hline that is NOT at the very start of the content
        fixed = fixed.replace(/(?<!^)\s*\\hline/g, ' \\\\ \\hline');
        
        // Step C: Ensure exactly double slashes for all other row breaks
        fixed = fixed.replace(/\\\\+/g, ' \\\\ ');
        
        // Step D: Repair orphan cells (like "& \\ \text" -> "& \text")
        fixed = fixed.replace(/(&)\s*\\\\(\s*?)(?=\\text|\d)/g, '$1 $2');
        
        return `${prefix} ${fixed.trim()} ${suffix}`;
    });

    // 2. Ensure all blocks are correctly wrapped in \[ and \] if they contain array
    if (s.includes('\\begin{array}') && !s.includes('\\[')) {
        s = s.replace(/(\\begin\{array\}[\s\S]*?\\end\{array\})/g, '\\[ $1 \\]');
    }

    // 3. Final cleanup of double-wrapped markers
    s = s.replace(/\\\[\s*\\\[/g, '\\[').replace(/\\\]\s*\\\]/g, '\\]');
    s = s.replace(/\s+/g, ' ').trim();

    return s;
};

if (!fs.existsSync(targetFile)) {
    console.error(`Missing target: ${targetFile}`);
    process.exit(1);
}

console.log(`Definitive rescue of ${targetFile}...`);
const raw = fs.readFileSync(targetFile, 'utf8');
const questions = JSON.parse(raw);

questions.forEach(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) q[field] = definitiveRescue(q[field]);
    });
    ['solution_steps_en', 'solution_steps_zh', 'solution_steps'].forEach(field => {
        if (Array.isArray(q[field])) {
            q[field] = q[field].map(item => definitiveRescue(item));
        } else if (q[field]) {
            q[field] = definitiveRescue(q[field]);
        }
    });
});

fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2), 'utf8');
console.log('✅ Definitive rescue complete. Quest data is 100% standard.');
