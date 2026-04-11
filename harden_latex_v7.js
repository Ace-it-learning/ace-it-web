const fs = require('fs');
const path = require('path');

const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const hardenQuestionText = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Pattern to capture the entire array content
    return text.replace(/(\\+begin\{array\}\{.*?\})([\s\S]*?)(\\+end\{array\})/g, (match, begin, inner, end) => {
        let rows = inner.split(/\\\\|\\/).map(r => r.trim()).filter(r => r.length > 0);
        
        // Build the inner content with explicit double-backslashes (\\\\ in result string, which becomes \\\\ in JSON)
        // Note: in JS string, "\\\\\\\\" outputs "\\\\" in the final string which stringify escapes to "\\\\\\\\"
        // Wait, the easiest is to just write the literal string.
        
        let cleanedRows = rows.map((row, idx) => {
            let r = row.replace(/&/g, ' & ').replace(/\s+/g, ' ').trim();
            // If it starts with hline, fix it
            r = r.replace(/^\\?hline\s*/, '\\hline ');
            return r;
        });
        
        // Rejoin with TWO literal backslashes for JS memory string
        // This will result in FOUR backslashes in the outputted JSON file.
        let joined = cleanedRows.join(' \\\\ ');
        
        return `${begin} ${joined} ${end}`;
    });
};

const fixed = data.map(q => {
    q.question_en = hardenQuestionText(q.question_en);
    q.question_zh = hardenQuestionText(q.question_zh);
    return q;
});

// Use a custom stringifier to ensure we don't double-escape incorrectly
const jsonOutput = JSON.stringify(fixed, null, 2);
fs.writeFileSync(filePath, jsonOutput, 'utf8');
console.log('✅ Global LaTeX Hardening v7 (Precise Row Splitting) Complete.');
