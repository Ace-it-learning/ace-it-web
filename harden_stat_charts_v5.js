const fs = require('fs');
const path = require('path');

const files = [
    'backend/data/math_content/math_stat_charts_q1_10.json',
    'backend/data/math_content/math_stat_charts_q11_20.json',
    'backend/data/math_content/math_stat_charts_q21_30.json'
];

const processQuestions = (questions) => {
    return questions.map(q => {
        // Fix question_en and question_zh
        ['question_en', 'question_zh'].forEach(field => {
            if (q[field]) {
                // Ensure \n\n before the math block and use $$ for tables
                // Pattern matches $\begin{array} ... $ or \[\begin{array} ... \]
                q[field] = q[field].replace(/(\n?)\s*(\$|\\\[)\s*(\\+begin\{array\}[\s\S]*?\\+end\{array\})\s*(\$|\\\])/g, (match, nl, open, inner, close) => {
                    // Normalize to single backslash for the command part (will be double-escaped by stringify)
                    let cleanInner = inner.replace(/\\\\+/g, '\\');
                    return `\n\n$$\n${cleanInner}\n$$`;
                });
            }
        });

        // Ensure double-escaping for all fields for the JSON storage (handled by JSON.stringify)
        return q;
    });
};

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`Processing ${file}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updated = processQuestions(data);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
});

console.log('✅ All Statistical Charts micro-batches hardened with $$ delimiters and better spacing.');
