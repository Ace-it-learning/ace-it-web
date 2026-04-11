import json
import os

# Updated batch for Q20-Q30 with expanded steps and mandatory SVGs for spatial problems
updated_batch = [
    {
        "id": "trig_v3_20",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": "Simplify $\\cos(90^\\circ - \\theta) \\sin \\theta + \\sin(90^\\circ - \\theta) \\cos \\theta$.",
        "question_zh": "簡化 $\\cos(90^\\circ - \\theta) \\sin \\theta + \\sin(90^\\circ - \\theta) \\cos \\theta$。",
        "answer": "1",
        "correct_answer": "1",
        "solution_steps": [
            "Apply complementary angle identities: $\\cos(90^\\circ - \\theta) = \\sin \\theta$ and $\\sin(90^\\circ - \\theta) = \\cos \\theta$.",
            "Substitute these identities into the expression: $(\\sin \\theta)(\\sin \\theta) + (\\cos \\theta)(\\cos \\theta)$.",
            "Simplify the terms to get $\\sin^2 \\theta + \\cos^2 \\theta$.",
            "Apply the Pythagorean identity $\\sin^2 \\theta + \\cos^2 \\theta = 1$ to reach the final answer."
        ],
        "solution_steps_zh": [
            "應用餘角恆等式：$\\cos(90^\\circ - \\theta) = \\sin \\theta$ 及 $\\sin(90^\\circ - \\theta) = \\cos \\theta$。",
            "將這些恆等式代入表達式中：$(\\sin \\theta)(\\sin \\theta) + (\\cos \\theta)(\\cos \\theta)$。",
            "簡化各項得到 $\\sin^2 \\theta + \\cos^2 \\theta$。",
            "應用畢氏恆等式 $\\sin^2 \\theta + \\cos^2 \\theta = 1$ 得出最終答案。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_21",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "If $\\sin \\theta + \\cos \\theta = \\frac{7}{5}$, find the value of $\\sin \\theta \\cos \\theta$.",
        "question_zh": "若 $\\sin \\theta + \\cos \\theta = \\frac{7}{5}$，求 $\\sin \\theta \\cos \\theta$ 的值。",
        "answer": "12/25",
        "correct_answer": "12/25",
        "solution_steps": [
            "Square both sides of the given equation: $(\\sin \\theta + \\cos \\theta)^2 = (\\frac{7}{5})^2$.",
            "Expand the left side using $(a+b)^2 = a^2 + 2ab + b^2$: $\\sin^2 \\theta + 2 \\sin \\theta \\cos \\theta + \\cos^2 \\theta = \\frac{49}{25}$.",
            "Substitute the identity $\\sin^2 \\theta + \\cos^2 \\theta = 1$ into the equation: $1 + 2 \\sin \\theta \\cos \\theta = \\frac{49}{25}$.",
            "Rearrange to solve for the product: $2 \\sin \\theta \\cos \\theta = \\frac{49}{25} - 1 = \\frac{24}{25}$, hence $\\sin \\theta \\cos \\theta = \\frac{12}{25}$."
        ],
        "solution_steps_zh": [
            "將給定方程的兩邊平方：$(\\sin \\theta + \\cos \\theta)^2 = (\\frac{7}{5})^2$。",
            "使用 $(a+b)^2 = a^2 + 2ab + b^2$ 展開左邊：$\\sin^2 \\theta + 2 \\sin \\theta \\cos \\theta + \\cos^2 \\theta = \\frac{49}{25}$。",
            "將恆等式 $\\sin^2 \\theta + \\cos^2 \\theta = 1$ 代入方程：$1 + 2 \\sin \\theta \\cos \\theta = \\frac{49}{25}$。",
            "移項求乘積：$2 \\sin \\theta \\cos \\theta = \\frac{49}{25} - 1 = \\frac{24}{25}$，因此 $\\sin \\theta \\cos \\theta = \\frac{12}{25}$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_22",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "In a unit cube $ABCDEFGH$, find the cosine of the angle between the body diagonal $AG$ and the face diagonal $AC$.",
        "question_zh": "在單位正方體 $ABCDEFGH$ 中，求體對角線 $AG$ 與面對角線 $AC$ 之間夾角的餘弦值。",
        "answer": "\\sqrt{2/3}",
        "correct_answer": "\\sqrt{2/3}",
        "solution_steps": [
            "Identify the triangle $\\triangle ACG$ formed by the face diagonal $AC$, the edge $CG$, and the body diagonal $AG$.",
            "In a unit cube (side length 1), the face diagonal $AC = \\sqrt{1^2 + 1^2} = \\sqrt{2}$. The vertical edge $CG = 1$.",
            "Calculate the body diagonal $AG$ using Pythagoras in $\\triangle ACG$: $AG = \\sqrt{AC^2 + CG^2} = \\sqrt{(\\sqrt{2})^2 + 1^2} = \\sqrt{3}$.",
            "Since $\\angle ACG = 90^\\circ$, apply the cosine ratio for $\\angle CAG$: $\\cos \\angle CAG = \\frac{AC}{AG} = \\frac{\\sqrt{2}}{\\sqrt{3}} = \\sqrt{\\frac{2}{3}}$."
        ],
        "solution_steps_zh": [
            "識別由面對角線 $AC$、棱 $CG$ 和體對角線 $AG$ 組成的三角形 $\\triangle ACG$。",
            "在單位正方體（邊長為 1）中，面對角線 $AC = \\sqrt{1^2 + 1^2} = \\sqrt{2}$。垂直棱 $CG = 1$。",
            "在 $\\triangle ACG$ 中利用畢氏定理計算體對角線 $AG$：$AG = \\sqrt{AC^2 + CG^2} = \\sqrt{(\\sqrt{2})^2 + 1^2} = \\sqrt{3}$。",
            "由於 $\\angle ACG = 90^\\circ$，對 $\\angle CAG$ 應用餘弦比例：$\\cos \\angle CAG = \\frac{AC}{AG} = \\frac{\\sqrt{2}}{\\sqrt{3}} = \\sqrt{\\frac{2}{3}}$。"
        ],
        "visual": "<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><path d='M 100 300 L 250 300 L 300 250 L 150 250 Z' fill='none' stroke='currentColor' stroke-width='2'/><path d='M 100 300 L 100 150 L 150 100 L 150 250 Z' fill='none' stroke='currentColor' stroke-width='2'/><path d='M 100 150 L 250 150 L 300 100 L 150 100 Z' fill='none' stroke='currentColor' stroke-width='2'/><path d='M 250 300 L 250 150 M 300 250 L 300 100' fill='none' stroke='currentColor' stroke-width='2'/><line x1='100' y1='300' x2='300' y2='100' stroke='currentColor' stroke-width='2' stroke-dasharray='5,5'/><line x1='100' y1='300' x2='300' y2='250' stroke='currentColor' stroke-width='2' stroke-dasharray='5,5'/><text x='85' y='315' fill='currentColor'>A</text><text x='310' y='265' fill='currentColor'>C</text><text x='310' y='95' fill='currentColor'>G</text></svg>"
    },
    {
        "id": "trig_v3_23",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Simplify $\\sin^4 \\theta - \\cos^4 \\theta$ and express it in terms of $\\sin^2 \\theta$.",
        "question_zh": "簡化 $\\sin^4 \\theta - \\cos^4 \\theta$ 並以 $\\sin^2 \\theta$ 表示之。",
        "answer": "2 \\sin^2 \\theta - 1",
        "correct_answer": "2 \\sin^2 \\theta - 1",
        "solution_steps": [
            "Treat the expression as a difference of squares: $(\\sin^2 \\theta)^2 - (\\cos^2 \\theta)^2$.",
            "Factor the expression: $(\\sin^2 \\theta + \\cos^2 \\theta)(\\sin^2 \\theta - \\cos^2 \\theta)$.",
            "Apply the identity $\\sin^2 \\theta + \\cos^2 \\theta = 1$ to simplify the first factor: $1 \\times (\\sin^2 \\theta - \\cos^2 \\theta)$.",
            "Substitute $\\cos^2 \\theta = 1 - \\sin^2 \\theta$ to eliminate cosine: $\\sin^2 \\theta - (1 - \\sin^2 \\theta) = 2 \\sin^2 \\theta - 1$."
        ],
        "solution_steps_zh": [
            "將表達式視為平方差：$(\\sin^2 \\theta)^2 - (\\cos^2 \\theta)^2$。",
            "分解表達式：$(\\sin^2 \\theta + \\cos^2 \\theta)(\\sin^2 \\theta - \\cos^2 \\theta)$。",
            "應用恆等式 $\\sin^2 \\theta + \\cos^2 \\theta = 1$ 簡化第一個括號：$1 \\times (\\sin^2 \\theta - \\cos^2 \\theta)$。",
            "代入 $\\cos^2 \\theta = 1 - \\sin^2 \\theta$ 以消去餘弦項：$\\sin^2 \\theta - (1 - \\sin^2 \\theta) = 2 \\sin^2 \\theta - 1$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_24",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Prove that for any right-angled triangle with fixed hypotenuse $L$, the maximum area is $\\frac{L^2}{4}$.",
        "question_zh": "證明對於任何斜邊長度固定為 $L$ 的直角三角形，其最大面積為 $\\frac{L^2}{4}$。",
        "answer": "L^2/4",
        "correct_answer": "L^2/4",
        "solution_steps": [
            "Let the two legs of the triangle be $L \\sin \\theta$ and $L \\cos \\theta$.",
            "Write the area formula: $A = \\frac{1}{2} (L \\sin \\theta)(L \\cos \\theta) = \\frac{1}{2} L^2 \\sin \\theta \\cos \\theta$.",
            "Apply the double angle identity $\\sin 2\\theta = 2 \\sin \\theta \\cos \\theta$ to rewrite the area: $A = \\frac{1}{4} L^2 \\sin 2\\theta$.",
            "Since the maximum value of $\\sin 2\\theta$ is 1 (where $2\\theta = 90^\\circ$), the maximum area is $\\frac{1}{4} L^2 (1) = \\frac{L^2}{4}$."
        ],
        "solution_steps_zh": [
            "設三角形的兩條直角邊分別為 $L \\sin \\theta$ 和 $L \\cos \\theta$。",
            "寫出面積公式：$A = \\frac{1}{2} (L \\sin \\theta)(L \\cos \\theta) = \\frac{1}{2} L^2 \\sin \\theta \\cos \\theta$。",
            "應用倍角恆等式 $\\sin 2\\theta = 2 \\sin \\theta \\cos \\theta$ 重寫面積：$A = \\frac{1}{4} L^2 \\sin 2\\theta$。",
            "由於 $\\sin 2\\theta$ 的最大值為 1（此時 $2\\theta = 90^\\circ$），故最大面積為 $\\frac{1}{4} L^2 (1) = \\frac{L^2}{4}$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_25",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Solve the equation $4 \\sin^2 \\theta - 1 = 0$ for $0^\\circ \\le \\theta \\le 90^\\circ$.",
        "question_zh": "解方程 $4 \\sin^2 \\theta - 1 = 0$，其中 $0^\\circ \\le \\theta \\le 90^\\circ$。",
        "answer": "30",
        "correct_answer": "30",
        "solution_steps": [
            "Rearrange the equation to isolate the squared term: $4 \\sin^2 \\theta = 1 \\implies \\sin^2 \\theta = \\frac{1}{4}$.",
            "Take the square root of both sides. Since $0^\\circ \\le \\theta \\le 90^\\circ$, we take the positive root: $\\sin \\theta = \\frac{1}{2}$.",
            "Find the angle $\\theta$ that satisfies $\\sin \\theta = 1/2$.",
            "Final result: $\\theta = 30^\\circ$."
        ],
        "solution_steps_zh": [
            "移項以分離平方項：$4 \\sin^2 \\theta = 1 \\implies \\sin^2 \\theta = \\frac{1}{4}$。",
            "對兩邊開平方。由於 $0^\\circ \\le \\theta \\le 90^\\circ$，我們取正根：$\\sin \\theta = \\frac{1}{2}$。",
            "找出滿足 $\\sin \\theta = 1/2$ 的角度 $\\theta$。",
            "最終結果：$\\theta = 30^\\circ$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_26",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "In $\\triangle ABC$, the property $\\sum \\tan X = \\prod \\tan X$ holds. If $\\tan A = 1$ and $\\tan B = 2$, find the exact value of $\\tan C$.",
        "question_zh": "在 $\\triangle ABC$ 中，恆等式 $\\tan A + \\tan B + \\tan C = \\tan A \\tan B \\tan C$ 成立。若 $\\tan A = 1$ 且 $\\tan B = 2$，求 $\\tan C$ 的精確值。",
        "answer": "3",
        "correct_answer": "3",
        "solution_steps": [
            "Substitute the given values into the identity: $1 + 2 + \\tan C = (1)(2)(\\tan C)$.",
            "Simplify the equation: $3 + \\tan C = 2 \\tan C$.",
            "Rearrange the equation by subtracting $\\tan C$ from both sides to isolate the variable.",
            "Final result: $\\tan C = 3$."
        ],
        "solution_steps_zh": [
            "將已知值代入恆等式：$1 + 2 + \\tan C = (1)(2)(\\tan C)$。",
            "簡化方程：$3 + \\tan C = 2 \\tan C$。",
            "通過從兩邊減去 $\\tan C$ 來移項，以分離變量。",
            "最終結果：$\\tan C = 3$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_27",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Simplify the sum $\\frac{1}{1 + \\cos \\theta} + \\frac{1}{1 - \\cos \\theta}$ and express it using $\\csc \\theta$.",
        "question_zh": "簡化和式 $\\frac{1}{1 + \\cos \\theta} + \\frac{1}{1 - \\cos \\theta}$ 並以 $\\csc \\theta$ 表示之。",
        "answer": "2 \\csc^2 \\theta",
        "correct_answer": "2 \\csc^2 \\theta",
        "solution_steps": [
            "Find a common denominator: $(1 + \\cos \\theta)(1 - \\cos \\theta) = 1 - \\cos^2 \\theta = \\sin^2 \\theta$.",
            "Combine the numerators: $(1 - \\cos \\theta) + (1 + \\cos \\theta) = 2$.",
            "Rewrite the expression: $\\frac{2}{\\sin^2 \\theta}$.",
            "Use the reciprocal identity $\\csc \\theta = \\frac{1}{\\sin \\theta}$ to get $2 \\csc^2 \\theta$."
        ],
        "solution_steps_zh": [
            "尋找公分母：$(1 + \\cos \\theta)(1 - \\cos \\theta) = 1 - \\cos^2 \\theta = \\sin^2 \\theta$。",
            "合併分子：$(1 - \\cos \\theta) + (1 + \\cos \\theta) = 2$。",
            "重寫表達式：$\\frac{2}{\\sin^2 \\theta}$。",
            "利用倒數恆等式 $\\csc \\theta = \\frac{1}{\\sin \\theta}$ 得到 $2 \\csc^2 \\theta$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_28",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "A rectangular cuboid has side lengths 3, 4, and 12. Find the sine of the angle between the space diagonal and the base face containing the sides 3 and 4.",
        "question_zh": "一個長方體的邊長分別為 3、4 和 12。求體對角線與包含邊長 3 和 4 的底面之間夾角的正弦值。",
        "answer": "12/13",
        "correct_answer": "12/13",
        "solution_steps": [
            "First, calculate the length of the face diagonal on the base: $d_{base} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = 5$.",
            "Next, calculate the length of the space diagonal $D$ using the height (12): $D = \\sqrt{d_{base}^2 + 12^2} = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = 13$.",
            "Identify the angle $\\phi$ in the vertical right-angled triangle formed by the height (opposite side) and the space diagonal (hypotenuse).",
            "Apply the sine ratio: $\\sin \\phi = \\frac{\\text{Opposite}}{\\text{Hypotenuse}} = \\frac{12}{13}$."
        ],
        "solution_steps_zh": [
            "首先，計算底面面對角線的長度：$d_{base} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = 5$。",
            "然後，利用高度 (12) 計算體對角線 $D$ 的長度：$D = \\sqrt{d_{base}^2 + 12^2} = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = 13$。",
            "識別由高度（對邊）和體對角線（斜邊）組成的垂直直角三角形中的夾角 $\\phi$。",
            "應用正弦比例：$\\sin \\phi = \\frac{\\text{對邊}}{\\text{斜邊}} = \\frac{12}{13}$。"
        ],
        "visual": "<svg viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'><path d='M 50 200 L 250 200 L 300 150 L 100 150 Z' fill='none' stroke='currentColor' stroke-width='2'/><path d='M 50 200 L 50 50 L 100 0 L 100 150 Z' fill='none' stroke='currentColor' stroke-width='2'/><path d='M 50 50 L 250 50 L 300 0 L 100 0 Z' fill='none' stroke='currentColor' stroke-width='2'/><path d='M 250 200 L 250 50 M 300 150 L 300 0' fill='none' stroke='currentColor' stroke-width='2'/><line x1='50' y1='200' x2='300' y2='0' stroke='currentColor' stroke-width='2' stroke-dasharray='5,5'/><line x1='50' y1='200' x2='300' y2='150' stroke='currentColor' stroke-width='2' stroke-dasharray='5,5'/><text x='35' y='215' fill='currentColor'>A</text><text x='310' y='165' fill='currentColor'>C</text><text x='310' y='-5' fill='currentColor'>G</text><text x='150' y='220' fill='currentColor'>4</text><text x='280' y='190' fill='currentColor'>3</text><text x='260' y='125' fill='currentColor'>12</text></svg>"
    },
    {
        "id": "trig_v3_29",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "If $\\tan \\theta + \\cot \\theta = 4$, find the exact value of $\\sin 2\\theta$.",
        "question_zh": "若 $\\tan \\theta + \\cot \\theta = 4$，求 $\\sin 2\\theta$ 的精確值。",
        "answer": "1/2",
        "correct_answer": "1/2",
        "solution_steps": [
            "Rewrite $\\tan \\theta$ and $\\cot \\theta$ using sine and cosine: $\\frac{\\sin \\theta}{\\cos \\theta} + \\frac{\\cos \\theta}{\\sin \\theta} = 4$.",
            "Combine the fractions: $\\frac{\\sin^2 \\theta + \\cos^2 \\theta}{\\sin \\theta \\cos \\theta} = 4$.",
            "Since $\\sin^2 \\theta + \\cos^2 \\theta = 1$, we have $\\frac{1}{\\sin \\theta \\cos \\theta} = 4 \\implies \\sin \\theta \\cos \\theta = \\frac{1}{4}$.",
            "Apply the double angle formula $\\sin 2\\theta = 2 \\sin \\theta \\cos \\theta$: $\\sin 2\\theta = 2(\\frac{1}{4}) = \\frac{1}{2}$."
        ],
        "solution_steps_zh": [
            "使用正弦和餘弦重寫 $\\tan \\theta$ 和 $\\cot \\theta$：$\\frac{\\sin \\theta}{\\cos \\theta} + \\frac{\\cos \\theta}{\\sin \\theta} = 4$。",
            "合併分式：$\\frac{\\sin^2 \\theta + \\cos^2 \\theta}{\\sin \\theta \\cos \\theta} = 4$。",
            "由於 $\\sin^2 \\theta + \\cos^2 \\theta = 1$，得出 $\\frac{1}{\\sin \\theta \\cos \\theta} = 4 \\implies \\sin \\theta \\cos \\theta = \\frac{1}{4}$。",
            "應用倍角公式 $\\sin 2\\theta = 2 \\sin \\theta \\cos \\theta$：$\\sin 2\\theta = 2(\\frac{1}{4}) = \\frac{1}{2}$。"
        ],
        "visual": ""
    },
    {
        "id": "trig_v3_30",
        "topic_id": "math_geo_trig",
        "subject": "maths",
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": "Simplify the expression $(\\csc \\theta - \\cot \\theta)(\\csc \\theta + \\cot \\theta)$ using the fundamental Pythagorean identity.",
        "question_zh": "利用基本畢氏恆等式簡化表達式 $(\\csc \\theta - \\cot \\theta)(\\csc \\theta + \\cot \\theta)$。",
        "answer": "1",
        "correct_answer": "1",
        "solution_steps": [
            "Treat the expression as a difference of squares: $\\csc^2 \\theta - \\cot^2 \\theta$.",
            "Recall the identity linking cosecant and cotangent: $1 + \\cot^2 \\theta = \\csc^2 \\theta$.",
            "Rearrange the identity to find the difference: $\\csc^2 \\theta - \\cot^2 \\theta = 1$.",
            "The simplified value of the expression is 1."
        ],
        "solution_steps_zh": [
            "將表達式視為平方差：$\\csc^2 \\theta - \\cot^2 \\theta$。",
            "回想連接餘割與餘切的恆等式：$1 + \\cot^2 \\theta = \\csc^2 \\theta$。",
            "移項恆等式以求得差值：$\\csc^2 \\theta - \\cot^2 \\theta = 1$。",
            "該表達式的簡化值為 1。"
        ],
        "visual": ""
    }
]

def patch_trig_questions():
    questions_path = os.path.join('backend', 'data', 'math_content', 'math_geo_trig_questions.json')
    
    with open(questions_path, 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    
    # Create a lookup for current IDs
    updated_ids = {q['id'] for q in updated_batch}
    
    # Filter out the old versions and append the new ones
    # (This maintains order if we sort later, or just replaces them)
    final_data = [q for q in full_data if q['id'] not in updated_ids]
    final_data.extend(updated_batch)
    
    # Sort by ID to maintain logical order (v3_01 to v3_30)
    final_data.sort(key=lambda x: x['id'])
    
    with open(questions_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Successfully patched {len(updated_batch)} questions (Q20-Q30) in {questions_path}")

if __name__ == "__main__":
    patch_trig_questions()
