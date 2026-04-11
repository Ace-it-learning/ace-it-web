const fs = require('fs');
const path = require('path');

const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const repairLatex = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // 1. Fix the "text{" error (missing backslash)
    // Looking for " text{" or "| text{" or " & text{" or "\\\\ text{"
    result = result.replace(/(^|[\s|&]|[^\\]\\(?:\\\\)*)text\{/g, '$1\\\\text{');
    
    // 2. Fix the double nesting: text{\text{...}}
    result = result.replace(/\\\\text\{\s*\\\\text\{/g, '\\\\text{');
    // And ensure balanced braces if we removed one
    // Actually, simpler: replace text{\text{X}} with \text{X}
    result = result.replace(/\\\\text\{\s*\\\\text\{([^}]*)\}\s*\}/g, '\\\\text{$1}');

    // 3. Fix the "redundant newline BEFORE text" error seen in view_file
    // "Stem} & \\\\ text{Leaf}" -> "Stem} & \\text{Leaf}"
    result = result.replace(/&\s*\\\\+\s*\\\\text\{/g, '& \\\\text{');

    // 4. Ensure row separators for arrays are quadruple backslashes (\\\\ in JSON file)
    // Only target those inside an array environment
    result = result.replace(/(\\+begin\{array\}[\s\S]*?\\+end\{array\})/g, (match) => {
        return match
            // Fix row ends that were flattened to single \ or escaped \
            .replace(/([^\\])\\\\?\s*(\d+|\\text)/g, '$1 \\\\\\\\ $2')
            // Fix hline
            .replace(/([^\\])\\\\?\s*\\\\hline/g, '$1 \\\\\\\\ \\\\hline')
            // Ensure space around &
            .replace(/&/g, ' & ')
            .replace(/\s+/g, ' ');
    });

    return result;
};

const fixed = data.map(q => {
    q.question_en = repairLatex(q.question_en);
    q.question_zh = repairLatex(q.question_zh);
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Surgical LaTeX Repair v8 Complete.');
