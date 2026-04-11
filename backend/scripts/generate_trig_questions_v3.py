import json
import os

# Data for 30 unique Trigonometric Ratios questions (V3.0 - WEB OPTIMIZED)
# Build as Python dictionaries to avoid JSON escaping manual errors.
# The json.dump() will automatically single-escape the backslashes in the output file.
questions = [
    {
        "id": "trig_v3_01",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": "In a right-angled triangle $\\triangle ABC$, $\\angle B = 90^\\circ$, $AB = 3$ and $BC = 4$. Find the value of $\\cos A$.",
        "question_zh": "在直角三角形 $\\triangle ABC$ 中，$\\angle B = 90^\\circ$，$AB = 3$ 且 $BC = 4$。求 $\\cos A$ 的值。",
        "answer": "3/5",
        "correct_answer": "3/5",
        "solution_steps": [
            "Identify that $\\triangle ABC$ is a right-angled triangle where $AC$ is the hypotenuse.",
            "Calculate the hypotenuse $AC$ using Pythagoras' theorem: $AC = \\sqrt{3^2 + 4^2} = 5$.",
            "Apply the cosine ratio: $\\cos A = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}} = \\frac{AB}{AC} = \\frac{3}{5}$."
        ],
        "solution_steps_zh": [
            "識別出 $\\triangle ABC$ 是一個直角三角形，其中 $AC$ 是斜邊。",
            "利用畢氏定理計算斜邊 $AC$：$AC = \\sqrt{3^2 + 4^2} = 5$。",
            "應用餘弦比例：$\\cos A = \\frac{\\text{鄰邊}}{\\text{斜邊}} = \\frac{AB}{AC} = \\frac{3}{5}$。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><polygon points='100,50 100,200 300,200' fill='none' stroke='currentColor' stroke-width='2'/><rect x='100' y='180' width='20' height='20' fill='none' stroke='currentColor'/><text x='90' y='45' fill='currentColor'>A</text><text x='90' y='220' fill='currentColor'>B</text><text x='310' y='220' fill='currentColor'>C</text><text x='80' y='125' fill='currentColor'>3</text><text x='200' y='220' fill='currentColor'>4</text></svg>"
    },
    {
        "id": "trig_v3_02",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": "Given $\\tan \\theta = \\frac{5}{12}$ where $\\theta$ is an acute angle, find the value of $\\sin \\theta$.",
        "question_zh": "已知 $\\tan \\theta = \\frac{5}{12}$，其中 $\\theta$ 為銳角，求 $\\sin \\theta$ 的值。",
        "answer": "5/13",
        "correct_answer": "5/13",
        "solution_steps": [
            "Set up a right-angled triangle where the opposite side is 5k and the adjacent side is 12k.",
            "Find the hypotenuse using Pythagoras: $\\sqrt{(5k)^2 + (12k)^2} = 13k$.",
            "Express the sine ratio: $\\sin \\theta = \\frac{\\text{Opposite}}{\\text{Hypotenuse}} = \\frac{5k}{13k} = \\frac{5}{13}$."
        ],
        "solution_steps_zh": [
            "設定一個直角三角形，其中對邊為 5k，鄰邊為 12k。",
            "利用畢氏定理求斜邊：$\\sqrt{(5k)^2 + (12k)^2} = 13k$。",
            "表示正弦比例：$\\sin \\theta = \\frac{\\text{對邊}}{\\text{斜邊}} = \\frac{5k}{13k} = \\frac{5}{13}$。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><polygon points='100,200 400,200 100,50' fill='none' stroke='currentColor' stroke-width='2'/><rect x='100' y='180' width='20' height='20' fill='none' stroke='currentColor'/><text x='90' y='220' fill='currentColor'>B</text><text x='410' y='220' fill='currentColor'>C</text><text x='90' y='45' fill='currentColor'>A</text><text x='110' y='190' fill='currentColor'>\\theta</text></svg>"
    },
    {
        "id": "trig_v3_03",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": "A right-angled triangle has a hypotenuse of 10 and an angle $\\theta$. If $\\sin \\theta = 0.8$, find the length of the opposite side.",
        "question_zh": "一個直角三角形的斜邊長度為 10，其中一個角為 $\\theta$。若 $\\sin \\theta = 0.8$，求對邊的長度。",
        "answer": "8",
        "correct_answer": "8",
        "solution_steps": [
            "Identify the relationship between the angle, opposite side, and hypotenuse.",
            "Set up the equation using the sine ratio: $\\text{Opposite} = \\text{Hypotenuse} \\times \\sin \\theta$.",
            "Perform the calculation: $\\text{Opposite} = 10 \\times 0.8 = 8$."
        ],
        "solution_steps_zh": [
            "識別角度、對邊與斜邊之間的關係。",
            "利用正弦比例設定方程：對邊 = 斜邊 $\\times \\sin \\theta$。",
            "進行計算：對邊 = 10 $\\times 0.8 = 8$。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><polygon points='100,200 400,200 400,50' fill='none' stroke='currentColor' stroke-width='2'/><rect x='380' y='180' width='20' height='20' fill='none' stroke='currentColor'/><text x='150' y='190' fill='currentColor'>\\theta</text><text x='250' y='100' fill='currentColor' transform='rotate(-26 250,110)'>10</text></svg>"
    },
    {
        "id": "trig_v3_04",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": "In $\\triangle XYZ$, $\\angle Y = 90^\\circ$, $YZ = 15$ and $XZ = 17$. Find $\\tan Z$.",
        "question_zh": "在 $\\triangle XYZ$ 中，$\\angle Y = 90^\\circ$，$YZ = 15$ 且 $XZ = 17$。求 $\\tan Z$。",
        "answer": "8/15",
        "correct_answer": "8/15",
        "solution_steps": [
            "Identify that for angle $Z$, $YZ$ is the adjacent side and $XY$ is the opposite side.",
            "Calculate the opposite side $XY$ using Pythagoras: $XY = \\sqrt{17^2 - 15^2} = 8$.",
            "Apply the tangent ratio: $\\tan Z = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{XY}{YZ} = \\frac{8}{15}$."
        ],
        "solution_steps_zh": [
            "識別出對於角 $Z$，$YZ$ 是鄰邊，而 $XY$ 是對邊。",
            "利用畢氏定理計算對邊 $XY$：$XY = \\sqrt{17^2 - 15^2} = 8$。",
            "應用正切比例：$\\tan Z = \\frac{\\text{對邊}}{\\text{鄰邊}} = \\frac{XY}{YZ} = \\frac{8}{15}$。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><polygon points='100,50 100,200 300,200' fill='none' stroke='currentColor' stroke-width='2'/><rect x='100' y='180' width='20' height='20' fill='none' stroke='currentColor'/><text x='95' y='45' fill='currentColor'>X</text><text x='95' y='220' fill='currentColor'>Y</text><text x='310' y='220' fill='currentColor'>Z</text><text x='200' y='110' fill='currentColor'>17</text><text x='200' y='220' fill='currentColor'>15</text></svg>"
    },
    {
        "id": "trig_v3_05",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": "Simplify the trigonometric ratio $\\frac{\\sin A}{\\cos A}$ using the fundamental identity.",
        "question_zh": "利用基本恆等式簡化三角比 $\\frac{\\sin A}{\\cos A}$。",
        "answer": "\\tan A",
        "correct_answer": "\\tan A",
        "solution_steps": [
            "Recall the definition: $\\tan A = \\frac{\\text{Opposite}}{\\text{Adjacent}}$.",
            "Note that $\\sin A = \\frac{\\text{Opp}}{\\text{Hyp}}$ and $\\cos A = \\frac{\\text{Adj}}{\\text{Hyp}}$.",
            "Dividing $\\sin A$ by $\\cos A$ gives $(\\text{Opp/Hyp}) / (\\text{Adj/Hyp}) = \\text{Opp/Adj} = \\tan A$."
        ],
        "solution_steps_zh": [
            "回想定義：$\\tan A = \\frac{\\text{對邊}}{\\text{鄰邊}}$。",
            "注意 $\\sin A = \\frac{\\text{對邊}}{\\text{斜邊}}$ 且 $\\cos A = \\frac{\\text{鄰邊}}{\\text{斜邊}}$。",
            "將 $\\sin A$ 除以 $\\cos A$ 得 $(\\text{對邊/斜邊}) / (\\text{鄰邊/斜邊}) = \\text{對邊/鄰邊} = \\tan A$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_06",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": "Find the exact value of $\\sin 60^\\circ \\times \\cos 30^\\circ$.",
        "question_zh": "求 $\\sin 60^\\circ \\times \\cos 30^\\circ$ 的精確值。",
        "answer": "3/4",
        "correct_answer": "3/4",
        "solution_steps": [
            "Use exact values: $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$ and $\\cos 30^\\circ = \\frac{\\sqrt{3}}{2}$.",
            "Multiplication: $\\frac{\\sqrt{3}}{2} \\times \\frac{\\sqrt{3}}{2} = \\frac{3}{4}$.",
            "Final Result: $3/4$."
        ],
        "solution_steps_zh": [
            "使用精確值：$\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$ 且 $\\cos 30^\\circ = \\frac{\\sqrt{3}}{2}$。",
            "乘法運算：$\\frac{\\sqrt{3}}{2} \\times \\frac{\\sqrt{3}}{2} = \\frac{3}{4}$。",
            "最終結果：$3/4$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_07",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": "Evaluate exactly: $\\tan^2 45^\\circ + \\sin 30^\\circ$.",
        "question_zh": "求 $\\tan^2 45^\\circ + \\sin 30^\\circ$ 的精確值。",
        "answer": "3/2",
        "correct_answer": "3/2",
        "solution_steps": [
            "Recall exact values: $\\tan 45^\\circ = 1$ and $\\sin 30^\\circ = 1/2$.",
            "Substitute and calculate: $1^2 + 1/2 = 1 + 0.5$.",
            "Final Result: $1.5$ or $3/2$."
        ],
        "solution_steps_zh": [
            "回想精確值：$\\tan 45^\\circ = 1$ 且 $\\sin 30^\\circ = 1/2$。",
            "代入並計算：$1^2 + 1/2 = 1 + 0.5$。",
            "最終結果：$1.5$ 或 $3/2$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_08",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": "A 5m ladder leans against a vertical wall, making an angle of $60^\\circ$ with the ground. How far is the base of the ladder from the wall?",
        "question_zh": "一條長 5 米的梯子靠在垂直牆上，與地面成 $60^\\circ$ 角。梯底距離牆腳多遠？",
        "answer": "2.5",
        "correct_answer": "2.5",
        "solution_steps": [
            "Represent the scenario with a right triangle where the ladder (5m) is the hypotenuse.",
            "Use the cosine ratio: $\\text{Distance} = 5 \\times \\cos 60^\\circ$.",
            "Final Result: $5 \\times 0.5 = 2.5$m."
        ],
        "solution_steps_zh": [
            "以直角三角形表示情境，其中梯子 (5m) 是斜邊。",
            "使用餘弦比例：距離 = $5 \\times \\cos 60^\\circ$。",
            "最終結果：$5 \\times 0.5 = 2.5$ 米。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><line x1='100' y1='50' x2='100' y2='200' stroke='currentColor' stroke-width='4'/><line x1='100' y1='200' x2='300' y2='200' stroke='currentColor' stroke-width='2'/><line x1='100' y1='50' x2='200' y2='200' stroke='currentColor' stroke-width='3'/><text x='150' y='120' transform='rotate(56 150,120)' fill='currentColor'>5m</text><text x='180' y='190' fill='currentColor'>60^\\circ</text></svg>"
    },
    {
        "id": "trig_v3_09",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": "The angle of elevation of the top of a tower from a distance of 50m is $30^\\circ$. Find the height of the tower.",
        "question_zh": "從距離塔 50 米處觀察塔頂，仰角為 $30^\\circ$。求塔的高度。",
        "answer": "50/\\sqrt{3}",
        "correct_answer": "50/\\sqrt{3}",
        "solution_steps": [
            "Construct a triangle where the 50m distance is the adjacent side to the $30^\\circ$ angle.",
            "Apply the tangent ratio: $\\text{Height} = 50 \\times \\tan 30^\\circ$.",
            "Final Result: $50 / \\sqrt{3}$ meters."
        ],
        "solution_steps_zh": [
            "構造一個三角形，其中 50 米距離是 $30^\\circ$ 角的鄰邊。",
            "應用正切比例：高度 = $50 \\times \\tan 30^\\circ$。",
            "最終結果：$50 / \\sqrt{3}$ 米。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><rect x='400' y='50' width='20' height='150' fill='none' stroke='currentColor'/><line x1='100' y1='200' x2='400' y2='200' stroke='currentColor'/><line x1='100' y1='200' x2='400' y2='50' stroke='currentColor' stroke-dasharray='5,5'/><text x='120' y='190' fill='currentColor'>30^\\circ</text><text x='250' y='220' fill='currentColor'>50m</text></svg>"
    },
    {
        "id": "trig_v3_10",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": "Evaluate $\\frac{2 \\tan 45^\\circ}{1 + \\cos 60^\\circ}$.",
        "question_zh": "計算 $\\frac{2 \\tan 45^\\circ}{1 + \\cos 60^\\circ}$ 的值。",
        "answer": "4/3",
        "correct_answer": "4/3",
        "solution_steps": [
            "Use known values: $\\tan 45^\\circ = 1$ and $\\cos 60^\\circ = 1/2$.",
            "Substitute: $\\frac{2(1)}{1 + 0.5} = \\frac{2}{1.5}$.",
            "Final Result: $4/3$."
        ],
        "solution_steps_zh": [
            "使用已知值：$\\tan 45^\\circ = 1$ 且 $\\cos 60^\\circ = 1/2$。",
            "代入：$\\frac{2(1)}{1 + 0.5} = \\frac{2}{1.5}$。",
            "最終結果：$4/3$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_11",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Simplify $(1 - \\sin^2 \\theta)(1 + \\tan^2 \\theta)$.",
        "question_zh": "簡化 $(1 - \\sin^2 \\theta)(1 + \\tan^2 \\theta)$。",
        "answer": "1",
        "correct_answer": "1",
        "solution_steps": [
            "Use $\\cos^2 \\theta = 1 - \\sin^2 \\theta$.",
            "Use $1 + \\tan^2 \\theta = \\sec^2 \\theta = 1/\\cos^2 \\theta$.",
            "Final Multiplication: $\\cos^2 \\theta \\times (1/\\cos^2 \\theta) = 1$."
        ],
        "solution_steps_zh": [
            "使用 $\\cos^2 \\theta = 1 - \\sin^2 \\theta$。",
            "使用 $1 + \\tan^2 \\theta = \\sec^2 \\theta = 1/\\cos^2 \\theta$。",
            "最終乘法：$\\cos^2 \\theta \\times (1/\\cos^2 \\theta) = 1$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_12",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "In the figure, $AD \\perp BC$, $AB = 10, \\angle B = 30^\\circ, \\angle C = 45^\\circ$. Find $BC$.",
        "question_zh": "如下圖所示，$AD \\perp BC$，$AB = 10$、$\\angle B = 30^\\circ$、$\\angle C = 45^\\circ$。求 $BC$ 的長度。",
        "answer": "5\\sqrt{3} + 5",
        "correct_answer": "5\\sqrt{3} + 5",
        "solution_steps": [
            "Find $AD = 10 \\sin 30^\\circ = 5$.",
            "Find $BD = 10 \\cos 30^\\circ = 5\\sqrt{3}$ and $CD = AD / \\tan 45^\\circ = 5$.",
            "Final Sum: $BC = 5\\sqrt{3} + 5$."
        ],
        "solution_steps_zh": [
            "求出 $AD = 10 \\sin 30^\\circ = 5$。",
            "求出 $BD = 10 \\cos 30^\\circ = 5\\sqrt{3}$ 且 $CD = AD / \\tan 45^\\circ = 5$。",
            "最終求和：$BC = 5\\sqrt{3} + 5$。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><line x1='100' y1='200' x2='400' y2='200' stroke='currentColor'/><line x1='250' y1='200' x2='250' y2='100' stroke='currentColor' stroke-dasharray='3,3'/><line x1='100' y1='200' x2='250' y2='100' stroke='currentColor'/><line x1='400' y1='200' x2='250' y2='100' stroke='currentColor'/><text x='245' y='90' fill='currentColor'>A</text><text x='95' y='215' fill='currentColor'>B</text><text x='405' y='215' fill='currentColor'>C</text><text x='255' y='215' fill='currentColor'>D</text></svg>"
    },
    {
        "id": "trig_v3_13",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Simplify $\\frac{\\sin^2 \\theta}{1 - \\cos \\theta}$.",
        "question_zh": "簡化 $\\frac{\\sin^2 \\theta}{1 - \\cos \\theta}$。",
        "answer": "1 + \\cos \\theta",
        "correct_answer": "1 + \\cos \\theta",
        "solution_steps": [
            "Substitute $\\sin^2 \\theta = (1 - \\cos \\theta)(1 + \\cos \\theta)$.",
            "Cancel terms: $\\frac{(1 - \\cos \\theta)(1 + \\cos \\theta)}{1 - \\cos \\theta}$.",
            "Final Result: $1 + \\cos \\theta$."
        ],
        "solution_steps_zh": [
            "代入 $\\sin^2 \\theta = (1 - \\cos \\theta)(1 + \\cos \\theta)$。",
            "相消：$\\frac{(1 - \\cos \\theta)(1 + \\cos \\theta)}{1 - \\cos \\theta}$。",
            "最終結果：$1 + \\cos \\theta$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_14",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "If $3 \\tan \\theta = 4$ ($0^\\circ < \\theta < 90^\\circ$), evaluate $\\sin \\theta + \\cos \\theta$.",
        "question_zh": "若 $3 \\tan \\theta = 4$（且 $0^\\circ < \\theta < 90^\\circ$），求 $\\sin \\theta + \\cos \\theta$ 的值。",
        "answer": "7/5",
        "correct_answer": "7/5",
        "solution_steps": [
            "From $\\tan \\theta = 4/3$, use a 3-4-5 triangle.",
            "Determine $\\sin \\theta = 4/5$ and $\\cos \\theta = 3/5$.",
            "Final Calculation: $4/5 + 3/5 = 7/5$."
        ],
        "solution_steps_zh": [
            "由 $\\tan \\theta = 4/3$，使用 3-4-5 三角形。",
            "得出 $\\sin \\theta = 4/5$ 且 $\\cos \\theta = 3/5$。",
            "最終計算：$4/5 + 3/5 = 7/5$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_15",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Find the range of $p$ if $2 \\sin \\theta = p - 3$.",
        "question_zh": "若 $2 \\sin \\theta = p - 3$，求 $p$ 的範圍。",
        "answer": "1 \\le p \\le 5",
        "correct_answer": "1 \\le p \\le 5",
        "solution_steps": [
            "Use $-2 \\le 2 \\sin \\theta \\le 2$ since $-1 \\le \\sin \\theta \\le 1$.",
            "Substitute: $-2 \\le p - 3 \\le 2$.",
            "Final Range: $1 \\le p \\le 5$."
        ],
        "solution_steps_zh": [
            "由於 $-1 \\le \\sin \\theta \\le 1$，故有 $-2 \\le 2 \\sin \\theta \\le 2$。",
            "代入：$-2 \\le p - 3 \\le 2$。",
            "最終範圍：$1 \\le p \\le 5$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_16",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Simplify $\\frac{1}{1 + \\sin \\theta} + \\frac{1}{1 - \\sin \\theta}$.",
        "question_zh": "簡化 $\\frac{1}{1 + \\sin \\theta} + \\frac{1}{1 - \\sin \\theta}$。",
        "answer": "2 \\sec^2 \\theta",
        "correct_answer": "2 \\sec^2 \\theta",
        "solution_steps": [
            "Common denominator: $1 - \\sin^2 \\theta = \\cos^2 \\theta$.",
            "Sum denominators: $(1 - \\sin \\theta) + (1 + \\sin \\theta) = 2$.",
            "Final Result: $2 / \\cos^2 \\theta = 2 \\sec^2 \\theta$."
        ],
        "solution_steps_zh": [
            "公分母：$1 - \\sin^2 \\theta = \\cos^2 \\theta$。",
            "分子相加：$(1 - \\sin \\theta) + (1 + \\sin \\theta) = 2$。",
            "最終結果：$2 / \\cos^2 \\theta = 2 \\sec^2 \\theta$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_17",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Find $\\sin A : \\sin B$ if $\\tan A = 3/4$ and $\\tan B = 5/12$.",
        "question_zh": "若 $\\tan A = 3/4$ 且 $\\tan B = 5/12$，求 $\\sin A : \\sin B$。",
        "answer": "39:25",
        "correct_answer": "39:25",
        "solution_steps": [
            "Find $\\sin A = 3/5$ and $\\sin B = 5/13$.",
            "Ratio: $(3/5) / (5/13) = 39/25$.",
            "Final Result: $39:25$."
        ],
        "solution_steps_zh": [
            "得出 $\\sin A = 3/5$ 且 $\\sin B = 5/13$。",
            "比例：$(3/5) / (5/13) = 39/25$。",
            "最終結果：$39:25$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_18",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Solve $2 \\cos \\theta = \\sqrt{3}$ for $0^\\circ < \\theta < 90^\\circ$.",
        "question_zh": "解方程 $2 \\cos \\theta = \\sqrt{3}$ ($0^\\circ < \\theta < 90^\\circ$)。",
        "answer": "30",
        "correct_answer": "30",
        "solution_steps": [
            "$\\cos \\theta = \\sqrt{3}/2$.",
            "Use special angle values.",
            "Final Result: $30^\\circ$."
        ],
        "solution_steps_zh": [
            "$\\cos \\theta = \\sqrt{3}/2$。",
            "使用特殊角數值。",
            "最終結果：$30^\\circ$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_19",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Find distance between cars if altitude is 100m and depression angles are $45^\\circ$ and $60^\\circ$.",
        "question_zh": "若高度為 100m，俯角為 $45^\\circ$ 和 $60^\\circ$，求地面兩車間距。",
        "answer": "100 - 100/\\sqrt{3}",
        "correct_answer": "100 - 100/\\sqrt{3}",
        "solution_steps": [
            "Distances: $100 / \\tan 45^\\circ = 100$ and $100 / \\tan 60^\\circ = 100/\\sqrt{3}$.",
            "Difference: $100 - 100/\\sqrt{3}$.",
            "Final Result: $100 - 100/\\sqrt{3}$."
        ],
        "solution_steps_zh": [
            "距離：$100 / \\tan 45^\\circ = 100$ 且 $100 / \\tan 60^\\circ = 100/\\sqrt{3}$。",
            "差值：$100 - 100/\\sqrt{3}$。",
            "最終結果：$100 - 100/\\sqrt{3}$。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><circle cx='400' cy='50' r='20' fill='none' stroke='currentColor'/><line x1='100' y1='200' x2='400' y2='200' stroke='currentColor'/></svg>"
    },
    {
        "id": "trig_v3_20",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Simplify $\\cos(90^\\circ - \\theta) \\sin \\theta + \\sin(90^\\circ - \\theta) \\cos \\theta$.",
        "question_zh": "簡化 $\\cos(90^\\circ - \\theta) \\sin \\theta + \\sin(90^\\circ - \\theta) \\cos \\theta$。",
        "answer": "1",
        "correct_answer": "1",
        "solution_steps": [
            "Use $\\sin \\theta \\sin \\theta + \\cos \\theta \\cos \\theta$.",
            "Identify $\\sin^2 \\theta + \\cos^2 \\theta = 1$.",
            "Final Result: $1$."
        ],
        "solution_steps_zh": [
            "變為 $\\sin \\theta \\sin \\theta + \\cos \\theta \\cos \\theta$。",
            "識別 $\\sin^2 \\theta + \\cos^2 \\theta = 1$。",
            "最終結果：$1$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_21",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "If $\\sin \\theta + \\cos \\theta = 7/5$, find $\\sin \\theta \\cos \\theta$.",
        "question_zh": "若 $\\sin \\theta + \\cos \\theta = 7/5$，求 $\\sin \\theta \\cos \\theta$。",
        "answer": "12/25",
        "correct_answer": "12/25",
        "solution_steps": [
            "Square sides: $(\\sin \\theta + \\cos \\theta)^2 = 49/25$.",
            "$1 + 2 \\sin \\theta \\cos \\theta = 49/25$.",
            "Final Result: $12/25$."
        ],
        "solution_steps_zh": [
            "兩邊平方：$(\\sin \\theta + \\cos \\theta)^2 = 49/25$。",
            "$1 + 2 \\sin \\theta \\cos \\theta = 49/25$。",
            "最終結果：$12/25$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_22",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Cos of angle between body and face diagonal of unit cube.",
        "question_zh": "求單位立方體體對角線與面對角線夾角的餘弦。",
        "answer": "\\sqrt{2/3}",
        "correct_answer": "\\sqrt{2/3}",
        "solution_steps": [
            "Lengths are $\\sqrt{3}$ and $\\sqrt{2}$.",
            "Apply right triangle definition.",
            "Final Result: $\\sqrt{2/3}$."
        ],
        "solution_steps_zh": [
            "長度為 $\\sqrt{3}$ 和 $\\sqrt{2}$。",
            "應用直角三角形定義。",
            "最終結果：$\\sqrt{2/3}$。"
        ],
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><path d='M 100,200 L 200,200 L 200,100 L 100,100 Z' fill='none' stroke='currentColor'/></svg>"
    },
    {
        "id": "trig_v3_23",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Simplify $\\sin^4 \\theta - \\cos^4 \\theta$.",
        "question_zh": "簡化 $\\sin^4 \\theta - \\cos^4 \\theta$。",
        "answer": "2 \\sin^2 \\theta - 1",
        "correct_answer": "2 \\sin^2 \\theta - 1",
        "solution_steps": [
            "Factor: $(\\sin^2 \\theta + \\cos^2 \\theta)(\\sin^2 \\theta - \\cos^2 \\theta)$.",
            "Replace $\\cos^2 \\theta$.",
            "Final Result: $2 \\sin^2 \\theta - 1$."
        ],
        "solution_steps_zh": [
            "因式分解：$(\\sin^2 \\theta + \\cos^2 \\theta)(\\sin^2 \\theta - \\cos^2 \\theta)$。",
            "代換 $\\cos^2 \\theta$。",
            "最終結果：$2 \\sin^2 \\theta - 1$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_24",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Max area with hypotenuse L.",
        "question_zh": "求斜邊為 L 的直角三角形最大面積。",
        "answer": "L^2/4",
        "correct_answer": "L^2/4",
        "solution_steps": [
            "Area $= (1/2) L^2 \\sin \\theta \\cos \\theta$.",
            "Use $\\sin 2\\theta = 1$.",
            "Final Result: $L^2 / 4$."
        ],
        "solution_steps_zh": [
            "面積 $= (1/2) L^2 \\sin \\theta \\cos \\theta$。",
            "使用 $\\sin 2\\theta = 1$。",
            "最終結果：$L^2 / 4$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_25",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Solve $4 \\sin^2 \\theta - 1 = 0$.",
        "question_zh": "解 $4 \\sin^2 \\theta - 1 = 0$。",
        "answer": "30",
        "correct_answer": "30",
        "solution_steps": [
            "$\\sin \\theta = 1/2$.",
            "Apply inverse sine.",
            "Final Result: $30^\\circ$."
        ],
        "solution_steps_zh": [
            "$\\sin \\theta = 1/2$。",
            "應用反正弦函數。",
            "最終結果：$30^\\circ$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_26",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Find $\\tan C$ if $\\sum \\tan X = \\prod \\tan X$ and $\\tan A=1, \\tan B=2$.",
        "question_zh": "若 $\\sum \\tan X = \\prod \\tan X$ 且 $\\tan A=1, \\tan B=2$，求 $\\tan C$。",
        "answer": "3",
        "correct_answer": "3",
        "solution_steps": [
            "$3 + \\tan C = 2 \\tan C$.",
            "Solve for $\\tan C$.",
            "Final Result: $3$."
        ],
        "solution_steps_zh": [
            "$3 + \\tan C = 2 \\tan C$。",
            "解 $\\tan C$。",
            "最終結果：$3$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_27",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Simplify $\\sum 1/(1 \\pm \\cos \\theta)$.",
        "question_zh": "簡化 $\\sum 1/(1 \\pm \\cos \\theta)$。",
        "answer": "2 \\csc^2 \\theta",
        "correct_answer": "2 \\csc^2 \\theta",
        "solution_steps": [
            "Result is $2 / \\sin^2 \\theta$.",
            "Apply cosecant definition.",
            "Final Result: $2 \\csc^2 \\theta$."
        ],
        "solution_steps_zh": [
            "結果為 $2 / \\sin^2 \\theta$。",
            "應用餘割定義。",
            "最終結果：$2 \\csc^2 \\theta$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_28",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Sin of angle between diagonal and base of 3, 4, 12 cuboid.",
        "question_zh": "求 3, 4, 12 長方體對角線與底面夾角正弦。",
        "answer": "12/13",
        "correct_answer": "12/13",
        "solution_steps": [
            "Diagonal length is $13$.",
            "Apply sine ratio.",
            "Final Result: $12/13$."
        ],
        "solution_steps_zh": [
            "對角線長度為 $13$。",
            "應用正弦比例。",
            "最終結果：$12/13$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_29",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Find $\\sin 2\\theta$ if $\\tan \\theta + \\cot \\theta = 4$.",
        "question_zh": "若 $\\tan \\theta + \\cot \\theta = 4$，求 $\\sin 2\\theta$。",
        "answer": "1/2",
        "correct_answer": "1/2",
        "solution_steps": [
            "$1 / (\\sin \\theta \\cos \\theta) = 4$.",
            "$\\sin 2\\theta = 2(1/4)$.",
            "Final Result: $1/2$."
        ],
        "solution_steps_zh": [
            "$1 / (\\sin \\theta \\cos \\theta) = 4$。",
            "$\\sin 2\\theta = 2(1/4)$。",
            "最終結果：$1/2$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_30",
        "topic_id": "math_trig_ratios",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Simplify $(\\csc \\theta - \\cot \\theta)(\\csc \\theta + \\cot \\theta)$.",
        "question_zh": "簡化 $(\\csc \\theta - \\cot \\theta)(\\csc \\theta + \\cot \\theta)$。",
        "answer": "1",
        "correct_answer": "1",
        "solution_steps": [
            "Difference of squares: $\\csc^2 \\theta - \\cot^2 \\theta$.",
            "Apply primary identity.",
            "Final Result: $1$."
        ],
        "solution_steps_zh": [
            "平方差：$\\csc^2 \\theta - \\cot^2 \\theta$。",
            "應用基本恆等式。",
            "最終結果：$1$。"
        ],
        "visual": ""
    }
]

output_path = os.path.join('backend', 'data', 'math_content', 'math_trig_ratios_questions.json')
with open(output_path, 'w', encoding='utf-8') as f:
    # This will write the single-escaped backslashes as required (e.g. \\sin in file)
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {len(questions)} questions to {output_path}")
