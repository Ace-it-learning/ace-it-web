const fs = require('fs');
const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const cleanup = (text) => {
    if (!text || typeof text !== 'string') return text;
    // Remove leading newlines inside begin{array}
    return text.replace(/(\\+begin\{array\}\{.*?\})\s*\\\\+/g, '$1');
};

const fixed = data.map(q => {
    q.question_en = cleanup(q.question_en);
    q.question_zh = cleanup(q.question_zh);
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Final LaTeX Polish v9 Complete.');
