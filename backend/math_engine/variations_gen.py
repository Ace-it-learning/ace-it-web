import random
import json
from fractions import Fraction

def generate():
    qs = []
    # L3: Q1-8
    for i in range(1, 9):
        qid = f"alg_var_{i:02d}"
        if i <= 4:
            k = random.randint(2, 8)
            x1 = random.randint(2, 5)
            y1 = k * x1
            x2 = random.randint(6, 12)
            y2 = k * x2
            q = f"It is given that $y$ varies directly as $x$. When $x = {x1}$, $y = {y1}$. Find $y$ when $x = {x2}$."
            qz = f"已知 $y$ 隨 $x$ 正變。當 $x = {x1}$ 時，$y = {y1}$。求當 $x = {x2}$ 時 $y$ 的值。"
            ans = f"${y2}$"
            steps = [f"Let $y = kx$.", f"Substitute $x={x1}, y={y1}$: ${y1} = k({x1}) \\implies k = {k}$.", f"When $x={x2}$, $y = {k}({x2}) = {y2}$."]
            stepsz = [f"設 $y = kx$。", f"代入 $x={x1}, y={y1}$：${y1} = k({x1}) \\implies k = {k}$。", f"當 $x={x2}$ 時，$y = {k}({x2}) = {y2}$。"]
        else:
            x1 = random.choice([2, 4, 5])
            y1 = random.randint(10, 30)
            k = x1 * y1
            x2 = random.choice([8, 10, 20])
            y2v = k / x2
            y2s = f"{int(y2v)}" if y2v == int(y2v) else f"\\frac{{{Fraction(k, x2).numerator}}}{{{Fraction(k, x2).denominator}}}"
            q = f"It is given that $y$ varies inversely as $x$. When $x = {x1}$, $y = {y1}$. Find $y$ when $x = {x2}$."
            qz = f"已知 $y$ 隨 $x$ 反變。當 $x = {x1}$ 時，$y = {y1}$。求當 $x = {x2}$ 時 $y$ 的值。"
            ans = f"${y2s}$"
            steps = [f"Let $y = \\frac{{k}}{{x}}$.", f"Substitute $x={x1}, y={y1}$: ${y1} = \\frac{{k}}{{{x1}}} \\implies k = {k}$.", f"When $x={x2}$, $y = \\frac{{{k}}}{{{x2}}} = {y2s}$."]
            stepsz = [f"設 $y = \\frac{{k}}{{x}}$。", f"代入 $x={x1}, y={y1}$：${y1} = \\frac{{k}}{{{x1}}} \\implies k = {k}$。", f"當 $x={x2}$ 時，$y = \\frac{{{k}}}{{{x2}}} = {y2s}$。"]
        qs.append({"id": qid, "topic_id": "math_alg_variation", "subject": "maths", "level": 3, "type": "short_answer", "marks": 2, "question": q, "question_zh": qz, "answer": ans, "correct_answer": ans, "solution_steps": steps, "solution_steps_zh": stepsz})

    # L4: Q9-16
    for i in range(9, 17):
        qid = f"alg_var_{i:02d}"
        if i <= 12:
            k, x1, y1 = random.randint(2, 4), random.randint(2, 4), random.randint(2, 4)
            z1 = k * x1 / (y1**2)
            z1s = f"{int(z1)}" if z1 == int(z1) else f"\\frac{{{Fraction(k*x1, y1**2).numerator}}}{{{Fraction(k*x1, y1**2).denominator}}}"
            x2, y2 = random.randint(5, 8), 2
            z2v = k * x2 / (y2**2)
            z2s = f"{int(z2v)}" if z2v == int(z2v) else f"\\frac{{{Fraction(k*x2, y2**2).numerator}}}{{{Fraction(k*x2, y2**2).denominator}}}"
            q = f"It is given that $z$ varies directly as $x$ and inversely as the square of $y$. When $x = {x1}$ and $y = {y1}$, $z = {z1s}$. Find $z$ when $x = {x2}$ and $y = {y2}$."
            qz = f"已知 $z$ 隨 $x$ 正變且隨 $y$ 的平方反變。當 $x = {x1}$ 及 $y = {y1}$ 時，$z = {z1s}$。求當 $x = {x2}$ 及 $y = {y2}$ 時 $z$ 的值。"
            ans = f"${z2s}$"
            steps = [f"Let $z = \\frac{{kx}}{{y^2}}$.", f"Sub $x={x1}, y={y1}, z={z1s}$ to find $k={k}$.", f"When $x={x2}, y={y2}$, $z = \\frac{{{k}({x2})}}{{{y2}^2}} = {z2s}$."]
            stepsz = [f"設 $z = \\frac{{kx}}{{y^2}}$。", f"代入 $x={x1}, y={y1}, z={z1s}$ 求得 $k={k}$。", f"當 $x={x2}, y={y2}$ 時，$z = \\frac{{{k}({x2})}}{{{y2}^2}} = {z2s}$。"]
        else:
            xi, yd = random.choice([10, 20]), random.choice([10, 20])
            xm, ym = 1 + xi/100, 1 - yd/100
            zm = (xm**2) / ym
            pc = round((zm - 1) * 100, 1)
            q = f"It is given that $z$ varies directly as $x^2$ and inversely as $y$. If $x$ increases by ${xi}\\%$ and $y$ decreases by ${yd}\\%$, find the percentage change in $z$."
            qz = f"已知 $z$ 隨 $x^2$ 正變且隨 $y$ 反變。若 $x$ 增加 ${xi}\\%$ 及 $y$ 減少 ${yd}\\%$，求 $z$ 的百分比變化。"
            ans = f"${pc}\\%$"
            steps = [f"New $z' = \\frac{{k({xm}x)^2}}{{{ym}y}} = \\frac{{{xm}^2}}{{{ym}}} z = {zm:.3f}z$.", f"Change = $({zm:.3f}-1) \\times 100\\% = {pc}\\%$."]
            stepsz = [f"新 $z' = \\frac{{k({xm}x)^2}}{{{ym}y}} = \\frac{{{xm}^2}}{{{ym}}} z = {zm:.3f}z$。", f"變化 = $({zm:.3f}-1) \\times 100\\% = {pc}\\%$。"]
        qs.append({"id": qid, "topic_id": "math_alg_variation", "subject": "maths", "level": 4, "type": "short_answer", "marks": 3, "question": q, "question_zh": qz, "answer": ans, "correct_answer": ans, "solution_steps": steps, "solution_steps_zh": stepsz})

    # L5: Q17-24
    for i in range(17, 25):
        qid = f"alg_var_{i:02d}"
        k1, k2 = random.randint(10, 20), random.randint(2, 5)
        x1, x2 = 2, 4
        y1, y2 = k1 + k2*x1, k1 + k2*x2
        y4 = k1 + k2*6
        q = f"$y$ is partly constant and partly varies as $x$. When $x={x1}, y={y1}$; $x={x2}, y={y2}$. Find $y$ when $x=6$."
        qz = f"$y$ 一部分為常數，另一部分隨 $x$ 正變。當 $x={x1}, y={y1}$；$x={x2}, y={y2}$。求當 $x=6$ 時 $y$ 的值。"
        ans = f"${y4}$"
        steps = [f"Let $y = k_1 + k_2 x$.", f"Solve $y1=k1+k2({x1})$ and $y2=k1+k2({x2})$: $k_1={k1}, k_2={k2}$.", f"When $x=6, y={k1}+{k2}(6)={y4}$."]
        stepsz = [f"設 $y = k_1 + k_2 x$。", f"解 $y1=k1+k2({x1})$ 及 $y2=k1+k2({x2})$：$k_1={k1}, k_2={k2}$。", f"當 $x=6$ 時，$y={k1}+{k2}(6)={y4}$。"]
        qs.append({"id": qid, "topic_id": "math_alg_variation", "subject": "maths", "level": 5, "type": "short_answer", "marks": 4, "question": q, "question_zh": qz, "answer": ans, "correct_answer": ans, "solution_steps": steps, "solution_steps_zh": stepsz})

    # L7: Q25-30
    for i in range(25, 31):
        qid = f"alg_var_{i:02d}"
        k1, k2 = random.randint(100, 200), random.randint(5, 15)
        n1, n2 = 10, 20
        C1, C2 = k1*n1 + k2*(n1**2), k1*n2 + k2*(n2**2)
        n3 = 30
        C3 = k1*n3 + k2*(n3**2)
        q = f"The cost $C$ of a task is partly varies as $n$ and partly as $n^2$. If $n={n1}, C={C1}$ and $n={n2}, C={C2}$, find $C$ when $n={n3}$."
        qz = f"某項工程的成本 $C$ 一部分隨 $n$ 正變，另一部分隨 $n^2$ 正變。若 $n={n1}, C={C1}$ 且 $n={n2}, C={C2}$，求當 $n={n3}$ 時 $C$ 的值。"
        ans = f"${C3}$"
        steps = [f"Let $C = k_1 n + k_2 n^2$.", f"Solve simultaneous eq: $k_1={k1}, k_2={k2}$.", f"At $n={n3}, C = {k1}({n3}) + {k2}({n3}^2) = {C3}$."]
        stepsz = [f"設 $C = k_1 n + k_2 n^2$。", f"解聯立方程：$k_1={k1}, k_2={k2}$。", f"當 $n={n3}$ 時，$C = {k1}({n3}) + {k2}({n3}^2) = {C3}$。"]
        qs.append({"id": qid, "topic_id": "math_alg_variation", "subject": "maths", "level": 7, "type": "short_answer", "marks": 4, "question": q, "question_zh": qz, "answer": ans, "correct_answer": ans, "solution_steps": steps, "solution_steps_zh": stepsz})

    return qs

def escape(qs):
    for q in qs:
        for k in ["question", "question_zh", "answer", "correct_answer", "solution_steps", "solution_steps_zh"]:
            if isinstance(q[k], str):
                q[k] = q[k].replace('\\', '\\\\').replace('[', '\\\\left[').replace(']', '\\\\right]').replace('<', '\\\\lt').replace('>', '\\\\gt')
            elif isinstance(q[k], list):
                q[k] = [s.replace('\\', '\\\\').replace('[', '\\\\left[').replace(']', '\\\\right]').replace('<', '\\\\lt').replace('>', '\\\\gt') for s in q[k]]
    return qs

if __name__ == "__main__":
    res = generate()
    res = escape(res)
    print(json.dumps(res, indent=2))
