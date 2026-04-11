import math
import random
import json
import os

def generate_log_exp_questions():
    questions = []
    topic_id = "math_alg_logexp"

    # ================= LEVEL 3: BASIC LOG PROPERTIES (8 Questions) =================
    # Q1-Q4: Numerical Evaluation
    # Q5-Q6: Simplifying Expressions
    # Q7-Q8: Change of Base
    
    # Q1-Q4
    l3_basics = [
        (2, 64, 6), (3, 243, 5), (5, 125, 3), (10, 100000, 5)
    ]
    for i in range(1, 5):
        base, val, ans = l3_basics[i-1]
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 2,
            "question": f"Evaluate $\\log_{{{base}}} {val}$.",
            "question_zh": f"試求 $\\log_{{{base}}} {val}$ 的值。",
            "answer": f"{ans}",
            "correct_answer": f"{ans}",
            "solution_steps": [
                f"Let $x = \\log_{{{base}}} {val}$.",
                f"By definition, ${base}^x = {val}$.",
                f"Since ${base}^{ans} = {val}$, we have $x = {ans}$."
            ],
            "solution_steps_zh": [
                f"設 $x = \\log_{{{base}}} {val}$。",
                f"根據定義，${base}^x = {val}$。",
                f"由於 ${base}^{ans} = {val}$，因此 $x = {ans}$。"
            ]
        })

    # Q5-Q6: Simplify
    l3_simplify = [
        (12, 15, 18, "1"), # log 12 + log 15 - log 18 = log (180/18) = log 10 = 1
        (16, 25, 4, "2")   # log 16 + log 25 - log 4 = log (400/4) = log 100 = 2
    ]
    for i in range(5, 7):
        a, b, c, ans = l3_simplify[i-5]
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 3,
            "question": f"Simplify $\\log {a} + \\log {b} - \\log {c}$.",
            "question_zh": f"簡化 $\\log {a} + \\log {b} - \\log {c}$。",
            "answer": f"{ans}",
            "correct_answer": f"{ans}",
            "solution_steps": [
                f"Using the properties of logarithms:",
                f"$\\log {a} + \\log {b} - \\log {c} = \\log\\left( \\frac{{{a} \\cdot {b}}}{{{c}}} \\right)$",
                f"$= \\log\\left( \\frac{{{a*b}}}{{{c}}} \\right) = \\log {int(a*b/c)}$",
                f"$= {ans}$"
            ],
            "solution_steps_zh": [
                f"利用對數性質：",
                f"$\\log {a} + \\log {b} - \\log {c} = \\log\\left( \\frac{{{a} \\cdot {b}}}{{{c}}} \\right)$",
                f"$= \\log\\left( \\frac{{{a*b}}}{{{c}}} \\right) = \\log {int(a*b/c)}$",
                f"$= {ans}$"
            ]
        })

    # Q7-Q8: Change of base
    l3_cob = [
        (2, 3, "k", 3, 8), # log2 3 = k, express log3 8 => log2 8 / log2 3 = 3/k
        (5, 7, "m", 7, 25) # log5 7 = m, express log7 25 => log5 25 / log5 7 = 2/m
    ]
    for i in range(7, 9):
        b1, b2, var, nb2, nval = l3_cob[i-7]
        ans_num = 3 if i == 7 else 2
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 3,
            "question": f"Given that $\\log_{{{b1}}} {b2} = {var}$, express $\\log_{{{nb2}}} {nval}$ in terms of ${var}$.",
            "question_zh": f"已知 $\\log_{{{b1}}} {b2} = {var}$，試以 ${var}$ 表示 $\\log_{{{nb2}}} {nval}$。",
            "answer": f"\\frac{{{ans_num}}}{{{var}}}",
            "correct_answer": f"\\frac{{{ans_num}}}{{{var}}}",
            "solution_steps": [
                f"By Change of Base formula: $\\log_{{{nb2}}} {nval} = \\frac{{\\log_{{{b1}}} {nval}}}{{\\log_{{{b1}}} {nb2}}}$.",
                f"Since $nval = {b1}^{ans_num}$, $\\log_{{{b1}}} {nval} = {ans_num}$.",
                f"Given $\\log_{{{b1}}} {b2} = {var}$, we have $\\log_{{{nb2}}} {nval} = \\frac{{{ans_num}}}{{{var}}}$."
            ],
            "solution_steps_zh": [
                f"利用換底公式：$\\log_{{{nb2}}} {nval} = \\frac{{\\log_{{{b1}}} {nval}}}{{\\log_{{{b1}}} {nb2}}}$。",
                f"由於 $nval = {b1}^{ans_num}$，因此 $\\log_{{{b1}}} {nval} = {ans_num}$。",
                f"已知 $\\log_{{{b1}}} {b2} = {var}$，故 $\\log_{{{nb2}}} {nval} = \\frac{{{ans_num}}}{{{var}}}$。"
            ]
        })

    # ================= LEVEL 4: BASIC EQUATIONS (8 Questions) =================
    # Q9-Q12: Matching Bases
    # Q13-Q16: Logarithmic Equations
    
    l4_exp = [
        (2, 8, "x+3", "x-1", 3, "x+3=3(x-1) => x+3=3x-3 => 2x=6 => x=3"),
        (3, 9, "2x+1", "x+2", 2, "2x+1=2(x+2) => 2x+1=2x+4 => No solution? Wait let me adjust"),
        (5, 25, "x+4", "x-2", 2, "x+4=2(x-2) => x+4=2x-4 => x=8"),
        (4, 32, "x+1", "x-1", 2.5, "2^(2x+2)=2^(5x-5) => 2x+2=5x-5 => 3x=7 => x=7/3")
    ]
    # Fixed Q10
    l4_exp[1] = (3, 27, "x+5", "2x-1", 3, "x+5=3(2x-1) => x+5=6x-3 => 5x=8 => x=8/5")
    
    for i in range(9, 13):
        b1, b2, e1, e2, k, sol_path = l4_exp[i-9]
        # b1^(e1) = b2^(e2) => b1^(e1) = (b1^k)^(e2)
        ans = "3" if i == 9 else "1.6" if i == 10 else "8" if i == 11 else "7/3"
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 4,
            "type": "short_answer",
            "marks": 3,
            "question": f"Solve ${b1}^{{{e1}}} = {b2}^{{{e2}}}$.",
            "question_zh": f"解方程 ${b1}^{{{e1}}} = {b2}^{{{e2}}}$。",
            "answer": f"{ans}",
            "correct_answer": f"{ans}",
            "solution_steps": [
                f"Express both sides in the same base:",
                f"${b1}^{{{e1}}} = ({b1}^{k})^{{{e2}}}$",
                f"${b1}^{{{e1}}} = {b1}^{{{k}({e2})}}$",
                f"Equating exponents: {sol_path.split('=>')[1].strip() if '=>' in sol_path else ''}",
                f"The solution is $x = {ans}$."
            ],
            "solution_steps_zh": [
                f"將兩邊化為相同底數：",
                f"${b1}^{{{e1}}} = ({b1}^{k})^{{{e2}}}$",
                f"${b1}^{{{e1}}} = {b1}^{{{k}({e2})}}$",
                f"令指數相等：{sol_path.split('=>')[1].strip() if '=>' in sol_path else ''}",
                f"解得 $x = {ans}$。"
            ]
        })

    # Q13-Q16: Log Equations
    l4_log = [
        (10, "x", "x-3", 1, 10, "x(x-3)=10 => x^2-3x-10=0 => (x-5)(x+2)=0 => x=5"),
        (10, "x", "x+3", "x+18", "N/A", "x(x+3)=x+18 => x^2+3x=x+18 => x^2+2x-18=0? No, let's make it cleaner"),
        (2, "x", "x-2", 3, 4, "x(x-2)=2^3=8 => x^2-2x-8=0 => (x-4)(x+2)=0 => x=4"),
        (3, "2x", "x-1", 2, 3, "2x(x-1)=3^2=9 => No. 3x(x-2)?")
    ]
    # Fixed Q14, Q16
    l4_log[1] = (10, "x+1", "x-2", 1, 4, "(x+1)(x-2)=10 => x^2-x-2=10 => x^2-x-12=0 => (x-4)(x+3)=0 => x=4")
    l4_log[3] = (2, "x", "x+2", 3, 2, "x(x+2)=2^3=8 => x^2+2x-8=0 => (x-2)(x+4)=0 => x=2")
    
    for i in range(13, 17):
        b, f1, f2, target, ans, sol_path = l4_log[i-13]
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 4,
            "type": "short_answer",
            "marks": 4,
            "question": f"Solve $\\log_{{{b}}} ({f1}) + \\log_{{{b}}} ({f2}) = {target}$.",
            "question_zh": f"解方程 $\\log_{{{b}}} ({f1}) + \\log_{{{b}}} ({f2}) = {target}$。",
            "answer": f"{ans}",
            "correct_answer": f"{ans}",
            "solution_steps": [
                f"Combine logarithms: $\\log_{{{b}}} [({f1})({f2})] = {target}$.",
                f"Convert to exponential form: $({f1})({f2}) = {b}^{{{target}}} = {b**target if isinstance(target, int) else target}$.",
                f"Expanding: {sol_path.split('=>')[1].strip()}",
                f"Factoring: {sol_path.split('=>')[2].strip()}",
                f"Checking validity ($f(x)>0$), we reject negative roots.",
                f"Solution is $x = {ans}$."
            ],
            "solution_steps_zh": [
                f"合併對數：$\\log_{{{b}}} [({f1})({f2})] = {target}$。",
                f"化為指數形式：$({f1})({f2}) = {b}^{{{target}}} = {b**target if isinstance(target, int) else target}$。",
                f"展開：{sol_path.split('=>')[1].strip()}",
                f"因式分解：{sol_path.split('=>')[2].strip()}",
                f"檢查有效性（真數必須大於 0），捨去負根。",
                f"解為 $x = {ans}$。"
            ]
        })

    # ================= LEVEL 5: QUADRATICS IN DISGUISE (8 Questions) =================
    # Q17-Q20: Exponential substitution u = a^x
    # Q21-Q24: Logarithmic substitution u = log x
    
    l5_exp_quad = [
        (2, -5, 4, "0, 2"),    # 2^(2x) - 5*2^x + 4 = 0 => (2^x-1)(2^x-4)=0 => 2^x=1, 4
        (3, -12, 27, "1, 2"),  # 3^(2x) - 12*3^x + 27 = 0 => (3^x-3)(3^x-9)=0 => 3^x=3, 9
        (5, -6, 5, "0, 1"),    # 5^(2x) - 6*5^x + 5 = 0 => (5^x-1)(5^x-5)=0 => 5^x=1, 5
        (2, -7, -8, "3")       # 2^(2x) - 7*2^x - 8 = 0 => (2^x-8)(2^x+1)=0 => 2^x=8 => x=3
    ]
    for i in range(17, 21):
        base, b, c, ans = l5_exp_quad[i-17]
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": f"Solve ${base}^{{2x}} {'+' if b>0 else '-'} {abs(b)}({base}^x) {'+' if c>0 else '-'} {abs(c)} = 0$.",
            "question_zh": f"解方程 ${base}^{{2x}} {'+' if b>0 else '-'} {abs(b)}({base}^x) {'+' if c>0 else '-'} {abs(c)} = 0$。",
            "answer": f"{ans}",
            "correct_answer": f"{ans}",
            "solution_steps": [
                f"Let $u = {base}^x$. Then $u^2 {'+' if b>0 else '-'} {abs(b)}u {'+' if c>0 else '-'} {abs(c)} = 0$.",
                f"Solving for $u$: $u = {ans.split(',')[0].strip() if ',' in ans else ans}$ or other roots.",
                f"Substitute back: ${base}^x = u$.",
                f"Note: $u$ must be positive. Reject any $u \\le 0$.",
                f"The solutions are $x = {ans}$."
            ],
            "solution_steps_zh": [
                f"設 $u = {base}^x$。則 $u^2 {'+' if b>0 else '-'} {abs(b)}u {'+' if c>0 else '-'} {abs(c)} = 0$。",
                f"解 $u$：$u = {ans.split(',')[0].strip() if ',' in ans else ans}$ 或其他根。",
                f"代回：${base}^x = u$。",
                f"注意：$u$ 必須為正數。捨去任何 $u \\le 0$ 的值。",
                f"解得 $x = {ans}$。"
            ]
        })

    # Q21-Q24: Log substitution
    l5_log_quad = [
        (2, -3, 2, "2, 4"),    # (log2 x)^2 - 3 log2 x + 2 = 0 => log2 x = 1, 2 => x=2, 4
        (3, -4, 3, "3, 27"),   # (log3 x)^2 - 4 log3 x + 3 = 0 => log3 x = 1, 3 => x=3, 27
        (10, -1, -2, "0.1, 100"), # (log x)^2 - log x - 2 = 0 => log x = -1, 2 => x=10^-1, 10^2
        (5, -5, 6, "25, 125")  # (log5 x)^2 - 5 log5 x + 6 = 0 => log5 x = 2, 3 => x=25, 125
    ]
    for i in range(21, 25):
        base, b, c, ans = l5_log_quad[i-21]
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": f"Solve $(\\log_{{{base}}} x)^2 {'+' if b>0 else '-'} {abs(b)}(\\log_{{{base}}} x) {'+' if c>0 else '-'} {abs(c)} = 0$.",
            "question_zh": f"解方程 $(\\log_{{{base}}} x)^2 {'+' if b>0 else '-'} {abs(b)}(\\log_{{{base}}} x) {'+' if c>0 else '-'} {abs(c)} = 0$。",
            "answer": f"{ans}",
            "correct_answer": f"{ans}",
            "solution_steps": [
                f"Let $u = \\log_{{{base}}} x$. Then $u^2 {'+' if b>0 else '-'} {abs(b)}u {'+' if c>0 else '-'} {abs(c)} = 0$.",
                f"Solving for $u$: $u = \\dots$",
                f"Substitute back: $\\log_{{{base}}} x = u \\Rightarrow x = {base}^u$.",
                f"The solutions are $x = {ans}$."
            ],
            "solution_steps_zh": [
                f"設 $u = \\log_{{{base}}} x$。則 $u^2 {'+' if b>0 else '-'} {abs(b)}u {'+' if c>0 else '-'} {abs(c)} = 0$。",
                f"解 $u$：$u = \\dots$",
                f"代回：$\\log_{{{base}}} x = u \\Rightarrow x = {base}^u$。",
                f"解得 $x = {ans}$。"
            ]
        })

    # ================= LEVEL 7: LINEAR RELATIONS (6 Questions) =================
    # Q25-Q30: Graph analysis
    
    l7_linear = [
        (3, 0, 2, 2, 6, "y = 9 \\cdot 9^x"), # log3 y against x, (0,2), (2,6) => m=2, c=2 => log3 y = 2x+2 => y=3^(2x+2)=9*9^x
        (2, 0, 1, 3, 7, "y = 2 \\cdot 4^x"),  # log2 y against x, (0,1), (3,7) => m=2, c=1 => log2 y = 2x+1 => y=2*4^x
        (10, 0, 1.5, 2, 3.5, "y = 10^{1.5} \\cdot 100^x"), # No, let's use exact
        (5, 0, 1, 1, 3, "y = 5 \\cdot 25^x"), # m=2, c=1 => log5 y = 2x+1 => y=5*25^x
        (2, 0, 4, 4, 0, "y = 16 \\cdot (1/2)^x"), # m=-1, c=4 => log2 y = -x+4 => y=16*(0.5)^x
        (10, 0, 2, 2, 4, "y = 100 \\cdot 10x") # wait m=1, c=2 => log y = x+2 => y=100*10^x
    ]
    # Fixed Q27, Q30
    l7_linear[2] = (10, 0, 2, 1, 2.5, "y = 100 \\cdot (10^{0.5})^x") # m=0.5, c=2 => log y = 0.5x+2 => y=100*sqrt(10)^x
    l7_linear[5] = (3, 0, 1, 2, 0, "y = 3 \\cdot (1/3)^{0.5x}") # No, m=-0.5, c=1 => log3 y = -0.5x+1 => y=3*(3^-0.5)^x
    # Better Q30
    l7_linear[5] = (4, 0, 1, 2, 2, "y = 4 \\cdot 2^x") # m=0.5, c=1 => log4 y = 0.5x+1 => y=4*4^0.5x = 4*2^x

    for i in range(25, 31):
        base, x1, y1_v, x2, y2_v, ans = l7_linear[i-25]
        m = (y2_v - y1_v) / (x2 - x1)
        c = y1_v
        questions.append({
            "id": f"log_exp_{i:02d}",
            "topic_id": topic_id,
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 4,
            "question": f"The graph of $\\log_{{{base}}} y$ against $x$ is a straight line passing through $({x1}, {y1_v})$ and $({x2}, {y2_v})$. Express $y$ in terms of $x$ in the form $y = ab^x$.",
            "question_zh": f"$\\log_{{{base}}} y$ 對 $x$ 的圖像是一條穿過 $({x1}, {y1_v})$ 及 $({x2}, {y2_v})$ 的直線。試以 $y = ab^x$ 的形式將 $y$ 表示為 $x$ 的函數。",
            "answer": f"{ans}",
            "correct_answer": f"{ans}",
            "solution_steps": [
                f"The equation of the line is $\\log_{{{base}}} y = mx + c$.",
                f"Slope $m = \\frac{{{y2_v} - {y1_v}}}{{{x2} - {x1}}} = {m}$.",
                f"Intercept $c = {c}$.",
                f"So, $\\log_{{{base}}} y = {m}x + {c}$.",
                f"Rewrite in exponential form: $y = {base}^{{{m}x + {c}}}$.",
                f"$y = {base}^{c} \\cdot ({base}^{m})^x$.",
                f"The required form is $y = {ans}$."
            ],
            "solution_steps_zh": [
                f"直線方程為 $\\log_{{{base}}} y = mx + c$。",
                f"斜率 $m = \\frac{{{y2_v} - {y1_v}}}{{{x2} - {x1}}} = {m}$。",
                f"截距 $c = {c}$。",
                f"因此，$\\log_{{{base}}} y = {m}x + {c}$。",
                f"改寫為指數形式：$y = {base}^{{{m}x + {c}}}$。",
                f"$y = {base}^{c} \\cdot ({base}^{m})^x$。",
                f"所求之形式為 $y = {ans}$。"
            ]
        })

    return questions

if __name__ == "__main__":
    questions = generate_log_exp_questions()
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "math_content", "math_alg_log_exp_questions.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"Successfully generated {len(questions)} questions.")
