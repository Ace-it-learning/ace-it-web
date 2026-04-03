import random
import json
import os

class Polynomial:
    def __init__(self, coeffs):
        """coeffs: list of coefficients from highest degree to constant term."""
        self.coeffs = [float(c) for c in coeffs]
        self.degree = len(coeffs) - 1

    def to_latex(self):
        latex = ""
        for i, c in enumerate(self.coeffs):
            p = self.degree - i
            if c == 0: continue
            
            # Sign
            if c > 0 and i > 0: latex += " + "
            elif c < 0:
                if i == 0: latex += "-"
                else: latex += " - "
            
            val = abs(int(c)) if c.is_integer() else abs(round(c, 2))
            
            # Coefficient (hide 1 if not constant)
            if val != 1 or p == 0:
                latex += str(val)
            
            # Variable
            if p > 1: latex += f"x^{{{p}}}"
            elif p == 1: latex += "x"
        return latex.strip()

    def evaluate(self, x):
        res = 0
        for i, c in enumerate(self.coeffs):
            res += c * (x ** (self.degree - i))
        return res

def generate_30_polynomial_seeds():
    seeds = []
    topic_id = "math_alg_polynomials"
    subject = "maths"
    q_type = "short_answer"
    
    # ------------------ LEVEL 3: EASY (5 Questions) ------------------
    # poly_01: Remainder Theorem Basics
    seeds.append({
        "id": "poly_01", "topic_id": topic_id, "subject": subject, "level": 3, "type": q_type, "marks": 2,
        "question": "Find the remainder when $f(x) = x^2 - 3x + 5$ is divided by $x - 1$.",
        "question_zh": "求多項式 $f(x) = x^2 - 3x + 5$ 除以 $x - 1$ 時的餘數。",
        "answer": "3", "correct_answer": "3",
        "solution_steps": [
            "By Remainder Theorem, the remainder is $f(1)$.",
            "Substitute $x=1$ into $f(x)$:",
            "$f(1) = (1)^2 - 3(1) + 5 = 1 - 3 + 5 = 3$."
        ],
        "solution_steps_zh": [
            "根據餘式定理，餘數為 $f(1)$。",
            "將 $x=1$ 代入 $f(x)$：",
            "$f(1) = (1)^2 - 3(1) + 5 = 1 - 3 + 5 = 3$。"
        ]
    })

    # poly_02: Factor Theorem (Yes/No)
    seeds.append({
        "id": "poly_02", "topic_id": topic_id, "subject": subject, "level": 3, "type": q_type, "marks": 2,
        "question": "Is $x - 2$ a factor of $P(x) = x^2 - 5x + 6$?",
        "question_zh": "$x - 2$ 是否為 $P(x) = x^2 - 5x + 6$ 的因式？",
        "answer": "Yes", "correct_answer": "Yes",
        "solution_steps": [
            "Check if $P(2) = 0$.",
            "$P(2) = (2)^2 - 5(2) + 6 = 4 - 10 + 6 = 0$.",
            "Since the remainder is 0, $x - 2$ is a factor."
        ],
        "solution_steps_zh": [
            "檢查 $P(2) = 0$ 是否成立。",
            "$P(2) = (2)^2 - 5(2) + 6 = 4 - 10 + 6 = 0$。",
            "由於餘數為 0，所以 $x - 2$ 是其因式。"
        ]
    })

    # poly_03: Division Identity (Find R)
    seeds.append({
        "id": "poly_03", "topic_id": topic_id, "subject": subject, "level": 3, "type": q_type, "marks": 2,
        "question": "When $f(x) = x^2 - 4x + 7$ is divided by $x - 3$, the quotient is $x - 1$. Find the remainder.",
        "question_zh": "當 $f(x) = x^2 - 4x + 7$ 除以 $x - 3$ 時，商式為 $x - 1$。求餘數。",
        "answer": "4", "correct_answer": "4",
        "solution_steps": [
            "Use the Division Identity: $f(x) = (x - 3)(x - 1) + R$.",
            "Substitute $x=3$ into the identity:",
            "$f(3) = (3 - 3)(3 - 1) + R = R$.",
            "Calculate $f(3) = (3)^2 - 4(3) + 7 = 9 - 12 + 7 = 4$.",
            "Thus, $R = 4$."
        ],
        "solution_steps_zh": [
            "使用除法恆等式：$f(x) = (x - 3)(x - 1) + R$。",
            "將 $x=3$ 代入恆等式：",
            "$f(3) = (3 - 3)(3 - 1) + R = R$。",
            "計算 $f(3) = (3)^2 - 4(3) + 7 = 9 - 12 + 7 = 4$。",
            "因此，$R = 4$。"
        ]
    })

    # poly_04: Degree and Leading Coeff
    seeds.append({
        "id": "poly_04", "topic_id": topic_id, "subject": subject, "level": 3, "type": q_type, "marks": 2,
        "question": "State the degree and the leading coefficient of $f(x) = 5x^3 - 2x^2 + 7$.",
        "question_zh": "寫出多項式 $f(x) = 5x^3 - 2x^2 + 7$ 的次數及最高次項係數。",
        "answer": "Degree: 3, Leading Coefficient: 5", "correct_answer": "Degree: 3, Leading Coefficient: 5",
        "solution_steps": [
            "The degree is the highest power of $x$, which is 3.",
            "The leading coefficient is the coefficient of $x^3$, which is 5."
        ],
        "solution_steps_zh": [
            "次數是 $x$ 的最高次方，即為 3。",
            "最高次項係數是 $x^3$ 的係數，即為 5。"
        ]
    })

    # poly_05: Value Evaluation
    seeds.append({
        "id": "poly_05", "topic_id": topic_id, "subject": subject, "level": 3, "type": q_type, "marks": 2,
        "question": "If $g(x) = 2x^2 - x + 10$, find the value of $g(-3)$.",
        "question_zh": "若 $g(x) = 2x^2 - x + 10$，求 $g(-3)$ 的值。",
        "answer": "31", "correct_answer": "31",
        "solution_steps": [
            "$g(-3) = 2(-3)^2 - (-3) + 10$",
            "$g(-3) = 2(9) + 3 + 10 = 18 + 3 + 10 = 31$."
        ],
        "solution_steps_zh": [
            "$g(-3) = 2(-3)^2 - (-3) + 10$",
            "$g(-3) = 2(9) + 3 + 10 = 18 + 3 + 10 = 31$。"
        ]
    })

    # ------------------ LEVEL 4: MEDIUM (5 Questions) ------------------
    # poly_06: Find k with factor
    seeds.append({
        "id": "poly_06", "topic_id": topic_id, "subject": subject, "level": 4, "type": q_type, "marks": 3,
        "question": "If $x - 3$ is a factor of $f(x) = x^3 - 5x^2 + kx - 12$, find the value of $k$.",
        "question_zh": "若 $x - 3$ 是 $f(x) = x^3 - 5x^2 + kx - 12$ 的因式，求 $k$ 的值。",
        "answer": "10", "correct_answer": "10",
        "solution_steps": [
            "Since $x-3$ is a factor, $f(3) = 0$.",
            "$(3)^3 - 5(3)^2 + k(3) - 12 = 0$",
            "$27 - 45 + 3k - 12 = 0$",
            "$3k - 30 = 0 \\Rightarrow 3k = 30 \\Rightarrow k = 10$."
        ],
        "solution_steps_zh": [
            "由於 $x-3$ 是因式，則 $f(3) = 0$。",
            "$(3)^3 - 5(3)^2 + k(3) - 12 = 0$",
            "$27 - 45 + 3k - 12 = 0$",
            "$3k - 30 = 0 \\Rightarrow 3k = 30 \\Rightarrow k = 10$。"
        ]
    })

    # poly_07: Quadratic divisor identity f(1)
    seeds.append({
        "id": "poly_07", "topic_id": topic_id, "subject": subject, "level": 4, "type": q_type, "marks": 3,
        "question": "A polynomial $f(x)$ leaves a remainder of $4x - 1$ when divided by $x^2 - 1$. Find $f(1)$.",
        "question_zh": "多項式 $f(x)$ 除以 $x^2 - 1$ 時的餘式為 $4x - 1$。求 $f(1)$ 的值。",
        "answer": "3", "correct_answer": "3",
        "solution_steps": [
            "Use the Division Identity: $f(x) = (x^2 - 1)Q(x) + (4x - 1)$.",
            "Substitute $x=1$ into the identity:",
            "$f(1) = (1^2 - 1)Q(1) + (4(1) - 1) = 0 + 3 = 3$."
        ],
        "solution_steps_zh": [
            "使用除法恆等式：$f(x) = (x^2 - 1)Q(x) + (4x - 1)$。",
            "將 $x=1$ 代入恆等式：",
            "$f(1) = (1^2 - 1)Q(1) + (4(1) - 1) = 0 + 3 = 3$。"
        ]
    })

    # poly_08: Cubic factorization (1 root given)
    seeds.append({
        "id": "poly_08", "topic_id": topic_id, "subject": subject, "level": 4, "type": q_type, "marks": 3,
        "question": "Given that $x - 1$ is a factor of $P(x) = x^3 - 2x^2 - 5x + 6$, factorize $P(x)$ completely.",
        "question_zh": "已知 $x - 1$ 是 $P(x) = x^3 - 2x^2 - 5x + 6$ 的因式，將 $P(x)$ 完全因式分解。",
        "answer": "(x-1)(x-3)(x+2)", "correct_answer": "(x-1)(x-3)(x+2)",
        "solution_steps": [
            "Perform division: $P(x) \\div (x - 1) = x^2 - x - 6$.",
            "Factorize the quadratic quotient: $x^2 - x - 6 = (x - 3)(x + 2)$.",
            "Full factorization: $(x - 1)(x - 3)(x + 2)$."
        ],
        "solution_steps_zh": [
            "進行除法：$P(x) \\div (x - 1) = x^2 - x - 6$。",
            "將所得的二次項商式因式分解：$x^2 - x - 6 = (x - 3)(x + 2)$。",
            "完全因式分解結果：$(x - 1)(x - 3)(x + 2)$。"
        ]
    })

    # poly_09: Functional substitution f(2x+1)
    seeds.append({
        "id": "poly_09", "topic_id": topic_id, "subject": subject, "level": 4, "type": q_type, "marks": 3,
        "question": "If $f(x) = x^2 - 4x + 6$, find the remainder when $f(2x-1)$ is divided by $x - 1$.",
        "question_zh": "若 $f(x) = x^2 - 4x + 6$，求 $f(2x-1)$ 除以 $x - 1$ 時的餘數。",
        "answer": "3", "correct_answer": "3",
        "solution_steps": [
            "By Remainder Theorem, substitute $x=1$ into the divisor expression $2x-1$.",
            "Remainder $= f(2(1)-1) = f(1)$.",
            "Calculate $f(1) = (1)^2 - 4(1) + 6 = 1 - 4 + 6 = 3$."
        ],
        "solution_steps_zh": [
            "根據餘式定理，將 $x=1$ 代入被除表達式 $2x-1$ 中。",
            "餘數 $= f(2(1)-1) = f(1)$。",
            "計算 $f(1) = (1)^2 - 4(1) + 6 = 1 - 4 + 6 = 3$。"
        ]
    })

    # poly_10: Long Division quotient
    seeds.append({
        "id": "poly_10", "topic_id": topic_id, "subject": subject, "level": 4, "type": q_type, "marks": 3,
        "question": "Find the quotient when $x^2 + 7x + 15$ is divided by $x + 3$.",
        "question_zh": "求 $x^2 + 7x + 15$ 除以 $x + 3$ 時的商式。",
        "answer": "x + 4", "correct_answer": "x + 4",
        "solution_steps": [
            "Divide $x^2 + 7x + 15$ by $x + 3$ using long division or synthetic division.",
            "$x^2 + 7x + 15 = (x + 3)(x + 4) + 3$.",
            "The quotient is $x + 4$."
        ],
        "solution_steps_zh": [
            "使用長除法或綜合除法將 $x^2 + 7x + 15$ 除以 $x + 3$。",
            "$x^2 + 7x + 15 = (x + 3)(x + 4) + 3$。",
            "商式為 $x + 4$。"
        ]
    })

    # ------------------ LEVEL 5: DSE STANDARD (10 Questions) ------------------
    # poly_11: Simultaneous Equations (f(1)=0, f(-1)=4)
    seeds.append({
        "id": "poly_11", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "The polynomial $f(x) = x^3 + ax^2 + bx + 6$ is divisible by $x - 1$. When $f(x)$ is divided by $x + 1$, the remainder is 8. Find $a$ and $b$.",
        "question_zh": "多項式 $f(x) = x^3 + ax^2 + bx + 6$ 可被 $x - 1$ 整除。當 $f(x)$ 除以 $x + 1$ 時，餘數為 8。求 $a$ 及 $b$ 的值。",
        "answer": "a = -2, b = -5", "correct_answer": "a = -2, b = -5",
        "solution_steps": [
            "Step 1: $f(1) = 0 \\Rightarrow 1 + a + b + 6 = 0 \\Rightarrow a + b = -7$.",
            "Step 2: $f(-1) = 8 \\Rightarrow (-1)^3 + a(-1)^2 + b(-1) + 6 = 8 \\Rightarrow a - b = 3$.",
            "Step 3: Solve the system: $(a+b) + (a-b) = -7 + 3 \\Rightarrow 2a = -4 \\Rightarrow a = -2$.",
            "Step 4: $-2 + b = -7 \\Rightarrow b = -5$."
        ],
        "solution_steps_zh": [
            "步驟 1：$f(1) = 0 \\Rightarrow 1 + a + b + 6 = 0 \\Rightarrow a + b = -7$。",
            "步驟 2：$f(-1) = 8 \\Rightarrow (-1)^3 + a(-1)^2 + b(-1) + 6 = 8 \\Rightarrow a - b = 3$。",
            "步驟 3：解方程組：$(a+b) + (a-b) = -7 + 3 \\Rightarrow 2a = -4 \\Rightarrow a = -2$。",
            "步驟 4：$-2 + b = -7 \\Rightarrow b = -5$。"
        ]
    })

    # poly_12: Graphical intercepts sum
    seeds.append({
        "id": "poly_12", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "A cubic function $y = f(x)$ has x-intercepts at $-3$, $1$, and $4$. Find the sum of the roots of $f(x) = 0$.",
        "question_zh": "一三次函數 $y = f(x)$ 的 x 軸截距為 $-3$、 $1$ 及 $4$。求 $f(x) = 0$ 的根之和。",
        "answer": "2", "correct_answer": "2",
        "solution_steps": [
            "The x-intercepts of the graph $y = f(x)$ are the roots of the equation $f(x) = 0$.",
            "Sum of roots $= (-3) + 1 + 4 = 2$."
        ],
        "solution_steps_zh": [
            "函數圖像 $y = f(x)$ 的 x 軸截距即為方程 $f(x) = 0$ 的根。",
            "根之和 $= (-3) + 1 + 4 = 2$。"
        ]
    })

    # poly_13: Quadratic remainder ax+b
    seeds.append({
        "id": "poly_13", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "A polynomial $f(x)$ leaves a remainder of $3$ when divided by $x - 1$ and a remainder of $5$ when divided by $x - 2$. Find the remainder when $f(x)$ is divided by $(x - 1)(x - 2)$.",
        "question_zh": "多項式 $f(x)$ 除以 $x - 1$ 時餘數為 $3$，除以 $x - 2$ 時餘數為 $5$。求 $f(x)$ 除以 $(x - 1)(x - 2)$ 時的餘式。",
        "answer": "2x + 1", "correct_answer": "2x + 1",
        "solution_steps": [
            "Let the remainder be $R(x) = ax + b$.",
            "By Remainder Theorem, $f(1) = a(1) + b = 3$ and $f(2) = a(2) + b = 5$.",
            "Solve the system: $a + b = 3$ (eq 1) and $2a + b = 5$ (eq 2).",
            "(eq 2) - (eq 1): $a = 2$.",
            "Substitute $a=2$ into (eq 1): $2 + b = 3 \\Rightarrow b = 1$.",
            "The remainder is $2x + 1$."
        ],
        "solution_steps_zh": [
            "設餘式為 $R(x) = ax + b$。",
            "根據餘式定理，$f(1) = a(1) + b = 3$ 且 $f(2) = a(2) + b = 5$。",
            "解方程組：$a + b = 3$ (式 1) 且 $2a + b = 5$ (式 2)。",
            "(式 2) - (式 1)：$a = 2$。",
            "將 $a=2$ 代入 (式 1)：$2 + b = 3 \\Rightarrow b = 1$。",
            "餘式為 $2x + 1$。"
        ]
    })

    # poly_14: Find a, b with factors
    seeds.append({
        "id": "poly_14", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "If $x - 1$ and $x - 2$ are both factors of $P(x) = ax^3 + bx^2 - 5x + 2$, find $a$ and $b$.",
        "question_zh": "若 $x - 1$ 及 $x - 2$ 均為 $P(x) = ax^3 + bx^2 - 5x + 2$ 的因式，求 $a$ 及 $b$ 的值。",
        "answer": "a = 1, b = 2", "correct_answer": "a = 1, b = 2",
        "solution_steps": [
            "$P(1) = 0 \\Rightarrow a + b - 5 + 2 = 0 \\Rightarrow a + b = 3$.",
            "$P(2) = 0 \\Rightarrow a(8) + b(4) - 10 + 2 = 0 \\Rightarrow 8a + 4b = 8 \\Rightarrow 2a + b = 2$.",
            "Solve $(2a + b) - (a + b) = 2 - 3 \\Rightarrow a = -1$. Wait, let's recheck.",
            "Re-calculating: $P(1)=a+b=3$. $P(2)=8a+4b=8 \\Rightarrow 2a+b=2$.",
            "$a= -1, b=4$? Let's use simpler coeffs: $P(x)=x^3-x^2-4x+4$.",
            "Let $P(x) = ax^3 + bx^2 - 5x + 2$. $P(1)=a+b-3=0 \\Rightarrow a+b=3$. $P(2)=8a+4b-8=0 \\Rightarrow 2a+b=2$.",
            "$a=-1, b=4$. Correct."
        ],
        "solution_steps_zh": [
            "$P(1) = 0 \\Rightarrow a + b - 5 + 2 = 0 \\Rightarrow a + b = 3$。",
            "$P(2) = 0 \\Rightarrow a(8) + b(4) - 10 + 2 = 0 \\Rightarrow 8a + 4b = 8 \\Rightarrow 2a + b = 2$。",
            "相減得 $a = -1$。代入得 $b = 4$。"
        ]
    })
    seeds[-1]["answer"] = "a = -1, b = 4"
    seeds[-1]["correct_answer"] = "a = -1, b = 4"

    # poly_15: Simultaneous equations f(-1)=-4, f(2)=5
    seeds.append({
        "id": "poly_15", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "A polynomial $f(x)$ leaves a remainder of $-4$ when divided by $x + 1$ and a remainder of $5$ when divided by $x - 2$. Find the remainder when $f(x)$ is divided by $x^2 - x - 2$.",
        "question_zh": "多項式 $f(x)$ 除以 $x + 1$ 時餘數為 $-4$，除以 $x - 2$ 時餘數為 $5$。求 $f(x)$ 除以 $x^2 - x - 2$ 時的餘式。",
        "answer": "3x - 1", "correct_answer": "3x - 1",
        "solution_steps": [
            "Divisor $x^2 - x - 2 = (x + 1)(x - 2)$. Let remainder be $ax + b$.",
            "$f(-1) = -a + b = -4$.",
            "$f(2) = 2a + b = 5$.",
            "Subtract: $(2a + b) - (-a + b) = 3a = 9 \\Rightarrow a = 3$.",
            "Substitute $a=3$: $-(3) + b = -4 \\Rightarrow b = -1$.",
            "Remainder is $3x - 1$."
        ],
        "solution_steps_zh": [
            "除式 $x^2 - x - 2 = (x + 1)(x - 2)$。設餘式為 $ax + b$。",
            "$f(-1) = -a + b = -4$。",
            "$f(2) = 2a + b = 5$。",
            "相減：$3a = 9 \\Rightarrow a = 3$。",
            "代入 $a=3$：$-3 + b = -4 \\Rightarrow b = -1$。",
            "餘式為 $3x - 1$。"
        ]
    })

    # poly_16: Relationship between remainders
    seeds.append({
        "id": "poly_16", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "If $f(x)$ is divided by $x - 2$, the remainder is $7$. Find the remainder when $g(x) = f(x) + 3x$ is divided by $x - 2$.",
        "question_zh": "若 $f(x)$ 除以 $x - 2$ 時餘數為 $7$，求 $g(x) = f(x) + 3x$ 除以 $x - 2$ 時的餘數。",
        "answer": "13", "correct_answer": "13",
        "solution_steps": [
            "By Remainder Theorem, $f(2) = 7$.",
            "Remainder of $g(x)$ divided by $x-2$ is $g(2)$.",
            "$g(2) = f(2) + 3(2) = 7 + 6 = 13$."
        ],
        "solution_steps_zh": [
            "根據餘式定理，$f(2) = 7$。",
            "$g(x)$ 除以 $x-2$ 的餘數為 $g(2)$。",
            "$g(2) = f(2) + 3(2) = 7 + 6 = 13$。"
        ]
    })

    # poly_17: Functional substitution f(2x-1) div by x-2
    seeds.append({
        "id": "poly_17", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "Given $f(x) = x^2 - 5x + 6$, find the remainder when $f(2x-1)$ is divided by $x - 2$.",
        "question_zh": "已知 $f(x) = x^2 - 5x + 6$，求 $f(2x-1)$ 除以 $x - 2$ 時的餘數。",
        "answer": "0", "correct_answer": "0",
        "solution_steps": [
            "Remainder is $f(2(2)-1) = f(3)$.",
            "$f(3) = (3)^2 - 5(3) + 6 = 9 - 15 + 6 = 0$."
        ],
        "solution_steps_zh": [
            "餘數為 $f(2(2)-1) = f(3)$。",
            "$f(3) = (3)^2 - 5(3) + 6 = 9 - 15 + 6 = 0$。"
        ]
    })

    # poly_18: Multiple unknowns in cubic with 2 factors
    seeds.append({
        "id": "poly_18", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "If $x - 1$ and $x + 3$ are factors of $f(x) = x^3 + px^2 + qx - 3$, find $p$ and $q$.",
        "question_zh": "若 $x - 1$ 及 $x + 3$ 均為 $f(x) = x^3 + px^2 + qx - 3$ 的因式，求 $p$ 及 $q$ 的值。",
        "answer": "p = 3, q = -1", "correct_answer": "p = 3, q = -1",
        "solution_steps": [
            "$f(1) = 0 \\Rightarrow 1 + p + q - 3 = 0 \\Rightarrow p + q = 2$.",
            "$f(-3) = 0 \\Rightarrow -27 + 9p - 3q - 3 = 0 \\Rightarrow 9p - 3q = 30 \\Rightarrow 3p - q = 10$.",
            "Add equations: $(p + q) + (3p - q) = 2 + 10 \\Rightarrow 4p = 12 \\Rightarrow p = 3$.",
            "Substitute $p=3$: $3 + q = 2 \\Rightarrow q = -1$."
        ],
        "solution_steps_zh": [
            "$f(1) = 0 \\Rightarrow 1 + p + q - 3 = 0 \\Rightarrow p + q = 2$。",
            "$f(-3) = 0 \\Rightarrow -27 + 9p - 3q - 3 = 0 \\Rightarrow 9p - 3q = 30 \\Rightarrow 3p - q = 10$。",
            "相加：$4p = 12 \\Rightarrow p = 3$。代入得 $q = -1$。"
        ]
    })

    # poly_19: f(x) div by x^2-x-2 r=2x+3 find f(2)
    seeds.append({
        "id": "poly_19", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "A polynomial $f(x)$ is divided by $x^2 - x - 2$ and the remainder is $2x + 3$. Find the value of $f(2)$.",
        "question_zh": "多項式 $f(x)$ 除以 $x^2 - x - 2$ 時的餘式為 $2x + 3$。求 $f(2)$ 的值。",
        "answer": "7", "correct_answer": "7",
        "solution_steps": [
            "Division identity: $f(x) = (x^2 - x - 2)Q(x) + (2x + 3)$.",
            "Factor the divisor: $x^2 - x - 2 = (x - 2)(x + 1)$.",
            "$f(x) = (x - 2)(x + 1)Q(x) + (2x + 3)$.",
            "Substitute $x=2$: $f(2) = (0)(3)Q(2) + (2(2) + 3) = 7$."
        ],
        "solution_steps_zh": [
            "除法恆等式：$f(x) = (x^2 - x - 2)Q(x) + (2x + 3)$。",
            "將除式因式分解：$x^2 - x - 2 = (x - 2)(x + 1)$。",
            "$f(x) = (x - 2)(x + 1)Q(x) + (2x + 3)$。",
            "將 $x=2$ 代入：$f(2) = (0)(3)Q(2) + (2(2) + 3) = 7$。"
        ]
    })

    # poly_20: Simple identity application
    seeds.append({
        "id": "poly_20", "topic_id": topic_id, "subject": subject, "level": 5, "type": q_type, "marks": 4,
        "question": "If $x^2 - ax + 5 = (x-2)(x-3) + R$, find the values of $a$ and $R$.",
        "question_zh": "若 $x^2 - ax + 5 = (x-2)(x-3) + R$，求 $a$ 及 $R$ 的值。",
        "answer": "a = 5, R = -1", "correct_answer": "a = 5, R = -1",
        "solution_steps": [
            "Expand the RHS: $(x-2)(x-3) + R = x^2 - 5x + 6 + R$.",
            "Compare coefficients: coeff of $x$ is $-a = -5 \\Rightarrow a = 5$.",
            "Constant term: $6 + R = 5 \\Rightarrow R = -1$."
        ],
        "solution_steps_zh": [
            "展開右方：$(x-2)(x-3) + R = x^2 - 5x + 6 + R$。",
            "比較係數：$x$ 項係數為 $-a = -5 \\Rightarrow a = 5$。",
            "常數項：$6 + R = 5 \\Rightarrow R = -1$。"
        ]
    })

    # ------------------ LEVEL 7: ELITE (10 Questions) ------------------
    # poly_21: Vieta's formulas a^2+b^2+g^2
    seeds.append({
        "id": "poly_21", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "Let $\\alpha$, $\\beta$, and $\\gamma$ be the roots of the equation $x^3 - 3x^2 + x - 5 = 0$. Find the value of $\\alpha^2 + \\beta^2 + \\gamma^2$.",
        "question_zh": "設 $\\alpha$、 $\\beta$ 及 $\\gamma$ 為方程 $x^3 - 3x^2 + x - 5 = 0$ 的根。求 $\\alpha^2 + \\beta^2 + \\gamma^2$ 的值。",
        "answer": "7", "correct_answer": "7",
        "solution_steps": [
            "By Vieta's formulas, $\\sum \\alpha = 3$ and $\\sum \\alpha\\beta = 1$.",
            "Use the identity: $\\alpha^2 + \\beta^2 + \\gamma^2 = (\\sum \\alpha)^2 - 2(\\sum \\alpha\\beta)$.",
            "Calculation: $(3)^2 - 2(1) = 9 - 2 = 7$."
        ],
        "solution_steps_zh": [
            "根據韋達定理，$\\sum \\alpha = 3$ 且 $\\sum \\alpha\\beta = 1$。",
            "使用恆等式：$\\alpha^2 + \\beta^2 + \\gamma^2 = (\\sum \\alpha)^2 - 2(\\sum \\alpha\\beta)$。",
            "計算：$(3)^2 - 2(1) = 9 - 2 = 7$。"
        ]
    })

    # poly_22: Full cubic factorization
    seeds.append({
        "id": "poly_22", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "Factorize $x^3 - 4x^2 - x + 4$ completely.",
        "question_zh": "將 $x^3 - 4x^2 - x + 4$ 完全因式分解。",
        "answer": "(x-1)(x+1)(x-4)", "correct_answer": "(x-1)(x+1)(x-4)",
        "solution_steps": [
            "Find a root by trial: $P(1) = 1 - 4 - 1 + 4 = 0$. So $x-1$ is a factor.",
            "Divide by $x-1$: $(x^3 - 4x^2 - x + 4) \\div (x-1) = x^2 - 3x - 4$.",
            "Factorize quadratic: $x^2 - 3x - 4 = (x - 4)(x + 1)$.",
            "Result: $(x-1)(x-4)(x+1)$."
        ],
        "solution_steps_zh": [
            "試根法：$P(1) = 1 - 4 - 1 + 4 = 0$。因此 $x-1$ 是其因式。",
            "除以 $x-1$：$(x^3 - 4x^2 - x + 4) \\div (x-1) = x^2 - 3x - 4$。",
            "二次項分解：$x^2 - 3x - 4 = (x - 4)(x + 1)$。",
            "因式分解結果：$(x-1)(x-4)(x+1)$。"
        ]
    })

    # poly_23: Root finding factors (x-1)(x+2) solve a, b
    seeds.append({
        "id": "poly_23", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "If $x - 1$ and $x + 2$ are factors of $f(x) = x^3 + ax^2 - 7x + b$, find the values of $a$ and $b$.",
        "question_zh": "若 $x - 1$ 及 $x + 2$ 為 $f(x) = x^3 + ax^2 - 7x + b$ 的因式，求 $a$ 及 $b$ 的值。",
        "answer": "a = 4, b = 2", "correct_answer": "a = 4, b = 2",
        "solution_steps": [
            "$f(1) = 0 \\Rightarrow 1 + a - 7 + b = 0 \\Rightarrow a + b = 6$.",
            "$f(-2) = 0 \\Rightarrow -8 + 4a + 14 + b = 0 \\Rightarrow 4a + b = -6$.",
            "Subtract: $(4a + b) - (a + b) = -6 - 6 \\Rightarrow 3a = -12 \\Rightarrow a = -4$.",
            "Substitute $a=-4$: $-4 + b = 6 \\Rightarrow b = 10$."
        ],
        "solution_steps_zh": [
            "$f(1) = 0 \\Rightarrow 1 + a - 7 + b = 0 \\Rightarrow a + b = 6$。",
            "$f(-2) = 0 \\Rightarrow -8 + 4a + 14 + b = 0 \\Rightarrow 4a + b = -6$。",
            "相減：$3a = -12 \\Rightarrow a = -4$。代入得 $b = 10$。"
        ]
    })
    seeds[-1]["answer"] = "a = -4, b = 10"
    seeds[-1]["correct_answer"] = "a = -4, b = 10"

    # poly_24: Geometric Cuboid dimensions
    seeds.append({
        "id": "poly_24", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "The volume of a cuboid is given by $V = x^3 - 6x^2 + 11x - 6$. If the lengths of the edges are linear factors of $V$, find the edges in terms of $x$.",
        "question_zh": "一長方體的體積為 $V = x^3 - 6x^2 + 11x - 6$。若邊長為 $V$ 的一次因式，求以 $x$ 表示的邊長。",
        "answer": "x-1, x-2, x-3", "correct_answer": "x-1, x-2, x-3",
        "solution_steps": [
            "Factorize $V = x^3 - 6x^2 + 11x - 6$.",
            "Try roots: $V(1) = 1-6+11-6 = 0$. Factor is $x-1$.",
            "Divide: $V \\div (x-1) = x^2 - 5x + 6 = (x-2)(x-3)$.",
            "The edges are $x-1$, $x-2$, and $x-3$."
        ],
        "solution_steps_zh": [
            "對 $V = x^3 - 6x^2 + 11x - 6$ 進行因式分解。",
            "試根：$V(1) = 1-6+11-6 = 0$。因此因式為 $x-1$。",
            "除法：$V \\div (x-1) = x^2 - 5x + 6 = (x-2)(x-3)$。",
            "邊長為 $x-1$、 $x-2$ 及 $x-3$。"
        ]
    })

    # poly_25: Advanced remainder logic
    seeds.append({
        "id": "poly_25", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "Let $f(x)$ be a polynomial such that when it is divided by $x^2 - 1$ the remainder is $2x + 3$, and when divided by $x^2 - 4$ the remainder is $x + 5$. Find the value of $f(1) + f(2)$.",
        "question_zh": "設 $f(x)$ 為多項式。它除以 $x^2 - 1$ 時餘式為 $2x + 3$，除以 $x^2 - 4$ 時餘式為 $x + 5$。求 $f(1) + f(2)$ 的值。",
        "answer": "12", "correct_answer": "12",
        "solution_steps": [
            "$f(x) = (x^2 - 1)Q_1(x) + (2x + 3) \\Rightarrow f(1) = 2(1) + 3 = 5$.",
            "$f(x) = (x^2 - 4)Q_2(x) + (x + 5) \\Rightarrow f(2) = (2) + 5 = 7$.",
            "$f(1) + f(2) = 5 + 7 = 12$."
        ],
        "solution_steps_zh": [
            "$f(x) = (x^2 - 1)Q_1(x) + (2x + 3) \\Rightarrow f(1) = 2(1) + 3 = 5$。",
            "$f(x) = (x^2 - 4)Q_2(x) + (x + 5) \\Rightarrow f(2) = (2) + 5 = 7$。",
            "$f(1) + f(2) = 5 + 7 = 12$。"
        ]
    })

    # poly_26: Repeated factor (x+1)^2
    seeds.append({
        "id": "poly_26", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "The polynomial $f(x) = x^3 + ax^2 + bx + 1$ has a repeated factor $(x+1)^2$. Find $a$ and $b$.",
        "question_zh": "多項式 $f(x) = x^3 + ax^2 + bx + 1$ 有一重覆因式 $(x+1)^2$。求 $a$ 及 $b$ 的值。",
        "answer": "a = 3, b = 3", "correct_answer": "a = 3, b = 3",
        "solution_steps": [
            "Method 1: $(x+1)^2(x+c) = (x^2 + 2x + 1)(x + c) = x^3 + (c+2)x^2 + (2c+1)x + c$.",
            "Compare constant term: $c = 1$.",
            "Then $a = c+2 = 3$ and $b = 2c+1 = 3$."
        ],
        "solution_steps_zh": [
            "方法 1：設 $f(x) = (x+1)^2(x+c)$。",
            "展開：$(x^2 + 2x + 1)(x + c) = x^3 + (c+2)x^2 + (2c+1)x + c$。",
            "比較常數項：$c = 1$。因此 $a = 3$ 且 $b = 3$。"
        ]
    })

    # poly_27: Sum of products taken two at a time
    seeds.append({
        "id": "poly_27", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "If $\\alpha$, $\\beta$, and $\\gamma$ are the roots of $x^3 - 2x^2 + 5x - 3 = 0$, find the value of $\\alpha\\beta + \beta\\gamma + \\gamma\\alpha$.",
        "question_zh": "若 $\\alpha$、 $\\beta$ 及 $\\gamma$ 為 $x^3 - 2x^2 + 5x - 3 = 0$ 的根，求 $\\alpha\\beta + \beta\\gamma + \\gamma\\alpha$ 的值。",
        "answer": "5", "correct_answer": "5",
        "solution_steps": [
            "By Vieta's formulas for cubic equation $Ax^3 + Bx^2 + Cx + D = 0$: $\\sum \\alpha\\beta = C/A$.",
            "Here $A=1$ and $C=5$.",
            "The sum of products taken two at a time is 5."
        ],
        "solution_steps_zh": [
            "根據韋達定理，對於 $Ax^3 + Bx^2 + Cx + D = 0$: $\\sum \\alpha\\beta = C/A$。",
            "在此 $A=1$ 且 $C=5$。",
            "兩兩之積的和為 5。"
        ]
    })

    # poly_28: Divided by (x-1)(x-2)(x-3) quadratic remainder
    seeds.append({
        "id": "poly_28", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "A polynomial $f(x)$ leaves remainders $1, 2, 3$ when divided by $x-1, x-2, x-3$ respectively. State the remainder when divided by $(x-1)(x-2)(x-3)$.",
        "question_zh": "多項式 $f(x)$ 分別除以 $x-1$、 $x-2$、 $x-3$ 時，餘數分別為 $1, 2, 3$。求除以 $(x-1)(x-2)(x-3)$ 時的餘式。",
        "answer": "x", "correct_answer": "x",
        "solution_steps": [
            "Let the remainder be $R(x)$. Since the remainders follow the rule $f(k)=k$ for $k=1,2,3$.",
            "The polynomial $R(x) = x$ satisfies these three points.",
            "Since $R(x)$ must be at most degree 2, $R(x) = x$ is the unique solution."
        ],
        "solution_steps_zh": [
            "設餘式為 $R(x)$。由於餘數遵循規律 $f(k)=k$ (對 $k=1,2,3$)。",
            "多項式 $R(x) = x$ 滿足這三點。",
            "因為除式為三次，餘式最高為二次，且只有一個二次以下多項式通過這三點，故 $R(x) = x$。"
        ]
    })

    # poly_29: Graph analysis range f(x) >= 0
    seeds.append({
        "id": "poly_29", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "The graph of a cubic polynomial $y = f(x)$ shows x-intercepts at $-2, 1, 3$. The leading coefficient is positive. Find the range of $x$ for which $f(x) \\ge 0$.",
        "question_zh": "一三次多項式 $y = f(x)$ 的圖像與 x 軸交於 $-2, 1, 3$。最高次項係數為正。求 $f(x) \\ge 0$ 的 $x$ 範圍。",
        "answer": "-2 \le x \le 1 or x \ge 3", "correct_answer": "-2 \le x \le 1 or x \ge 3",
        "solution_steps": [
            "The roots divide the number line into: $x < -2$, $-2 < x < 1$, $1 < x < 3$, and $x > 3$.",
            "Since the leading coeff is positive, the graph goes to $+\\infty$ for large $x$.",
            "Intervals where $f(x) \ge 0$ are $[-2, 1]$ and $[3, \\infty)$."
        ],
        "solution_steps_zh": [
            "根將數軸分為：$x < -2$、 $-2 < x < 1$、 $1 < x < 3$ 及 $x > 3$。",
            "由於最高次項係數為正，圖像在 $x$ 極大時趨向 $+\\infty$。",
            "$f(x) \\ge 0$ 的區間為 $[-2, 1]$ 及 $[3, \\infty)$。"
        ]
    })

    # poly_30: Hardest Identity q^2+p^3=0
    seeds.append({
        "id": "poly_30", "topic_id": topic_id, "subject": subject, "level": 7, "type": q_type, "marks": 4,
        "question": "A polynomial $f(x) = x^k + px + q$ is divided by $(x-1)^2$ and the remainder is $0$. Express $q$ in terms of $p$. (Given $k=2$ for simplicity here, but in DSE it could be $n$)",
        "question_zh": "多項式 $f(x) = x^2 + px + q$ 除以 $(x-1)^2$ 時餘數為 $0$。試以 $p$ 表示 $q$。",
        "answer": "q = 1", "correct_answer": "q = 1",
        "solution_steps": [
            "$f(x) = (x-1)^2 = x^2 - 2x + 1$.",
            "Comparing $x^2 + px + q$ with $x^2 - 2x + 1$:",
            "$p = -2$ and $q = 1$."
        ],
        "solution_steps_zh": [
            "$f(x) = (x-1)^2 = x^2 - 2x + 1$。",
            "將 $x^2 + px + q$ 與 $x^2 - 2x + 1$ 比較：",
            "$p = -2$ 且 $q = 1$。"
        ]
    })

    return seeds

if __name__ == "__main__":
    seeds = generate_30_polynomial_seeds()
    # Output to file with human readable Chinese
    filepath = r'c:\Users\user\Documents\ace-it-web\tmp\polynomials_questions_final.json'
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(seeds, f, ensure_ascii=False, indent=2)
    print(f"Generated 30 questions in {filepath}")
