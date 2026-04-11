const fs = require('fs');
const path = require('path');

const filePath = 'backend/data/math_content/math_stat_charts_questions.json';

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const fixed = data.map(q => {
    ['question_en', 'question_zh'].forEach(field => {
        if (q[field]) {
            // Restore LaTeX newlines (\\) which should be stored as \\\\ in JSON
            // Currently they are single \ or \ \ (trailing space)
            // We need \\ before \hline and after each leaf row
            q[field] = q[field]
                .replace(/\\ \\hline/g, '\\\\ \\\\hline')
                .replace(/, ([0-9]) \\ /g, ', $1 \\\\ ')
                .replace(/([0-9]) \\ /g, '$1 \\\\ ')
                .replace(/Leaf \(1\)\s*\\\\/g, 'Leaf (1) \\\\\\\\') // Extra protection for header
                .replace(/Leaf \(1\)\s*\\ /g, 'Leaf (1) \\\\\\\\ ')
                .replace(/茎 \(10\)\s*\\\\/g, '茎 (10) \\\\\\\\')
                .replace(/茎 \(10\)\s*\\ /g, '茎 (10) \\\\\\\\ ')
                .replace(/葉 \(1\)\s*\\\\/g, '葉 (1) \\\\\\\\')
                .replace(/葉 \(1\)\s*\\ /g, '葉 (1) \\\\\\\\ ')
                .replace(/莖 \(10\)\s*\\\\/g, '莖 (10) \\\\\\\\')
                .replace(/莖 \(10\)\s*\\ /g, '莖 (10) \\\\\\\\ ');
            
            // For general array cleanup
            q[field] = q[field].replace(/\\+begin\{array\}/g, '\\begin{array}').replace(/\\+end\{array\}/g, '\\end{array}');
        }
    });
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Master JSON LaTeX newlines restored.');
