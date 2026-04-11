import random
import json
import math

def generate_complex_numbers_seeds():
    seeds = []
    
    # helper for formatting complex numbers
    def fmt_c(a, b):
        if b == 0: return f"${a}$"
        if a == 0:
            if b == 1: return "$i$"
            if b == -1: return "$-i$"
            return f"${b}i$"
        sign = "+" if b > 0 else "-"
        abs_b = abs(b)
        b_str = "i" if abs_b == 1 else f"{abs_b}i"
        return f"${a} {sign} {b_str}$"

    # ================= LEVEL 3: EASY (Q1-Q8: 8 Questions) =================
    # Basic operations, i^2=-1, Real/Imag parts
    
    # 1. Addition
    a, b, c, d = random.randint(1, 10), random.randint(1, 10), random.randint(1, 10), random.randint(1, 10)
    seeds.append({
        "id": "complex_num_01",
        "level": 3,
        "question": f"Simplify $({a} + {b}i) + ({c} + {d}i)$ and express the result in the form $a+bi$.",
        "question_zh": f"化簡 $({a} + {b}i) + ({c} + {d}i)$ 並以 $a+bi$ 的形式表示結果。",
        "answer": f"{a+c} + {b+d}i",
        "correct_answer": f"${a+c} + {b+d}i$",
        "solution_steps": [
            f"Combine the real parts: ${a} + {c} = {a+c}$.",
            f"Combine the imaginary parts: ${b}i + {d}i = ({b} + {d})i = {b+d}i$.",
            f"The result is ${a+c} + {b+d}i$."
        ],
        "solution_steps_zh": [
            f"合併實部：${a} + {c} = {a+c}$。",
            f"合併虛部：${b}i + {d}i = ({b} + {d})i = {b+d}i$。",
            f"結果為 ${a+c} + {b+d}i$。"
        ]
    })

    # 2. Subtraction
    a, b, c, d = random.randint(5, 15), random.randint(5, 15), random.randint(1, 5), random.randint(1, 5)
    seeds.append({
        "id": "complex_num_02",
        "level": 3,
        "question": f"Simplify $({a} - {b}i) - ({c} + {d}i)$ and express the result in the form $a+bi$.",
        "question_zh": f"化簡 $({a} - {b}i) - ({c} + {d}i)$ 並以 $a+bi$ 的形式表示結果。",
        "answer": f"{a-c} - {b+d}i",
        "correct_answer": f"${a-c} - {b+d}i$",
        "solution_steps": [
            f"Distribute the negative sign: ${a} - {b}i - {c} - {d}i$.",
            f"Combine the real parts: ${a} - {c} = {a-c}$.",
            f"Combine the imaginary parts: $-{b}i - {d}i = -{b+d}i$.",
            f"The result is ${a-c} - {b+d}i$."
        ],
        "solution_steps_zh": [
            f"分配負號：${a} - {b}i - {c} - {d}i$。",
            f"合併實部：${a} - {c} = {a-c}$。",
            f"合併虛部：$-{b}i - {d}i = -{b+d}i$。",
            f"結果為 ${a-c} - {b+d}i$。"
        ]
    })

    # 3. Basic Multiplication (purely imaginary)
    a, b = random.randint(2, 6), random.randint(2, 6)
    seeds.append({
        "id": "complex_num_03",
        "level": 3,
        "question": f"Find the value of $({a}i)({b}i)$.",
        "question_zh": f"求 $({a}i)({b}i)$ 的值。",
        "answer": str(-a*b),
        "correct_answer": f"$-{a*b}$",
        "solution_steps": [
            f"Multiply the coefficients: ${a} \\times {b} = {a*b}$.",
            f"Multiply the imaginary units: $i \\times i = i^2$.",
            f"Since $i^2 = -1$, the result is ${a*b}(-1) = -{a*b}$."
        ],
        "solution_steps_zh": [
            f"將係數相乘：${a} \\times {b} = {a*b}$。",
            f"將虛數單位相乘：$i \\times i = i^2$。",
            f"由於 $i^2 = -1$，結果為 ${a*b}(-1) = -{a*b}$。"
        ]
    })

    # 4. Multiplication (FOIL)
    seeds.append({
        "id": "complex_num_04",
        "level": 3,
        "question": "Simplify $(2 + 3i)(1 - i)$ and express the result in the form $a+bi$.",
        "question_zh": "化簡 $(2 + 3i)(1 - i)$ 並以 $a+bi$ 的形式表示結果。",
        "answer": "5 + i",
        "correct_answer": "$5 + i$",
        "solution_steps": [
            "Use the FOIL method: $(2)(1) + (2)(-i) + (3i)(1) + (3i)(-i)$.",
            "$2 - 2i + 3i - 3i^2$.",
            "Substitute $i^2 = -1$: $2 + i - 3(-1) = 2 + i + 3$.",
            "The result is $5 + i$."
        ],
        "solution_steps_zh": [
            "使用 FOIL 法：$(2)(1) + (2)(-i) + (3i)(1) + (3i)(-i)$。",
            "$2 - 2i + 3i - 3i^2$。",
            "將 $i^2 = -1$ 代入：$2 + i - 3(-1) = 2 + i + 3$。",
            "結果為 $5 + i$。"
        ]
    })

    # 5. Real part identification
    seeds.append({
        "id": "complex_num_05",
        "level": 3,
        "question": "If $z = 4 - 7i$, find the real part of $z$.",
        "question_zh": "若 $z = 4 - 7i$，求 $z$ 的實部。",
        "answer": "4",
        "correct_answer": "$4$",
        "solution_steps": [
            "A complex number is written as $z = a + bi$, where $a$ is the real part.",
            "In $z = 4 - 7i$, $a = 4$.",
            "The real part is 4."
        ],
        "solution_steps_zh": [
            "複數寫作 $z = a + bi$，其中 $a$ 是實部。",
            "在 $z = 4 - 7i$ 中，$a = 4$。",
            "實部為 4。"
        ]
    })

    # 6. Imaginary part identification
    seeds.append({
        "id": "complex_num_06",
        "level": 3,
        "question": "If $z = -3 + 2i$, find the imaginary part of $z$.",
        "question_zh": "若 $z = -3 + 2i$，求 $z$ 的虛部。",
        "answer": "2",
        "correct_answer": "$2$",
        "solution_steps": [
            "A complex number is written as $z = a + bi$, where $b$ is the imaginary part.",
            "In $z = -3 + 2i$, $b = 2$.",
            "The imaginary part is 2."
        ],
        "solution_steps_zh": [
            "複數寫作 $z = a + bi$，其中 $b$ 是虛部。",
            "在 $z = -3 + 2i$ 中，$b = 2$。",
            "虛部為 2。"
        ]
    })

    # 7. i^2 substitution in expression
    seeds.append({
        "id": "complex_num_07",
        "level": 3,
        "question": "Simplify $3i^2 + 5$.",
        "question_zh": "化簡 $3i^2 + 5$。",
        "answer": "2",
        "correct_answer": "$2$",
        "solution_steps": [
            "Substitute $i^2 = -1$.",
            "$3(-1) + 5 = -3 + 5$.",
            "The result is 2."
        ],
        "solution_steps_zh": [
            "代入 $i^2 = -1$。",
            "$3(-1) + 5 = -3 + 5$。",
            "結果為 2。"
        ]
    })

    # 8. conjugate definition
    seeds.append({
        "id": "complex_num_08",
        "level": 3,
        "question": "Find the conjugate of $5 + 2i$.",
        "question_zh": "求 $5 + 2i$ 的共軛複數。",
        "answer": "5 - 2i",
        "correct_answer": "$5 - 2i$",
        "solution_steps": [
            "The conjugate of $a + bi$ is $a - bi$.",
            "For $5 + 2i$, the conjugate is $5 - 2i$."
        ],
        "solution_steps_zh": [
            "$a + bi$ 的共軛複數是 $a - bi$。",
            "對於 $5 + 2i$，共軛複數是 $5 - 2i$。"
        ]
    })

    # ================= LEVEL 4: MEDIUM (Q9-Q16: 8 Questions) =================
    # Division, Conjugate trick

    # 9. Realizing denominator (simple)
    seeds.append({
        "id": "complex_num_09",
        "level": 4,
        "question": "Express $\\frac{1}{i}$ in the form $a+bi$.",
        "question_zh": "以 $a+bi$ 的形式表示 $\\frac{1}{i}$。",
        "answer": "-i",
        "correct_answer": "$-i$",
        "solution_steps": [
            "Multiply numerator and denominator by $i$: $\\frac{1 \\times i}{i \\times i}$.",
            "Numerator: $i$. Denominator: $i^2 = -1$.",
            "The result is $\\frac{i}{-1} = -i$."
        ],
        "solution_steps_zh": [
            "分子和分母同乘以 $i$：$\\frac{1 \\times i}{i \\times i}$。",
            "分子：$i$。分母：$i^2 = -1$。",
            "結果為 $\\frac{i}{-1} = -i$。"
        ]
    })

    # 10. Division by conjugate (1/(a+bi))
    seeds.append({
        "id": "complex_num_10",
        "level": 4,
        "question": "Express $\\frac{1}{1 + i}$ in the form $a+bi$.",
        "question_zh": "以 $a+bi$ 的形式表示 $\\frac{1}{1 + i}$。",
        "answer": "1/2 - 1/2i",
        "correct_answer": "$\\frac{1}{2} - \\frac{1}{2}i$",
        "solution_steps": [
            "Multiply numerator and denominator by the conjugate $1-i$: $\\frac{1(1-i)}{(1+i)(1-i)}$.",
            "Denominator: $1^2 + 1^2 = 2$.",
            "Numerator: $1-i$.",
            "The result is $\\frac{1-i}{2} = \\frac{1}{2} - \\frac{1}{2}i$."
        ],
        "solution_steps_zh": [
            "分子和分母同乘以共軛複數 $1-i$：$\\frac{1(1-i)}{(1+i)(1-i)}$。",
            "分母：$1^2 + 1^2 = 2$。",
            "分子：$1-i$。",
            "結果為 $\\frac{1-i}{2} = \\frac{1}{2} - \\frac{1}{2}i$。"
        ]
    })

    # 11. Division (a+bi)/(c+di)
    seeds.append({
        "id": "complex_num_11",
        "level": 4,
        "question": "Simplify $\\frac{2+i}{2-i}$ and express the result in the form $a+bi$.",
        "question_zh": "化簡 $\\frac{2+i}{2-i}$ 並以 $a+bi$ 的形式表示結果。",
        "answer": "3/5 + 4/5i",
        "correct_answer": "$\\frac{3}{5} + \\frac{4}{5}i$",
        "solution_steps": [
            "Multiply by conjugate $2+i$: $\\frac{(2+i)(2+i)}{(2-i)(2+i)}$.",
            "Denominator: $2^2 + 1^2 = 5$.",
            "Numerator: $4 + 2i + 2i + i^2 = 4 + 4i - 1 = 3 + 4i$.",
            "The result is $\\frac{3+4i}{5} = \\frac{3}{5} + \\frac{4}{5}i$."
        ],
        "solution_steps_zh": [
            "乘以共軛複數 $2+i$：$\\frac{(2+i)(2+i)}{(2-i)(2+i)}$。",
            "分母：$2^2 + 1^2 = 5$。",
            "分子：$4 + 2i + 2i + i^2 = 4 + 4i - 1 = 3 + 4i$。",
            "結果為 $\\frac{3+4i}{5} = \\frac{3}{5} + \\frac{4}{5}i$。"
        ]
    })

    # 12. Power of i (small)
    seeds.append({
        "id": "complex_num_12",
        "level": 4,
        "question": "Find the value of $i^{10}$.",
        "question_zh": "求 $i^{10}$ 的值。",
        "answer": "-1",
        "correct_answer": "$-1$",
        "solution_steps": [
            "Observe the cycle: $i^1=i, i^2=-1, i^3=-i, i^4=1$.",
            "Divide the power by 4: $10 \\div 4 = 2$ with remainder $2$.",
            "$i^{10} = (i^4)^2 \\times i^2 = 1^2 \\times (-1) = -1$."
        ],
        "solution_steps_zh": [
            "觀察循環：$i^1=i, i^2=-1, i^3=-i, i^4=1$。",
            "將次方除以 4：$10 \\div 4 = 2$ 餘 $2$。",
            "$i^{10} = (i^4)^2 \\times i^2 = 1^2 \\times (-1) = -1$。"
        ]
    })

    # 13. (a+bi)^2 expansion
    seeds.append({
        "id": "complex_num_13",
        "level": 4,
        "question": "Expand and simplify $(3 + 2i)^2$.",
        "question_zh": "展開並化簡 $(3 + 2i)^2$。",
        "answer": "5 + 12i",
        "correct_answer": "$5 + 12i$",
        "solution_steps": [
            "Use $(x+y)^2 = x^2 + 2xy + y^2$.",
            "$(3)^2 + 2(3)(2i) + (2i)^2 = 9 + 12i + 4i^2$.",
            "Substitute $i^2 = -1$: $9 + 12i - 4 = 5 + 12i$."
        ],
        "solution_steps_zh": [
            "使用 $(x+y)^2 = x^2 + 2xy + y^2$。",
            "$(3)^2 + 2(3)(2i) + (2i)^2 = 9 + 12i + 4i^2$。",
            "代入 $i^2 = -1$：$9 + 12i - 4 = 5 + 12i$。"
        ]
    })

    # 14. Real part logic z + z_bar
    seeds.append({
        "id": "complex_num_14",
        "level": 4,
        "question": "If $z = a + bi$, find $z + \\bar{z}$.",
        "question_zh": "若 $z = a + bi$，求 $z + \\bar{z}$。",
        "answer": "2a",
        "correct_answer": "$2a$",
        "solution_steps": [
            "The conjugate $\\bar{z} = a - bi$.",
            "$(a + bi) + (a - bi) = a + a + bi - bi = 2a$.",
            "The sum is $2a$ (which is $2 \\times$ Real part)."
        ],
        "solution_steps_zh": [
            "共軛複數 $\\bar{z} = a - bi$。",
            "$(a + bi) + (a - bi) = a + a + bi - bi = 2a$。",
            "總和為 $2a$（即 $2 \\times$ 實部）。"
        ]
    })

    # 15. Imaginary part logic z - z_bar
    seeds.append({
        "id": "complex_num_15",
        "level": 4,
        "question": "If $z = a + bi$, find $z - \\bar{z}$.",
        "question_zh": "若 $z = a + bi$，求 $z - \\bar{z}$。",
        "answer": "2bi",
        "correct_answer": "$2bi$",
        "solution_steps": [
            "The conjugate $\\bar{z} = a - bi$.",
            "$(a + bi) - (a - bi) = a - a + bi - (-bi) = 2bi$.",
            "The result is $2bi$."
        ],
        "solution_steps_zh": [
            "共軛複數 $\\bar{z} = a - bi$。",
            "$(a + bi) - (a - bi) = a - a + bi - (-bi) = 2bi$。",
            "結果為 $2bi$。"
        ]
    })

    # 16. Modulus intro (not requested but standard for level 4)
    seeds.append({
        "id": "complex_num_16",
        "level": 4,
        "question": "Calculate the value of $(3+4i)(3-4i)$.",
        "question_zh": "計算 $(3+4i)(3-4i)$ 的值。",
        "answer": "25",
        "correct_answer": "$25$",
        "solution_steps": [
            "Use $(a+bi)(a-bi) = a^2 + b^2$.",
            "$3^2 + 4^2 = 9 + 16 = 25$.",
            "Alternatively, FOIL: $9 - 12i + 12i - 16i^2 = 9 - 16(-1) = 25$."
        ],
        "solution_steps_zh": [
            "使用 $(a+bi)(a-bi) = a^2 + b^2$。",
            "$3^2 + 4^2 = 9 + 16 = 25$。",
            "或者使用 FOIL：$9 - 12i + 12i - 16i^2 = 9 - 16(-1) = 25$。"
        ]
    })

    # ================= LEVEL 5: STANDARD (Q17-Q24: 8 Questions) =================
    # Solving quadratics with delta < 0, Equality

    # 17. Solving x^2 + 1 = 0
    seeds.append({
        "id": "complex_num_17",
        "level": 5,
        "question": "Solve the equation $x^2 + 4 = 0$.",
        "question_zh": "解方程 $x^2 + 4 = 0$。",
        "answer": "plus or minus 2i",
        "correct_answer": "$x = \\pm 2i$",
        "solution_steps": [
            "$x^2 = -4$.",
            "$x = \\pm \\sqrt{-4}$.",
            "Using $i = \\sqrt{-1}$, $x = \\pm \\sqrt{4} \\times \\sqrt{-1} = \\pm 2i$."
        ],
        "solution_steps_zh": [
            "$x^2 = -4$。",
            "$x = \\pm \\sqrt{-4}$。",
            "使用 $i = \\sqrt{-1}$，$x = \\pm \\sqrt{4} \\times \\sqrt{-1} = \\pm 2i$。"
        ]
    })

    # 18. Solving quadratic with complex roots
    seeds.append({
        "id": "complex_num_18",
        "level": 5,
        "question": "Solve the quadratic equation $x^2 - 2x + 5 = 0$.",
        "question_zh": "解二次方程 $x^2 - 2x + 5 = 0$。",
        "answer": "1 plus or minus 2i",
        "correct_answer": "$x = 1 \\pm 2i$",
        "solution_steps": [
            "Use the quadratic formula: $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.",
            "$\\Delta = (-2)^2 - 4(1)(5) = 4 - 20 = -16$.",
            "$\\sqrt{\\Delta} = \\sqrt{-16} = 4i$.",
            "$x = \\frac{2 \\pm 4i}{2} = 1 \\pm 2i$."
        ],
        "solution_steps_zh": [
            "使用二次公式：$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$。",
            "$\\Delta = (-2)^2 - 4(1)(5) = 4 - 20 = -16$。",
            "$\\sqrt{\\Delta} = \\sqrt{-16} = 4i$。",
            "$x = \\frac{2 \\pm 4i}{2} = 1 \\pm 2i$。"
        ]
    })

    # 19. Equality: x + yi = a + bi
    seeds.append({
        "id": "complex_num_19",
        "level": 5,
        "question": "Find the real values of $x$ and $y$ such that $x + 2i = 3 + yi$.",
        "question_zh": "求實數 $x$ 和 $y$ 的值，使得 $x + 2i = 3 + yi$。",
        "answer": "x=3, y=2",
        "correct_answer": "$x=3, y=2$",
        "solution_steps": [
            "Equate the real parts: $x = 3$.",
            "Equate the imaginary parts: $2 = y$.",
            "The values are $x=3, y=2$."
        ],
        "solution_steps_zh": [
            "將實部相等：$x = 3$。",
            "將虛部相等：$2 = y$。",
            "值為 $x=3, y=2$。"
        ]
    })

    # 20. Equality: (x+yi)(1+i) = 2
    seeds.append({
        "id": "complex_num_20",
        "level": 5,
        "question": "If $(x + yi)(1 + i) = 4$, where $x$ and $y$ are real, find $x$ and $y$.",
        "question_zh": "若 $(x + yi)(1 + i) = 4$，其中 $x$ 和 $y$ 是實部，求 $x$ 和 $y$。",
        "answer": "x=2, y=-2",
        "correct_answer": "$x=2, y=-2$",
        "solution_steps": [
            "Divide by $(1+i)$: $x + yi = \\frac{4}{1+i}$.",
            "Multiply by conjugate: $\\frac{4(1-i)}{(1+i)(1-i)} = \\frac{4-4i}{2} = 2-2i$.",
            "Equate parts: $x=2, y=-2$."
        ],
        "solution_steps_zh": [
            "除以 $(1+i)$：$x + yi = \\frac{4}{1+i}$。",
            "乘以共軛複數：$\\frac{4(1-i)}{(1+i)(1-i)} = \\frac{4-4i}{2} = 2-2i$。",
            "將各部分相等：$x=2, y=-2$。"
        ]
    })

    # 21. Real result condition
    seeds.append({
        "id": "complex_num_21",
        "level": 5,
        "question": "If $(k + i)(2 - i)$ is a real number, find the value of the constant $k$.",
        "question_zh": "若 $(k + i)(2 - i)$ 是一個實數，求常數 $k$ 的值。",
        "answer": "2",
        "correct_answer": "$k = 2$",
        "solution_steps": [
            "Expand the expression: $2k - ki + 2i - i^2 = (2k+1) + (2-k)i$.",
            "For the result to be real, the imaginary part must be zero.",
            "$2 - k = 0 \\implies k = 2$."
        ],
        "solution_steps_zh": [
            "展開表達式：$2k - ki + 2i - i^2 = (2k+1) + (2-k)i$。",
            "若結果為實數，則虛部必須為零。",
            "$2 - k = 0 \\implies k = 2$。"
        ]
    })

    # 22. Purely imaginary condition
    seeds.append({
        "id": "complex_num_22",
        "level": 5,
        "question": "If $\\frac{a + 3i}{1 + i}$ is purely imaginary, find the value of $a$.",
        "question_zh": "若 $\\frac{a + 3i}{1 + i}$ 是純虛數，求 $a$ 的值。",
        "answer": "-3",
        "correct_answer": "$a = -3$",
        "solution_steps": [
            "Multiply by conjugate: $\\frac{(a+3i)(1-i)}{2}$.",
            "Numerator: $a - ai + 3i - 3i^2 = (a+3) + (3-a)i$.",
            "For purely imaginary, real part is zero: $a+3 = 0 \\implies a = -3$."
        ],
        "solution_steps_zh": [
            "乘以共軛複數：$\\frac{(a+3i)(1-i)}{2}$。",
            "分子：$a - ai + 3i - 3i^2 = (a+3) + (3-a)i$。",
            "對於純虛數，實部為零：$a+3 = 0 \\implies a = -3$。"
        ]
    })

    # 23. Square root of complex number condition
    seeds.append({
        "id": "complex_num_23",
        "level": 5,
        "question": "Find the values of $a$ and $b$ such that $(a + bi)^2 = -3 + 4i$, where $a > 0$.",
        "question_zh": "求 $a$ 和 $b$ 的值，使得 $(a + bi)^2 = -3 + 4i$，其中 $a > 0$。",
        "answer": "a=1, b=2",
        "correct_answer": "$a=1, b=2$",
        "solution_steps": [
            "Expand LHS: $a^2 - b^2 + 2abi = -3 + 4i$.",
            "Equate: (1) $a^2 - b^2 = -3$, (2) $2ab = 4 \\implies ab = 2$.",
            "From (2), $b = 2/a$. Sub into (1): $a^2 - 4/a^2 = -3$.",
            "$a^4 + 3a^2 - 4 = 0 \\implies (a^2 + 4)(a^2 - 1) = 0$.",
            "Since $a^2 > 0$, $a^2 = 1 \\implies a = 1$ (as $a>0$).",
            "Then $b = 2/1 = 2$."
        ],
        "solution_steps_zh": [
            "展開左端：$a^2 - b^2 + 2abi = -3 + 4i$。",
            "相等：(1) $a^2 - b^2 = -3$，(2) $2ab = 4 \\implies ab = 2$。",
            "由 (2) 得出 $b = 2/a$。代入 (1)：$a^2 - 4/a^2 = -3$。",
            "$a^4 + 3a^2 - 4 = 0 \\implies (a^2 + 4)(a^2 - 1) = 0$。",
            "由於 $a^2 > 0$，則 $a^2 = 1 \\implies a = 1$（因為 $a>0$）。",
            "則 $b = 2/1 = 2$。"
        ]
    })

    # 24. Equality with two variables
    seeds.append({
        "id": "complex_num_24",
        "level": 5,
        "question": "If $\\frac{x}{1-i} + \\frac{y}{1+i} = 1 + 2i$, solve for $x$ and $y$.",
        "question_zh": "若 $\\frac{x}{1-i} + \\frac{y}{1+i} = 1 + 2i$，求 $x$ 和 $y$。",
        "answer": "x=3, y=-1",
        "correct_answer": "$x=3, y=-1$",
        "solution_steps": [
            "Common denominator: $\\frac{x(1+i) + y(1-i)}{2} = 1 + 2i$.",
            "$(x+y) + (x-y)i = 2 + 4i$.",
            "Equate: $x+y=2$ and $x-y=4$.",
            "Sum: $2x=6 \\implies x=3$.",
            "Diff: $2y=-2 \\implies y=-1$."
        ],
        "solution_steps_zh": [
            "公分母：$\\frac{x(1+i) + y(1-i)}{2} = 1 + 2i$。",
            "$(x+y) + (x-y)i = 2 + 4i$。",
            "相等：$x+y=2$ 且 $x-y=4$。",
            "相加：$2x=6 \\implies x=3$。",
            "相減：$2y=-2 \\implies y=-1$。"
        ]
    })

    # ================= LEVEL 7: ELITE (Q25-Q30: 6 Questions) =================
    # High powers, system of equations, forming equations

    # 25. High power of i
    seeds.append({
        "id": "complex_num_25",
        "level": 7,
        "question": "Simplify the expression $i^{2026} + i^{2027} + i^{2028} + i^{2029}$.",
        "question_zh": "化簡表達式 $i^{2026} + i^{2027} + i^{2028} + i^{2029}$。",
        "answer": "0",
        "correct_answer": "$0$",
        "solution_steps": [
            "Recall that the sum of any four consecutive powers of $i$ is zero ($i^n + i^{n+1} + i^{n+2} + i^{n+3} = 0$).",
            "This is because: $i^n(1 + i + i^2 + i^3) = i^n(1 + i - 1 - i) = 0$.",
            "Therefore, the expression equals 0."
        ],
        "solution_steps_zh": [
            "回想任何連續四個 $i$ 的冪之和為零（$i^n + i^{n+1} + i^{n+2} + i^{n+3} = 0$）。",
            "這是因為：$i^n(1 + i + i^2 + i^3) = i^n(1 + i - 1 - i) = 0$。",
            "因此，表達式等於 0。"
        ]
    })

    # 26. (1+i)^n type
    seeds.append({
        "id": "complex_num_26",
        "level": 7,
        "question": "Show that $(1 + i)^{8} = 16$.",
        "question_zh": "證明 $(1 + i)^{8} = 16$。",
        "answer": "True",
        "correct_answer": "Proved: $16$",
        "solution_steps": [
            "First find $(1+i)^2 = 1 + 2i + i^2 = 2i$.",
            "Then $(1+i)^4 = ((1+i)^2)^2 = (2i)^2 = 4i^2 = -4$.",
            "Then $(1+i)^8 = ((1+i)^4)^2 = (-4)^2 = 16$."
        ],
        "solution_steps_zh": [
            "首先求 $(1+i)^2 = 1 + 2i + i^2 = 2i$。",
            "接著 $(1+i)^4 = ((1+i)^2)^2 = (2i)^2 = 4i^2 = -4$。",
            "接著 $(1+i)^8 = ((1+i)^4)^2 = (-4)^2 = 16$。"
        ]
    })

    # 27. System of complex equations (2x+2)
    seeds.append({
        "id": "complex_num_27",
        "level": 7,
        "question": "Solve the system of equations for complex numbers $z$ and $w$: $z + w = 3$ and $z - w = 1 + 2i$.",
        "question_zh": "解關於複數 $z$ 和 $w$ 的聯立方程：$z + w = 3$ 及 $z - w = 1 + 2i$。",
        "answer": "z=2+i, w=1-i",
        "correct_answer": "$z = 2+i, w = 1-i$",
        "solution_steps": [
            "Add the two equations: $2z = (3) + (1 + 2i) = 4 + 2i \\implies z = 2 + i$.",
            "Subtract the two equations: $2w = (3) - (1 + 2i) = 2 - 2i \\implies w = 1 - i$.",
            "The solution is $(z, w) = (2+i, 1-i)$."
        ],
        "solution_steps_zh": [
            "將兩個方程相加：$2z = (3) + (1 + 2i) = 4 + 2i \\implies z = 2 + i$。",
            "將兩個方程相減：$2w = (3) - (1 + 2i) = 2 - 2i \\implies w = 1 - i$。",
            "解為 $(z, w) = (2+i, 1-i)$。"
        ]
    })

    # 28. Forming equation from roots
    seeds.append({
        "id": "complex_num_28",
        "level": 7,
        "question": "Find a quadratic equation with real coefficients such that one of its roots is $2 + 3i$.",
        "question_zh": "求一個實係數二次方程，使得其根之一為 $2 + 3i$。",
        "answer": "x^2 - 4x + 13 = 0",
        "correct_answer": "$x^2 - 4x + 13 = 0$",
        "solution_steps": [
            "Since coefficients are real, the roots must be a conjugate pair: $x_1 = 2+3i, x_2 = 2-3i$.",
            "Sum of roots: $(2+3i) + (2-3i) = 4$.",
            "Product of roots: $(2+3i)(2-3i) = 2^2 + 3^2 = 13$.",
            "The equation is $x^2 - (\\text{sum})x + (\\text{product}) = 0$.",
            "Result: $x^2 - 4x + 13 = 0$."
        ],
        "solution_steps_zh": [
            "由於係數是實數，根必須成對共軛：$x_1 = 2+3i, x_2 = 2-3i$。",
            "根之和：$(2+3i) + (2-3i) = 4$。",
            "根之積：$(2+3i)(2-3i) = 2^2 + 3^2 = 13$。",
            "方程為 $x^2 - (\\text{根之和})x + (\\text{根之積}) = 0$。",
            "結果：$x^2 - 4x + 13 = 0$。"
        ]
    })

    # 29. i^2025 simplification
    seeds.append({
        "id": "complex_num_29",
        "level": 7,
        "question": "Express $\\frac{i^{2025}}{1 - i}$ in the form $a+bi$.",
        "question_zh": "以 $a+bi$ 的形式表示 $\\frac{i^{2025}}{1 - i}$。",
        "answer": "-1/2 + 1/2i",
        "correct_answer": "$-\\frac{1}{2} + \\frac{1}{2}i$",
        "solution_steps": [
            "First, simplify the power of $i$: $2025 \\div 4 = 506$ with a remainder of $1$.",
            "Thus, $i^{2025} = i^1 = i$. The expression becomes $\\frac{i}{1 - i}$.",
            "Multiply the numerator and denominator by the conjugate $(1 + i)$: $\\frac{i(1 + i)}{(1 - i)(1 + i)}$.",
            "Numerator: $i + i^2 = -1 + i$. Denominator: $1^2 + 1^2 = 2$.",
            "The result is $\\frac{-1 + i}{2} = -\\frac{1}{2} + \\frac{1}{2}i$."
        ],
        "solution_steps_zh": [
            "首先，化簡 $i$ 的次方：$2025 \\div 4 = 506$ 餘數為 $1$。",
            "因此，$i^{2025} = i^1 = i$。表達式變為 $\\frac{i}{1 - i}$。",
            "分子和分母同乘以共軛複數 $(1 + i)$：$\\frac{i(1 + i)}{(1 - i)(1 + i)}$。",
            "分子：$i + i^2 = -1 + i$。分母：$1^2 + 1^2 = 2$。",
            "結果為 $\\frac{-1 + i}{2} = -\\frac{1}{2} + \\frac{1}{2}i$。"
        ]
    })

    # 30. Complex number roots logic
    seeds.append({
        "id": "complex_num_30",
        "level": 7,
        "question": "Find the values of $k$ such that the equation $z^2 + kz + 1 = 0$ has purely imaginary roots.",
        "question_zh": "求 $k$ 的值，使得方程 $z^2 + kz + 1 = 0$ 有純虛根。",
        "answer": "k=0",
        "correct_answer": "$k = 0$",
        "solution_steps": [
            "Let a purely imaginary root be $z = bi$.",
            "Substitute: $(bi)^2 + k(bi) + 1 = 0 \\implies -b^2 + kbi + 1 = 0$.",
            "Equate real and imaginary parts to zero.",
            "Real: $1 - b^2 = 0 \\implies b = \\pm 1$.",
            "Imaginary: $kb = 0$. Since $b = \\pm 1$ (not zero), $k = 0$.",
            "Thus, $k=0$."
        ],
        "solution_steps_zh": [
            "設一個純虛根為 $z = bi$。",
            "代入：$(bi)^2 + k(bi) + 1 = 0 \\implies -b^2 + kbi + 1 = 0$。",
            "將實部和虛部設為零。",
            "實部：$1 - b^2 = 0 \\implies b = \\pm 1$。",
            "虛部：$kb = 0$。由於 $b = \\pm 1$（非零），因此 $k = 0$。",
            "所以，$k=0$。"
        ]
    })

    return seeds

if __name__ == "__main__":
    seeds = generate_complex_numbers_seeds()
    # Output schema as requested by the user
    final_output = []
    for s in seeds:
        final_output.append({
            "id": s["id"],
            "topic_id": "math_alg_complex",
            "subject": "maths",
            "level": s["level"],
            "type": "short_answer",
            "marks": 2 if s["level"] <= 4 else (3 if s["level"] == 5 else 4),
            "question": s["question"],
            "question_zh": s["question_zh"],
            "answer": s["answer"],
            "correct_answer": s["correct_answer"],
            "solution_steps": s["solution_steps"],
            "solution_steps_zh": s["solution_steps_zh"]
        })
    print(json.dumps(final_output, indent=2, ensure_ascii=False))
