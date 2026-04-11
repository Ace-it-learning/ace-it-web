const fs = require('fs');
const path = require('path');

const batch3 = [
    {
        "id": "stat_21",
        "topic_id": "math_stat_charts",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 5,
        "question_en": "The standard deviation of a data set $x$ is $\\sigma = 4$. If each data point in $x$ is multiplied by $3$ and then $10$ is subtracted from the product to form a new data set $y$, find the standard deviation of $y$.",
        "question_zh": "數據集 $x$ 的標準差為 $\\sigma = 4$。若將 $x$ 中的每個數據均乘以 $3$ 且從乘積中減去 $10$ 以組成新數據集 $y$，求 $y$ 的標準差。",
        "answer": "12",
        "correct_answer": "12",
        "solution_steps_en": [
            "1. For a linear transformation $y = ax + b$, the relationship between the standard deviations is given by \\sigma_y = |a| \\times \\sigma_x$.",
            "2. In this transformation, $a = 3$ and $b = -10$.",
            "3. The new standard deviation \\sigma_y = |3| \\times 4 = 12$."
        ],
        "solution_steps_zh": [
            "1. 對於線性變換 $y = ax + b$，標準差之間的關係為 \\sigma_y = |a| \\times \\sigma_x$。",
            "2. 在此變換中，$a = 3$ 且 $b = -10$。",
            "3. 新的標準差 \\sigma_y = |3| \\times 4 = 12$。"
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
        "question_en": "The variance of a data set $x$ is $25$. If the relationship between $x$ and $y$ is given by $y = -2x + 5$, find the variance of $y$.",
        "question_zh": "數據集 $x$ 的方差為 $25$。若 $x$ 與 $y$ 之間的關係為 $y = -2x + 5$，求 $y$ 的方差。",
        "answer": "100",
        "correct_answer": "100",
        "solution_steps_en": [
            "1. For a linear transformation $y = ax + b$, the relationship between the variances is given by \\text{Var}(y) = a^2 \\times \\text{Var}(x)$.",
            "2. In this case, $a = -2$.",
            "3. The new variance \\text{Var}(y) = (-2)^2 \\times 25 = 4 \\times 25 = 100$."
        ],
        "solution_steps_zh": [
            "1. 對於線性變換 $y = ax + b$，方差之間的關係為 \\text{Var}(y) = a^2 \\times \\text{Var}(x)$。",
            "2. 在此情況下，$a = -2$。",
            "3. 新的方差 \\text{Var}(y) = (-2)^2 \\times 25 = 100$。"
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
        "question_en": "In a school, Class A has $25$ students with a mean score of $60$ marks, while Class B has $35$ students with a mean score of $72$ marks. Find the combined mean score of the two classes.",
        "question_zh": "在一所學校中，A 班有 $25$ 名學生，其平均分為 $60$ 分；而 B 班則有 $35$ 名學生，其平均分為 $72$ 分。求這兩班的總平均分。",
        "answer": "67",
        "correct_answer": "67",
        "solution_steps_en": [
            "1. Calculate the total score of Class A: $25 \\times 60 = 1500$ marks.",
            "2. Calculate the total score of Class B: $35 \\times 72 = 2520$ marks.",
            "3. The combined total score of both classes is $1500 + 2520 = 4020$ marks.",
            "4. The total number of students in both classes is $25 + 35 = 60$.",
            "5. The combined mean score is $4020 / 60 = 67$ marks."
        ],
        "solution_steps_zh": [
            "1. 計算 A 班的總分：$25 \\times 60 = 1500$ 分。",
            "2. 計算 B 班的總分：$35 \\times 72 = 2520$ 分。",
            "3. 兩班的總得分為 $1500 + 2520 = 4020$ 分。",
            "4. 兩班的總人數為 $25 + 35 = 60$ 人。",
            "5. 總平均分為 $4020 / 60 = 67$ 分。"
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
        "question_en": "There are two groups of data, each consisting of $10$ data points. Both groups have a variance of $9$ and they share the same mean. Find the variance of the combined group of $20$ data points.",
        "question_zh": "現有兩組各含有 $10$ 個數據的數據集。這兩組的方差均為 $9$ 且平均值相同。求組合後共 $20$ 個數據的方差。",
        "answer": "9",
        "correct_answer": "9",
        "solution_steps_en": [
            "1. Since both groups have the same mean, the combined mean remains identical to the group means.",
            "2. If two groups have the same mean, the combined variance \\text{Var}_{comb} is given by \\frac{n_1 \\text{Var}_1 + n_2 \\text{Var}_2}{n_1 + n_2}$.",
            "3. Substituting the values: \\text{Var}_{comb} = \\frac{10(9) + 10(9)}{10 + 10} = \\frac{180}{20} = 9$."
        ],
        "solution_steps_zh": [
            "1. 由於兩組平均值相同，組合後的平均值與各組平均值相同。",
            "2. 若兩組平均值相同，組合方差 \\text{Var}_{comb} 為 \\frac{n_1 \\text{Var}_1 + n_2 \\text{Var}_2}{n_1 + n_2}$。",
            "3. 代入數值：\\text{Var}_{comb} = \\frac{10(9) + 10(9)}{10 + 10} = 9$。"
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
        "question_en": "The mean weight of a group of $10$ boys is $50$ kg and that of $20$ girls is $44$ kg. If another girl with a weight of $47$ kg joins the group, find the new mean weight of the $31$ children. (Correct your answer to 2 decimal places.)",
        "question_zh": "一組 $10$ 名男孩的平均體重為 $50$ kg，而 $20$ 名女孩的平均體重則為 $44$ kg。若另一名體重為 $47$ kg 的女孩加入該組，求這 $31$ 名孩子的新平均體重。（答案須取至小數點後兩個位。）",
        "answer": "46.03 kg",
        "correct_answer": "46.03",
        "solution_steps_en": [
            "1. Calculate the total weight of the boys: $10 \\times 50 = 500$ kg.",
            "2. Calculate the total weight of the girls: $20 \\times 44 = 880$ kg.",
            "3. The new total weight after the additional girl joins is $500 + 880 + 47 = 1427$ kg.",
            "4. The new total number of children is $31$.",
            "5. The new mean weight is $1427 / 31 \\approx 46.0322... \\approx 46.03$ kg."
        ],
        "solution_steps_zh": [
            "1. 計算男孩的總重量：$10 \\times 50 = 500$ kg。",
            "2. 計算女孩的總重量：$20 \\times 44 = 880$ kg。",
            "3. 加入新成員後的總重為 $500 + 880 + 47 = 1427$ kg。",
            "4. 總人數增加至 $31$ 人。",
            "5. 新平均體重為 $1427 / 31 \\approx 46.03$ kg。"
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
        "question_en": "A student obtained a score of $84$ marks in a test. If this score is $2$ standard deviations above the mean score of $60$ marks, find the standard deviation of the test.",
        "question_zh": "一名學生在測驗中取得 $84$ 分。若該分數比平均分 $60$ 分高出 $2$ 個標準差，求該測驗的標準差。",
        "answer": "12",
        "correct_answer": "12",
        "solution_steps_en": [
            "1. Use the standard score relationship: $x = \\mu + z\\sigma$.",
            "2. Given $x = 84$, $\\mu = 60$, and $z = 2$.",
            "3. Substitute these into the equation: $84 = 60 + 2\\sigma$.",
            "4. Solve for $\\sigma$: $2\\sigma = 24 \\implies \\sigma = 12$."
        ],
        "solution_steps_zh": [
            "1. 使用標準分的關係式：$x = \\mu + z\\sigma$。",
            "2. 已知 $x = 84$、$\\mu = 60$ 且 $z = 2$。",
            "3. 代入關係式：$84 = 60 + 2\\sigma$。",
            "4. 解 $\\sigma$：$2\\sigma = 24 \\implies \\sigma = 12$。"
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
        "question_en": "In a mid-term examination, a student scored $75$ marks in Mathematics and $80$ marks in Biology. The mean and standard deviation of the two subjects are shown below:\n\n$\\begin{array}{|c|c|c|} \\hline & \\text{Mean} & \\text{Standard Deviation} \\\\ \\hline \\text{Mathematics} & 60 & 10 \\\\ \\hline \\text{Biology} & 70 & 8 \\\\ \\hline \\end{array}$\n\nIn which subject did the student perform better relative to the class?",
        "question_zh": "在一次中期考試中，一名學生在數學科取得 $75$ 分，在生物科取得 $80$ 分。這兩科的平均分及標準差如下表所示：\n\n$\\begin{array}{|c|c|c|} \\hline & \\text{平均分} & \\text{標準差} \\\\ \\hline \\text{數學} & 60 & 10 \\\\ \\hline \\text{生物} & 70 & 8 \\\\ \\hline \\end{array}$\n\n相對於全班，該學生在哪一科表現較佳？",
        "answer": "Mathematics",
        "correct_answer": "Mathematics",
        "solution_steps_en": [
            "1. Calculate the standard score ($z$-score) for Mathematics: $z_{Math} = (75 - 60) / 10 = 1.5$.",
            "2. Calculate the standard score ($z$-score) for Biology: $z_{Bio} = (80 - 70) / 8 = 1.25$.",
            "3. Comparing the standard scores: $1.5 > 1.25$.",
            "4. Therefore, the student performed better in Mathematics relative to the class."
        ],
        "solution_steps_zh": [
            "1. 計算數學科的標準分：$z_{數學} = (75 - 60) / 10 = 1.5$。",
            "2. 計算生物科的標準分：$z_{生物} = (80 - 70) / 8 = 1.25$。",
            "3. 比較兩科的標準分：$1.5 > 1.25$。",
            "4. 因此，該學生在數學科的表現相對較佳。"
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
        "question_en": "The mean and standard deviation of a set of test scores are $100$ marks and $20$ marks respectively. If a student's standard score is $-1.5$, find the student's original score.",
        "question_zh": "一組測驗得分的平均分及標準差分別為 $100$ 分及 $20$ 分。若一名學生的標準分為 $-1.5$，求該學生的原始分數。",
        "answer": "70",
        "correct_answer": "70",
        "solution_steps_en": [
            "1. Use the $z$-score formula: $z = (x - \\mu) / \\sigma$.",
            "2. Substitute the given values: $-1.5 = (x - 100) / 20$.",
            "3. Rearrange to solve for $x$: $x - 100 = -1.5 \\times 20 = -30$.",
            "4. The original score $x = 100 - 30 = 70$ marks."
        ],
        "solution_steps_zh": [
            "1. 使用標準分公式：$z = (x - \\mu) / \\sigma$。",
            "2. 代入已知數值：$-1.5 = (x - 100) / 20$。",
            "3. 解 $x$：$x - 100 = -30$。",
            "4. 原始分數 $x = 70$ 分。"
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
        "question_en": "The standard deviation of a data set is $15$. If a score of $120$ in the data set corresponds to a standard score of $1.2$, find the mean of the data set.",
        "question_zh": "一組數據集的標準差為 $15$。若該數據集中數值為 $120$ 的數據所對應的標準分為 $1.2$，求該數據集的平均值。",
        "answer": "102",
        "correct_answer": "102",
        "solution_steps_en": [
            "1. Use the $z$-score formula: $z = (x - \\mu) / \\sigma$.",
            "2. Substitute the given values: $1.2 = (120 - \\mu) / 15$.",
            "3. Rearrange to solve for \\mu: $120 - \\mu = 1.2 \\times 15 = 18$.",
            "4. The mean \\mu = 120 - 18 = 102$."
        ],
        "solution_steps_zh": [
            "1. 使用標準分公式：$z = (x - \\mu) / \\sigma$。",
            "2. 代入已知數值：$1.2 = (120 - \\mu) / 15$。",
            "3. 解 \\mu：$120 - \\mu = 18$。",
            "4. 平均值 \\mu = 120 - 18 = 102$。"
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
        "question_en": "The following frequency distribution table shows the heights (cm) of a group of students:\n\n$\\begin{array}{|c|c|} \\hline \\text{Height (cm)} & \\text{Frequency} \\\\ \\hline 140 - 150 & 6 \\\\ \\hline 150 - 160 & 14 \\\\ \\hline 160 - 170 & 10 \\\\ \\hline \\end{array}$\n\nEstimate the mean height of the group of students using class marks.",
        "question_zh": "下表顯示一組學生的身高 (cm) 頻數分佈：\n\n$\\begin{array}{|c|c|} \\hline \\text{身高 (cm)} & \\text{頻數} \\\\ \\hline 140 - 150 & 6 \\\\ \\hline 150 - 160 & 14 \\\\ \\hline 160 - 170 & 10 \\\\ \\hline \\end{array}$\n\n利用組中點估計該組學生的平均身高。",
        "answer": "156.33 cm",
        "correct_answer": "156.33",
        "solution_steps_en": [
            "1. Find the class marks (mid-points) for each interval: $145, 155, 165$.",
            "2. Calculate the sum of ($x \\times f$): $145(6) + 155(14) + 165(10) = 870 + 2170 + 1650 = 4690$.",
            "3. Find the total frequency $n = 6 + 14 + 10 = 30$.",
            "4. Estimated mean = $\\sum (x \\times f) / n = 4690 / 30 \\approx 156.333... \\approx 156.33$ cm."
        ],
        "solution_steps_zh": [
            "1. 求各組組中點：$145, 155, 165$。",
            "2. 計算各組 (組中點 \\times 頻數) 之和：$145(6) + 155(14) + 165(10) = 4690$。",
            "3. 總頻數為 $n = 30$。",
            "4. 估計平均身高 = $4690 / 30 \\approx 156.33$ cm。"
        ],
        "diagram_json": null
    }
];

// Re-inject LaTeX backslashes carefully before stringifying
// This ensures that the resulting JSON file has DOUBLE backslashes (\\)
// e.g. \sigma -> \\sigma
batch3.forEach(q => {
    // We'll replace the single backslash with a double one where appropriate
    // JSON.stringify will automatically turn a literal \ in a JS string into \\ in the file
    // So the input JS string should have a single literal backslash.
    // In JS source, a literal backslash is \\.
});

// Write the file
const writeBatch = (filename, data) => {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
};

writeBatch('backend/data/math_content/math_stat_charts_q21_30.json', batch3);
console.log('✅ Batch 3 regenerated and polished.');
