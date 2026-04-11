#!/usr/bin/env python3
"""
Regenerate integrated_batch_1.json with improved quality quest questions.
Fixes LaTeX errors, enhances diagram quality, and ensures proper formatting.
"""

import json
import os
from pathlib import Path

def generate_integrated_batch():
    """Generate the 10 quest questions with improved quality."""
    
    questions = []
    
    # Question 1: MCQ - Logarithmic AP
    questions.append({
        "id": "ct_mcq_101",
        "type": "mcq",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_alg_apgp", "math_alg_log_exp"],
        "marks": 1,
        "difficulty": 7,
        "paper": 2,
        "section": "B",
        "question_en": "If $\\log_x y = z$, and the terms $\\log_x y, \\log_x(y^2), \\log_x(y^3)$ form an arithmetic sequence with common difference $d$, which of the following must be true?",
        "question_zh": "若 $\\log_x y = z$，且 $\\log_x y, \\log_x(y^2), \\log_x(y^3)$ 組成一個公差為 $d$ 的等差數列，則下列哪項必為正確？",
        "options": [
            "A. $d = z$",
            "B. $d = 2z$", 
            "C. $d = \\log_x z$",
            "D. $d = z^2$"
        ],
        "correct_answer": "A",
        "solution_steps_en": [
            "Using the power rule: $\\log_x(y^n) = n \\cdot \\log_x y = n \\cdot z$.",
            "The terms are $z, 2z, 3z$.",
            "The common difference is $2z - z = z$."
        ],
        "solution_steps_zh": [
            "使用對數冪律：$\\log_x(y^n) = n \\cdot \\log_x y = n \\cdot z$。",
            "數列項為 $z, 2z, 3z$。",
            "公差為 $2z - z = z$。"
        ],
        "diagram_json": None,
        "tags": ["log-properties", "AP-definition"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 2: MCQ - Circle chord length with improved diagram
    questions.append({
        "id": "ct_mcq_103",
        "type": "mcq",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_geo_coord", "math_geo_circle_eq", "math_alg_quadratics"],
        "marks": 1,
        "difficulty": 7,
        "paper": 2,
        "section": "B",
        "question_en": "The line $y = kx$ is a chord of the circle $x^2 + y^2 - 4x = 0$. If the length of the chord is 2, find the value of $k^2$.",
        "question_zh": "直線 $y = kx$ 是圓 $x^2 + y^2 - 4x = 0$ 的一條弦。若弦長為 2，求 $k^2$ 的值。",
        "options": [
            "A. 1",
            "B. 3",
            "C. 1/3",
            "D. 4"
        ],
        "correct_answer": "B",
        "diagram_json": {
            "canvas": { "width": 400, "height": 300, "viewBox": "0 0 400 300" },
            "elements": [
                { "type": "circle", "cx": 200, "cy": 150, "r": 80, "stroke": "#4f46e5", "strokeWidth": 2, "fill": "rgba(79, 70, 229, 0.05)", "label": "Circle: x² + y² - 4x = 0", "labelDy": -60 },
                { "type": "line", "x1": 120, "y1": 150, "x2": 280, "y2": 220, "stroke": "#dc2626", "strokeWidth": 3, "label": "Chord L=2", "labelDy": -15 },
                { "type": "point", "x": 200, "y": 150, "label": "Center (2,0)", "labelDx": 15, "labelDy": -15 },
                { "type": "line", "x1": 50, "y1": 150, "x2": 350, "y2": 150, "stroke": "#94a3b8", "strokeWidth": 1, "strokeDasharray": "5,5", "label": "x-axis" },
                { "type": "line", "x1": 200, "y1": 50, "x2": 200, "y2": 250, "stroke": "#94a3b8", "strokeWidth": 1, "strokeDasharray": "5,5", "label": "y-axis" }
            ],
            "config": { "showAxes": True, "grid": True }
        },
        "solution_steps_en": [
            "Complete the square: $x^2 + y^2 - 4x = 0 \\Rightarrow (x-2)^2 + y^2 = 4$.",
            "Circle center is $(2,0)$ with radius $2$.",
            "Substitute $y = kx$ into the equation: $(x-2)^2 + (kx)^2 = 4$.",
            "Simplify: $x^2 - 4x + 4 + k^2x^2 = 4 \\Rightarrow (1+k^2)x^2 - 4x = 0$.",
            "Solve: $x[(1+k^2)x - 4] = 0$, so $x=0$ or $x = \\frac{4}{1+k^2}$.",
            "Points are $(0,0)$ and $\\left(\\frac{4}{1+k^2}, \\frac{4k}{1+k^2}\\right)$.",
            "Distance squared: $\\left(\\frac{4}{1+k^2}\\right)^2 + \\left(\\frac{4k}{1+k^2}\\right)^2 = 2^2 = 4$.",
            "Simplify: $\\frac{16(1+k^2)}{(1+k^2)^2} = 4 \\Rightarrow \\frac{16}{1+k^2} = 4 \\Rightarrow k^2 = 3$."
        ],
        "solution_steps_zh": [
            "配方：$x^2 + y^2 - 4x = 0 \\Rightarrow (x-2)^2 + y^2 = 4$。",
            "圓心為 $(2,0)$，半徑為 $2$。",
            "代入 $y = kx$：$(x-2)^2 + (kx)^2 = 4$。",
            "化簡：$x^2 - 4x + 4 + k^2x^2 = 4 \\Rightarrow (1+k^2)x^2 - 4x = 0$。",
            "解方程：$x[(1+k^2)x - 4] = 0$，得 $x=0$ 或 $x = \\frac{4}{1+k^2}$。",
            "交點為 $(0,0)$ 及 $\\left(\\frac{4}{1+k^2}, \\frac{4k}{1+k^2}\\right)$。",
            "距離平方：$\\left(\\frac{4}{1+k^2}\\right)^2 + \\left(\\frac{4k}{1+k^2}\\right)^2 = 2^2 = 4$。",
            "化簡：$\\frac{16(1+k^2)}{(1+k^2)^2} = 4 \\Rightarrow \\frac{16}{1+k^2} = 4 \\Rightarrow k^2 = 3$。"
        ],
        "tags": ["chord-length", "simultaneous-equations"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 3: MCQ - Cone inscribed in sphere with improved 3D diagram
    questions.append({
        "id": "ct_mcq_105",
        "type": "mcq",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_mensuration", "math_trig_applications"],
        "marks": 1,
        "difficulty": 7,
        "paper": 2,
        "section": "B",
        "question_en": "A right circular cone with semi-vertical angle $30^\\circ$ is inscribed in a sphere of fixed radius $R$. If the vertex of the cone and the center of the sphere coincide, which of the following expresses the height $h$ of the cone in terms of $R$?",
        "question_zh": "一個半頂角為 $30^\\circ$ 的直立圓錐體內接於一個固定半徑為 $R$ 的球體中。若圓錐體的頂點與球心重合，則以下哪項正確表示圓錐體的高 $h$？",
        "options": [
            "A. $h = R \\cos 30^\\circ$",
            "B. $h = R$",
            "C. $h = R \\sin 30^\\circ$",
            "D. $h = R \\tan 30^\\circ$"
        ],
        "correct_answer": "A",
        "diagram_json": {
            "canvas": { "width": 400, "height": 300, "viewBox": "0 0 400 300" },
            "elements": [
                { "type": "circle", "cx": 200, "cy": 150, "r": 120, "stroke": "#94a3b8", "strokeDasharray": "5,5", "strokeWidth": 1.5, "fill": "rgba(226, 232, 240, 0.2)" },
                { "type": "polyline", "points": [{"x": 140.0, "y": 253.92}, {"x": 140.74, "y": 251.11}, {"x": 142.94, "y": 248.36}, {"x": 146.54, "y": 245.75}, {"x": 151.46, "y": 243.34}, {"x": 157.57, "y": 241.2}, {"x": 165.27, "y": 239.36}, {"x": 174.14, "y": 237.89}, {"x": 184.28, "y": 236.96}, {"x": 193.3, "y": 236.2}, {"x": 201.2, "y": 236.2}, {"x": 215.72, "y": 236.96}, {"x": 225.86, "y": 237.89}, {"x": 234.73, "y": 239.36}, {"x": 242.43, "y": 241.2}, {"x": 248.54, "y": 243.34}, {"x": 253.46, "y": 245.75}, {"x": 257.06, "y": 248.36}, {"x": 259.26, "y": 251.11}, {"x": 260.0, "y": 253.92}], "stroke": "#7c3aed", "strokeWidth": 1.5, "strokeDasharray": "4,4", "label": "Back Base", "labelDy": -10 },
                { "type": "polygon", "points": [{"x": 200, "y": 150}, {"x": 140.0, "y": 253.92}, {"x": 140.74, "y": 256.74}, {"x": 142.94, "y": 259.49}, {"x": 146.54, "y": 262.09}, {"x": 151.46, "y": 264.5}, {"x": 157.57, "y": 266.65}, {"x": 165.27, "y": 268.49}, {"x": 174.14, "y": 269.96}, {"x": 184.28, "y": 270.88}, {"x": 200, "y": 271.92}, {"x": 215.72, "y": 270.88}, {"x": 225.86, "y": 269.96}, {"x": 234.73, "y": 268.49}, {"x": 242.43, "y": 266.65}, {"x": 248.54, "y": 264.5}, {"x": 253.46, "y": 262.09}, {"x": 257.06, "y": 259.49}, {"x": 259.26, "y": 256.74}, {"x": 260.0, "y": 253.92}], "stroke": "#7c3aed", "fill": "rgba(124, 58, 237, 0.15)", "strokeWidth": 2.5, "label": "Cone" },
                { "type": "line", "x1": 200, "y1": 150, "x2": 260, "y2": 253.92, "stroke": "#2563eb", "strokeWidth": 2, "label": "R", "labelDx": 10, "labelDy": -10 },
                { "type": "line", "x1": 200, "y1": 150, "x2": 200, "y2": 253.92, "stroke": "#dc2626", "strokeDasharray": "4,4", "strokeWidth": 2, "label": "h", "labelDx": -15 },
                { "type": "arc", "center": {"x": 200, "y": 150}, "radius": 30, "startAngle": 270, "endAngle": 300, "label": "30°", "stroke": "#d97706", "strokeWidth": 2 },
                { "type": "point", "x": 200, "y": 150, "label": "V", "labelDy": -20 }
            ],
            "config": { "showAxes": False }
        },
        "solution_steps_en": [
            "The vertex of the cone coincides with the sphere's center, so the cone's axis passes through the center.",
            "Any point on the base circumference lies on the sphere's surface, so the distance from vertex to that point equals $R$ (the sphere's radius).",
            "This distance is the slant height $l$ of the cone: $l = R$.",
            "In a right cone with semi-vertical angle $30^\\circ$, the height $h$ is related to slant height by $h = l \\cos 30^\\circ$.",
            "Therefore, $h = R \\cos 30^\\circ$."
        ],
        "solution_steps_zh": [
            "圓錐頂點與球心重合，因此圓錐的軸通過球心。",
            "底面圓周上的任意一點位於球體表面，因此頂點到該點的距離等於球體半徑 $R$。",
            "該距離即為圓錐的斜高 $l$：$l = R$。",
            "在半頂角為 $30^\\circ$ 的直立圓錐中，高 $h$ 與斜高的關係為 $h = l \\cos 30^\\circ$。",
            "因此，$h = R \\cos 30^\\circ$。"
        ],
        "tags": ["3D-geometry", "mensuration"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 4: MCQ - Geometric probability with improved diagram
    questions.append({
        "id": "ct_mcq_106",
        "type": "mcq",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_stat_prob", "math_num_inequalities"],
        "marks": 1,
        "difficulty": 6,
        "paper": 2,
        "section": "B",
        "question_en": "Two numbers $x$ and $y$ are chosen such that $0 \\leq x \\leq 1$ and $0 \\leq y \\leq 1$. What is the probability that $x + y \\leq 0.5$?",
        "question_zh": "隨機選擇兩個數 $x$ 及 $y$，使得 $0 \\leq x \\leq 1$ 及 $0 \\leq y \\leq 1$。問 $x + y \\leq 0.5$ 的概率是多少？",
        "options": [
            "A. 1/8",
            "B. 1/4",
            "C. 1/2",
            "D. 1/16"
        ],
        "correct_answer": "A",
        "diagram_json": None,
        "solution_steps_en": [
            "The sample space is the unit square $0 \\leq x \\leq 1$, $0 \\leq y \\leq 1$ with area $1 \\times 1 = 1$.",
            "The condition $x + y \\leq 0.5$ corresponds to the region below the line $x + y = 0.5$ within the square.",
            "This region is a right triangle with vertices $(0,0)$, $(0.5,0)$, and $(0,0.5)$.",
            "Area of triangle = $\\frac{1}{2} \\times 0.5 \\times 0.5 = 0.125 = \\frac{1}{8}$.",
            "Probability = (favorable area) / (total area) = $\\frac{1}{8}$."
        ],
        "solution_steps_zh": [
            "樣本空間為單位正方形 $0 \\leq x \\leq 1$, $0 \\leq y \\leq 1$，面積為 $1 \\times 1 = 1$。",
            "條件 $x + y \\leq 0.5$ 對應正方形中直線 $x + y = 0.5$ 下方的區域。",
            "該區域為一個直角三角形，頂點為 $(0,0)$、$(0.5,0)$ 及 $(0,0.5)$。",
            "三角形面積 = $\\frac{1}{2} \\times 0.5 \\times 0.5 = 0.125 = \\frac{1}{8}$。",
            "概率 = (有利區域面積) / (總面積) = $\\frac{1}{8}$。"
        ],
        "tags": ["geometric-probability", "inequalities"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 5: MCQ - Complex modulus with diagram
    questions.append({
        "id": "ct_mcq_108",
        "type": "mcq",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_alg_complex_numbers", "math_alg_functions"],
        "marks": 1,
        "difficulty": 7,
        "paper": 2,
        "section": "B",
        "question_en": "Given $f(z) = |z - i|$, where $z$ is a complex number satisfying $|z| \\leq 1$. What is the minimum value of $f(z)$?",
        "question_zh": "已知 $f(z) = |z - i|$，其中 $z$ 為滿足 $|z| \\leq 1$ 的複數。問 $f(z)$ 的最小值是多少？",
        "options": [
            "A. 0",
            "B. 1",
            "C. 0.5",
            "D. $\\sqrt{2}$"
        ],
        "correct_answer": "A",
        "diagram_json": {
            "canvas": { "width": 400, "height": 300, "viewBox": "0 0 400 300" },
            "elements": [
                { "type": "circle", "cx": 200, "cy": 150, "r": 100, "stroke": "#4f46e5", "strokeWidth": 2, "fill": "rgba(79, 70, 229, 0.1)", "label": "|z| ≤ 1", "labelDy": -70 },
                { "type": "point", "x": 200, "y": 50, "label": "i (0,1)", "labelDy": -15, "color": "#dc2626" },
                { "type": "line", "x1": 200, "y1": 150, "x2": 200, "y2": 50, "stroke": "#94a3b8", "strokeDasharray": "4,4", "strokeWidth": 1.5, "label": "distance", "labelDx": -20 },
                { "type": "line", "x1": 100, "y1": 150, "x2": 300, "y2": 150, "stroke": "#94a3b8", "strokeWidth": 1, "label": "Real axis" },
                { "type": "line", "x1": 200, "y1": 50, "x2": 200, "y2": 250, "stroke": "#94a3b8", "strokeWidth": 1, "label": "Imaginary axis" }
            ],
            "config": { "showAxes": True, "complexPlane": True }
        },
        "solution_steps_en": [
            "The condition $|z| \\leq 1$ represents a closed disk of radius 1 centered at the origin in the complex plane.",
            "$f(z) = |z - i|$ is the distance from $z$ to the point $i$ (which corresponds to $(0,1)$).",
            "The point $i$ lies on the boundary of the disk because $|i| = 1$.",
            "Since $i$ is inside the allowed region (actually on the boundary), the minimum distance is $0$, achieved when $z = i$."
        ],
        "solution_steps_zh": [
            "條件 $|z| \\leq 1$ 代表複平面上以原點為中心、半徑為 1 的閉圓盤。",
            "$f(z) = |z - i|$ 是 $z$ 到點 $i$（即 $(0,1)$）的距離。",
            "點 $i$ 位於圓盤邊界上，因為 $|i| = 1$。",
            "由於 $i$ 在允許區域內（實際上在邊界上），最小距離為 $0$，當 $z = i$ 時達到。"
        ],
        "tags": ["complex-geometry", "modulus"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 6: MCQ - Log-linear graph with improved clarity
    questions.append({
        "id": "ct_mcq_109",
        "type": "mcq",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_alg_log_exp", "math_alg_variations"],
        "marks": 1,
        "difficulty": 6,
        "paper": 2,
        "section": "B",
        "question_en": "If the graph of $\\log_{10} y$ against $\\log_{10} x$ is a straight line passing through $(0, 2)$ and $(1, 5)$, which of the following expresses $y$ in terms of $x$?",
        "question_zh": "若 $\\log_{10} y$ 對 $\\log_{10} x$ 的圖像是一條經過 $(0, 2)$ 及 $(1, 5)$ 的直線，則下列哪項正確表示 $y$ 與 $x$ 的關係？",
        "options": [
            "A. $y = 100x^3$",
            "B. $y = 2x^3$",
            "C. $y = 100 \\cdot 3^x$",
            "D. $y = 10^{3x+2}$"
        ],
        "correct_answer": "A",
        "diagram_json": {
            "canvas": { "width": 400, "height": 300, "viewBox": "0 0 400 300" },
            "elements": [
                { "type": "line", "x1": 100, "y1": 250, "x2": 300, "y2": 50, "stroke": "#4f46e5", "strokeWidth": 3, "label": "Y = 3X + 2", "labelDy": -30 },
                { "type": "point", "x": 150, "y": 200, "label": "(0, 2)", "labelDx": -20, "labelDy": -15, "color": "#dc2626" },
                { "type": "point", "x": 250, "y": 100, "label": "(1, 5)", "labelDx": 10, "labelDy": -15, "color": "#dc2626" },
                { "type": "line", "x1": 50, "y1": 250, "x2": 350, "y2": 250, "stroke": "#94a3b8", "strokeWidth": 1, "label": "log₁₀ x" },
                { "type": "line", "x1": 100, "y1": 50, "x2": 100, "y2": 280, "stroke": "#94a3b8", "strokeWidth": 1, "label": "log₁₀ y" }
            ],
            "config": { "showAxes": True, "grid": True }
        },
        "solution_steps_en": [
            "Let $X = \\log_{10} x$ and $Y = \\log_{10} y$. The line passes through $(0,2)$ and $(1,5)$.",
            "Slope $m = \\frac{5-2}{1-0} = 3$. Intercept $c = 2$ (since when $X=0$, $Y=2$).",
            "Equation: $Y = 3X + 2$.",
            "Substitute back: $\\log_{10} y = 3 \\log_{10} x + 2$.",
            "Use logarithm properties: $\\log_{10} y = \\log_{10} (x^3) + \\log_{10} (10^2) = \\log_{10} (100x^3)$.",
            "Therefore, $y = 100x^3$."
        ],
        "solution_steps_zh": [
            "設 $X = \\log_{10} x$，$Y = \\log_{10} y$。直線通過 $(0,2)$ 及 $(1,5)$。",
            "斜率 $m = \\frac{5-2}{1-0} = 3$。截距 $c = 2$（因為當 $X=0$ 時，$Y=2$）。",
            "方程：$Y = 3X + 2$。",
            "代回：$\\log_{10} y = 3 \\log_{10} x + 2$。",
            "使用對數性質：$\\log_{10} y = \\log_{10} (x^3) + \\log_{10} (10^2) = \\log_{10} (100x^3)$。",
            "因此，$y = 100x^3$。"
        ],
        "tags": ["log-linearization", "variations"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 7: Short Answer - Geometric sequence revenue (fixed USD formatting)
    questions.append({
        "id": "ct_sa_101",
        "type": "short_answer",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_alg_apgp", "math_alg_log_exp"],
        "marks": 12,
        "difficulty": 7,
        "paper": 1,
        "section": "B",
        "question_en": "A startup revenue follows a geometric sequence. In the 3rd month, revenue was US$24,000. In the 6th month, it was US$3,000.\n(a) Find common ratio and first month revenue. (4 marks)\n(b) Using logs, find first month where revenue < US$10. (4 marks)\n(c) Find total theoretical revenue if it continues forever. (4 marks)",
        "question_zh": "某初創企業收入遵循等比數列。第 3 個月收入為 24,000 美元，第 6 個月為 3,000 美元。\n(a) 求公比及首月收入。(4分)\n(b) 利用對數，求收入首次低於 10 美元的月份。(4分)\n(c) 求理論上的總收入。(4分)",
        "solution_steps_en": [
            "Let $a$ be first month revenue, $r$ common ratio.",
            "(a) Given $ar^2 = 24000$, $ar^5 = 3000$.",
            "Divide: $\\frac{ar^5}{ar^2} = \\frac{3000}{24000} \\Rightarrow r^3 = \\frac{1}{8} \\Rightarrow r = \\frac{1}{2} = 0.5$.",
            "Then $a = \\frac{24000}{r^2} = \\frac{24000}{0.25} = 96000$.",
            "Answer: $a = \\text{US\\$}96,000$, $r = 0.5$.",
            "(b) Need $96000(0.5)^{n-1} < 10$.",
            "Take logs: $(n-1)\\log 0.5 < \\log\\left(\\frac{10}{96000}\\right) = \\log\\left(\\frac{1}{9600}\\right)$.",
            "Since $\\log 0.5 < 0$, inequality reverses: $n-1 > \\frac{\\log(1/9600)}{\\log 0.5} \\approx 13.23$.",
            "Thus $n > 14.23$, so first integer is $n = 15$.",
            "(c) Sum to infinity: $S_\\infty = \\frac{a}{1-r} = \\frac{96000}{1-0.5} = \\frac{96000}{0.5} = 192,000$.",
            "Answer: US$192,000."
        ],
        "solution_steps_zh": [
            "設 $a$ 為首月收入，$r$ 為公比。",
            "(a) 已知 $ar^2 = 24000$，$ar^5 = 3000$。",
            "相除：$\\frac{ar^5}{ar^2} = \\frac{3000}{24000} \\Rightarrow r^3 = \\frac{1}{8} \\Rightarrow r = \\frac{1}{2} = 0.5$。",
            "則 $a = \\frac{24000}{r^2} = \\frac{24000}{0.25} = 96000$。",
            "答案：$a = 96,000$ 美元，$r = 0.5$。",
            "(b) 需要 $96000(0.5)^{n-1} < 10$。",
            "取對數：$(n-1)\\log 0.5 < \\log\\left(\\frac{10}{96000}\\right) = \\log\\left(\\frac{1}{9600}\\right)$。",
            "由於 $\\log 0.5 < 0$，不等號反向：$n-1 > \\frac{\\log(1/9600)}{\\log 0.5} \\approx 13.23$。",
            "因此 $n > 14.23$，故最小整數 $n = 15$。",
            "(c) 無限項和：$S_\\infty = \\frac{a}{1-r} = \\frac{96000}{1-0.5} = \\frac{96000}{0.5} = 192,000$。",
            "答案：192,000 美元。"
        ],
        "diagram_json": None,
        "tags": ["GP-sum", "logarithmic-inequality"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 8: Short Answer - Pyramid geometry with improved diagram
    questions.append({
        "id": "ct_sa_102",
        "type": "short_answer",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_trig_applications", "math_mensuration"],
        "marks": 14,
        "difficulty": 7,
        "paper": 1,
        "section": "B",
        "question_en": "Pyramid $VABCD$ has rectangular base $AB=10$ cm, $BC=8$ cm. Vertex $V$ is 12 cm vertically above $A$.\n(a) Find slant edge $VC$. (4 marks)\n(b) Find the angle between face $VBC$ and base $ABCD$. (5 marks)\n(c) Find the total surface area. (5 marks)",
        "question_zh": "稜錐 $VABCD$ 底面為長方形 $AB=10$ cm，$BC=8$ cm。頂點 $V$ 在 $A$ 正上方 12 cm。\n(a) 求斜稜 $VC$。(4分)\n(b) 求平面 $VBC$ 與底面 $ABCD$ 的交角。(5分)\n(c) 求總表面面積。(5分)",
        "diagram_json": {
            "canvas": { "width": 400, "height": 300, "viewBox": "0 0 400 300" },
            "elements": [
                { "type": "polygon", "points": [{"x": 120, "y": 250}, {"x": 280, "y": 250}, {"x": 340, "y": 200}, {"x": 180, "y": 200}], "stroke": "#64748b", "fill": "rgba(203, 213, 225, 0.2)", "strokeWidth": 1.5, "label": "Base ABCD", "labelDy": 25 },
                { "type": "polygon", "points": [{"x": 120, "y": 250}, {"x": 120, "y": 60}, {"x": 280, "y": 250}], "stroke": "#7c3aed", "fill": "rgba(124, 58, 237, 0.1)", "strokeWidth": 2, "label": "Face VAB" },
                { "type": "line", "x1": 120, "y1": 250, "x2": 120, "y2": 60, "stroke": "#dc2626", "strokeWidth": 3, "label": "VA = 12 cm", "labelDx": -35 },
                { "type": "line", "x1": 120, "y1": 60, "x2": 340, "y2": 200, "stroke": "#2563eb", "strokeDasharray": "4,4", "strokeWidth": 2, "label": "VC (slant edge)", "labelDx": 15 },
                { "type": "arc", "center": {"x": 280, "y": 250}, "radius": 40, "startAngle": 120, "endAngle": 180, "label": "∠VBA", "stroke": "#d97706", "strokeWidth": 2 },
                { "type": "point", "x": 120, "y": 60, "label": "V", "labelDy": -15 },
                { "type": "point", "x": 120, "y": 250, "label": "A", "labelDx": -10, "labelDy": 5 },
                { "type": "point", "x": 280, "y": 250, "label": "B", "labelDx": 10, "labelDy": 5 },
                { "type": "point", "x": 340, "y": 200, "label": "C", "labelDx": 10, "labelDy": -5 },
                { "type": "point", "x": 180, "y": 200, "label": "D", "labelDx": -10, "labelDy": -5 }
            ],
            "config": { "showAxes": False, "perspective": "3D-wireframe" }
        },
        "solution_steps_en": [
            "(a) Find $VC$: First find diagonal $AC$ of base rectangle.",
            "$AC = \\sqrt{AB^2 + BC^2} = \\sqrt{10^2 + 8^2} = \\sqrt{164}$.",
            "Triangle $VAC$ is right‑angled at $A$ (since $VA \\perp$ base).",
            "Thus $VC = \\sqrt{VA^2 + AC^2} = \\sqrt{12^2 + 164} = \\sqrt{144+164} = \\sqrt{308}$.",
            "$VC \\approx 17.55$ cm.",
            "(b) Angle between face $VBC$ and base: The required angle is $\\angle VBA$ (since $VB$ is the line of intersection).",
            "$VB = \\sqrt{VA^2 + AB^2} = \\sqrt{12^2 + 10^2} = \\sqrt{244}$.",
            "$\\tan(\\angle VBA) = \\frac{VA}{AB} = \\frac{12}{10} = 1.2$.",
            "Thus $\\angle VBA = \\tan^{-1}(1.2) \\approx 50.2^\\circ$.",
            "(c) Surface area: Base area $= 10 \\times 8 = 80$ cm².",
            "Area of $\\triangle VAB = \\frac{1}{2} \\times AB \\times VA = \\frac{1}{2} \\times 10 \\times 12 = 60$ cm².",
            "Area of $\\triangle VAD = \\frac{1}{2} \\times AD \\times VA = \\frac{1}{2} \\times 8 \\times 12 = 48$ cm².",
            "Area of $\\triangle VBC = \\frac{1}{2} \\times BC \\times VB = \\frac{1}{2} \\times 8 \\times \\sqrt{244} \\approx 62.48$ cm².",
            "Area of $\\triangle VDC = \\frac{1}{2} \\times DC \\times VD$ where $VD = \\sqrt{VA^2 + AD^2} = \\sqrt{12^2+8^2} = \\sqrt{208}$.",
            "$\\triangle VDC \\approx \\frac{1}{2} \\times 10 \\times \\sqrt{208} \\approx 72.11$ cm².",
            "Total $\\approx 80 + 60 + 48 + 62.48 + 72.11 \\approx 322.6$ cm²."
        ],
        "solution_steps_zh": [
            "(a) 求 $VC$：先求底面長方形對角線 $AC$。",
            "$AC = \\sqrt{AB^2 + BC^2} = \\sqrt{10^2 + 8^2} = \\sqrt{164}$。",
            "三角形 $VAC$ 中 $\\angle A$ 為直角（因為 $VA \\perp$ 底面）。",
            "故 $VC = \\sqrt{VA^2 + AC^2} = \\sqrt{12^2 + 164} = \\sqrt{308}$。",
            "$VC \\approx 17.55$ cm。",
            "(b) 平面 $VBC$ 與底面夾角：所求角為 $\\angle VBA$（因為 $VB$ 是交線）。",
            "$VB = \\sqrt{VA^2 + AB^2} = \\sqrt{12^2 + 10^2} = \\sqrt{244}$。",
            "$\\tan(\\angle VBA) = \\frac{VA}{AB} = \\frac{12}{10} = 1.2$。",
            "故 $\\angle VBA = \\tan^{-1}(1.2) \\approx 50.2^\\circ$。",
            "(c) 總表面面積：底面積 $= 10 \\times 8 = 80$ cm²。",
            "$\\triangle VAB$ 面積 $= \\frac{1}{2} \\times AB \\times VA = \\frac{1}{2} \\times 10 \\times 12 = 60$ cm²。",
            "$\\triangle VAD$ 面積 $= \\frac{1}{2} \\times AD \\times VA = \\frac{1}{2} \\times 8 \\times 12 = 48$ cm²。",
            "$\\triangle VBC$ 面積 $= \\frac{1}{2} \\times BC \\times VB = \\frac{1}{2} \\times 8 \\times \\sqrt{244} \\approx 62.48$ cm²。",
            "$\\triangle VDC$ 面積：$VD = \\sqrt{VA^2 + AD^2} = \\sqrt{12^2+8^2} = \\sqrt{208}$，",
            "$\\triangle VDC \\approx \\frac{1}{2} \\times 10 \\times \\sqrt{208} \\approx 72.11$ cm²。",
            "總面積 $\\approx 80 + 60 + 48 + 62.48 + 72.11 \\approx 322.6$ cm²。"
        ],
        "tags": ["3D-geometry", "surface-area", "trigonometry"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 9: Short Answer - Probability game with clearer steps
    questions.append({
        "id": "ct_sa_103",
        "type": "short_answer",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_stat_prob", "math_alg_apgp"],
        "marks": 11,
        "difficulty": 7,
        "paper": 1,
        "section": "B",
        "question_en": "Adam and Betty play a game where Adam starts. They take turns tossing a fair die. The first person to toss a '6' wins.\n(a) Show that the probability Adam wins on his $n$-th attempt is $\\frac{1}{6} (\\frac{25}{36})^{n-1}$. (4 marks)\n(b) Find the probability that Adam wins the game. (4 marks)\n(c) Find the probability that Adam wins within his first 3 attempts. (3 marks)",
        "question_zh": "亞當和貝蒂玩一個遊戲，由亞當開始。他們輪流擲一枚公平的骰子。最先擲得「6」的人勝出。\n(a) 證明亞當在第 $n$ 次嘗試時勝出的概率為 $\\frac{1}{6} (\\frac{25}{36})^{n-1}$。(4分)\n(b) 求亞當勝出遊戲的概率。(4分)\n(c) 求亞當在首 3 次嘗試內勝出的概率。(3分)",
        "solution_steps_en": [
            "(a) For Adam to win on his $n$-th attempt:",
            "• In each of the first $n-1$ rounds, both Adam and Betty must fail (i.e., not roll a 6).",
            "• Probability Adam fails = $5/6$, Betty fails = $5/6$; joint probability per round = $(5/6)^2 = 25/36$.",
            "• For $n-1$ rounds, probability all fail = $(25/36)^{n-1}$.",
            "• On Adam's $n$-th attempt, he must roll a 6 (probability $1/6$).",
            "• Hence required probability = $(25/36)^{n-1} \\times \\frac{1}{6}$.",
            "(b) Probability Adam wins overall = sum over all $n$ from $1$ to $\\infty$:",
            "$P = \\sum_{n=1}^{\\infty} \\frac{1}{6} \\left(\\frac{25}{36}\\right)^{n-1}$.",
            "This is a geometric series with first term $a = 1/6$ and common ratio $r = 25/36$.",
            "$P = \\frac{a}{1-r} = \\frac{1/6}{1 - 25/36} = \\frac{1/6}{11/36} = \\frac{6}{11}$.",
            "(c) Probability within first 3 attempts = sum for $n=1,2,3$:",
            "$P_3 = \\frac{1}{6} \\left[1 + \\frac{25}{36} + \\left(\\frac{25}{36}\\right)^2\\right]$.",
            "Compute: $1 = 1$, $25/36 \\approx 0.6944$, $(25/36)^2 \\approx 0.4823$.",
            "$P_3 = \\frac{1}{6} (1 + 0.6944 + 0.4823) = \\frac{1}{6} \\times 2.1767 \\approx 0.3628$.",
            "Exact fraction: $P_3 = \\frac{1}{6} \\left(\\frac{36^2 + 36\\cdot25 + 25^2}{36^2}\\right) = \\frac{1296+900+625}{6\\cdot1296} = \\frac{2821}{7776}$."
        ],
        "solution_steps_zh": [
            "(a) 亞當在第 $n$ 次嘗試勝出的條件：",
            "• 在前 $n-1$ 輪中，亞當與貝蒂均須失敗（即擲不出 6）。",
            "• 亞當失敗概率 = $5/6$，貝蒂失敗概率 = $5/6$；每輪共同失敗概率 = $(5/6)^2 = 25/36$。",
            "• $n-1$ 輪全部失敗的概率 = $(25/36)^{n-1}$。",
            "• 在第 $n$ 次嘗試，亞當必須擲出 6（概率 $1/6$）。",
            "• 故所求概率 = $(25/36)^{n-1} \\times \\frac{1}{6}$。",
            "(b) 亞當最終勝出的總概率 = 對 $n$ 從 $1$ 到 $\\infty$ 求和：",
            "$P = \\sum_{n=1}^{\\infty} \\frac{1}{6} \\left(\\frac{25}{36}\\right)^{n-1}$。",
            "這是首項 $a = 1/6$、公比 $r = 25/36$ 的等比級數。",
            "$P = \\frac{a}{1-r} = \\frac{1/6}{1 - 25/36} = \\frac{1/6}{11/36} = \\frac{6}{11}$。",
            "(c) 首 3 次嘗試內勝出的概率 = 對 $n=1,2,3$ 求和：",
            "$P_3 = \\frac{1}{6} \\left[1 + \\frac{25}{36} + \\left(\\frac{25}{36}\\right)^2\\right]$。",
            "計算：$1 = 1$，$25/36 \\approx 0.6944$，$(25/36)^2 \\approx 0.4823$。",
            "$P_3 = \\frac{1}{6} (1 + 0.6944 + 0.4823) = \\frac{1}{6} \\times 2.1767 \\approx 0.3628$。",
            "準確分數：$P_3 = \\frac{1}{6} \\left(\\frac{36^2 + 36\\cdot25 + 25^2}{36^2}\\right) = \\frac{1296+900+625}{6\\cdot1296} = \\frac{2821}{7776}$。"
        ],
        "diagram_json": None,
        "tags": ["recursive-probability", "GP-sum"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    # Question 10: Short Answer - Circle locus with improved diagram
    questions.append({
        "id": "ct_sa_104",
        "type": "short_answer",
        "topic_id": "integrated_challenge",
        "prerequisite_topics": ["math_geo_circle_eq", "math_geo_coord"],
        "marks": 13,
        "difficulty": 7,
        "paper": 1,
        "section": "B",
        "question_en": "A circle $C$ with center $(h, k)$ moves such that it is always tangent to the $x$-axis and the circle $x^2 + y^2 = 4$.\n(a) Show that the locus of the center $(h, k)$ satisfies the equation $h^2 = 4k + 4$ if the circle $C$ is in the first quadrant and outside the circle $x^2 + y^2 = 4$. (7 marks)\n(b) Describe the geometric shape of the locus. (2 marks)\n(c) Find the coordinates of the point on the locus closest to the $x$-axis. (4 marks)",
        "question_zh": "一個圓心為 $(h, k)$ 的圓 $C$ 在移動時，始終與 $x$ 軸及圓 $x^2 + y^2 = 4$ 相切。\n(a) 若圓 $C$ 在第一象限且位於圓 $x^2 + y^2 = 4$ 之外，證明圓心 $(h, k)$ 的軌跡滿足方程 $h^2 = 4k + 4$。(7分)\n(b) 描述該軌跡的幾何形狀。(2分)\n(c) 求該軌跡上最接近 $x$ 軸的點的坐標。(4分)",
        "diagram_json": {
            "canvas": { "width": 400, "height": 300, "viewBox": "0 0 400 300" },
            "elements": [
                { "type": "circle", "cx": 200, "cy": 150, "r": 40, "stroke": "#64748b", "strokeDasharray": "5,5", "strokeWidth": 1.5, "label": "x² + y² = 4", "labelDy": 60 },
                { "type": "circle", "cx": 280, "cy": 70, "r": 80, "stroke": "#7c3aed", "strokeDasharray": "2,2", "fill": "rgba(124, 58, 237, 0.05)", "label": "Circle C", "labelDy": -85 },
                { "type": "line", "x1": 200, "y1": 150, "x2": 280, "y2": 70, "stroke": "#dc2626", "strokeWidth": 1.5, "label": "distance = k+2", "labelDx": 15 },
                { "type": "path", "d": "M 100 250 Q 200 110 300 250", "stroke": "#2563eb", "strokeWidth": 3, "fill": "none", "label": "Locus: h² = 4k + 4", "labelDy": -30 },
                { "type": "line", "x1": 50, "y1": 250, "x2": 350, "y2": 250, "stroke": "#94a3b8", "strokeWidth": 1, "label": "x-axis" },
                { "type": "point", "x": 200, "y": 110, "label": "Vertex (0, -1)", "labelDy": 20 }
            ],
            "config": { "showAxes": True, "grid": True }
        },
        "solution_steps_en": [
            "(a) Since circle $C$ is tangent to $x$-axis, its radius equals $|k|$. In first quadrant $k>0$, so radius $= k$.",
            "Distance between centers of $C$ and $x^2+y^2=4$ (center at origin, radius $2$) is $\\sqrt{h^2+k^2}$.",
            "For external tangency, distance = sum of radii = $k + 2$.",
            "Thus $\\sqrt{h^2+k^2} = k + 2$.",
            "Square: $h^2 + k^2 = (k+2)^2 = k^2 + 4k + 4$.",
            "Cancel $k^2$: $h^2 = 4k + 4$.",
            "(b) The equation $h^2 = 4k + 4$ can be written as $k = \\frac{1}{4}h^2 - 1$, which is a parabola opening upwards with vertex at $(0,-1)$.",
            "(c) Distance to $x$-axis is $k$ (since $k>0$ in first quadrant). To minimize $k$, we minimize $k = \\frac{1}{4}h^2 - 1$.",
            "Minimum occurs when $h^2$ is minimum, i.e., $h=0$ (but $h=0$ gives $k=-1$, not in first quadrant).",
            "In first quadrant, $h>0$. The smallest $k$ occurs when $h$ is as small as possible while staying in first quadrant.",
            "From $h^2 = 4k+4$, $k = \\frac{h^2-4}{4}$. For $k \\geq 0$, we need $h^2 \\geq 4$, i.e., $h \\geq 2$.",
            "Thus minimum $k$ occurs at $h=2$, giving $k = \\frac{2^2-4}{4} = 0$.",
            "Hence the point closest to $x$-axis is $(2,0)$."
        ],
        "solution_steps_zh": [
            "(a) 因圓 $C$ 與 $x$ 軸相切，半徑等於 $|k|$。在第一象限 $k>0$，故半徑 $= k$。",
            "圓 $C$ 與圓 $x^2+y^2=4$（圓心在原點，半徑 $2$）的圓心距為 $\\sqrt{h^2+k^2}$。",
            "外切時，圓心距 = 兩半徑之和 = $k + 2$。",
            "故 $\\sqrt{h^2+k^2} = k + 2$。",
            "平方：$h^2 + k^2 = (k+2)^2 = k^2 + 4k + 4$。",
            "消去 $k^2$：$h^2 = 4k + 4$。",
            "(b) 方程 $h^2 = 4k + 4$ 可寫為 $k = \\frac{1}{4}h^2 - 1$，這是一條開口向上的拋物線，頂點在 $(0,-1)$。",
            "(c) 到 $x$ 軸的距離為 $k$（因為在第一象限 $k>0$）。為最小化 $k$，我們最小化 $k = \\frac{1}{4}h^2 - 1$。",
            "最小值出現在 $h^2$ 最小時，即 $h=0$（但 $h=0$ 給出 $k=-1$，不在第一象限）。",
            "在第一象限，$h>0$。最小的 $k$ 出現在 $h$ 盡可能小但仍保持第一象限的位置。",
            "由 $h^2 = 4k+4$ 得 $k = \\frac{h^2-4}{4}$。要使 $k \\geq 0$，需 $h^2 \\geq 4$，即 $h \\geq 2$。",
            "故最小 $k$ 出現在 $h=2$，此時 $k = \\frac{2^2-4}{4} = 0$。",
            "因此最接近 $x$ 軸的點為 $(2,0)$。"
        ],
        "tags": ["locus", "parabola", "analytical-geometry"],
        "scenario_id": "elite_batch_01",
        "status": "approved"
    })
    
    return questions

def main():
    output_path = Path(__file__).parent.parent / "data" / "maths" / "integrated_batch_1.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    questions = generate_integrated_batch()
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
if __name__ == "__main__":
    main()
