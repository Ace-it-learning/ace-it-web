const fs = require('fs');
const batch3 = [
  {
    "id": "stat_21",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question_en": "A set of data x has a standard deviation \\sigma = 4. If each data point in x is multiplied by 3 and then 10 is subtracted to form a new set y, find the standard deviation of y.",
    "question_zh": "數據集 x 的標準差為 \\sigma = 4。若將 x 中的每個數據都乘以 3 且減去 10，得到新數據集 y，求 y 的標準差。",
    "answer": "12",
    "correct_answer": "12",
    "solution_steps_en": [
      "1. For a transformation y = ax + b, the new standard deviation \\sigma_y = |a| \\times \\sigma_x.",
      "2. Here a = 3 and b = -10.",
      "3. \\sigma_y = |3| \\times 4 = 12."
    ],
    "solution_steps_zh": [
      "1. 對於變換 y = ax + b，新標準差 \\sigma_y = |a| \\times \\sigma_x。",
      "2. 此處 a = 3 且 b = -10。",
      "3. \\sigma_y = 3 \\times 4 = 12。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_22",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question_en": "Variance of x is 25. If y = -2x + 5, find the variance of y.",
    "question_zh": "數據 x 的方差均為 25。若 y = -2x + 5，求 y 的方差。",
    "answer": "100",
    "correct_answer": "100",
    "solution_steps_en": [
      "1. Var(ax+b) = a^2 \\times Var(x).",
      "2. Var(y) = (-2)^2 \\times 25 = 4 \\times 25 = 100."
    ],
    "solution_steps_zh": [
      "1. Var(ax+b) = a^2 \\times Var(x)。",
      "2. Var(y) = 100。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_23",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question_en": "Class A (25 students, mean 60). Class B (35 students, mean 72). Find combined mean.",
    "question_zh": "A 班（25 名學生，平均分為 60）。B 班（35 名學生，平均分為 72）。求兩班的總平均分。",
    "answer": "67",
    "correct_answer": "67",
    "solution_steps_en": [
      "1. Total sum = 25(60) + 35(72) = 1500 + 2520 = 4020.",
      "2. Total students = 25 + 35 = 60.",
      "3. Combined mean = 4020 / 60 = 67."
    ],
    "solution_steps_zh": [
      "1. 總分之和 = 4020。",
      "2. 總人數 = 60。",
      "3. 總平均分 = 67。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_24",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question_en": "Variance of two groups of 10 items each is 9 and Mean is identical. Combined variance?",
    "question_zh": "兩組各有 10 個數據的方差均為 9，且平均值相同。求組合後的 20 個數據的方差。",
    "answer": "9",
    "correct_answer": "9",
    "solution_steps_en": [
      "1. Since means are identical, Combined Var = (10*9 + 10*9) / 20 = 9."
    ],
    "solution_steps_zh": [
      "1. 由於平均值相同，組合方差為 9。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_25",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question_en": "10 boys (mean 50 kg), 20 girls (mean 44 kg). Add one girl of 47 kg. New mean?",
    "question_zh": "10 名男孩平均體重 50 kg，20 名女孩平均體重 44 kg。若多一名 47 kg 的女孩加入，求 31 名學生的新平均體重。",
    "answer": "46.03 kg",
    "correct_answer": "46.03",
    "solution_steps_en": [
      "1. New total sum = 10(50) + 20(44) + 47 = 1427.",
      "2. New total n = 31.",
      "3. New mean = 1427 / 31 \\approx 46.03."
    ],
    "solution_steps_zh": [
      "1. 新重量總和 = 1427。",
      "2. 新平均體重 = 46.03。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_26",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question_en": "If 84 is 2 SD above Mean of 60, find SD.",
    "question_zh": "若 84 比平均值 60 高出 2 個標準差，求標準差的值。",
    "answer": "12",
    "correct_answer": "12",
    "solution_steps_en": [
      "1. 84 = 60 + 2*sigma.",
      "2. 2*sigma = 24 => sigma = 12."
    ],
    "solution_steps_zh": [
      "1. 84 = 60 + 2*sigma。",
      "2. sigma = 12。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_27",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question_en": "Math (score 75, mean 60, SD 10). Bio (score 80, mean 70, SD 8). Which relative performance is better?",
    "question_zh": "數學得分 75（平均 60，標準差 10）。生物得分 80（平均 70，標準差 8）。哪一科相對表現較佳？",
    "answer": "Math",
    "correct_answer": "Math",
    "solution_steps_en": [
      "1. Math z = (75 - 60)/10 = 1.5.",
      "2. Bio z = (80 - 70)/8 = 1.25.",
      "3. 1.5 > 1.25, so Math is better."
    ],
    "solution_steps_zh": [
      "1. 數學 z = 1.5。生物 z = 1.25。",
      "2. 1.5 > 1.25，表現較佳。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_28",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question_en": "If z = -1.5, mu = 100, sigma = 20, find original score x.",
    "question_zh": "若 z = -1.5, mu = 100, sigma = 20，求原始分數 x。",
    "answer": "70",
    "correct_answer": "70",
    "solution_steps_en": [
      "1. -1.5 = (x - 100) / 20.",
      "2. -30 = x - 100 => x = 70."
    ],
    "solution_steps_zh": [
      "1. x - 100 = -30 => x = 70。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_29",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question_en": "SD = 15. If 120 has z = 1.2, find Mean.",
    "question_zh": "標準差為 15。若 120 的標準分 z = 1.2，求平均值。",
    "answer": "102",
    "correct_answer": "102",
    "solution_steps_en": [
      "1. 1.2 = (120 - mu) / 15.",
      "2. 18 = 120 - mu => mu = 102."
    ],
    "solution_steps_zh": [
      "1. 120 - mu = 18 => mu = 102。"
    ],
    "diagram_json": null
  },
  {
    "id": "stat_30",
    "topic_id": "math_stat_charts",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question_en": "Height intervals: 140-150(6), 150-160(14), 160-170(10). Estimate mean.",
    "question_zh": "高度分組：140-150(6), 150-160(14), 160-170(10)。估算平均值。",
    "answer": "156.33 cm",
    "correct_answer": "156.33",
    "solution_steps_en": [
      "1. Sum = 145(6) + 155(14) + 165(10) = 4690.",
      "2. 4690 / 30 = 156.33."
    ],
    "solution_steps_zh": [
      "1. Mean = 4690 / 30 = 156.33。"
    ],
    "diagram_json": null
  }
];

// Re-inject LaTeX backslashes carefully before stringifying
batch3.forEach(q => {
  q.question_en = q.question_en.replace(/sigma/g, '\\sigma').replace(/mu/g, '\\mu').replace(/x /g, '$x$ ');
  q.question_zh = q.question_zh.replace(/sigma/g, '\\sigma').replace(/mu/g, '\\mu').replace(/x /g, '$x$ ');
  q.solution_steps_en = q.solution_steps_en.map(s => s.replace(/sigma/g, '\\sigma').replace(/mu/g, '\\mu').replace(/Var/g, '\\text{Var}').replace(/approx/g, '\\approx'));
  q.solution_steps_zh = q.solution_steps_zh.map(s => s.replace(/sigma/g, '\\sigma').replace(/mu/g, '\\mu').replace(/Var/g, '\\text{Var}').replace(/approx/g, '\\approx'));
});

fs.writeFileSync('backend/data/math_content/math_stat_charts_q21_30.json', JSON.stringify(batch3, null, 2), 'utf8');
console.log('✅ Batch 3 regenerated via JS script.');
