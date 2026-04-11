import random
import json
import math
import sys

def format_num(n):
    if n == int(n):
        return str(int(n))
    return f"{n:.2f}".rstrip('0').rstrip('.')

def get_quad_term(a, var="x", is_first=True):
    if a == 0: return ""
    sign = ""
    if a > 0:
        if not is_first: sign = " + "
    else:
        sign = " - " if not is_first else "-"
    
    abs_a = abs(a)
    coeff = format_num(abs_a) if abs_a != 1 else ""
    return f"{sign}{coeff}{var}^2"

def get_linear_term(b, var="x", is_first=False):
    if b == 0: return ""
    sign = ""
    if b > 0:
        if not is_first: sign = " + "
    else:
        sign = " - " if not is_first else "-"
    
    abs_b = abs(b)
    coeff = format_num(abs_b) if abs_b != 1 else ""
    return f"{sign}{coeff}{var}"

def get_const_term(c, is_first=False):
    if c == 0: return ""
    sign = ""
    if c > 0:
        if not is_first: sign = " + "
    else:
        sign = " - " if not is_first else "-"
    
    return f"{sign}{format_num(abs(c))}"

def generate_30_quadratics_seeds():
    seeds = []
    # Difficulty counts: 5 Easy, 5 Medium, 10 DSE Standard, 10 Elite
    
    # ================= LEVEL 3: EASY (5 Questions) =================
    # 1. Quadratic Formula Basics
    a, b, c = 1, -5, 6
    seeds.append({
        "level": 3,
        "topic": "Solving by Factorization",
        "question": "Solve the quadratic equation $x^2 - 5x + 6 = 0$.",
        "question_zh": "解二次方程 $x^2 - 5x + 6 = 0$。",
        "answer": "x = 2 or x = 3",
        "answer_zh": "x = 2 或 x = 3",
        "steps": [
            r"Factorize the quadratic expression: $(x - 2)(x - 3) = 0$.",
            r"Set each factor to zero: $x - 2 = 0$ or $x - 3 = 0$.",
            r"Solutions: $x = 2$ or $x = 3$."
        ],
        "steps_zh": [
            r"將二次式因式分解：$(x - 2)(x - 3) = 0$。",
            r"將每個因式設為零：$x - 2 = 0$ 或 $x - 3 = 0$。",
            r"解為：$x = 2$ 或 $x = 3$。"
        ]
    })

    # 2. Discriminant Basics
    a, b, k = 1, -4, 4
    seeds.append({
        "level": 3,
        "topic": "Nature of Roots",
        "question": "Find the discriminant of $x^2 - 4x + 4 = 0$ and state the nature of its roots.",
        "question_zh": "求 $x^2 - 4x + 4 = 0$ 的判別式，並寫出其根的性質。",
        "answer": r"$\Delta = 0$, equal real roots",
        "answer_zh": r"$\Delta = 0$，有等實根",
        "steps": [
            "Identify $a=1, b=-4, c=4$.",
            r"Discriminant $\Delta = b^2 - 4ac = (-4)^2 - 4(1)(4) = 16 - 16 = 0$.",
            r"Since $\Delta = 0$, the equation has one real root (equal real roots)."
        ],
        "steps_zh": [
            "辨識 $a=1, b=-4, c=4$。",
            r"判別式 $\Delta = b^2 - 4ac = (-4)^2 - 4(1)(4) = 16 - 16 = 0$。",
            r"由於 $\Delta = 0$，該方程有一個實根（等實根）。"
        ]
    })

    # 3. Simple Formula Calculation
    seeds.append({
        "level": 3,
        "topic": "Quadratic Formula",
        "question": r"Use the quadratic formula to solve $x^2 + 2x - 1 = 0$. (Leave answer in surd form)",
        "question_zh": r"利用二次公式解 $x^2 + 2x - 1 = 0$。（答案以根式表示）",
        "answer": r"x = -1 \pm \sqrt{2}",
        "steps": [
            r"Quadratic formula: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.",
            r"$x = \frac{-2 \pm \sqrt{2^2 - 4(1)(-1)}}{2(1)} = \frac{-2 \pm \sqrt{4 + 4}}{2}$.",
            r"$x = \frac{-2 \pm \sqrt{8}}{2} = \frac{-2 \pm 2\sqrt{2}}{2} = -1 \pm \sqrt{2}$."
        ],
        "steps_zh": [
            r"二次公式：$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$。",
            r"$x = \frac{-2 \pm \sqrt{2^2 - 4(1)(-1)}}{2(1)} = \frac{-2 \pm \sqrt{4 + 4}}{2}$。",
            r"$x = \frac{-2 \pm \sqrt{8}}{2} = \frac{-2 \pm 2\sqrt{2}}{2} = -1 \pm \sqrt{2}$。"
        ]
    })

    # 4. Sum and Product Basics
    seeds.append({
        "level": 3,
        "topic": "Basic Vieta's",
        "question": "For the equation $2x^2 + 7x - 4 = 0$, find the sum of roots and product of roots.",
        "question_zh": "對於方程 $2x^2 + 7x - 4 = 0$，求其兩根之和及兩根之積。",
        "answer": "Sum = -3.5, Product = -2",
        "answer_zh": "和 = -3.5，積 = -2",
        "steps": [
            r"Sum of roots $\alpha + \beta = -b/a = -7/2 = -3.5$.",
            r"Product of roots $\alpha\beta = c/a = -4/2 = -2$."
        ],
        "steps_zh": [
            r"兩根之和 $\alpha + \beta = -b/a = -7/2 = -3.5$。",
            r"兩根之積 $\alpha\beta = c/a = -4/2 = -2$。"
        ]
    })

    # 5. Rearrange to Standard Form
    seeds.append({
        "level": 3,
        "topic": "Standard Form",
        "question": "Rearrange $x(x - 3) = 10$ into the form $ax^2 + bx + c = 0$ and solve for $x$.",
        "question_zh": "將 $x(x - 3) = 10$ 重整為 $ax^2 + bx + c = 0$ 的形式，並求 $x$。",
        "answer": "x = 5 or x = -2",
        "answer_zh": "x = 5 或 x = -2",
        "steps": [
            "Expand LHS: $x^2 - 3x = 10$.",
            r"Rearrange: $x^2 - 3x - 10 = 0$.",
            "Factorize: $(x - 5)(x + 2) = 0$.",
            "Solutions: $x = 5$ or $x = -2$."
        ],
        "steps_zh": [
            "展開左方：$x^2 - 3x = 10$。",
            "重整：$x^2 - 3x - 10 = 0$。",
            "因式分解：$(x - 5)(x + 2) = 0$。",
            "解為：$x = 5$ 或 $x = -2$。"
        ]
    })

    # ================= LEVEL 4: MEDIUM (5 Questions) =================
    # 6. Completed Square Form
    seeds.append({
        "level": 4,
        "topic": "Completing the Square",
        "question": "Express $y = x^2 - 6x + 5$ in vertex form $y = (x - h)^2 + k$.",
        "question_zh": "將 $y = x^2 - 6x + 5$ 表示成頂點式 $y = (x - h)^2 + k$。",
        "answer": "y = (x - 3)^2 - 4",
        "steps": [
            "$y = (x^2 - 6x + 9) - 9 + 5$.",
            "$y = (x - 3)^2 - 4$."
        ],
        "steps_zh": [
            "$y = (x^2 - 6x + 9) - 9 + 5$。",
            "$y = (x - 3)^2 - 4$。"
        ]
    })

    # 7. Finding k for Equal Roots
    seeds.append({
        "level": 4,
        "topic": "Nature of Roots",
        "question": "The equation $x^2 + kx + 9 = 0$ has equal real roots. Find the possible values of $k$.",
        "question_zh": "方程 $x^2 + kx + 9 = 0$ 有等實根。求 $k$ 的可能值。",
        "answer": "k = 6 or k = -6",
        "answer_zh": "k = 6 或 k = -6",
        "steps": [
            r"For equal roots, $\Delta = 0$.",
            "$k^2 - 4(1)(9) = 0$.",
            r"$k^2 - 36 = 0 \Rightarrow k^2 = 36$.",
            r"$k = 6$ or $k = -6$."
        ],
        "steps_zh": [
            r"對於等實根，$\Delta = 0$。",
            "$k^2 - 4(1)(9) = 0$。",
            r"$k^2 - 36 = 0 \Rightarrow k^2 = 36$。",
            r"$k = 6$ 或 $k = -6$。"
        ]
    })

    # 8. Vertex to Maximum Value
    seeds.append({
        "level": 4,
        "topic": "Optimization",
        "question": "Find the maximum value of the function $f(x) = -2(x + 1)^2 + 7$.",
        "question_zh": "求函數 $f(x) = -2(x + 1)^2 + 7$ 的極大值。",
        "answer": "7",
        "steps": [
            "The function is in vertex form $a(x-h)^2 + k$ with $a = -2 < 0$.",
            "The maximum value occurs at the vertex $(h, k) = (-1, 7)$.",
            "Maximum value is 7."
        ],
        "steps_zh": [
            "該函數為頂點式 $a(x-h)^2 + k$，其中 $a = -2 < 0$。",
            "極大值發生在頂點 $(h, k) = (-1, 7)$ 處。",
            "極大值為 7。"
        ]
    })

    # 9. Form Equation from Roots
    seeds.append({
        "level": 4,
        "topic": "Forming Equations",
        "question": "Form a quadratic equation with integer coefficients whose roots are $1/2$ and $-3$.",
        "question_zh": "建立一個以 $1/2$ 及 $-3$ 為根且係數為整數的二次方程。",
        "answer": r"2x^2 + 5x - 3 = 0",
        "steps": [
            r"Sum of roots $= 1/2 + (-3) = -2.5$.",
            r"Product of roots $= (1/2)(-3) = -1.5$.",
            r"Equation: $x^2 - (sum)x + (product) = 0$.",
            r"$x^2 + 2.5x - 1.5 = 0$.",
            r"Multiply by 2 for integer coefficients: $2x^2 + 5x - 3 = 0$."
        ],
        "steps_zh": [
            r"兩根之和 $= 1/2 + (-3) = -2.5$。",
            r"兩根之積 $= (1/2)(-3) = -1.5$。",
            r"方程：$x^2 - (和)x + (積) = 0$。",
            r"$x^2 + 2.5x - 1.5 = 0$。",
            r"乘以 2 以獲得整數係數：$2x^2 + 5x - 3 = 0$。"
        ]
    })

    # 10. Simple Transformations
    seeds.append({
        "level": 4,
        "topic": "Graph Transformations",
        "question": "The graph of $y = x^2$ is shifted 2 units to the right and 3 units downwards. Find the new equation.",
        "question_zh": "將 $y = x^2$ 的圖像向右平移 2 單位，再向下平移 3 單位。求新方程。",
        "answer": "y = (x - 2)^2 - 3",
        "steps": [
            "Shift right by 2: replace $x$ with $x - 2$. Result: $y = (x - 2)^2$.",
            "Shift down by 3: subtract 3 from the expression. Result: $y = (x - 2)^2 - 3$."
        ],
        "steps_zh": [
            "向右平移 2 單位：將 $x$ 替換為 $x - 2$。結果：$y = (x - 2)^2$。",
            "向下平移 3 單位：從表達式中減去 3。結果：$y = (x - 2)^2 - 3$。"
        ]
    })

    # ================= LEVEL 5: DSE STANDARD (10 Questions) =================
    # 11. Range of k for 2 real roots
    seeds.append({
        "level": 5,
        "topic": "Nature of Roots (Range)",
        "question": "Find the range of values of $k$ such that $x^2 + 6x + k = 0$ has two distinct real roots.",
        "question_zh": "求 $k$ 的取值範圍，使得 $x^2 + 6x + k = 0$ 有兩個不相等的實根。",
        "answer": "k < 9",
        "steps": [
            r"For two distinct real roots, $\Delta > 0$.",
            "$6^2 - 4(1)(k) > 0$.",
            r"$36 - 4k > 0 \Rightarrow 36 > 4k$.",
            "$k < 9$."
        ],
        "steps_zh": [
            r"對於兩個不相等的實根，$\Delta > 0$。",
            "$6^2 - 4(1)(k) > 0$。",
            r"$36 - 4k > 0 \Rightarrow 36 > 4k$。",
            "$k < 9$。"
        ],
        "hints": [
            {
                "level": 1,
                "cost_xp": 0,
                "content_en": "For a quadratic equation $ax^2 + bx + c = 0$ to have two distinct real roots, its discriminant ($\\Delta = b^2 - 4ac$) must be greater than zero.",
                "content_zh": "對於二次方程 $ax^2 + bx + c = 0$ 要有兩個不相等的實根，其判別式（$\\Delta = b^2 - 4ac$）必須大於零。"
            },
            {
                "level": 2,
                "cost_xp": 5,
                "content_en": "Identify the coefficients: $a = 1$, $b = 6$, $c = k$. Now set up the inequality: $6^2 - 4(1)(\\_) > 0$.",
                "content_zh": "找出係數：$a = 1$，$b = 6$，$c = k$。現在建立不等式：$6^2 - 4(1)(\\_) > 0$。"
            },
            {
                "level": 3,
                "cost_xp": 10,
                "content_en": "Simplify the inequality: $36 - 4k > 0$. Rearrange to solve for $k$ to find the range: $k < \\_$.",
                "content_zh": "化簡不等式：$36 - 4k > 0$。重新排列解出 $k$ 以求得範圍：$k < \\_$"
            }
        ]
    })

    # 12. Intersection of Line and Curve
    seeds.append({
        "level": 5,
        "topic": "Line-Curve Intersection",
        "question": "Find the coordinates of the points of intersection of the line $y = x + 1$ and the curve $y = x^2 - x - 2$.",
        "question_zh": "求直線 $y = x + 1$ 與曲線 $y = x^2 - x - 2$ 的交點坐標。",
        "answer": "(-1, 0) and (3, 4)",
        "answer_zh": "(-1, 0) 及 (3, 4)",
        "steps": [
            "Equate the expressions: $x^2 - x - 2 = x + 1$.",
            "Rearrange to quadratic: $x^2 - 2x - 3 = 0$.",
            r"Factorize: $(x - 3)(x + 1) = 0 \Rightarrow x = 3$ or $x = -1$.",
            "Find corresponding $y$ values using line $y = x + 1$:",
            "For $x=3$, $y=4$. Intersection $(3, 4)$.",
            "For $x=-1$, $y=0$. Intersection $(-1, 0)$."
        ],
        "steps_zh": [
            r"設表達式相等：$x^2 - x - 2 = x + 1$。",
            r"重整為二次方程：$x^2 - 2x - 3 = 0$。",
            r"因式分解：$(x - 3)(x + 1) = 0 \Rightarrow x = 3$ 或 $x = -1$。",
            r"利用直線 $y = x + 1$ 求相應的 $y$ 值：",
            r"當 $x=3$ 時，$y=4$。交點為 $(3, 4)$。",
            r"當 $x=-1$ 時，$y=0$。交點為 $(-1, 0)$。"
        ]
    })

    # 13. Vertex and Axis of Symmetry
    seeds.append({
        "level": 5,
        "topic": "Coordinate Geometry of Quadratics",
        "question": "Find the vertex and the axis of symmetry of $y = 2x^2 + 8x + 3$.",
        "question_zh": "求 $y = 2x^2 + 8x + 3$ 的頂點及對稱軸。",
        "answer": "Vertex: (-2, -5), Axis: x = -2",
        "answer_zh": "頂點：(-2, -5)，對稱軸：x = -2",
        "steps": [
            "x-coordinate of vertex $h = -b/(2a) = -8/(2 \times 2) = -2$.",
            "y-coordinate $k = 2(-2)^2 + 8(-2) + 3 = 8 - 16 + 3 = -5$.",
            "Vertex is $(-2, -5)$.",
            "Axis of symmetry is $x = h$, so $x = -2$."
        ],
        "steps_zh": [
            "頂點的 x 坐標 $h = -b/(2a) = -8/(2 \times 2) = -2$。",
            "y 坐標 $k = 2(-2)^2 + 8(-2) + 3 = 8 - 16 + 3 = -5$。",
            "頂點為 $(-2, -5)$。",
            r"對稱軸為 $x = h$，即 $x = -2$。"
        ]
    })

    # 14. Vieta's for simple expression
    seeds.append({
        "level": 5,
        "topic": "Vieta's Formulas",
        "question": r"If $\alpha$ and $\beta$ are the roots of $x^2 - 4x + 1 = 0$, evaluate $\alpha^2 + \beta^2$.",
        "question_zh": r"若 $\alpha$ 及 $\beta$ 為 $x^2 - 4x + 1 = 0$ 的根，求 $\alpha^2 + \beta^2$ 的值。",
        "answer": "14",
        "steps": [
            r"From equation, $\alpha + \beta = 4$ and $\alpha\beta = 1$.",
            r"$\alpha^2 + \beta^2 = (\alpha + \beta)^2 - 2\alpha\beta$.",
            r"$\alpha^2 + \beta^2 = 4^2 - 2(1) = 16 - 2 = 14$."
        ],
        "steps_zh": [
            r"根據方程，$\alpha + \beta = 4$ 且 $\alpha\beta = 1$。",
            r"$\alpha^2 + \beta^2 = (\alpha + \beta)^2 - 2\alpha\beta$。",
            r"$\alpha^2 + \beta^2 = 4^2 - 2(1) = 16 - 2 = 14$。"
        ]
    })

    # 15. Form equation with transformed roots (simple)
    seeds.append({
        "level": 5,
        "topic": "Root Transformations",
        "question": r"The roots of $x^2 - 2x - 2 = 0$ are $\alpha$ and $\beta$. Find a quadratic equation whose roots are $\alpha+1$ and $\beta+1$.",
        "question_zh": r"$x^2 - 2x - 2 = 0$ 的根為 $\alpha$ 及 $\beta$。求一個以 $\alpha+1$ 及 $\beta+1$ 為根的二次方程。",
        "answer": "x^2 - 4x + 1 = 0",
        "steps": [
            r"Original: $\alpha + \beta = 2, \alpha\beta = -2$.",
            r"New sum $S = (\alpha+1) + (\beta+1) = (\alpha + \beta) + 2 = 2 + 2 = 4$.",
            r"New product $P = (\alpha+1)(\beta+1) = \alpha\beta + (\alpha + \beta) + 1 = -2 + 2 + 1 = 1$.",
            r"New equation: $x^2 - Sx + P = 0 \Rightarrow x^2 - 4x + 1 = 0$."
        ],
        "steps_zh": [
            r"原方程：$\alpha + \beta = 2, \alpha\beta = -2$。",
            r"新和 $S = (\alpha+1) + (\beta+1) = (\alpha + \beta) + 2 = 2 + 2 = 4$。",
            r"新積 $P = (\alpha+1)(\beta+1) = \alpha\beta + (\alpha + \beta) + 1 = -2 + 2 + 1 = 1$。",
            r"新方程：$x^2 - Sx + P = 0 \Rightarrow x^2 - 4x + 1 = 0$。"
        ]
    })

    # 16. Intersection Condition (k range for line-curve)
    seeds.append({
        "level": 5,
        "topic": "Line-Curve Intersection Condition",
        "question": "Find the range of $k$ such that the line $y = kx$ does not intersect the curve $y = x^2 + 1$.",
        "question_zh": "求 $k$ 的取值範圍，使得直線 $y = kx$ 與曲線 $y = x^2 + 1$ 不相交。",
        "answer": "-2 < k < 2",
        "steps": [
            r"Equate: $x^2 + 1 = kx \Rightarrow x^2 - kx + 1 = 0$.",
            r"For no intersection, $\Delta < 0$.",
            r"$(-k)^2 - 4(1)(1) < 0 \Rightarrow k^2 - 4 < 0$.",
            r"$k^2 < 4 \Rightarrow -2 < k < 2$."
        ],
        "steps_zh": [
            r"設相等：$x^2 + 1 = kx \Rightarrow x^2 - kx + 1 = 0$。",
            r"對於不相交狀況，$\Delta < 0$。",
            r"$(-k)^2 - 4(1)(1) < 0 \Rightarrow k^2 - 4 < 0$。",
            r"$k^2 < 4 \Rightarrow -2 < k < 2$。"
        ]
    })

    # 17. Tangent Condition (k value)
    seeds.append({
        "level": 5,
        "topic": "Line Tangent to Curve",
        "question": "The line $y = 2x + k$ is tangent to the curve $y = x^2 - 4x$. Find the value of $k$.",
        "question_zh": "直線 $y = 2x + k$ 是曲線 $y = x^2 - 4x$ 的切線。求 $k$ 的值。",
        "answer": "-9",
        "steps": [
            r"Equate expressions: $x^2 - 4x = 2x + k \Rightarrow x^2 - 6x - k = 0$.",
            r"Since it is tangent, $\Delta = 0$.",
            "$(-6)^2 - 4(1)(-k) = 0$.",
            r"$36 + 4k = 0 \Rightarrow 4k = -36 \Rightarrow k = -9$."
        ],
        "steps_zh": [
            r"設表達式相等：$x^2 - 4x = 2x + k \Rightarrow x^2 - 6x - k = 0$。",
            r"由於是相切，$\Delta = 0$。",
            "$(-6)^2 - 4(1)(-k) = 0$。",
            r"$36 + 4k = 0 \Rightarrow 4k = -36 \Rightarrow k = -9$。"
        ]
    })

    # 18. Domain and Range of Quadratic
    seeds.append({
        "level": 5,
        "topic": "Properties of Function",
        "question": "Find the range of the function $f(x) = 2x^2 - 4x + 5$ for all real values of $x$.",
        "question_zh": "求函數 $f(x) = 2x^2 - 4x + 5$ 對於所有 $x$ 實數值的對應值範圍（值域）。",
        "answer": r"f(x) \ge 3",
        "steps": [
            "Find the vertex: $x = -(-4)/(2 \times 2) = 1$.",
            "Minimum value $= f(1) = 2(1)^2 - 4(1) + 5 = 2 - 4 + 5 = 3$.",
            "Since $a = 2 > 0$, the parabola opens upwards.",
            r"Range: $f(x) \ge 3$."
        ],
        "steps_zh": [
            "求頂點：$x = -(-4)/(2 \times 2) = 1$。",
            "極小值 $= f(1) = 2(1)^2 - 4(1) + 5 = 2 - 4 + 5 = 3$。",
            "由於 $a = 2 > 0$，拋物線向上開口。",
            r"值域：$f(x) \ge 3$。"
        ]
    })

    # 19. Intersection with Axes
    seeds.append({
        "level": 5,
        "topic": "Graph Intercepts",
        "question": "Find the x-intercepts and y-intercept of the curve $y = x^2 - 2x - 8$.",
        "question_zh": "求曲線 $y = x^2 - 2x - 8$ 的 x 軸截距及 y 軸截距。",
        "answer": "x: (4,0), (-2,0); y: (0,-8)",
        "answer_zh": "x: (4,0), (-2,0)；y: (0,-8)",
        "steps": [
            r"y-intercept: set $x=0$, $y = -8 \Rightarrow (0, -8)$.",
            "x-intercepts: set $y=0$, $x^2 - 2x - 8 = 0$.",
            r"Factorize: $(x - 4)(x + 2) = 0 \Rightarrow x = 4$ or $x = -2$.",
            "Intercepts are $(4, 0)$ and $(-2, 0)$."
        ],
        "steps_zh": [
            r"y 軸截距：設 $x=0$，$y = -8 \Rightarrow (0, -8)$。",
            "x 軸截距：設 $y=0$，$x^2 - 2x - 8 = 0$。",
            r"因式分解：$(x - 4)(x + 2) = 0 \Rightarrow x = 4$ 或 $x = -2$。",
            "截距為 $(4, 0)$ 及 $(-2, 0)$。"
        ]
    })

    # 20. Word Problem (Area)
    seeds.append({
        "level": 5,
        "topic": "Applied Quadratics",
        "question": "The length of a rectangle is 3 cm more than its width. If the area is 40 cm$^2$, find its dimensions.",
        "question_zh": "長方形的長比寬多 3 cm。若面積為 40 cm$^2$，求其長寬。",
        "answer": "Length = 8 cm, Width = 5 cm",
        "answer_zh": "長 = 8 cm，寬 = 5 cm",
        "steps": [
            "Let width be $w$, then length is $w + 3$.",
            "Area $= w(w + 3) = 40$.",
            "$w^2 + 3w - 40 = 0$.",
            r"Factorize: $(w + 8)(w - 5) = 0 \Rightarrow w = 5$ ($w > 0$).",
            "Width $= 5$ cm, Length $= 5 + 3 = 8$ cm."
        ],
        "steps_zh": [
            "設寬為 $w$，則長為 $w + 3$。",
            "面積 $= w(w + 3) = 40$。",
            "$w^2 + 3w - 40 = 0$。",
            r"因式分解：$(w + 8)(w - 5) = 0 \Rightarrow w = 5$ (取正值)。",
            "寬為 5 cm，長為 $5 + 3 = 8$ cm。"
        ]
    })

    # ================= LEVEL 7: ELITE (10 Questions) =================
    # 21. Advanced Vieta's (1/alpha + 1/beta)
    seeds.append({
        "level": 7,
        "topic": "Elite Vieta's Manipulation",
        "question": r"If $\alpha$ and $\beta$ are the roots of $2x^2 - 5x + 1 = 0$, evaluate $\frac{1}{\alpha^2} + \frac{1}{\beta^2}$.",
        "question_zh": r"若 $\alpha$ 及 $\beta$ 為 $2x^2 - 5x + 1 = 0$ 的根，求 $\frac{1}{\alpha^2} + \frac{1}{\beta^2}$ 的值。",
        "answer": "21",
        "steps": [
            r"$\alpha + \beta = 2.5$, $\alpha\beta = 0.5$.",
            r"$\frac{1}{\alpha^2} + \frac{1}{\beta^2} = \frac{\alpha^2 + \beta^2}{(\alpha\beta)^2}$.",
            r"$\alpha^2 + \beta^2 = (2.5)^2 - 2(0.5) = 6.25 - 1 = 5.25$.",
            r"Result $= \frac{5.25}{0.5^2} = \frac{5.25}{0.25} = 21$."
        ],
        "steps_zh": [
            r"$\alpha + \beta = 2.5$，$\alpha\beta = 0.5$。",
            r"$\frac{1}{\alpha^2} + \frac{1}{\beta^2} = \frac{\alpha^2 + \beta^2}{(\alpha\beta)^2}$。",
            r"$\alpha^2 + \beta^2 = (2.5)^2 - 2(0.5) = 6.25 - 1 = 5.25$。",
            r"結果 $= \frac{5.25}{0.5^2} = \frac{5.25}{0.25} = 21$。"
        ]
    })

    # 22. Substitute Back Trick
    seeds.append({
        "level": 7,
        "topic": "Substitute Back Trick",
        "question": r"Given that $\alpha$ is a root of $x^2 - 4x - 7 = 0$, find the value of $\alpha^2 - 4\alpha + 10$.",
        "question_zh": r"已知 $\alpha$ 為 $x^2 - 4x - 7 = 0$ 的根，求 $\alpha^2 - 4\alpha + 10$ 的值。",
        "answer": "17",
        "steps": [
            r"Since $\alpha$ is a root, it satisfies the equation: $\alpha^2 - 4\alpha - 7 = 0$.",
            r"Rearranging gives $\alpha^2 - 4\alpha = 7$.",
            "Substitute this into the expression: $7 + 10 = 17$."
        ],
        "steps_zh": [
            r"由於 $\alpha$ 是根，它滿足方程：$\alpha^2 - 4\alpha - 7 = 0$。",
            r"重整得 $\alpha^2 - 4\alpha = 7$。",
            "將此代入表達式中：$7 + 10 = 17$。"
        ]
    })

    # 23. Discriminant + Intersection Inequality
    seeds.append({
        "level": 7,
        "topic": "Advanced Intersection Condition",
        "question": "The line $y = x + k$ intersects the parabola $y = x^2 - 3x + 5$ at two distinct points. Find the range of $k$.",
        "question_zh": "直線 $y = x + k$ 與拋物線 $y = x^2 - 3x + 5$ 相交於兩個不相等的點。求 $k$ 的範圍。",
        "answer": "k > 1",
        "steps": [
            r"Equate: $x^2 - 3x + 5 = x + k \Rightarrow x^2 - 4x + (5 - k) = 0$.",
            r"For two distinct points, $\Delta > 0$.",
            r"$(-4)^2 - 4(1)(5 - k) > 0$.",
            "$16 - 20 + 4k > 0$.",
            r"$4k - 4 > 0 \Rightarrow 4k > 4 \Rightarrow k > 1$."
        ],
        "steps_zh": [
            r"設相等：$x^2 - 3x + 5 = x + k \Rightarrow x^2 - 4x + (5 - k) = 0$。",
            r"對於兩個不相等的點，$\Delta > 0$。",
            r"$(-4)^2 - 4(1)(5 - k) > 0$。",
            "$16 - 20 + 4k > 0$。",
            r"$4k - 4 > 0 \Rightarrow 4k > 4 \Rightarrow k > 1$。"
        ]
    })

    # 24. Form Equation with roots alpha^2, beta^2
    seeds.append({
        "level": 7,
        "topic": "Elite Root Transformations",
        "question": r"The roots of $x^2 - 4x + 2 = 0$ are $\alpha$ and $\beta$. Form a quadratic equation whose roots are $\alpha^2$ and $\beta^2$.",
        "question_zh": r"$x^2 - 4x + 2 = 0$ 的根為 $\alpha$ 及 $\beta$。求一個以 $\alpha^2$ 及 $\beta^2$ 為根的二次方程。",
        "answer": "x^2 - 12x + 4 = 0",
        "steps": [
            r"$\alpha + \beta = 4, \alpha\beta = 2$.",
            r"New sum $S = \alpha^2 + \beta^2 = (\alpha + \beta)^2 - 2\alpha\beta = 4^2 - 2(2) = 12$.",
            r"New product $P = \alpha^2\beta^2 = (\alpha\beta)^2 = 2^2 = 4$.",
            r"New equation: $x^2 - Sx + P = 0 \Rightarrow x^2 - 12x + 4 = 0$."
        ],
        "steps_zh": [
            r"$\alpha + \beta = 4, \alpha\beta = 2$。",
            r"新和 $S = \alpha^2 + \beta^2 = (\alpha + \beta)^2 - 2\alpha\beta = 4^2 - 2(2) = 12$。",
            r"新積 $P = \alpha^2\beta^2 = (\alpha\beta)^2 = 2^2 = 4$。",
            r"新方程：$x^2 - Sx + P = 0 \Rightarrow x^2 - 12x + 4 = 0$。"
        ]
    })

    # 25. Hard "Substitute Back" with higher power
    seeds.append({
        "level": 7,
        "topic": "Power Reduction Trick",
        "question": r"If $\alpha$ is a root of $x^2 - 3x + 1 = 0$, evaluate $\alpha^3 - 3\alpha^2 + \alpha + 5$.",
        "question_zh": r"若 $\alpha$ 為 $x^2 - 3x + 1 = 0$ 的根，求 $\alpha^3 - 3\alpha^2 + \alpha + 5$ 的值。",
        "answer": "5",
        "steps": [
            r"Factor the expression by grouping: $\alpha^3 - 3\alpha^2 + \alpha = \alpha(\alpha^2 - 3\alpha + 1)$.",
            r"Since $\alpha$ is a root, $\alpha^2 - 3\alpha + 1 = 0$.",
            r"Thus, $\alpha(\alpha^2 - 3\alpha + 1) = \alpha(0) = 0$.",
            "The expression simplifies to $0 + 5 = 5$."
        ],
        "steps_zh": [
            r"將表達式分組因式分解：$\alpha^3 - 3\alpha^2 + \alpha = \alpha(\alpha^2 - 3\alpha + 1)$。",
            r"由於 $\alpha$ 是根，$\alpha^2 - 3\alpha + 1 = 0$。",
            r"因此，$\alpha(\alpha^2 - 3\alpha + 1) = \alpha(0) = 0$。",
            "該表達式簡化為 $0 + 5 = 5$。"
        ]
    })

    # 26. Intersection resulting in secondary quadratic inequality
    seeds.append({
        "level": 7,
        "topic": "Secondary Inequality",
        "question": "Find the range of $m$ such that the line $y = mx - 1$ is tangent to the curve $y = x^2$.",
        "question_zh": "求 $m$ 的取值範圍，使得直線 $y = mx - 1$ 正好與曲線 $y = x^2$ 相切。",
        "answer": "m = 2 or m = -2",
        "answer_zh": "m = 2 或 m = -2",
        "steps": [
            r"Equate: $x^2 = mx - 1 \Rightarrow x^2 - mx + 1 = 0$.",
            r"For tangency, $\Delta = 0$.",
            r"$(-m)^2 - 4(1)(1) = 0 \Rightarrow m^2 = 4$.",
            r"$m = \pm 2$."
        ],
        "steps_zh": [
            r"設相等：$x^2 = mx - 1 \Rightarrow x^2 - mx + 1 = 0$。",
            r"對於相切狀況，$\Delta = 0$。",
            r"$(-m)^2 - 4(1)(1) = 0 \Rightarrow m^2 = 4$。",
            r"$m = \pm 2$。"
        ]
    })

    # 27. Advanced vertex shift with unknown coefficients
    seeds.append({
        "level": 7,
        "topic": "Transformation with Unknowns",
        "question": "The graph of $y = x^2 + ax + b$ has its vertex at $(1, 2)$. Find $a$ and $b$.",
        "question_zh": "已知 $y = x^2 + ax + b$ 的頂點在 $(1, 2)$。求 $a$ 及 $b$ 的值。",
        "answer": "a = -2, b = 3",
        "steps": [
            "Vertex form: $y = (x - 1)^2 + 2$.",
            "Expand: $y = x^2 - 2x + 1 + 2 = x^2 - 2x + 3$.",
            "Compare with $y = x^2 + ax + b$: $a = -2, b = 3$."
        ],
        "steps_zh": [
            "頂點式：$y = (x - 1)^2 + 2$。",
            "展開：$y = x^2 - 2x + 1 + 2 = x^2 - 2x + 3$。",
            "與 $y = x^2 + ax + b$ 比較：$a = -2, b = 3$。"
        ]
    })

    # 28. Form Equation from roots 1/alpha, 1/beta
    seeds.append({
        "level": 7,
        "topic": "Reciprocal Roots",
        "question": r"The roots of $ax^2 + bx + c = 0$ are $\alpha$ and $\beta$. Show that the equation whose roots are $1/\alpha$ and $1/\beta$ is $cx^2 + bx + a = 0$.",
        "question_zh": r"已知 $ax^2 + bx + c = 0$ 的根為 $\alpha$ 及 $\beta$。證明以 $1/\alpha$ 及 $1/\beta$ 為根的方程是 $cx^2 + bx + a = 0$。",
        "answer": "Proved (cx^2 + bx + a = 0)",
        "answer_zh": "已證明 (cx^2 + bx + a = 0)",
        "steps": [
            r"New sum $S = 1/\alpha + 1/\beta = (\alpha + \beta)/(\alpha\beta) = (-b/a)/(c/a) = -b/c$.",
            r"New product $P = (1/\alpha)(1/\beta) = 1/(\alpha\beta) = 1/(c/a) = a/c$.",
            r"Equation: $x^2 - (-b/c)x + (a/c) = 0 \Rightarrow x^2 + (b/c)x + (a/c) = 0$.",
            r"Multiply by $c$: $cx^2 + bx + a = 0$."
        ],
        "steps_zh": [
            r"新和 $S = 1/\alpha + 1/\beta = (\alpha + \beta)/(\alpha\beta) = (-b/a)/(c/a) = -b/c$。",
            r"新積 $P = (1/\alpha)(1/\beta) = 1/(\alpha\beta) = 1/(c/a) = a/c$。",
            r"方程：$x^2 - (-b/c)x + (a/c) = 0 \Rightarrow x^2 + (b/c)x + (a/c) = 0$。",
            r"乘以 $c$：$cx^2 + bx + a = 0$。"
        ]
    })

    # 29. Maximum Area with Perimeter Constraint
    seeds.append({
        "level": 7,
        "topic": "Applied Optimization",
        "question": "A gardener has 40 m of fencing to enclose a rectangular garden. What is the maximum area possible?",
        "question_zh": "一名園丁有 40 m 的圍欄來圍合一個長方形花園。所能圍合的最大面積是多少？",
        "answer": "100 m^2",
        "steps": [
            r"Let side lengths be $x$ and $y$. Perimeter $2(x + y) = 40 \Rightarrow x + y = 20 \Rightarrow y = 20 - x$.",
            r"Area $A = x(20 - x) = 20x - x^2$.",
            r"This is a downward parabola with vertex at $x = -20/(2 \times -1) = 10$.",
            r"Maximum Area $= 20(10) - 10^2 = 200 - 100 = 100$ m$^2$."
        ],
        "steps_zh": [
            r"設邊長為 $x$ 及 $y$。周界 $2(x + y) = 40 \Rightarrow x + y = 20 \Rightarrow y = 20 - x$。",
            r"面積 $A = x(20 - x) = 20x - x^2$。",
            r"這是一個開口向下的拋物線，頂點在 $x = -20/(2 \times -1) = 10$ 處。",
            r"最大面積 $= 20(10) - 10^2 = 200 - 100 = 100$ m$^2$。"
        ]
    })

    # 30. Complex Number of Intersection Condition (k range)
    seeds.append({
        "level": 7,
        "topic": "Advanced Discriminant",
        "question": "For what values of $k$ does the equation $x^2 + (k-2)x + (k+1) = 0$ have real roots?",
        "question_zh": "當 $k$ 取何值時，方程 $x^2 + (k-2)x + (k+1) = 0$ 有實根？",
        "answer": r"k \le 0 or k \ge 8",
        "steps": [
            r"For real roots, $\Delta \ge 0$.",
            r"$(k-2)^2 - 4(1)(k+1) \ge 0$.",
            r"$k^2 - 4k + 4 - 4k - 4 \ge 0$.",
            r"$k^2 - 8k \ge 0 \Rightarrow k(k - 8) \ge 0$.",
            r"$k \le 0$ or $k \ge 8$."
        ],
        "steps_zh": [
            r"對於實根，$\Delta \ge 0$。",
            r"$(k-2)^2 - 4(1)(k+1) \ge 0$。",
            r"$k^2 - 4k + 4 - 4k - 4 \ge 0$。",
            r"$k^2 - 8k \ge 0 \Rightarrow k(k - 8) \ge 0$。",
            r"$k \le 0$ 或 $k \ge 8$。"
        ]
    })

    return seeds

if __name__ == "__main__":
    try:
        seeds = generate_30_quadratics_seeds()
        print(json.dumps(seeds, indent=2, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
