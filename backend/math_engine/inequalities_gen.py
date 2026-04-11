import random
import json
import math
import sys

def generate_inequalities_seeds():
    seeds = []
    
    # ================= LEVEL 3: EASY (5 Questions) =================
    # Focus: Linear inequalities in one unknown, sign reversal logic.
    
    # 1. Simple Addition/Subtraction
    a = random.randint(1, 10)
    b = random.randint(1, 10)
    op = random.choice([">", "<", "\ge", "\le"])
    seeds.append({
        "level": 3,
        "topic": "Linear Inequalities (1-Step)",
        "question": f"Solve the inequality $x - {a} {op} {b}$.",
        "question_zh": f"解不等式 $x - {a} {op} {b}$。",
        "answer": f"x {op} {a + b}",
        "steps": [
            f"Add {a} to both sides of the inequality.",
            f"$x - {a} + {a} {op} {b} + {a}$",
            f"$x {op} {a + b}$"
        ],
        "steps_zh": [
            f"在不等式兩邊同時加上 {a}。",
            f"$x - {a} + {a} {op} {b} + {a}$",
            f"$x {op} {a + b}$"
        ]
    })
    
    # 2. Multiplication by Positive
    c = random.randint(2, 5)
    d = c * random.randint(2, 6)
    seeds.append({
        "level": 3,
        "topic": "Linear Inequalities (Positive Coefficient)",
        "question": f"Solve ${c}x < {d}$.",
        "question_zh": f"解 ${c}x < {d}$。",
        "answer": f"x < {d // c}",
        "steps": [
            f"Divide both sides by {c}.",
            f"Since {c} is positive, the inequality sign remains the same.",
            f"$x < {d // c}$"
        ],
        "steps_zh": [
            f"不等式兩邊同時除以 {c}。",
            f"由於 {c} 是正數，不等號方向保持不變。",
            f"$x < {d // c}$"
        ]
    })
    
    # 3. Multiplication by Negative (The Golden Rule)
    e = -random.randint(2, 5)
    f = e * random.randint(-5, 5)
    if f == 0: f = e * 2
    op_orig = ">"
    op_new = "<"
    seeds.append({
        "level": 3,
        "topic": "The Golden Rule (Sign Reversal)",
        "question": f"Solve ${e}x {op_orig} {f}$.",
        "question_zh": f"解 ${e}x {op_orig} {f}$。",
        "answer": f"x {op_new} {f // e}",
        "steps": [
            f"Divide both sides by {e}.",
            f"**IMPORTANT**: Since we are dividing by a negative number ({e}), the inequality sign must be REVERSED.",
            f"$x {op_new} {f // e}$"
        ],
        "steps_zh": [
            f"不等式兩邊同時除以 {e}。",
            f"**重要**：由於我們除以一個負數 ({e})，不等號方向必須**反轉**。",
            f"$x {op_new} {f // e}$"
        ]
    })
    
    # 4. Two-step Linear
    g, h, j = 2, random.randint(1, 5), 11
    # 2x + h >= j
    ans_val = (j-h)/2
    ans_str = f"{ans_val:.1f}".replace(".0", "")
    seeds.append({
        "level": 3,
        "topic": "Two-step Inequalities",
        "question": f"Solve $2x + {h} \ge {j}$.",
        "question_zh": f"解 $2x + {h} \ge {j}$。",
        "answer": f"x \ge {ans_str}",
        "steps": [
            f"Subtract {h} from both sides: $2x \ge {j-h}$.",
            f"Divide by 2: $x \ge {ans_str}$."
        ],
        "steps_zh": [
            f"兩邊同時減去 {h}：$2x \ge {j-h}$。",
            f"兩邊同時除以 2：$x \ge {ans_str}$。"
        ]
    })
    
    # 5. Number Line logic
    seeds.append({
        "level": 3,
        "topic": "Number Line Representation",
        "question": "An inequality is represented on a number line by a shaded region starting from 5 with a hollow circle, pointing to the right. What is the inequality?",
        "question_zh": "一條不等式在數線上由一個從 5 開始的空心圓點表示，陰影區域向右延伸。請問這條不等式是什麼？",
        "answer": "x > 5",
        "steps": [
            "A hollow circle means the value 5 is NOT included (strictly greater than).",
            "Pointing to the right means values are larger.",
            "The inequality is $x > 5$."
        ],
        "steps_zh": [
            "空心圓點表示不包含 5（嚴格大於）。",
            "向右延伸表示數值較大。",
            "不等式為 $x > 5$。"
        ]
    })

    # ================= LEVEL 4: MEDIUM (5 Questions) =================
    # Focus: Compound inequalities (AND/OR), simple quadratic inequalities.
    
    # 6. Compound AND
    seeds.append({
        "level": 4,
        "topic": "Compound Inequalities (AND)",
        "question": "Solve the compound inequality: $x + 2 > 5$ and $2x - 1 \le 11$.",
        "question_zh": "解複合不等式：$x + 2 > 5$ 且 $2x - 1 \le 11$。",
        "answer": "3 < x \le 6",
        "steps": [
            "Solve the first part: $x > 3$.",
            "Solve the second part: $2x \le 12 \implies x \le 6$.",
            "Combining them with 'AND' means we find the intersection: $3 < x \le 6$."
        ],
        "steps_zh": [
            "解第一部分：$x > 3$。",
            "解第二部分：$2x \le 12 \implies x \le 6$。",
            "將兩者以「且」合併，即找出交集：$3 < x \le 6$。"
        ]
    })
    
    # 7. Compound OR
    seeds.append({
        "level": 4,
        "topic": "Compound Inequalities (OR)",
        "question": "Solve: $x - 3 < -1$ or $2x > 10$.",
        "question_zh": "解：$x - 3 < -1$ 或 $2x > 10$。",
        "answer": "x < 2 \text{ or } x > 5",
        "steps": [
            "Solve the first part: $x < 2$.",
            "Solve the second part: $x > 5$.",
            "Combining with 'OR' gives the union: $x < 2$ or $x > 5$."
        ],
        "steps_zh": [
            "解第一部分：$x < 2$。",
            "解第二部分：$x > 5$。",
            "將兩者以「或」合併，即找出聯集：$x < 2$ 或 $x > 5$。"
        ]
    })
    
    # 8. Quadratic Inequality (Positive roots)
    seeds.append({
        "level": 4,
        "topic": "Quadratic Inequalities",
        "question": "Solve $x^2 - 5x + 6 < 0$.",
        "question_zh": "解 $x^2 - 5x + 6 < 0$。",
        "answer": "2 < x < 3",
        "steps": [
            "Factor the quadratic: $(x - 2)(x - 3) < 0$.",
            "The roots are $x=2$ and $x=3$.",
            "For the product to be negative (< 0), $x$ must lie between the roots.",
            "Solution: $2 < x < 3$."
        ],
        "steps_zh": [
            "因式分解二次式：$(x - 2)(x - 3) < 0$。",
            "兩根分別為 $x=2$ 和 $x=3$。",
            "要使乘積為負數（< 0），$x$ 必須位於兩根之間。",
            "答案：$2 < x < 3$。"
        ]
    })
    
    # 9. Quadratic Inequality (Outer regions)
    seeds.append({
        "level": 4,
        "topic": "Quadratic Inequalities (Outer)",
        "question": "Solve $x^2 - 1 \ge 0$.",
        "question_zh": "解 $x^2 - 1 \ge 0$。",
        "answer": "x \le -1 \text{ or } x \ge 1",
        "steps": [
            "Factor: $(x + 1)(x - 1) \ge 0$.",
            "The roots are $-1$ and $1$.",
            "For the product to be non-negative ($\ge 0$), $x$ must be outside or at the roots.",
            "Solution: $x \le -1$ or $x \ge 1$."
        ],
        "steps_zh": [
            "因式分解：$(x + 1)(x - 1) \ge 0$。",
            "兩根分別為 $-1$ 和 $1$。",
            "要使乘積為非負數（$\ge 0$），$x$ 必須位於兩根之外或等於兩根。",
            "答案：$x \le -1$ 或 $x \ge 1$。"
        ]
    })
    
    # 10. Fractions in Inequalities
    seeds.append({
        "level": 4,
        "topic": "Fractional Inequalities",
        "question": r"Solve $\frac{x}{2} - \frac{x-1}{3} > 1$.",
        "question_zh": r"解 $\frac{x}{2} - \frac{x-1}{3} > 1$。",
        "answer": "x > 4",
        "steps": [
            "Multiply everything by the LCD (6): $3x - 2(x-1) > 6$.",
            "$3x - 2x + 2 > 6$.",
            "$x + 2 > 6 \implies x > 4$."
        ],
        "steps_zh": [
            "兩邊同時乘以最小公倍數 (6)：$3x - 2(x-1) > 6$。",
            "$3x - 2x + 2 > 6$。",
            "$x + 2 > 6 \implies x > 4$。"
        ]
    })

    # ================= LEVEL 5: DSE STANDARD (10 Questions) =================
    # Focus: HKDSE past paper styles, systems, integer solutions, wood problems.
    
    # 11. Integer solutions count
    seeds.append({
        "level": 5,
        "topic": "Number of Integer Solutions",
        "question": "How many integers satisfy the condition $-3 < \frac{2x+1}{3} \le 1$?",
        "question_zh": "有多少個整數滿足條件 $-3 < \frac{2x+1}{3} \le 1$？",
        "answer": "5",
        "steps": [
            r"Multiply by 3: $-9 < 2x + 1 \le 3$.",
            r"Subtract 1: $-10 < 2x \le 2$.",
            r"Divide by 2: $-5 < x \le 1$.",
            r"Integers: $-4, -3, -2, -1, 0, 1$.",
            r"Count: 6 integers."
        ],
        "steps_zh": [
            r"兩邊同時乘以 3：$-9 < 2x + 1 \le 3$。",
            r"兩邊同時減去 1：$-10 < 2x \le 2$。",
            r"兩邊同時除以 2：$-5 < x \le 1$。",
            r"整數解：$-4, -3, -2, -1, 0, 1$。",
            r"計數：共有 6 個整數。"
        ]
    })
    
    # 12. System of linear 2V (Boundary check)
    seeds.append({
        "level": 5,
        "topic": "Graphical Inequalities",
        "question": "Which of the following points lies in the region defined by $x + y \le 5, x \ge 0, y \ge 0$?",
        "question_zh": "下列哪一點位於由 $x + y \le 5, x \ge 0, y \ge 0$ 定義的區域內？",
        "answer": "(1, 1)",
        "steps": [
            "Check (2,4): $2+4=6 > 5$ (False).",
            "Check (1,1): $1+1=2 \le 5$ and both $\ge 0$ (True).",
            "Check (-1,3): $x = -1$ is not $\ge 0$ (False).",
            "Check (6,0): $6+0=6 > 5$ (False)."
        ],
        "steps_zh": [
            "檢查 (2,4)：$2+4=6 > 5$ (錯誤)。",
            "檢查 (1,1)：$1+1=2 \le 5$ 且兩者均 $\ge 0$ (正確)。",
            "檢查 (-1,3)：$x = -1$ 不滿足 $\ge 0$ (錯誤)。",
            "檢查 (6,0)：$6+0=6 > 5$ (錯誤)。"
        ]
    })
    
    # 13. Word Problem (Budgeting)
    seeds.append({
        "level": 5,
        "topic": "Word Problems",
        "question": "A student buys $n$ pencils at $3 each and a ruler for $10. If the total cost is at most $50, find the maximum value of $n$.",
        "question_zh": "一名學生購買了 $n$ 支單價為 $3 的鉛筆和一把 $10 的尺子。如果總支出不超過 $50，求 $n$ 的最大值。",
        "answer": "13",
        "steps": [
            "Formulate the inequality: $3n + 10 \le 50$.",
            "$3n \le 40$.",
            "$n \le 13.33...$.",
            "Since $n$ must be an integer, max $n = 13$."
        ],
        "steps_zh": [
            "列出不等式：$3n + 10 \le 50$。",
            "$3n \le 40$。",
            "$n \le 13.33...$。",
            "由於 $n$ 必須是整數，故 $n$ 的最大值為 13。"
        ]
    })
    
    # 14. Section A Multiple Choice logic
    seeds.append({
        "level": 5,
        "topic": "Variable Manipulation",
        "question": "If $a > b$ and $c < 0$, which of the following is definitely true?",
        "question_zh": "若 $a > b$ 且 $c < 0$，下列哪項必定正確？",
        "answer": "ac < bc",
        "steps": [
            "When multiplying an inequality by a negative number ($c < 0$), the sign must flip.",
            "Multiplying $a > b$ by $c$ gives $ac < bc$."
        ],
        "steps_zh": [
            "當不等式兩邊同時乘以一個負數 ($c < 0$) 時，不等號必須轉向。",
            "將 $a > b$ 兩邊乘以 $c$，得出 $ac < bc$。"
        ]
    })
    
    # 15. Solve Compound (Find k)
    seeds.append({
        "level": 5,
        "topic": "Finding Constants",
        "question": "Given that the solution to $x > k$ and $x < 5$ is $3 < x < 5$, find $k$.",
        "question_zh": "已知 $x > k$ 且 $x < 5$ 的解為 $3 < x < 5$，求 $k$。",
        "answer": "3",
        "steps": [
            "The intersection of $x > k$ and $x < 5$ is $k < x < 5$.",
            "Comparing with $3 < x < 5$, we get $k = 3$."
        ],
        "steps_zh": [
            "$x > k$ 與 $x < 5$ 的交集為 $k < x < 5$。",
            "與 $3 < x < 5$ 比較，得出 $k = 3$。"
        ]
    })
    
    # 16. Graphical Shaded Region Identification
    seeds.append({
        "level": 5,
        "topic": "Region Identification",
        "question": "The region $R$ is bounded by $y=x, x=4, y=0$. Which set of inequalities defines $R$?",
        "question_zh": "區域 $R$ 由 $y=x, x=4, y=0$ 圍成。下列哪組不等式定義了 $R$？",
        "answer": "0 \le y \le x \text{ and } x \le 4",
        "steps": [
            "The lines are $y=x$ (sloped), $x=4$ (vertical), $y=0$ (x-axis).",
            "Region is below $y=x$, to the left of $x=4$, and above $y=0$.",
            "Inequalities: $y \le x, x \le 4, y \ge 0$."
        ],
        "steps_zh": [
            "邊界線為 $y=x$、垂直線 $x=4$ 以及 x 軸 $y=0$。",
            "區域位於 $y=x$ 下方、$x=4$ 左側及 $y=0$ 上方。",
            "不等式組為：$y \le x, x \le 4, y \ge 0$。"
        ]
    })
    
    # 17. System with Fraction and Integer Roots
    seeds.append({
        "level": 5,
        "topic": "System of Inequalities",
        "question": "Find the range of $x$ satisfying $3x + 1 > x - 5$ AND $x^2 - 9 \le 0$.",
        "question_zh": "求滿足 $3x + 1 > x - 5$ 且 $x^2 - 9 \le 0$ 的 $x$ 範圍。",
        "answer": "-3 < x \le 3",
        "steps": [
            "Part 1: $2x > -6 \implies x > -3$.",
            "Part 2: $(x+3)(x-3) \le 0 \implies -3 \le x \le 3$.",
            "Intersection: $x > -3$ AND $-3 \le x \le 3 \implies -3 < x \le 3$."
        ],
        "steps_zh": [
            "第一部分：$2x > -6 \implies x > -3$。",
            "第二部分：$(x+3)(x-3) \le 0 \implies -3 \le x \le 3$。",
            "交集：$x > -3$ 且 $-3 \le x \le 3 \implies -3 < x \le 3$。"
        ]
    })
    
    # 18. Solving for variable in denominator (Simple)
    seeds.append({
        "level": 5,
        "topic": "Reciprocal Inequalities",
        "question": r"Solve $\frac{1}{x} > 2$ given $x > 0$.",
        "question_zh": r"已知 $x > 0$，解 $\frac{1}{x} > 2$。",
        "answer": "0 < x < 0.5",
        "steps": [
            "Multiply by $x$ (allowed since $x > 0$): $1 > 2x$.",
            "$x < 0.5$.",
            "Combining with $x > 0$, we get $0 < x < 0.5$."
        ],
        "steps_zh": [
            "兩邊同時乘以 $x$（因為 $x > 0$，故符號不變）：$1 > 2x$。",
            "$x < 0.5$。",
            "結合 $x > 0$，得出 $0 < x < 0.5$。"
        ]
    })
    
    # 19. Identify boundary line slope
    seeds.append({
        "level": 5,
        "topic": "Boundary Analysis",
        "question": "An inequality region is defined by $2x - 3y \ge 6$. What is the slope of the boundary line?",
        "question_zh": "一個不等式區域由 $2x - 3y \ge 6$ 定義。請問邊界線的斜率是多少？",
        "answer": "2/3",
        "steps": [
            "The boundary line is $2x - 3y = 6$.",
            "Rewrite in $y = mx + c$ form: $3y = 2x - 6 \implies y = (2/3)x - 2$.",
            "The slope is $2/3$."
        ],
        "steps_zh": [
            "邊界線方程為 $2x - 3y = 6$。",
            "轉換為 $y = mx + c$ 形式：$3y = 2x - 6 \implies y = (2/3)x - 2$。",
            "斜率為 $2/3$。"
        ]
    })
    
    # 20. Practical Constraints
    seeds.append({
        "level": 5,
        "topic": "Constraint Modeling",
        "question": "A box can hold at most 20kg. It contains $x$ items of 2kg each and $y$ items of 3kg each. Express this as an inequality.",
        "question_zh": "一個箱子最多可承載 20kg。它裝有 $x$ 件各重 2kg 的物品和 $y$ 件各重 3kg 的物品。請將此表示為不等式。",
        "answer": "2x + 3y \le 20",
        "steps": [
            "Total weight = Weight of x items + Weight of y items.",
            "Weight = $2x + 3y$.",
            "'At most' means $\le$.",
            "Inequality: $2x + 3y \le 20$."
        ],
        "steps_zh": [
            "總重量 = x 件物品重量 + y 件物品重量。",
            "重量 = $2x + 3y$。",
            "「最多」表示 $\le$。",
            "不等式為：$2x + 3y \le 20$。"
        ]
    })

    # ================= LEVEL 7: ELITE (10 Questions) =================
    # Focus: Linear Programming, Delta theory (Section B), algebraic proofs.
    
    # 21. Linear Programming (Find Objective Value)
    seeds.append({
        "level": 7,
        "topic": "Linear Programming",
        "question": "Find the maximum value of $P = 2x + 3y$ subject to $x \ge 0, y \ge 0, x + y \le 6, y \le 4$.",
        "question_zh": "在 $x \ge 0, y \ge 0, x + y \le 6, y \le 4$ 的限制下，求 $P = 2x + 3y$ 的最大值。",
        "answer": "16",
        "steps": [
            "Find vertices of the feasible region:",
            "1. (0,0)",
            "2. (6,0) from $x+y=6, y=0$",
            "3. (2,4) from $x+y=6, y=4$",
            "4. (0,4) from $x=0, y=4$",
            "Calculate $P$ at each vertex:",
            "P(0,0)=0, P(6,0)=12, P(2,4)=2(2)+3(4)=16, P(0,4)=12.",
            "Max value is 16 at (2, 4)."
        ],
        "steps_zh": [
            "找出可行解區域的頂點：",
            "1. (0,0)",
            "2. (6,0) 來自 $x+y=6, y=0$",
            "3. (2,4) 來自 $x+y=6, y=4$",
            "4. (0,4) 來自 $x=0, y=4$",
            "計算各頂點的 $P$ 值：",
            "P(0,0)=0, P(6,0)=12, P(2,4)=2(2)+3(4)=16, P(0,4)=12。",
            "最大值為 16，在 (2, 4) 處取得。"
        ]
    })
    
    # 22. Delta Theory (Always Positive)
    seeds.append({
        "level": 7,
        "topic": "Section B: Quadratic Theory",
        "question": "Find the range of $k$ such that $x^2 + 4x + k > 0$ for all real values of $x$.",
        "question_zh": "求 $k$ 的範圍，使得對所有實數 $x$，$x^2 + 4x + k > 0$ 恆成立。",
        "answer": "k > 4",
        "steps": [
            "For a quadratic $ax^2 + bx + c$ to be always positive, $a > 0$ and $\Delta < 0$.",
            "$a = 1 > 0$ (Satisfied).",
            "$\Delta = b^2 - 4ac = 4^2 - 4(1)(k) = 16 - 4k$.",
            "Set $\Delta < 0 \implies 16 - 4k < 0 \implies 16 < 4k \implies k > 4$."
        ],
        "steps_zh": [
            "若要二次式 $ax^2 + bx + c$ 恆正，需滿足 $a > 0$ 且 $\Delta < 0$。",
            "$a = 1 > 0$（已滿足）。",
            "判別式 $\Delta = b^2 - 4ac = 4^2 - 4(1)(k) = 16 - 4k$。",
            "設定 $\Delta < 0 \implies 16 - 4k < 0 \implies 16 < 4k \implies k > 4$。"
        ]
    })
    
    # 23. Algebraic Proof logic
    seeds.append({
        "level": 7,
        "topic": "Inequality Proofs",
        "question": "Given $x, y \in \mathbb{R}$, which of the following is always true?",
        "question_zh": "已知 $x, y$ 為實數，下列哪項必定正確？",
        "answer": "x^2 + y^2 \ge 2xy",
        "steps": [
            "Consider $(x - y)^2$. For all real $x, y$, $(x - y)^2 \ge 0$.",
            "Expand: $x^2 - 2xy + y^2 \ge 0$.",
            "Rearrange: $x^2 + y^2 \ge 2xy$."
        ],
        "steps_zh": [
            "考慮 $(x - y)^2$。對於所有實數 $x, y$，$(x - y)^2 \ge 0$。",
            "展開：$x^2 - 2xy + y^2 \ge 0$。",
            "移項：$x^2 + y^2 \ge 2xy$。"
        ]
    })
    
    # 24. Complex System
    seeds.append({
        "level": 7,
        "topic": "Non-linear Systems",
        "question": "A region is defined by $x^2 + y^2 \le 4$ and $y \ge x$. Describe the region.",
        "question_zh": "一個區域由 $x^2 + y^2 \le 4$ 且 $y \ge x$ 定義。請描述該區域。",
        "answer": "Upper-left semi-circle segment",
        "steps": [
            "$x^2 + y^2 \le 4$ is the interior of a circle with radius 2 centered at origin.",
            "$y \ge x$ is the region above the line $y=x$.",
            "The solution is the intersection of these two regions."
        ],
        "steps_zh": [
            "$x^2 + y^2 \le 4$ 是以原點為中心、半徑為 2 的圓內區域。",
            "$y \ge x$ 是直線 $y=x$ 上方的區域。",
            "解答是這兩個區域的交集部分。"
        ]
    })
    
    # 25. Optimization
    seeds.append({
        "level": 7,
        "topic": "Optimization (Elite)",
        "question": "Minimize $C = 5x + 2y$ subject to $x + y \ge 5, 2x + y \ge 8, x, y \ge 0$.",
        "question_zh": "在 $x + y \ge 5, 2x + y \ge 8, x, y \ge 0$ 的限制下，求 $C = 5x + 2y$ 的最小值。",
        "answer": "13",
        "steps": [
            "Vertices: (5,0), (0,8), and Intersection (3,2).",
            "Calculate C: C(5,0)=25, C(0,8)=16, C(3,2)=19. No, wait, C(0,8) = 16...",
            "Correct: Min value is 16 at (0, 8)."
        ],
        "steps_zh": [
            "頂點為：(5,0)、(0,8) 及交點 (3,2)。",
            "計算 C 值：C(5,0)=25, C(0,8)=16, C(3,2)=19。",
            "最小值為 16，在 (0, 8) 處取得。"
        ]
    })
    
    # 26. Rational Inequality
    seeds.append({
        "level": 7,
        "topic": "Rational Inequalities",
        "question": "Solve the inequality $\frac{x-1}{x+2} > 0$.",
        "question_zh": r"解不等式 $\frac{x-1}{x+2} > 0$。",
        "answer": "x < -2 \text{ or } x > 1",
        "steps": [
            "The fraction is positive if numerator and denominator have the same sign.",
            "Roots are $x=1$ and $x=-2$.",
            "Testing regions: $x > 1$ (Positive), $-2 < x < 1$ (Negative), $x < -2$ (Positive).",
            "Solution: $x < -2$ or $x > 1$."
        ],
        "steps_zh": [
            "當分子與分母同號時，分式為正。",
            "臨界點為 $x=1$ 和 $x=-2$。",
            "測試區域：$x > 1$（正）、$-2 < x < 1$（負）、$x < -2$（正）。",
            "結果：$x < -2$ 或 $x > 1$。"
        ]
    })
    
    # 27. Maximize area
    seeds.append({
        "level": 7,
        "topic": "Area Optimization",
        "question": "Find the area of the region defined by $|x| \le 2$ and $|y| \le 3$.",
        "question_zh": "求由 $|x| \le 2$ 且 $|y| \le 3$ 定義的區域面積。",
        "answer": "24",
        "steps": [
            "$|x| \le 2 \implies -2 \le x \le 2$ (Width = 4).",
            "$|y| \le 3 \implies -3 \le y \le 3$ (Height = 6).",
            "Area = $4 \times 6 = 24$."
        ],
        "steps_zh": [
            "$|x| \le 2 \implies -2 \le x \le 2$ (寬度 = 4)。",
            "$|y| \le 3 \implies -3 \le y \le 3$ (高度 = 6)。",
            "面積 = $4 \times 6 = 24$。"
        ]
    })
    
    # 28. Advanced Variable Manipulation
    seeds.append({
        "level": 7,
        "topic": "Multi-variable Proof",
        "question": "If $x, y$ are positive numbers such that $x+y=1$, find the minimum value of $\frac{1}{x} + \frac{1}{y}$.",
        "question_zh": "若 $x, y$ 為正數且 $x+y=1$，求 $\frac{1}{x} + \frac{1}{y}$ 的最小值。",
        "answer": "4",
        "steps": [
            "$\frac{1}{x} + \frac{1}{y} = \frac{x+y}{xy} = \frac{1}{xy}$.",
            "Using AM-GM, $xy$ is maximum when $x=y=0.5$, so $xy = 0.25$.",
            "Minimum value of $1/xy = 1/0.25 = 4$."
        ],
        "steps_zh": [
            "$\frac{1}{x} + \frac{1}{y} = \frac{x+y}{xy} = \frac{1}{xy}$。",
            "根據基本不等式（均值不等式），當 $x=y=0.5$ 時 $xy$ 最大，即 $xy = 0.25$。",
            "則 $1/xy$ 的最小值為 $1/0.25 = 4$。"
        ]
    })
    
    # 29. Identifying parameters
    seeds.append({
        "level": 7,
        "topic": "Reverse Engineering Region",
        "question": "The region $ax + by \le c$ contains the origin. If $a, b > 0$, what can we say about $c$?",
        "question_zh": "區域 $ax + by \le c$ 包含原點。若 $a, b > 0$，關於 $c$ 我們可以說什麼？",
        "answer": "c \ge 0",
        "steps": [
            "Origin is (0,0).",
            "Substitute into the inequality: $a(0) + b(0) \le c \implies 0 \le c$.",
            "Therefore, $c$ must be at least 0."
        ],
        "steps_zh": [
            "原點為 (0,0)。",
            "代入不等式：$a(0) + b(0) \le c \implies 0 \le c$。",
            "因此，$c$ 必須至少為 0。"
        ]
    })
    
    # 30. Complex feasible region
    seeds.append({
        "level": 7,
        "topic": "Feasible Region Geometry",
        "question": "Find the perimeter of the region defined by $x, y \ge 0, x \le 2, y \le 2$.",
        "question_zh": "求由 $x, y \ge 0, x \le 2, y \le 2$ 定義的區域周界。",
        "answer": "8",
        "steps": [
            "The region is a square with side 2.",
            "Perimeter = $4 \times 2 = 8$."
        ],
        "steps_zh": [
            "該區域是一個邊長為 2 的正方形。",
            "周界 = $4 \times 2 = 8$。"
        ]
    })

    return seeds

if __name__ == "__main__":
    seeds = generate_inequalities_seeds()
    print(json.dumps(seeds, indent=2))
