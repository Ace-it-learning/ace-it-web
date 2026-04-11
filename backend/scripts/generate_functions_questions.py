def generate_questions():
    questions = []
    topic_id = "math_alg_functions" 
    
    # --- 5 EASY (Level 3) ---
    # 1. Evaluate f(a)
    questions.append({
        "id": "func_01",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 3,
        "type": "short_answer",
        "marks": 2,
        "question": r"Given $f(x) = 2x^2 - 3x + 5$, find $f(-2)$. Looking at the parabola sketch below, does it open upwards or downwards?",
        "question_zh": r"已知 $f(x) = 2x^2 - 3x + 5$，求 $f(-2)$。觀察下方拋物線草圖，它是向上還是向下開口？",
        "answer": "19, upwards",
        "correct_answer": "19",
        "solution_steps": r"1. Substitute $x = -2$ into $f(x)$: $f(-2) = 2(-2)^2 - 3(-2) + 5$.\n2. Calculate: $2(4) + 6 + 5 = 8 + 6 + 5 = 19$.",
        "solution_steps_zh": r"1. 將 $x = -2$ 代入 $f(x)$：$f(-2) = 2(-2)^2 - 3(-2) + 5$。\n2. 計算：$2(4) + 6 + 5 = 8 + 6 + 5 = 19$。"
    })
    
    # 2. Find y-intercept
    questions.append({
        "id": "func_02",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 3,
        "type": "short_answer",
        "marks": 2,
        "question": r"Find the $y$-intercept of the graph of $y = -x^2 + 4x - 7$.",
        "question_zh": r"求 $y = -x^2 + 4x - 7$ 的圖像之 $y$ 軸截距。",
        "answer": "-7",
        "correct_answer": "-7",
        "solution_steps": r"1. The $y$-intercept occurs when $x = 0$.\n2. Substitute $x = 0$: $y = -(0)^2 + 4(0) - 7 = -7$.",
        "solution_steps_zh": r"1. 當 $x = 0$ 時出現 $y$ 軸截距。\n2. 代入 $x = 0$：$y = -(0)^2 + 4(0) - 7 = -7$。"
    })

    # 3. Read roots from graph (Easy)
    questions.append({
        "id": "func_03",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": r"Based on the graph, what are the roots of the quadratic equation? (Smallest root first, separated by comma)",
        "question_zh": r"根據圖像，該二次方程的根是什麼？（由小到大排列，以逗號分隔）",
        "answer": "-2, 4",
        "correct_answer": "-2, 4",
        "solution_steps": r"1. Roots are the $x$-coordinates where the graph crosses the $x$-axis.\n2. Observations show intersections at $x = -2$ and $x = 4$.",
        "solution_steps_zh": r"1. 根是圖像與 $x$ 軸相交處的 $x$ 座標。\n2. 觀察顯示交點位於 $x = -2$ 和 $x = 4$。"
    })

    # 4. Opening direction
    questions.append({
        "id": "func_04",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 3,
        "type": "short_answer",
        "marks": 2,
        "question": r"Does the graph of $y = 3 - 5x + 2x^2$ open upwards or downwards? (Type 'up' or 'down')",
        "question_zh": r"$y = 3 - 5x + 2x^2$ 的圖像開口向上還是向下？（輸入 'up' 或 'down'）",
        "answer": "up",
        "correct_answer": "up",
        "solution_steps": r"1. Rewrite in standard form: $y = 2x^2 - 5x + 3$.\n2. The coefficient of $x^2$ is $a = 2$.\n3. Since $a > 0$, the graph opens upwards.",
        "solution_steps_zh": r"1. 重寫為標準式：$y = 2x^2 - 5x + 3$。\n2. $x^2$ 的係數為 $a = 2$。\n3. 由於 $a > 0$，圖像開口向上。"
    })

    # 5. Domain restriction
    questions.append({
        "id": "func_05",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 3,
        "type": "short_answer",
        "marks": 2,
        "question": r"Find the value of $x$ that must be excluded from the domain of $f(x) = \frac{1}{x-4}$.",
        "question_zh": r"求必須從 $f(x) = \frac{1}{x-4}$ 的定義域中排除的 $x$ 值。",
        "answer": "4",
        "correct_answer": "4",
        "solution_steps": r"1. The denominator cannot be zero.\n2. Solve $x - 4 = 0 \implies x = 4$.",
        "solution_steps_zh": r"1. 分母不能為零。\n2. 解 $x - 4 = 0 \implies x = 4$。"
    })

    # --- 5 MEDIUM (Level 4) ---
    # 6. Complete square for vertex
    questions.append({
        "id": "func_06",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": r"Find the vertex of $y = x^2 - 6x + 10$. (Format: (h,k))",
        "question_zh": r"求 $y = x^2 - 6x + 10$ 的頂點。（格式：(h,k)）",
        "answer": "(3,1)",
        "correct_answer": "(3,1)",
        "solution_steps": r"1. Complete the square: $y = (x^2 - 6x + 9) - 9 + 10$.\n2. $y = (x - 3)^2 + 1$.\n3. The vertex is $(3, 1)$.",
        "solution_steps_zh": r"1. 配方：$y = (x^2 - 6x + 9) - 9 + 10$。\n2. $y = (x - 3)^2 + 1$。\n3. 頂點為 $(3, 1)$。"
    })

    # 7. Basic discriminant case
    questions.append({
        "id": "func_07",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 4,
        "type": "short_answer",
        "marks": 3,
        "question": r"Find the value of $k$ if the graph of $y = x^2 + 8x + k$ touches the $x$-axis at only one point.",
        "question_zh": r"若 $y = x^2 + 8x + k$ 的圖像與 $x$ 軸僅相交於一點，求 $k$ 的值。",
        "answer": "16",
        "correct_answer": "16",
        "solution_steps": r"1. One intersection point means $\Delta = 0$.\n2. $\Delta = 8^2 - 4(1)(k) = 64 - 4k = 0$.\n3. $4k = 64 \implies k = 16$.",
        "solution_steps_zh": r"1. 一個交點意味著 $\Delta = 0$。\n2. $\Delta = 8^2 - 4(1)(k) = 64 - 4k = 0$。\n3. $4k = 64 \implies k = 16$。"
    })

    # 8. Translation f(x)+k
    questions.append({
        "id": "func_08",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 4,
        "type": "short_answer",
        "marks": 2,
        "question": r"The graph of $y = f(x)$ is translated upwards by 5 units. If the original equation is $f(x) = 2x^2$, what is the new equation?",
        "question_zh": r"$y = f(x)$ 的圖像向上平移 5 個單位。若原始方程為 $f(x) = 2x^2$，新方程是什麼？",
        "answer": "y = 2x^2 + 5",
        "correct_answer": "y = 2x^2 + 5",
        "solution_steps": r"1. Upward translation of $k$ units is $f(x) + k$.\n2. New equation: $y = 2x^2 + 5$.",
        "solution_steps_zh": r"1. 向上平移 $k$ 個單位為 $f(x) + k$。\n2. 新方程：$y = 2x^2 + 5$。"
    })

    # 9. Find k from point
    questions.append({
        "id": "func_09",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 4,
        "type": "short_answer",
        "marks": 3,
        "question": r"The graph of $y = x^2 + k$ passes through $(2, 10)$. Find $k$.",
        "question_zh": r"$y = x^2 + k$ 的圖像經過 $(2, 10)$。求 $k$。",
        "answer": "6",
        "correct_answer": "6",
        "solution_steps": r"1. Substitute $(2, 10)$ into the equation: $10 = (2)^2 + k$.\n2. $10 = 4 + k \implies k = 6$.",
        "solution_steps_zh": r"1. 將 $(2, 10)$ 代入方程：$10 = (2)^2 + k$。\n2. $10 = 4 + k \implies k = 6$。"
    })

    # 10. Axis of symmetry
    questions.append({
        "id": "func_10",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 4,
        "type": "short_answer",
        "marks": 3,
        "question": r"Determine the axis of symmetry for $y = -2(x + 4)^2 - 7$.",
        "question_zh": r"求 $y = -2(x + 4)^2 - 7$ 的對稱軸。",
        "answer": "x = -4",
        "correct_answer": "x = -3",
        "solution_steps": r"1. Axis of symmetry is $x = -b/2a$.\n2. $a = 2, b = 12 \implies x = -12/(2 \times 2) = -12/4 = -3$.",
        "solution_steps_zh": r"1. 對稱軸為 $x = -b/2a$。\n2. $a = 2, b = 12 \implies x = -12/(2 \times 2) = -12/4 = -3$。"
    })

    # --- 10 DSE STANDARD (Level 5) ---
    # 11. Intersection coordinates
    questions.append({
        "id": "func_11",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"Find the intersection points of the line $y = x + 2$ and the parabola $y = x^2$. (Format: (x1,y1), (x2,y2) where x1 < x2)",
        "question_zh": r"求直線 $y = x + 2$ 與拋物線 $y = x^2$ 的交點。（格式：(x1,y1), (x2,y2)，其中 x1 < x2）",
        "answer": "(-1,1), (2,4)",
        "correct_answer": "(-1,1), (2,4)",
        "solution_steps": r"1. Set equations equal: $x^2 = x + 2$.\n2. $x^2 - x - 2 = 0 \implies (x-2)(x+1) = 0$.\n3. $x = 2$ or $x = -1$.\n4. For $x = 2, y = 4$. For $x = -1, y = 1$.\n5. Points are $(-1, 1)$ and $(2, 4)$.",
        "solution_steps_zh": r"1. 令方程相等：$x^2 = x + 2$。\n2. $x^2 - x - 2 = 0 \implies (x-2)(x+1) = 0$。\n3. $x = 2$ 或 $x = -1$。\n4. 當 $x = 2$ 時 $y = 4$；當 $x = -1$ 時 $y = 1$。\n5. 交點為 $(-1, 1)$ 和 $(2, 4)$。"
    })

    # 12. Signs from SVG
    questions.append({
        "id": "func_12",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"In the graph of $y = ax^2 + bx + c$, determine the signs of $a$ and $c$ if the graph opens downwards and has a positive $y$-intercept. (Format: a>0,c<0 etc.)",
        "question_zh": r"在 $y = ax^2 + bx + c$ 的圖像中，若圖像開口向下且 $y$ 軸截距為正，判斷 $a$ 和 $c$ 的正負號。（格式：a>0,c<0 等）",
        "answer": "a<0, c>0",
        "correct_answer": "a<0, c>0",
        "solution_steps": r"1. Graph opens downwards $\implies a < 0$.\n2. $y$-intercept is above the $x$-axis $\implies c > 0$.",
        "solution_steps_zh": r"1. 圖像開口向下 $\implies a < 0$。\n2. $y$ 軸截距在 $x$ 軸上方 $\implies c > 0$。"
    })

    # 13. Horizontal shift f(x-h)
    questions.append({
        "id": "func_13",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 3,
        "question": r"If $f(x) = x^2 + 4$, find the equation of $y = f(x - 3)$.",
        "question_zh": r"若 $f(x) = x^2 + 4$，求 $y = f(x - 3)$ 的方程。",
        "answer": "y = (x-3)^2 + 4",
        "correct_answer": "y = (x-3)^2 + 4",
        "solution_steps": r"1. Replace $x$ with $(x - 3)$ in the function: $f(x-3) = (x-3)^2 + 4$.",
        "solution_steps_zh": r"1. 將函數中的 $x$ 替換為 $(x - 3)$：$f(x-3) = (x-3)^2 + 4$。"
    })

    # 14. Linear intersection count (discriminant)
    questions.append({
        "id": "func_14",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"Find the range of $m$ if the line $y = mx + 1$ does not intersect the parabola $y = x^2 + 2x + 5$.",
        "question_zh": r"若直線 $y = mx + 1$ 與拋物線 $y = x^2 + 2x + 5$ 不相交，求 $m$ 的範圍。",
        "answer": "-2 < m < 6",
        "correct_answer": r"-2 \lt m \lt 6",
        "solution_steps": r"1. $x^2 + 2x + 5 = mx + 1 \implies x^2 + (2-m)x + 4 = 0$.\n2. No intersection $\implies \Delta < 0$.\n3. $(2-m)^2 - 4(1)(4) < 0 \implies (2-m)^2 - 16 < 0$.\n4. $(2-m-4)(2-m+4) < 0 \implies (-m-2)(6-m) < 0$.\n5. $(m+2)(m-6) < 0 \implies -2 < m < 6$.",
        "solution_steps_zh": r"1. $x^2 + 2x + 5 = mx + 1 \implies x^2 + (2-m)x + 4 = 0$。\n2. 不相交 $\implies \Delta < 0$。\n3. $(2-m)^2 - 4(1)(4) < 0 \implies (2-m)^2 - 16 < 0$。\n4. $(2-m-4)(2-m+4) < 0 \implies (-m-2)(6-m) < 0$。\n5. $(m+2)(m-6) < 0 \implies -2 < m < 6$。"
    })

    # 15. Vertex shift
    questions.append({
        "id": "func_15",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 3,
        "question": r"The vertex of $y = f(x)$ is $(3, -2)$. What is the vertex of $y = f(x + 4) - 7$?",
        "question_zh": r"$y = f(x)$ 的頂點為 $(3, -2)$。$y = f(x + 4) - 7$ 的頂點是什麼？",
        "answer": "(-1,-9)",
        "correct_answer": "(-1,-9)",
        "solution_steps": r"1. $f(x+4)$ shifts left by 4 units: $3 - 4 = -1$.\n2. $-7$ shifts down by 7 units: $-2 - 7 = -9$.\n3. New vertex is $(-1, -9)$.",
        "solution_steps_zh": r"1. $f(x+4)$ 向左平移 4 個單位：$3 - 4 = -1$。\n2. $-7$ 向下平移 7 個單位：$-2 - 7 = -9$。\n3. 新頂點為 $(-1, -9)$。"
    })

    # 16. Signs of b
    questions.append({
        "id": "func_16",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"In the graph of $y = ax^2 + bx + c$, the vertex is in the first quadrant and $a > 0$. Determine the sign of $b$.",
        "question_zh": r"在 $y = ax^2 + bx + c$ 的圖像中，頂點在第一象限且 $a > 0$。判斷 $b$ 的正負號。",
        "answer": "b < 0",
        "correct_answer": r"b \lt 0",
        "solution_steps": r"1. Vertex in 1st quadrant $\implies x$-coordinate is positive: $-b/2a > 0$.\n2. Since $a > 0$, then $-b > 0 \implies b < 0$.",
        "solution_steps_zh": r"1. 頂點在第一象限 $\implies x$ 座標為正：$-b/2a > 0$。\n2. 由於 $a > 0$，所以 $-b > 0 \implies b < 0$。"
    })

    # 17. Constant term significance
    questions.append({
        "id": "func_17",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 3,
        "question": r"The graph of $y = kx^2 + (1-2k)x + k$ is always above the $x$-axis. Find the range of $k$.",
        "question_zh": r"若 $y = kx^2 + (1-2k)x + k$ 的圖像始終在 $x$ 軸上方，求 $k$ 的範圍。",
        "answer": "k > 1/4",
        "correct_answer": r"k \gt 1/4",
        "solution_steps": r"1. Always above $x$-axis $\implies a > 0$ and $\Delta < 0$.\n2. $k > 0$ and $(1-2k)^2 - 4(k)(k) < 0$.\n3. $1 - 4k + 4k^2 - 4k^2 < 0 \implies 1 - 4k < 0 \implies 4k > 1 \implies k > 1/4$.",
        "solution_steps_zh": r"1. 始終在 $x$ 軸上方 $\implies a > 0$ 且 $\Delta < 0$。\n2. $k > 0$ 且 $(1-2k)^2 - 4(k)(k) < 0$。\n3. $1 - 4k + 4k^2 - 4k^2 < 0 \implies 1 - 4k < 0 \implies 4k > 1 \implies k > 1/4$。"
    })

    # 18. Parabola passing through roots
    questions.append({
        "id": "func_18",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"A parabola has roots $x=1$ and $x=5$, and its $y$-intercept is 10. Find its equation in standard form.",
        "question_zh": r"一條拋物線的根為 $x=1$ 和 $x=5$，其 $y$ 軸截距為 10。求其標準式方程。",
        "answer": "y = 2x^2 - 12x + 10",
        "correct_answer": "y = 2x^2 - 12x + 10",
        "solution_steps": r"1. Equation: $y = a(x-1)(x-5)$.\n2. At $x=0, y=10 \implies 10 = a(-1)(-5) = 5a \implies a = 2$.\n3. $y = 2(x^2 - 6x + 5) = 2x^2 - 12x + 10$.",
        "solution_steps_zh": r"1. 方程：$y = a(x-1)(x-5)$。\n2. 當 $x=0, y=10 \implies 10 = a(-1)(-5) = 5a \implies a = 2$。\n3. $y = 2(x^2 - 6x + 5) = 2x^2 - 12x + 10$。"
    })

    # 19. Reflection
    questions.append({
        "id": "func_19",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 3,
        "question": r"If $f(x) = (x-2)^2 + 3$, find the vertex of the reflection of $y=f(x)$ across the $x$-axis.",
        "question_zh": r"若 $f(x) = (x-2)^2 + 3$，求 $y=f(x)$ 沿 $x$ 軸反射後的頂點。",
        "answer": "(2,-3)",
        "correct_answer": "(2,-3)",
        "solution_steps": r"1. Original vertex is $(2, 3)$.\n2. Reflection across $x$-axis changes the sign of $y$: $(2, -3)$.",
        "solution_steps_zh": r"1. 原始頂點為 $(2, 3)$。\n2. 沿 $x$ 軸反射會改變 $y$ 的正負號：$(2, -3)$。"
    })

    # 20. Tangent line
    questions.append({
        "id": "func_20",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"Find the value of $c$ such that the line $y = 4x + c$ is tangent to the parabola $y = x^2$.",
        "question_zh": r"求 $c$ 的值，使得直線 $y = 4x + c$ 與拋物線 $y = x^2$ 相切。",
        "answer": "-4",
        "correct_answer": "-4",
        "solution_steps": r"1. $x^2 = 4x + c \implies x^2 - 4x - c = 0$.\n2. Tangent $\implies \Delta = 0$.\n3. $(-4)^2 - 4(1)(-c) = 0 \implies 16 + 4c = 0 \implies c = -4$.",
        "solution_steps_zh": r"1. $x^2 = 4x + c \implies x^2 - 4x - c = 0$。\n2. 相切 $\implies \Delta = 0$。\n3. $(-4)^2 - 4(1)(-c) = 0 \implies 16 + 4c = 0 \implies c = -4$。"
    })

    # --- 10 ELITE (Level 7) ---
    # 21. Max area word problem
    questions.append({
        "id": "func_21",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 6,
        "question": r"A farmer has 100m of fencing to enclose a rectangular area against a straight wall. Find the maximum area possible.",
        "question_zh": r"一位農民有 100 米長的圍欄，用於在一面直牆邊圍出一個矩形區域。求可能的最大面積。",
        "answer": "1250",
        "correct_answer": "1250",
        "solution_steps": r"1. Let the width be $x$ and length be $L$. $2x + L = 100 \implies L = 100 - 2x$.\n2. Area $A = x(100 - 2x) = 100x - 2x^2$.\n3. Vertex at $x = -100/(2 \times -2) = 25$.\n4. Max area $A = 25(100 - 50) = 25(50) = 1250$ m$^2$.",
        "solution_steps_zh": r"1. 設寬為 $x$，長為 $L$。$2x + L = 100 \implies L = 100 - 2x$。\n2. 面積 $A = x(100 - 2x) = 100x - 2x^2$。\n3. 頂點在 $x = -100/(2 \times -2) = 25$。\n4. 最大面積 $A = 25(100 - 50) = 25(50) = 1250$ $\text{m}^2$。"
    })

    # 22. Full equation from vertex
    questions.append({
        "id": "func_22",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 5,
        "question": r"Find the equation of a parabola with vertex $(1, -4)$ that passing through $(3, 8)$.",
        "question_zh": r"求一條頂點為 $(1, -4)$ 且經過 $(3, 8)$ 的拋物線方程。",
        "answer": "y = 3(x-1)^2 - 4",
        "correct_answer": "y = 3(x-1)^2 - 4",
        "solution_steps": r"1. Use vertex form: $y = a(x - 1)^2 - 4$.\n2. Substitute $(3, 8): 8 = a(3 - 1)^2 - 4 \implies 12 = 4a \implies a = 3$.\n3. Equation is $y = 3(x - 1)^2 - 4$.",
        "solution_steps_zh": r"1. 使用頂點式：$y = a(x - 1)^2 - 4$。\n2. 代入 $(3, 8)：8 = a(3 - 1)^2 - 4 \implies 12 = 4a \implies a = 3$。\n3. 方程為 $y = 3(x - 1)^2 - 4$。"
    })

    # 23. Combined transformations
    questions.append({
        "id": "func_23",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 4,
        "question": r"Starting with $y = x^2$, reflect across the $x$-axis, then translate right by 2 and up by 4. What is the new equation?",
        "question_zh": r"從 $y = x^2$ 開始，先沿 $x$ 軸反射，然後向右平移 2 個單位，向上平移 4 個單位。新方程是什麼？",
        "answer": "y = -(x-2)^2 + 4",
        "correct_answer": "y = -(x-2)^2 + 4",
        "solution_steps": r"1. Reflection: $y = -x^2$.\n2. Translate right by 2: $y = -(x - 2)^2$.\n3. Translate up by 4: $y = -(x - 2)^2 + 4$.",
        "solution_steps_zh": r"1. 反射：$y = -x^2$。\n2. 向右平移 2：$y = -(x - 2)^2$。\n3. 向上平移 4：$y = -(x - 2)^2 + 4$。"
    })

    # 24. Optimization: Sum of squares
    questions.append({
        "id": "func_24",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 5,
        "question": r"Two numbers sum to 20. Find the minimum possible value of the sum of their squares.",
        "question_zh": r"兩個數的和為 20。求這兩個數的平方和的最小值。",
        "answer": "200",
        "correct_answer": "200",
        "solution_steps": r"1. Let numbers be $x$ and $20-x$.\n2. Sum $S = x^2 + (20-x)^2 = x^2 + 400 - 40x + x^2 = 2x^2 - 40x + 400$.\n3. Vertex at $x = -(-40)/(2 \times 2) = 10$.\n4. Min sum $S = 2(100) - 400 + 400 = 200$.",
        "solution_steps_zh": r"1. 設這兩個數為 $x$ 和 $20-x$。\n2. 平方和 $S = x^2 + (20-x)^2 = x^2 + 400 - 40x + x^2 = 2x^2 - 40x + 400$。\n3. 頂點在 $x = -(-40)/(2 \times 2) = 10$。\n4. 最小平方和 $S = 2(100) - 400 + 400 = 200$。"
    })

    # 25. Intersection of two parabolas
    questions.append({
        "id": "func_25",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 6,
        "question": r"Find the $x$-coordinates of the intersection of $y = x^2 - 4x + 1$ and $y = -x^2 + 2x + 9$. (Smaller value first, separated by comma)",
        "question_zh": r"求 $y = x^2 - 4x + 1$ 與 $y = -x^2 + 2x + 9$ 交點的 $x$ 座標。（較小值在前，以逗號分隔）",
        "answer": "-1, 4",
        "correct_answer": "-1, 4",
        "solution_steps": r"1. $x^2 - 4x + 1 = -x^2 + 2x + 9 \implies 2x^2 - 6x - 8 = 0$.\n2. $x^2 - 3x - 4 = 0 \implies (x-4)(x+1) = 0$.\n3. $x = 4$ or $x = -1$.",
        "solution_steps_zh": r"1. $x^2 - 4x + 1 = -x^2 + 2x + 9 \implies 2x^2 - 6x - 8 = 0$。\n2. $x^2 - 3x - 4 = 0 \implies (x-4)(x+1) = 0$。\n3. $x = 4$ 或 $x = -1$。"
    })

    # 26. Determine a,b,c from 3 points
    questions.append({
        "id": "func_26",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 6,
        "question": r"Find the quadratic equation passing through $(0, 2), (1, 3),$ and $(2, 6)$.",
        "question_zh": r"求經過 $(0, 2), (1, 3)$ 和 $(2, 6)$ 的二次方程。",
        "answer": "y = x^2 + 2",
        "correct_answer": "y = x^2 + 2",
        "solution_steps": r"1. $(0,2) \implies c = 2$.\n2. $(1,3) \implies a + b + 2 = 3 \implies a + b = 1$.\n3. $(2,6) \implies 4a + 2b + 2 = 6 \implies 4a + 2b = 4 \implies 2a + b = 2$.\n4. Subtract eqs: $a = 1, b = 0$.\n5. Equation is $y = x^2 + 2$.",
        "solution_steps_zh": r"1. $(0,2) \implies c = 2$。\n2. $(1,3) \implies a + b + 2 = 3 \implies a + b = 1$。\n3. $(2,6) \implies 4a + 2b + 2 = 6 \implies 4a + 2b = 4 \implies 2a + b = 2$。\n4. 聯立求解：$a = 1, b = 0$。\n5. 方程為 $y = x^2 + 2$。"
    })

    # 27. Function composition shift
    questions.append({
        "id": "func_27",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 5,
        "question": r"If $f(x) = x^2$, what is the equation of the line representing the axis of symmetry of $y = f(x-h)+k$?",
        "question_zh": r"若 $f(x) = x^2$，則 $y = f(x-h)+k$ 的對稱軸方程是什麼？",
        "answer": "x = h",
        "correct_answer": "x = h",
        "solution_steps": r"1. $f(x) = x^2$ has axis $x = 0$.\n2. $f(x-h)$ shifts graph right by $h$, so axis becomes $x = h$.",
        "solution_steps_zh": r"1. $f(x) = x^2$ 的對稱軸為 $x = 0$。\n2. $f(x-h)$ 將圖像向右平移 $h$，因此對稱軸變為 $x = h$。"
    })

    # 28. Discriminant in inequalities
    questions.append({
        "id": "func_28",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 5,
        "question": r"Find the range of $p$ for which $x^2 + px + p + 3 = 0$ has no real roots.",
        "question_zh": r"求 $p$ 的範圍，使得 $x^2 + px + p + 3 = 0$ 沒有實根。",
        "answer": "-2 < p < 6",
        "correct_answer": r"-2 \lt p \lt 6",
        "solution_steps": r"1. No real roots $\implies \Delta < 0$.\n2. $p^2 - 4(1)(p+3) < 0 \implies p^2 - 4p - 12 < 0$.\n3. $(p-6)(p+2) < 0 \implies -2 < p < 6$.",
        "solution_steps_zh": r"1. 沒有實根 $\implies \Delta < 0$。\n2. $p^2 - 4(1)(p+3) < 0 \implies p^2 - 4p - 12 < 0$。\n3. $(p-6)(p+2) < 0 \implies -2 < p < 6$。"
    })

    # 29. Max height of projectile
    questions.append({
        "id": "func_29",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 5,
        "question": r"The height of a ball is given by $h(t) = -5t^2 + 20t + 2$. Find the maximum height reached.",
        "question_zh": r"一個球的高度由 $h(t) = -5t^2 + 20t + 2$ 給出。求球達到的最大高度。",
        "answer": "22",
        "correct_answer": "22",
        "solution_steps": r"1. Max height at $t = -20/(2 \times -5) = 2$.\n2. $h(2) = -5(4) + 20(2) + 2 = -20 + 40 + 2 = 22$.",
        "solution_steps_zh": r"1. 最大高度在 $t = -20/(2 \times -5) = 2$ 時達到。\n2. $h(2) = -5(4) + 20(2) + 2 = -20 + 40 + 2 = 22$。"
    })

    # 30. Complex graph relationship
    questions.append({
        "id": "func_30",
        "topic_id": topic_id,
        "subject": "Maths",
        "level": 7,
        "type": "short_answer",
        "marks": 6,
        "question": r"The graph of $y = kx^2 + 2x + 1$ is tangent to the $x$-axis. Find $k$.",
        "question_zh": r"若 $y = kx^2 + 2x + 1$ 的圖像與 $x$ 軸相切，求 $k$ 到值。",
        "answer": "1",
        "correct_answer": "1",
        "solution_steps": r"1. Tangent to $x$-axis $\implies \\Delta = 0$.\n2. $2^2 - 4(k)(1) = 0 \implies 4 - 4k = 0 \implies k = 1$.",
        "solution_steps_zh": r"1. 與 $x$ 軸相切 $\implies \\Delta = 0$。\n2. $2^2 - 4(k)(1) = 0 \implies 4 - 4k = 0 \implies k = 1$。"
    })

    with open('functions_graphs.json', 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("Successfully generated 30 questions in functions_graphs.json")

if __name__ == "__main__":
    generate_questions()
