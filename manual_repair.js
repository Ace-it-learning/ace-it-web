const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_questions.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Hardcoded repair for Q1 (Stem-and-Leaf)
const q1 = data.find(q => q.id === 'stat_01');
if (q1) {
    const table = "\\\\begin{array}{r|l} \\\\text{Stem (10)} & \\\\text{Leaf (1)} \\\\\\\\ \\\\hline 4 & 2, 5, 8 \\\\\\\\ 5 & 0, 3, 3, 6, 9 \\\\\\\\ 6 & 1, 4, 4, 7, 8 \\\\\\\\ 7 & 2, 5 \\\\end{array}";
    q1.question_en = q1.question_en.replace(/\\begin\{array\}[\s\S]*?\\end\{array\}/, table);
    q1.question_zh = q1.question_zh.replace(/\\begin\{array\}[\s\S]*?\\end\{array\}/, table.replace('Stem', '莖').replace('Leaf', '葉'));
}

// Hardcoded repair for Q10 (Table)
const q10 = data.find(q => q.id === 'stat_10');
if (q10) {
    const table10 = "\\\\begin{array}{|c|c|c|c|c|} \\\\hline \\\\text{Siblings} & 0 & 1 & 2 & 3 \\\\\\\\ \\\\hline \\\\text{Frequency} & 2 & 3 & 4 & 1 \\\\\\\\ \\\\hline \\\\end{array}";
    q10.question_en = q10.question_en.replace(/\\begin\{array\}[\s\S]*?\\end\{array\}/, table10);
    q10.question_zh = q10.question_zh.replace(/\\begin\{array\}[\s\S]*?\\end\{array\}/, table10.replace('Siblings', '兄弟姐妹').replace('Frequency', '頻數'));
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("✅ Q1 and Q10 Manually Repaired.");
