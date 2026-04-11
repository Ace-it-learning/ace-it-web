import json
import math
import random

def generate_apgp_questions():
    questions = []
    
    # helper for latex escaping
    def lx(text):
        return text.replace('\\', '\\\\')

    # Level 3 (Q1-Q8): Basic AP and GP
    for i in range(1, 9):
        is_ap = i <= 4
        qid = f"seq_series_{i:02d}"
        level = 3
        marks = 2
        
        if is_ap:
            a = random.randint(2, 10)
            d = random.randint(2, 8)
            n = random.randint(5, 15)
            tn = a + (n-1)*d
            sn = n * (2*a + (n-1)*d) // 2
            
            if i % 2 == 1:
                # Find T_n
                q = f"In an arithmetic progression (AP), the first term is ${a}$ and the common difference is ${d}$. Find the ${n}$-th term."
                q_zh = f"在一等差數列 (AP) 中，首項為 ${a}$，公差為 ${d}$。求第 ${n}$ 項。"
                ans = f"${tn}$"
                steps = [
                    f"Given $a = {a}$ and $d = {d}$.",
                    f"Using the general term formula $T_n = a + (n-1)d$.",
                    f"$T_{{{n}}} = {a} + ({n}-1)({d}) = {tn}$."
                ]
                steps_zh = [
                    f"已知 $a = {a}$ 且 $d = {d}$。",
                    f"使用通項公式 $T_n = a + (n-1)d$。",
                    f"$T_{{{n}}} = {a} + ({n}-1)({d}) = {tn}$。"
                ]
            else:
                # Find S_n
                q = f"Find the sum of the first ${n}$ terms of an arithmetic progression (AP) where the first term is ${a}$ and the common difference is ${d}$."
                q_zh = f"在一等差數列 (AP) 中，首項為 ${a}$，公差為 ${d}$。求首 ${n}$ 項之和。"
                ans = f"${sn}$"
                steps = [
                    f"Using the sum formula $S_n = \\\\frac{{n}}{{2}}[2a + (n-1)d]$.",
                    f"$S_{{{n}}} = \\\\frac{{{n}}}{{2}}[2({a}) + ({n}-1)({d})] = {sn}$."
                ]
                steps_zh = [
                    f"使用求和公式 $S_n = \\\\frac{{n}}{{2}}[2a + (n-1)d]$。",
                    f"$S_{{{n}}} = \\\\frac{{{n}}}{{2}}[2({a}) + ({n}-1)({d})] = {sn}$。"
                ]
        else:
            a = random.randint(2, 5)
            r = random.randint(2, 3)
            n = random.randint(4, 7)
            tn = a * (r ** (n-1))
            sn = a * (r**n - 1) // (r - 1)
            
            if i % 2 == 1:
                # Find T_n
                q = f"In a geometric progression (GP), the first term is ${a}$ and the common ratio is ${r}$. Find the ${n}$-th term."
                q_zh = f"在一等比數列 (GP) 中，首項為 ${a}$，公比為 ${r}$。求第 ${n}$ 項。"
                ans = f"${tn}$"
                steps = [
                    f"Given $a = {a}$ and $r = {r}$.",
                    f"Using the general term formula $T_n = ar^{{n-1}}$.",
                    f"$T_{{{n}}} = {a}({r})^{{{n}-1}} = {tn}$."
                ]
                steps_zh = [
                    f"已知 $a = {a}$ 且 $r = {r}$。",
                    f"使用通項公式 $T_n = ar^{{n-1}}$。",
                    f"$T_{{{n}}} = {a}({r})^{{{n}-1}} = {tn}$。"
                ]
            else:
                # Find S_n
                q = f"Find the sum of the first ${n}$ terms of a geometric progression (GP) where the first term is ${a}$ and the common ratio is ${r}$."
                q_zh = f"在一等比數列 (GP) 中，首項為 ${a}$，公比為 ${r}$。求首 ${n}$ 項之和。"
                ans = f"${sn}$"
                steps = [
                    f"Using the sum formula $S_n = \\\\frac{{a(r^n - 1)}}{{r - 1}}$.",
                    f"$S_{{{n}}} = \\\\frac{{{a}({r}^{{{n}}} - 1)}}{{{r} - 1}} = {sn}$."
                ]
                steps_zh = [
                    f"使用求和公式 $S_n = \\\\frac{{a(r^n - 1)}}{{r - 1}}$。",
                    f"$S_{{{n}}} = \\\\frac{{{a}({r}^{{{n}}} - 1)}}{{{r} - 1}} = {sn}$。"
                ]

        questions.append({
            "id": qid,
            "topic_id": "math_alg_apgp",
            "subject": "maths",
            "level": level,
            "type": "short_answer",
            "marks": marks,
            "question": q,
            "question_zh": q_zh,
            "answer": ans,
            "correct_answer": ans,
            "solution_steps": steps,
            "solution_steps_zh": steps_zh
        })

    # Level 4 (Q9-Q16): Simultaneous equations, S_inf
    for i in range(9, 17):
        qid = f"seq_series_{i:02d}"
        level = 4
        marks = 3
        
        if i <= 12:
            # Simultaneous equations in AP
            # T_p = v1, T_q = v2. Find a or d or S_n
            p, q_idx = random.sample([2, 3, 4, 5, 6, 7, 8], 2)
            if p > q_idx: p, q_idx = q_idx, p
            a = random.randint(5, 20)
            d = random.randint(3, 10)
            v1 = a + (p-1)*d
            v2 = a + (q_idx-1)*d
            
            q_txt = f"The ${p}$-th term of an arithmetic progression (AP) is ${v1}$ and the ${q_idx}$-th term is ${v2}$. Find the common difference $d$."
            q_zh = f"一等差數列 (AP) 的第 ${p}$ 項為 ${v1}$，第 ${q_idx}$ 項為 ${v2}$。求公差 $d$。"
            ans = f"${d}$"
            steps = [
                f"Let the first term be $a$ and the common difference be $d$.",
                f"$T_{{{p}}} = a + ({p}-1)d = {v1} \\\\quad \\\\dots (1)$",
                f"$T_{{{q_idx}}} = a + ({q_idx}-1)d = {v2} \\\\quad \\\\dots (2)$",
                f"Subtract (1) from (2): $({q_idx}-1)d - ({p}-1)d = {v2} - {v1}$",
                f"$({q_idx-p})d = {v2-v1} \\\\Rightarrow d = {d}$."
            ]
            steps_zh = [
                f"設首項為 $a$，公差為 $d$。",
                f"$T_{{{p}}} = a + ({p}-1)d = {v1} \\\\quad \\\\dots (1)$",
                f"$T_{{{q_idx}}} = a + ({q_idx}-1)d = {v2} \\\\quad \\\\dots (2)$",
                f"將 (1) 從 (2) 中減去：$({q_idx}-1)d - ({p}-1)d = {v2} - {v1}$",
                f"$({q_idx-p})d = {v2-v1} \\\\Rightarrow d = {d}$。"
            ]
        else:
            # S_inf
            a = random.randint(10, 50) * 2
            r_num = 1
            r_den = random.choice([2, 3, 4, 5])
            s_inf = a * r_den // (r_den - r_num)
            
            q_txt = f"Find the sum to infinity of a geometric progression (GP) with first term ${a}$ and common ratio $\\\\frac{{{r_num}}}{{{r_den}}}$."
            q_zh = f"一等比數列 (GP) 的首項為 ${a}$，公比為 $\\\\frac{{{r_num}}}{{{r_den}}}$。求該數列的無限項之和。"
            ans = f"${s_inf}$"
            steps = [
                f"Given $a = {a}$ and $r = \\\\frac{{{r_num}}}{{{r_den}}}$.",
                f"Using the sum to infinity formula $S_\\\\infty = \\\\frac{{a}}{{1-r}}$.",
                f"$S_\\\\infty = \\\\frac{{{a}}}{{1 - \\\\frac{{{r_num}}}{{{r_den}}}}} = \\\\frac{{{a}}}{{\\\\frac{{{r_den-r_num}}}{{{r_den}}}}} = {s_inf}$."
            ]
            steps_zh = [
                f"已知 $a = {a}$ 且 $r = \\\\frac{{{r_num}}}{{{r_den}}}$。",
                f"使用無限項求和公式 $S_\\\\infty = \\\\frac{{a}}{{1-r}}$。",
                f"$S_\\\\infty = \\\\frac{{{a}}}{{1 - \\\\frac{{{r_num}}}{{{r_den}}}}} = \\\\frac{{{a}}}{{\\\\frac{{{r_den-r_num}}}{{{r_den}}}}} = {s_inf}$。"
            ]

        questions.append({
            "id": qid,
            "topic_id": "math_alg_apgp",
            "subject": "maths",
            "level": level,
            "type": "short_answer",
            "marks": marks,
            "question": q_txt,
            "question_zh": q_zh,
            "answer": ans,
            "correct_answer": ans,
            "solution_steps": steps,
            "solution_steps_zh": steps_zh
        })

    # Level 5 (Q17-Q24): Mixed AP/GP, Word problems
    for i in range(17, 25):
        qid = f"seq_series_{i:02d}"
        level = 5
        marks = 3
        
        if i <= 20:
            # Mixed AP/GP property
            # x, y, z are AP, x, y-1, z are GP etc.
            # Simple case: a, b, c are AP => 2b = a+c
            # a, b, c are GP => b^2 = ac
            a = random.randint(1, 10)
            d = random.randint(2, 5)
            b = a + d
            c = a + 2*d
            # $a, b, c$ is AP. Find $x$ such that $a, b, c+x$ is GP.
            # (a+d)^2 = a(a+2d+x)
            # a^2 + 2ad + d^2 = a^2 + 2ad + ax
            # d^2 = ax => x = d^2/a
            # Let's ensure integer x
            a = random.choice([1, 2, 4])
            if a == 1: d = random.choice([2, 3, 4, 5])
            elif a == 2: d = random.choice([2, 4])
            else: d = 4
            
            x = (d**2) // a
            b = a + d
            c = a + 2*d
            
            q_txt = f"The terms ${a}$, ${b}$, and ${c}$ form an arithmetic progression (AP). If $x$ is added to the third term, the new sequence ${a}$, ${b}$, ${c}+x$ forms a geometric progression (GP). Find the value of $x$."
            q_zh = f"各項 ${a}$、${b}$ 和 ${c}$ 形成一個等差數列 (AP)。若將 $x$ 加到第三項，新數列 ${a}$、${b}$、${c}+x$ 形成一個等比數列 (GP)。求 $x$ 的值。"
            ans = f"${x}$"
            steps = [
                f"The initial sequence is an AP with common difference $d = {b} - {a} = {d}$.",
                f"The new sequence is ${a}$, ${b}$, ${c}+x$.",
                f"Since it is a GP, we have ${b}^2 = {a}({c}+x)$.",
                f"${b**2} = {a}({c}+x) \\\\Rightarrow {c}+x = {b**2 // a} \\\\Rightarrow x = {x}$."
            ]
            steps_zh = [
                f"原數列是一個公差 $d = {b} - {a} = {d}$ 的 AP。",
                f"新數列為 ${a}$、${b}$、${c}+x$。",
                f"由於它是 GP，我們有 ${b}^2 = {a}({c}+x)$。",
                f"${b**2} = {a}({c}+x) \\\\Rightarrow {c}+x = {b**2 // a} \\\\Rightarrow x = {x}$。"
            ]
        else:
            # Word problem: Compound growth (GP)
            # A city population grows by r% each year.
            p = random.randint(10000, 50000)
            rate_pct = random.randint(2, 5)
            years = random.randint(3, 5)
            final_p = p * ((1 + rate_pct/100)**years)
            final_p = round(final_p)
            
            q_txt = f"The population of a city is ${p}$ and it increases by ${rate_pct}\\\\%$ every year. Find the population after ${years}$ years, correct to the nearest integer."
            q_zh = f"某城市的入口為 ${p}$，且每年增加 ${rate_pct}\\\\%$。求 ${years}$ 年後的城市人口（準確至最接近的整數）。"
            ans = f"${final_p}$"
            steps = [
                f"This is a GP problem with $a = {p}$ and $r = 1 + {rate_pct}/100 = {1 + rate_pct/100}$.",
                f"After ${years}$ years, the population is $T_{{{years+1}}} = ar^{{{years}}}$.",
                f"Population $= {p}({1 + rate_pct/100})^{{{years}}} \\\\approx {final_p}$."
            ]
            steps_zh = [
                f"這是一個 GP 問題，其中 $a = {p}$ 且 $r = 1 + {rate_pct}/100 = {1 + rate_pct/100}$。",
                f"${years}$ 年後，人口為 $T_{{{years+1}}} = ar^{{{years}}}$。",
                f"人口 $= {p}({1 + rate_pct/100})^{{{years}}} \\\\approx {final_p}$。"
            ]

        questions.append({
            "id": qid,
            "topic_id": "math_alg_apgp",
            "subject": "maths",
            "level": level,
            "type": "short_answer",
            "marks": marks,
            "question": q_txt,
            "question_zh": q_zh,
            "answer": ans,
            "correct_answer": ans,
            "solution_steps": steps,
            "solution_steps_zh": steps_zh
        })

    # Level 7 (Q25-Q30): Elite HKDSE Section B traps
    for i in range(25, 31):
        qid = f"seq_series_{i:02d}"
        level = 7
        marks = 4
        
        if i <= 27:
            # Inequality for n
            # S_n > K. Find min n. 
            # AP sum
            a = random.randint(10, 20)
            d = random.randint(5, 10)
            k_target = random.randint(500, 1000)
            # n/2 * (2a + (n-1)d) > k_target
            # dn^2 + (2a-d)n - 2k > 0
            # Solve quadratic
            coeffs = [d, 2*a-d, -2*k_target]
            n_root = (-coeffs[1] + math.sqrt(coeffs[1]**2 - 4*coeffs[0]*coeffs[2])) / (2*coeffs[0])
            min_n = math.ceil(n_root)
            
            q_txt = f"In an arithmetic progression (AP), the first term is ${a}$ and the common difference is ${d}$. Find the minimum value of $n$ such that the sum of the first $n$ terms is greater than ${k_target}$."
            q_zh = f"在一等差數列 (AP) 中，首項為 ${a}$，公差為 ${d}$。求 $n$ 的最小值，使得首 $n$ 項之和超過 ${k_target}$。"
            ans = f"${min_n}$"
            steps = [
                f"Using the sum formula $S_n = \\\\frac{{n}}{{2}}[2({a}) + (n-1)({d})] > {k_target}$.",
                f"\\\\frac{{{d}}}{{2}}n^2 + ({a} - \\\\frac{{{d}}}{{2}})n - {k_target} > 0$.",
                f"Solving the quadratic inequality $n > {n_root:.2f}$.",
                f"Therefore, the minimum integer $n$ is ${min_n}$."
            ]
            steps_zh = [
                f"使用求和公式 $S_n = \\\\frac{{n}}{{2}}[2({a}) + (n-1)({d})] > {k_target}$。",
                f"\\\\frac{{{d}}}{{2}}n^2 + ({a} - \\\\frac{{{d}}}{{2}})n - {k_target} > 0$。",
                f"解二次不等式得 $n > {n_root:.2f}$。",
                f"因此，最小整數 $n$ 為 ${min_n}$。"
            ]
        else:
            # Logarithmic sequences
            # log(x), log(xy), log(xy^2)... 
            # This is an AP with a=log(x) and d=log(y)
            x_val = random.randint(2, 5)
            y_val = random.randint(2, 5)
            n_val = random.randint(4, 6)
            # Sum of log(x * y^k) for k=0 to n-1
            # = n*log(x) + (n(n-1)/2)*log(y)
            # = log(x^n * y^(n(n-1)/2))
            ans_val = f"\\\\log({x_val}^{{{n_val}}}{y_val}^{{{n_val*(n_val-1)//2}}})"
            
            q_txt = f"Consider the sequence $\\\\log({x_val})$, $\\\\log({x_val}\\\\cdot{y_val})$, $\\\\log({x_val}\\\\cdot{y_val}^2)$, $\\\\dots$. Find the sum of the first ${n_val}$ terms in terms of $\\\\log$."
            q_zh = f"考慮數列 $\\\\log({x_val})$、$\\\\log({x_val}\\\\cdot{y_val})$、$\\\\log({x_val}\\\\cdot{y_val}^2)$、$\\\\dots$。以 $\\\\log$ 表示首 ${n_val}$ 項之和。"
            ans = f"${ans_val}$"
            steps = [
                f"This sequence is an AP where the first term is $a = \\\\log({x_val})$ and common difference $d = \\\\log({y_val})$.",
                f"The sum is $S_{{{n_val}}} = \\\\frac{{{n_val}}}{{2}}[2\\\\log({x_val}) + ({n_val}-1)\\\\log({y_val})]$.",
                f"$S_{{{n_val}}} = {n_val}\\\\log({x_val}) + \\\\frac{{{n_val}({n_val}-1)}}{{2}}\\\\log({y_val}) = \\\\log({x_val}^{{{n_val}}}{y_val}^{{{n_val*(n_val-1)//2}}})$."
            ]
            steps_zh = [
                f"該數列是一個 AP，其中首項 $a = \\\\log({x_val})$，公差 $d = \\\\log({y_val})$。",
                f"總和 $S_{{{n_val}}} = \\\\frac{{{n_val}}}{{2}}[2\\\\log({x_val}) + ({n_val}-1)\\\\log({y_val})]$。",
                f"$S_{{{n_val}}} = {n_val}\\\\log({x_val}) + \\\\frac{{{n_val}({n_val}-1)}}{{2}}\\\\log({y_val}) = \\\\log({x_val}^{{{n_val}}}{y_val}^{{{n_val*(n_val-1)//2}}})$。"
            ]

        questions.append({
            "id": qid,
            "topic_id": "math_alg_apgp",
            "subject": "maths",
            "level": level,
            "type": "short_answer",
            "marks": marks,
            "question": q_txt,
            "question_zh": q_zh,
            "answer": ans,
            "correct_answer": ans,
            "solution_steps": steps,
            "solution_steps_zh": steps_zh
        })

    return questions

if __name__ == "__main__":
    qs = generate_apgp_questions()
    print(json.dumps(qs, indent=4))
