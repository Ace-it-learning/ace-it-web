import random
import json
import math

class FormulasGenerator:
    def __init__(self):
        self.questions = []

    def _add_q(self, diff, topic, question, question_zh, steps, steps_zh, answer):
        self.questions.append({
            "difficulty": diff,
            "topic": topic,
            "question": question,
            "question_zh": question_zh,
            "diagram_svg": None,
            "solution_steps": steps,
            "solution_steps_zh": steps_zh,
            "final_answer": answer
        })

    def generate_all(self):
        # 1-5 EASY
        self.q_easy_substitution_1()
        self.q_easy_substitution_2()
        self.q_easy_subject_1()
        self.q_easy_subject_2()
        self.q_easy_subject_3()

        # 6-10 MEDIUM
        self.q_med_substitution_neg()
        self.q_med_substitution_frac()
        self.q_med_subject_2step_1()
        self.q_med_subject_2step_2()
        self.q_med_subject_brackets()

        # 11-20 DSE STANDARD
        for i in range(3): self.q_dse_factorization_basic()
        for i in range(3): self.q_dse_fractions_basic()
        for i in range(2): self.q_dse_roots_powers()
        for i in range(2): self.q_dse_brackets_distribute()

        # 21-30 ELITE
        for i in range(3): self.q_elite_rational_linear()
        for _ in range(2): self.q_elite_double_fraction()
        for i in range(3): self.q_elite_multi_variable()
        for i in range(2): self.q_elite_complex_reciprocal()

        return self.questions

    # ================= EASY =================
    def q_easy_substitution_1(self):
        a = random.randint(2, 6)
        b = random.randint(2, 8)
        x = random.randint(1, 5)
        res = a*x + b
        self._add_q("Easy", "Substitution",
            f"Given $y = {a}x + {b}$, find the value of $y$ when $x = {x}$.",
            f"已知 $y = {a}x + {b}$，求當 $x = {x}$ 時 $y$ 的值。",
            [
                f"Substitute $x = {x}$ into the formula:",
                f"$y = {a}({x}) + {b}$",
                f"$y = {a*x} + {b}$",
                f"$y = {res}$"
            ],
            [
                f"將 $x = {x}$ 代入公式：",
                f"$y = {a}({x}) + {b}$",
                f"$y = {a*x} + {b}$",
                f"$y = {res}$"
            ],
            str(res))

    def q_easy_substitution_2(self):
        r = random.randint(2, 5)
        h = random.randint(6, 12)
        # Use V = pi r^2 h / 3
        vol_pi = (r**2 * h) // 3
        if (r**2 * h) % 3 != 0: vol_pi = f"\\frac{{{r**2 * h}}}{{3}}"
        
        self._add_q("Easy", "Substitution",
            f"The volume of a cone is given by $V = \\frac{{1}}{{3}}\\pi r^2 h$. Find $V$ in terms of $\\pi$ if $r = {r}$ and $h = {h}$.",
            f"圓錐體的體積公式為 $V = \\frac{{1}}{{3}}\\pi r^2 h$。若 $r = {r}$ 及 $h = {h}$，求以 $\\pi$ 表示的 $V$ 的值。",
            [
                f"Substitute $r = {r}$ and $h = {h}$:",
                f"$V = \\frac{{1}}{{3}}\\pi ({r})^2 ({h})$",
                f"$V = \\frac{{1}}{{3}}\\pi ({r**2}) ({h})$",
                f"$V = {vol_pi}\\pi$"
            ],
            [
                f"代入 $r = {r}$ 及 $h = {h}$：",
                f"$V = \\frac{{1}}{{3}}\\pi ({r})^2 ({h})$",
                f"$V = \\frac{{1}}{{3}}\\pi ({r**2}) ({h})$",
                f"$V = {vol_pi}\\pi$"
            ],
            f"{vol_pi}\\pi")

    def q_easy_subject_1(self):
        # x + a = y
        a = random.randint(2, 12)
        self._add_q("Easy", "Changing Subject",
            f"Make $x$ the subject of the formula $x + {a} = y$.",
            f"將 $x$ 設為公式 $x + {a} = y$ 的主項。",
            [
                f"To isolate $x$, subtract {a} from both sides:",
                f"$x = y - {a}$"
            ],
            [
                f"要獨立出 $x$，從等式兩邊減去 {a}：",
                f"$x = y - {a}$"
            ],
            f"x = y - {a}")

    def q_easy_subject_2(self):
        # ax = y
        a = random.randint(2, 9)
        self._add_q("Easy", "Changing Subject",
            f"Make $x$ the subject of the formula ${a}x = y$.",
            f"將 $x$ 設為公式 ${a}x = y$ 的主項。",
            [
                f"To isolate $x$, divide both sides by {a}:",
                f"$x = \\frac{{y}}{{{a}}}$"
            ],
            [
                f"要獨立出 $x$，將等式兩邊除以 {a}：",
                f"$x = \\frac{{y}}{{{a}}}$"
            ],
            f"x = \\frac{{y}}{{{a}}}")

    def q_easy_subject_3(self):
        # y = x - b
        b = random.randint(3, 15)
        self._add_q("Easy", "Changing Subject",
            f"Make $x$ the subject of the formula $y = x - {b}$.",
            f"將 $x$ 設為公式 $y = x - {b}$ 的主項。",
            [
                f"Add {b} to both sides:",
                f"$y + {b} = x$",
                "Swap the sides:",
                f"$x = y + {b}$"
            ],
            [
                f"等式兩邊同時加 {b}：",
                f"$y + {b} = x$",
                "左右對調：",
                f"$x = y + {b}$"
            ],
            f"x = y + {b}")

    # ================= MEDIUM =================
    def q_med_substitution_neg(self):
        # y = ax^2 + bx + c, x is negative
        a = random.randint(1, 3)
        b = random.randint(-5, 5)
        c = random.randint(-10, 10)
        x = random.randint(-4, -1)
        res = a*(x**2) + b*x + c
        self._add_q("Medium", "Substitution",
            f"Given $y = {a}x^2 + ({b})x + ({c})$, find $y$ when $x = {x}$.",
            f"已知 $y = {a}x^2 + ({b})x + ({c})$，求當 $x = {x}$ 時 $y$ 的值。",
            [
                f"Substitute $x = {x}$ with brackets:",
                f"$y = {a}({x})^2 + ({b})({x}) + ({c})$",
                f"$y = {a}({x**2}) + ({b*x}) + ({c})$",
                f"$y = {a*x**2} + {b*x} + {c}$",
                f"$y = {res}$"
            ],
            [
                f"使用括號代入 $x = {x}$：",
                f"$y = {a}({x})^2 + ({b})({x}) + ({c})$",
                f"$y = {a}({x**2}) + ({b*x}) + ({c})$",
                f"$y = {a*x**2} + {b*x} + {c}$",
                f"$y = {res}$"
            ],
            str(res))

    def q_med_substitution_frac(self):
        # y = (a+b)/c
        a = random.randint(10, 30)
        b = random.randint(5, 15)
        c = random.randint(2, 5)
        # Avoid simple integer if possible
        res_val = (a+b)/c
        res_str = f"{res_val:.1f}" if res_val % 1 != 0 else str(int(res_val))
        self._add_q("Medium", "Substitution",
            f"Given $z = \\frac{{x + y}}{{{c}}}$, find $z$ when $x = {a}$ and $y = {b}$.",
            f"已知 $z = \\frac{{x + y}}{{{c}}}$，求當 $x = {a}$ 且 $y = {b}$ 時 $z$ 的值。",
            [
                f"Substitute values into the fraction:",
                f"$z = \\frac{{{a} + {b}}}{{{c}}}$",
                f"$z = \\frac{{{a+b}}}{{{c}}}$",
                f"$z = {res_str}$"
            ],
            [
                f"將數值代入分數中：",
                f"$z = \\frac{{{a} + {b}}}{{{c}}}$",
                f"$z = \\frac{{{a+b}}}{{{c}}}$",
                f"$z = {res_str}$"
            ],
            res_str)

    def q_med_subject_2step_1(self):
        # y = ax + b
        a = random.randint(2, 7)
        b = random.randint(2, 10)
        self._add_q("Medium", "Changing Subject",
            f"Make $x$ the subject of the formula $y = {a}x + {b}$.",
            f"將 $x$ 設為公式 $y = {a}x + {b}$ 的主項。",
            [
                f"Subtract {b} from both sides:",
                f"$y - {b} = {a}x$",
                f"Divide both sides by {a}:",
                f"$x = \\frac{{y - {b}}}{{{a}}}$"
            ],
            [
                f"等式兩邊同時減去 {b}：",
                f"$y - {b} = {a}x$",
                f"兩邊同時除以 {a}：",
                f"$x = \\frac{{y - {b}}}{{{a}}}$"
            ],
            f"x = \\frac{{y - {b}}}{{{a}}}")

    def q_med_subject_2step_2(self):
        # y = (x - h) / k
        h = random.randint(1, 9)
        k = random.randint(2, 6)
        self._add_q("Medium", "Changing Subject",
            f"Make $x$ the subject of the formula $y = \\frac{{x - {h}}}{{{k}}}$.",
            f"將 $x$ 設為公式 $y = \\frac{{x - {h}}}{{{k}}}$ 的主項。",
            [
                f"Multiply both sides by {k} to remove the denominator:",
                f"{k}y = x - {h}",
                f"Add {h} to both sides:",
                f"x = {k}y + {h}"
            ],
            [
                f"兩邊同時乘以 {k} 以消除分母：",
                f"{k}y = x - {h}",
                f"兩邊同時加上 {h}：",
                f"x = {k}y + {h}"
            ],
            f"x = {k}y + {h}")

    def q_med_subject_brackets(self):
        # y = a(x + b)
        a = random.randint(2, 5)
        b = random.randint(1, 6)
        self._add_q("Medium", "Changing Subject",
            f"Make $x$ the subject of the formula $y = {a}(x + {b})$.",
            f"將 $x$ 設為公式 $y = {a}(x + {b})$ 的主項。",
            [
                f"Method 1: Divide by {a} first:",
                f"\\frac{{y}}{{{a}}} = x + {b}",
                f"x = \\frac{{y}}{{{a}}} - {b}",
                "Alternatively, expand first:",
                f"y = {a}x + {a*b}",
                f"y - {a*b} = {a}x",
                f"x = \\frac{{y - {a*b}}}{{{a}}}"
            ],
            [
                f"方法 1：先除以 {a}：",
                f"\\frac{{y}}{{{a}}} = x + {b}",
                f"x = \\frac{{y}}{{{a}}} - {b}",
                "或者先展開括號：",
                f"y = {a}x + {a*b}",
                f"y - {a*b} = {a}x",
                f"x = \\frac{{y - {a*b}}}{{{a}}}"
            ],
            f"x = \\frac{{y}}{{{a}}} - {b}")

    # ================= DSE STANDARD =================
    def q_dse_factorization_basic(self):
        # ax = b - cx  => x(a+c) = b
        a = random.choice(['a', 'k', 'm', 'p'])
        b = random.randint(2, 10)
        c = random.choice(['c', 'n', 'q'])
        self._add_q("DSE Standard", "Factorization",
            f"Make $x$ the subject of the formula ${a}x = {b} - {c}x$.",
            f"將 $x$ 設為公式 ${a}x = {b} - {c}x$ 的主項。",
            [
                f"Group all terms containing $x$ on one side:",
                f"${a}x + {c}x = {b}$",
                f"Factor out $x$ (The Golden Step):",
                f"$x({a} + {c}) = {b}$",
                f"Divide by the bracket term:",
                f"$x = \\frac{{{b}}}{{{a} + {c}}}$"
            ],
            [
                f"將所有含 $x$ 的項歸到一邊：",
                f"${a}x + {c}x = {b}$",
                f"提取公因式 $x$（關鍵步驟）：",
                f"$x({a} + {c}) = {b}$",
                f"除以括號內的項：",
                f"$x = \\frac{{{b}}}{{{a} + {c}}}$"
            ],
            f"x = \\frac{{{b}}}{{{a} + {c}}}")

    def q_dse_fractions_basic(self):
        # y = (x+a)/bX  => byx = x + a => x(by-1) = a
        a = random.randint(1, 9)
        b = random.randint(2, 5)
        self._add_q("DSE Standard", "Fractions",
            f"Make $x$ the subject of the formula $y = \\frac{{x + {a}}}{{{b}x}}$.",
            f"將 $x$ 設為公式 $y = \\frac{{x + {a}}}{{{b}x}}$ 的主項。",
            [
                f"Multiply both sides by ${b}x$ (Cross-multiplication):",
                f"${b}xy = x + {a}$",
                f"Move the $x$ term to the left side:",
                f"${b}xy - x = {a}$",
                f"Factor out $x$:",
                f"$x({b}y - 1) = {a}$",
                f"Final Step:",
                f"$x = \\frac{{{a}}}{{{b}y - 1}}$"
            ],
            [
                f"兩邊同時乘以 ${b}x$（交叉相乘）：",
                f"${b}xy = x + {a}$",
                f"將 $x$ 項移到左邊：",
                f"${b}xy - x = {a}$",
                f"提取公因式 $x$：",
                f"$x({b}y - 1) = {a}$",
                f"最終步驟：",
                f"$x = \\frac{{{a}}}{{{b}y - 1}}$"
            ],
            f"x = \\frac{{{a}}}{{{b}y - 1}}")

    def q_dse_roots_powers(self):
        # y = sqrt(x-a)/b => by = sqrt(x-a) => b^2 y^2 = x-a
        a = random.randint(1, 10)
        b = random.randint(2, 5)
        self._add_q("DSE Standard", "Roots & Powers",
            f"Make $x$ the subject of the formula $y = \\frac{{\\sqrt{{x - {a}}}}}{{{b}}}$.",
            f"將 $x$ 設為公式 $y = \\frac{{\\sqrt{{x - {a}}}}}{{{b}}}$ 的主項。",
            [
                f"Isolate the square root term:",
                f"${b}y = \\sqrt{{x - {a}}}$",
                f"Square both sides to remove the root:",
                f"$({b}y)^2 = x - {a}$",
                f"${b**2}y^2 = x - {a}$",
                f"Add {a} to both sides:",
                f"$x = {b**2}y^2 + {a}$"
            ],
            [
                f"首先獨立出根號項：",
                f"${b}y = \\sqrt{{x - {a}}}$",
                f"兩邊同時平方以消除根號：",
                f"$({b}y)^2 = x - {a}$",
                f"${b**2}y^2 = x - {a}$",
                f"兩邊同時加上 {a}：",
                f"$x = {b**2}y^2 + {a}$"
            ],
            f"x = {b**2}y^2 + {a}")

    def q_dse_brackets_distribute(self):
        # a(x+b) = cx + d => ax + ab = cx + d => x(a-c) = d - ab
        a = random.randint(4, 9)
        b = random.randint(2, 5)
        c = random.randint(1, 3)
        d = random.choice(['k', 'm', 'n', 'p'])
        self._add_q("DSE Standard", "Complex Expansion",
            f"Make $x$ the subject of the formula ${a}(x + {b}) = {c}x + {d}$.",
            f"將 $x$ 設為公式 ${a}(x + {b}) = {c}x + {d}$ 的主項。",
            [
                f"Step 1: Expand the bracket:",
                f"${a}x + {a*b} = {c}x + {d}$",
                f"Step 2: Group all $x$ terms on the left side:",
                f"${a}x - {c}x = {d} - {a*b}$",
                f"Step 3: Factor out $x$:",
                f"$x({a} - {c}) = {d} - {a*b}$",
                f"Step 4: Isolate $x$:",
                f"$x = \\frac{{{d} - {a*b}}}{{{a} - {c}}}$",
                f"Result: $x = \\frac{{{d} - {a*b}}}{{{a-c}}}$"
            ],
            [
                f"步驟 1：展開括號：",
                f"${a}x + {a*b} = {c}x + {d}$",
                f"步驟 2：將所有含 $x$ 的項歸到左邊：",
                f"${a}x - {c}x = {d} - {a*b}$",
                f"步驟 3：提取公因式 $x$：",
                f"$x({a} - {c}) = {d} - {a*b}$",
                f"步驟 4：獨立出 $x$：",
                f"$x = \\frac{{{d} - {a*b}}}{{{a} - {c}}}$",
                f"結果：$x = \\frac{{{d} - {a*b}}}{{{a-c}}}$"
            ],
            f"x = \\frac{{{d} - {a*b}}}{{{a-c}}}")

    # ================= ELITE =================
    def q_elite_rational_linear(self):
        # y = (ax+b)/(cx+d) => y(cx+d) = ax+b => cxy + dy = ax+b => x(cy-a) = b - dy
        a = random.randint(2, 6)
        b = random.randint(1, 12)
        c = random.randint(2, 5)
        d = random.randint(1, 12)
        var_y = random.choice(['y', 'k', 'P'])
        self._add_q("Elite", "Rational Functions",
            f"Make $x$ the subject of the formula ${var_y} = \\frac{{{a}x + {b}}}{{{c}x + {d}}}$.",
            f"將 $x$ 設為公式 ${var_y} = \\frac{{{a}x + {b}}}{{{c}x + {d}}}$ 的主項。",
            [
                f"Step 1: Multiply both sides by the denominator (${c}x + {d}$):",
                f"${var_y}({c}x + {d}) = {a}x + {b}$",
                f"Step 2: Expand the bracket:",
                f"${c}x{var_y} + {d}{var_y} = {a}x + {b}$",
                f"Step 3: Move all $x$-containing terms to the left side:",
                f"${c}x{var_y} - {a}x = {b} - {d}{var_y}$",
                f"Step 4: Factor out $x$ (The 'Golden Key'):",
                f"$x({c}{var_y} - {a}) = {b} - {d}{var_y}$",
                f"Step 5: Divide by the remaining bracket:",
                f"$x = \\frac{{{b} - {d}{var_y}}}{{{c}{var_y} - {a}}}$"
            ],
            [
                f"步驟 1：等式兩邊同時乘以分母 (${c}x + {d}$)：",
                f"${var_y}({c}x + {d}) = {a}x + {b}$",
                f"步驟 2：展開括號：",
                f"${c}x{var_y} + {d}{var_y} = {a}x + {b}$",
                f"步驟 3：將所有含 $x$ 的項歸到左邊：",
                f"${c}x{var_y} - {a}x = {b} - {d}{var_y}$",
                f"步驟 4：提取公因式 $x$（關鍵步驟）：",
                f"$x({c}{var_y} - {a}) = {b} - {d}{var_y}$",
                f"步驟 5：除以括號內的項：",
                f"$x = \\frac{{{b} - {d}{var_y}}}{{{c}{var_y} - {a}}}$"
            ],
            f"x = \\frac{{{b} - {d}{var_y}}}{{{c}{var_y} - {a}}}")

    def q_elite_double_fraction(self):
        # 1/x + 1/a = 1/y => 1/x = (a-y)/ay => x = ay/(a-y)
        a = random.randint(2, 9)
        self._add_q("Elite", "Double Fractions",
            f"Make $x$ the subject of the formula $\\frac{{1}}{{x}} + \\frac{{1}}{{{a}}} = \\frac{{1}}{{y}}$.",
            f"將 $x$ 設為公式 $\\frac{{1}}{{x}} + \\frac{{1}}{{{a}}} = \\frac{{1}}{{y}}$ 的主項。",
            [
                f"Step 1: Subtract $\\frac{{1}}{{{a}}}$ from both sides:",
                f"$\\frac{{1}}{{x}} = \\frac{{1}}{{y}} - \\frac{{1}}{{{a}}}$",
                f"Step 2: Combine the fractions on the right side using a common denominator ($ay$):",
                f"$\\frac{{1}}{{x}} = \\frac{{{a} - y}}{{{a}y}}$",
                f"Step 3: Reciprocate both sides to solve for $x$:",
                f"$x = \\frac{{{a}y}}{{{a} - y}}$"
            ],
            [
                f"步驟 1：等式兩邊同時減去 $\\frac{{1}}{{{a}}}$：",
                f"$\\frac{{1}}{{x}} = \\frac{{1}}{{y}} - \\frac{{1}}{{{a}}}$",
                f"步驟 2：使用通分（公分母為 $ay$）將右邊的分數合併：",
                f"$\\frac{{1}}{{x}} = \\frac{{{a} - y}}{{{a}y}}$",
                f"步驟 3：將等式兩邊同時取倒數，求出 $x$：",
                f"$x = \\frac{{{a}y}}{{{a} - y}}$"
            ],
            f"x = \\frac{{{a}y}}{{{a} - y}}")

    def q_elite_multi_variable(self):
        # S = n/2 [2a + (n-1)d] => solve for d
        self._add_q("Elite", "Complex Formula",
            f"Make $d$ the subject of the arithmetic sequence sum formula $S = \\frac{{n}}{{2}}[2a + (n - 1)d]$.",
            f"將 $d$ 設為等差數列求和公式 $S = \\frac{{n}}{{2}}[2a + (n - 1)d]$ 的主項。",
            [
                f"Step 1: Multiply both sides by 2:",
                f"$2S = n[2a + (n - 1)d]$",
                f"Step 2: Divide by $n$:",
                f"$\\frac{{2S}}{{n}} = 2a + (n - 1)d$",
                f"Step 3: Subtract $2a$:",
                f"$\\frac{{2S}}{{n}} - 2a = (n - 1)d$",
                f"Step 4: Divide by $(n - 1)$:",
                f"$d = \\frac{{\\frac{{2S}}{{n}} - 2a}}{{n - 1}}$",
                f"Step 5: Simplify the complex fraction (optional but recommended):",
                f"$d = \\frac{{2S - 2an}}{{n(n - 1)}}$"
            ],
            [
                f"步驟 1：兩邊同時乘以 2：",
                f"$2S = n[2a + (n - 1)d]$",
                f"步驟 2：兩邊同時除以 $n$：",
                f"$\\frac{{2S}}{{n}} = 2a + (n - 1)d$",
                f"步驟 3：兩邊同時減去 $2a$：",
                f"$\\frac{{2S}}{{n}} - 2a = (n - 1)d$",
                f"步驟 4：兩邊同時除以 $(n - 1)$：",
                f"$d = \\frac{{\\frac{{2S}}{{n}} - 2a}}{{n - 1}}$",
                f"步驟 5：化簡繁分數（可選，但建議進行）：",
                f"$d = \\frac{{2S - 2an}}{{n(n - 1)}}$"
            ],
            f"d = \\frac{{2S - 2an}}{{n(n - 1)}}")

    def q_elite_complex_reciprocal(self):
        # 1/f = 1/u + 1/v => make v subject
        self._add_q("Elite", "Reciprocals",
            f"Make $v$ the subject of the lens formula $\\frac{{1}}{{f}} = \\frac{{1}}{{u}} + \\frac{{1}}{{v}}$.",
            f"將 $v$ 設為透鏡公式 $\\frac{{1}}{{f}} = \\frac{{1}}{{u}} + \\frac{{1}}{{v}}$ 的主項。",
            [
                f"Step 1: Isolate the term with $v$:",
                f"\\frac{{1}}{{v}} = \\frac{{1}}{{f}} - \\frac{{1}}{{u}}",
                f"Step 2: Combine terms on the right using a common denominator:",
                f"\\frac{{1}}{{v}} = \\frac{{u - f}}{{uf}}",
                f"Step 3: Reciprocate both sides:",
                f"v = \\frac{{uf}}{{u - f}}$"
            ],
            [
                f"步驟 1：獨立出含 $v$ 的項：",
                f"\\frac{{1}}{{v}} = \\frac{{1}}{{f}} - \\frac{{1}}{{u}}",
                f"步驟 2：使用通分將右邊的項合併：",
                f"\\frac{{1}}{{v}} = \\frac{{u - f}}{{uf}}",
                f"步驟 3：將兩邊同時取倒數：",
                f"v = \\frac{{uf}}{{u - f}}$"
            ],
            f"v = \\frac{{uf}}{{u - f}}")

    def save_json(self, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.questions, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    gen = FormulasGenerator()
    questions = gen.generate_all()
    # Need exactly 30: 5+5+10+10
    # Currently defined: 5+5+10+10 (using loops for standard/elite)
    gen.save_json("formulas_questions.json")
    print(json.dumps(questions, indent=2, ensure_ascii=False))
