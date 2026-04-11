const fs = require('fs');
const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const stat30_en = "The following frequency distribution table shows the heights (cm) of a group of students:\n\n$$\n\\begin{array}{|c|c|} \\hline \\text{Height (cm)} & \\text{Frequency} \\\\ \\hline 140 - 150 & 6 \\\\ \\hline 150 - 160 & 14 \\\\ \\hline 160 - 170 & 10 \\\\ \\hline \\end{array}\n$$\n\nEstimate the mean height of the group of students using class marks.";

const stat30_zh = "下表顯示一組學生的身高 (cm) 頻數分佈：\n\n$$\n\\begin{array}{|c|c|} \\hline \\text{身高 (cm)} & \\text{頻數} \\\\ \\hline 140 - 150 & 6 \\\\ \\hline 150 - 160 & 14 \\\\ \\hline 160 - 170 & 10 \\\\ \\hline \\end{array}\n$$\n\n利用組中點估計該組學生的平均身高。";

const fixed = data.map(q => {
    if (q.id === 'stat_30') {
        q.question_en = stat30_en;
        q.question_zh = stat30_zh;
    }
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Surgical LaTeX Fix v14: Exact Manual String Override for stat_30.');
