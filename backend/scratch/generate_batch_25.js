const fs = require('fs');
const path = require('path');

const data = [
  {
    "id": "ct_mcq_341",
    "type": "mcq",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_alg_logarithms"],
    "marks": 1,
    "difficulty": 6,
    "paper": 2,
    "section": "B",
    "question_en": "If $\\log_y x = \\frac{1}{2}$ and $\\log_y z = 3$, find $\\log_x z$.",
    "question_zh": "若 $\\log_y x = \\frac{1}{2}$ 及 $\\log_y z = 3$，求 $\\log_x z$。",
    "options": [
      "A. 1.5",
      "B. 4.5",
      "C. 6",
      "D. 9"
    ],
    "correct_answer": "C",
    "solution_steps_en": [
      "Using the change of base formula: $\\log_x z = \\frac{\\log_y z}{\\log_y x}$.",
      "Substitute the given values:",
      " $\\log_x z = \\frac{3}{1/2}$.",
      " $\\log_x z = 3 \\times 2 = 6$."
    ],
    "solution_steps_zh": [
      "利用換底公式：$\\log_x z = \\frac{\\log_y z}{\\log_y x}$。",
      "代入已知數值：",
      " $\\log_x z = \\frac{3}{1/2}$。",
      " $\\log_x z = 6$。"
    ],
    "diagram_json": null,
    "tags": ["logarithms", "algebra"],
    "status": "approved"
  },
  {
    "id": "ct_mcq_342",
    "type": "mcq",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_alg_quadratics"],
    "marks": 1,
    "difficulty": 6,
    "paper": 2,
    "section": "A",
    "question_en": "If the quadratic equation $x^2 + (k-2)x + (k+1) = 0$ has equal roots, find the possible values of $k$.",
    "question_zh": "若二次方程 $x^2 + (k-2)x + (k+1) = 0$ 有等根，求 $k$ 的可能值。",
    "options": [
      "A. $k = 0$ or $k = 8$",
      "B. $k = 0$ or $k = -8$",
      "C. $k = 2$ or $k = -2$",
      "D. $k = 4$ or $k = -4$"
    ],
    "correct_answer": "A",
    "solution_steps_en": [
      "For equal roots, discriminant $\\Delta = 0$.",
      " $\\Delta = b^2 - 4ac = (k-2)^2 - 4(1)(k+1) = 0$.",
      " $k^2 - 4k + 4 - 4k - 4 = 0$.",
      " $k^2 - 8k = 0$.",
      " $k(k - 8) = 0 \\Rightarrow k = 0$ or $k = 8$."
    ],
    "solution_steps_zh": [
      "若方程有等根，則判別式 $\\Delta = 0$。",
      " $\\Delta = (k-2)^2 - 4(k+1) = 0$。",
      " $k^2 - 4k + 4 - 4k - 4 = 0$。",
      " $k^2 - 8k = 0$。",
      " $k = 0$ 或 $k = 8$。"
    ],
    "diagram_json": null,
    "tags": ["quadratics", "nature-of-roots"],
    "status": "approved"
  },
  {
    "id": "ct_mcq_343",
    "type": "mcq",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_stat_prob"],
    "marks": 1,
    "difficulty": 7,
    "paper": 2,
    "section": "B",
    "question_en": "4 boys and 3 girls are arranged in a row. Find the number of ways to arrange them such that all girls are next to each other.",
    "question_zh": "4 名男孩及 3 名女孩排成一列。問有多少種排列方式使得所有女孩都相鄰？",
    "options": [
      "A. 144",
      "B. 720",
      "C. 120",
      "D. 4320"
    ],
    "correct_answer": "B",
    "solution_steps_en": [
      "Treat the 3 girls as a single unit.",
      "Total units to arrange: 4 boys + 1 girl-unit = 5 units.",
      "Internal arrangement of 3 girls: $3! = 6$.",
      "Arrangement of 5 units: $5! = 120$.",
      "Total ways $= 120 \\times 6 = 720$."
    ],
    "solution_steps_zh": [
      "將 3 名女孩視作一個整體。",
      "排列單位總數：4 名男孩 + 1 個女孩組 $= 5$ 個單位。",
      "女孩組內部的排列：$3! = 6$。",
      "5 個單位的排列：$5! = 120$。",
      "總方法數 $= 120 \\times 6 = 720$。"
    ],
    "diagram_json": null,
    "tags": ["permutations", "combinations"],
    "status": "approved"
  },
  {
    "id": "ct_mcq_344",
    "type": "mcq",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_geo_polygons"],
    "marks": 1,
    "difficulty": 5,
    "paper": 2,
    "section": "A",
    "question_en": "If the sum of interior angles of a regular polygon is 1080°, find the number of sides of the polygon.",
    "question_zh": "若一個正多邊形的內角和為 1080°，求該多邊形的邊數。",
    "options": [
      "A. 8",
      "B. 10",
      "C. 6",
      "D. 12"
    ],
    "correct_answer": "A",
    "solution_steps_en": [
      "Sum of interior angles formula: $(n - 2) \\times 180^\\circ = 1080^\\circ$.",
      " $n - 2 = 1080 / 180 = 6$.",
      " $n = 6 + 2 = 8$.",
      "The polygon is an octagon (8 sides)."
    ],
    "solution_steps_zh": [
      "內角和公式：$(n - 2) \\times 180^\\circ = 1080^\\circ$。",
      " $n - 2 = 6$。",
      " $n = 8$。",
      "該多邊形有 8 條邊。"
    ],
    "diagram_json": null,
    "tags": ["polygons", "geometry"],
    "status": "approved"
  },
  {
    "id": "ct_mcq_345",
    "type": "mcq",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_alg_equations"],
    "marks": 1,
    "difficulty": 7,
    "paper": 2,
    "section": "A",
    "question_en": "The length and width of a rectangle are measured as $6.0 \\text{ cm}$ and $4.0 \\text{ cm}$ respectively, both correct to the nearest $0.1 \\text{ cm}$. Find the maximum absolute error in the calculated area of the rectangle.",
    "question_zh": "一長方形的長及闊分別量得為 $6.0 \\text{ cm}$ 及 $4.0 \\text{ cm}$，準確至最接近的 $0.1 \\text{ cm}$。求該長方形計算面積的最大絕對誤差。",
    "options": [
      "A. $0.0025 \\text{ cm}^2$",
      "B. $0.5 \\text{ cm}^2$",
      "C. $0.5025 \\text{ cm}^2$",
      "D. $1.0 \\text{ cm}^2$"
    ],
    "correct_answer": "C",
    "solution_steps_en": [
      "Scale interval is $0.1$. Maximum absolute error in measurement is $0.05$.",
      "Lower bounds: $L_{min} = 5.95, W_{min} = 3.95$.",
      "Upper bounds: $L_{max} = 6.05, W_{max} = 4.05$.",
      "Measured Area $A = 6.0 \\times 4.0 = 24.0$.",
      "Max Area $A_{max} = 6.05 \\times 4.05 = 24.5025$.",
      "Min Area $A_{min} = 5.95 \\times 3.95 = 23.5015$.",
      "Diff Upper $= 24.5025 - 24.0 = 0.5025$.",
      "Diff Lower $= 24.0 - 23.5015 = 0.4985$.",
      "Maximum absolute error is the larger difference: $0.5025 \\text{ cm}^2$."
    ],
    "solution_steps_zh": [
      "刻度間距為 $0.1$，故量度最大絕對誤差為 $0.05$。",
      "上限：$L = 6.05, W = 4.05$。下限：$L = 5.95, W = 3.95$。",
      "量得面積 $A = 24.0$。",
      "最大可能面積 $A_{max} = 6.05 \\times 4.05 = 24.5025$。",
      "最小可能面積 $A_{min} = 5.95 \\times 3.95 = 23.5015$。",
      "最大絕對誤差為量得值與極端值之差的較大者：$24.5025 - 24.0 = 0.5025$。"
    ],
    "diagram_json": null,
    "tags": ["numbers", "estimation", "error"],
    "status": "approved"
  },
  {
    "id": "ct_mcq_346",
    "type": "mcq",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_geo_coordinate_geo"],
    "marks": 1,
    "difficulty": 7,
    "paper": 2,
    "section": "B",
    "question_en": "Find the locus of points that move such that their distance from the point $(4, 0)$ and the line $x = -4$ are equal.",
    "question_zh": "求所有與點 $(4, 0)$ 及直線 $x = -4$ 距離相等的點的軌跡。",
    "options": [
      "A. $y^2 = 16x$",
      "B. $x^2 = 16y$",
      "C. $y = 4x^2$",
      "D. $x^2 + y^2 = 16$"
    ],
    "correct_answer": "A",
    "solution_steps_en": [
      "This is the definition of a parabola with focus $(4, 0)$ and directrix $x = -4$.",
      "Distance to $(4, 0) = \\sqrt{(x-4)^2 + y^2}$.",
      "Distance to $x = -4$ is $|x + 4|$.",
      " $\\sqrt{(x-4)^2 + y^2} = |x + 4|$.",
      "Squaring: $(x-4)^2 + y^2 = (x+4)^2$.",
      " $x^2 - 8x + 16 + y^2 = x^2 + 8x + 16$.",
      " $y^2 = 16x$."
    ],
    "solution_steps_zh": [
      "這是拋物線的定義：與定點（焦點）及定直線（準線）距離相等。",
      "與 $(4,0)$ 的距離：$\\sqrt{(x-4)^2 + y^2}$。",
      "與 $x=-4$ 的距離：$|x+4|$。",
      "兩邊平方：$(x-4)^2 + y^2 = (x+4)^2$。",
      " $x^2 - 8x + 16 + y^2 = x^2 + 8x + 16$。",
      " $y^2 = 16x$。"
    ],
    "diagram_json": null,
    "tags": ["locus", "coordinate-geo"],
    "status": "approved"
  },
  {
    "id": "ct_sa_347",
    "type": "short_answer",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_stat_prob"],
    "marks": 10,
    "difficulty": 6,
    "paper": 1,
    "section": "A",
    "question_en": "The set of numbers $\\{12, 15, 18, 18, 20, 24, 28, x\\}$ has a median of 18.5.\n(a) Find the value of $x$. (4 marks)\n(b) If a number 30 is added to the set, find the change in the range. (6 marks)",
    "question_zh": "一組數集 $\\{12, 15, 18, 18, 20, 24, 28, x\\}$ 的中位數為 18.5。\n(a) 求 $x$ 的值。(4分)\n(b) 若將 30 加入該數集，求全距的變化。(6分)",
    "solution_steps_en": [
      "(a) There are 8 numbers. The median is the average of the 4th and 5th terms in an ordered set.",
      "If $x \\ge 20$, the 4th and 5th terms are 18 and 20, giving a median of 19 (Impossible).",
      "If $x \\le 18$, the 4th and 5th terms are 18 and 18, giving a median of 18 (Impossible).",
      "Therefore, $18 < x < 20$. The 4th and 5th terms are 18 and $x$. $(18 + x) / 2 = 18.5$.",
      "Thus, $x = 19$.",
      "(b) Original set: $\\{12, 15, 18, 18, 19, 20, 24, 28\\}$.",
      "Original Range $= 28 - 12 = 16$.",
      "New set: $\\{12, 15, 18, 18, 19, 20, 24, 28, 30\\}$.",
      "New Range $= 30 - 12 = 18$.",
      "Change $= 18 - 16 = 2$."
    ],
    "solution_steps_zh": [
      "(a) 共有 8 個數。中位數是排序後第 4 及第 5 項的平均值。",
      "若 $x \\ge 20$，第 4 及第 5 項分別為 18 及 20，中位數為 19（不符合題意）。",
      "若 $x \\le 18$，第 4 及第 5 項均為 18，中位數為 18（不符合題意）。",
      "因此 $18 < x < 20$。第 4 及第 5 項分別為 18 及 $x$。$(18 + x) / 2 = 18.5$。",
      "得 $x = 19$。",
      "(b) 原數集：$\\{12, 15, 18, 18, 19, 20, 24, 28\\}$。",
      "原全距 $= 28 - 12 = 16$。",
      "新數集：$\\{12, 15, 18, 18, 19, 20, 24, 28, 30\\}$。",
      "新全距 $= 30 - 12 = 18$。",
      "變化 $= 18 - 16 = 2$。"
    ],
    "diagram_json": null,
    "tags": ["statistics", "median-range"],
    "status": "approved"
  },
  {
    "id": "ct_sa_348",
    "type": "short_answer",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_geo_circles"],
    "marks": 12,
    "difficulty": 7,
    "paper": 1,
    "section": "A",
    "question_en": "In the figure, $ABCD$ is a cyclic quadrilateral. $AC$ and $BD$ intersect at $E$. Given $\\angle DAC = 40^\\circ$, $\\angle ABD = 45^\\circ$ and $\\angle ACB = 35^\\circ$, find $\\angle AEB$.",
    "question_zh": "圖中，$ABCD$ 為一個圓內接四邊形。$AC$ 與 $BD$ 相交於 $E$。已知 $\\angle DAC = 40^\\circ$、$\\angle ABD = 45^\\circ$ 及 $\\angle ACB = 35^\\circ$，求 $\\angle AEB$。",
    "solution_steps_en": [
      "In a circle, angles in the same segment are equal.",
      "$\\angle DBC = \\angle DAC = 40^\\circ$ (angles in same segment $CD$).",
      "Consider $\\triangle EBC$. The angle $\\angle AEB$ is the exterior angle of the triangle at vertex $E$.",
      "By the Exterior Angle Theorem of a triangle, $\\angle AEB = \\angle EBC + \\angle ECB$.",
      "Substitute the given and found values:",
      " $\\angle AEB = 40^\\circ + 35^\\circ = 75^\\circ$."
    ],
    "solution_steps_zh": [
      "在圓中，同弓形內的圓周角相等。",
      "$\\angle DBC = \\angle DAC = 40^\\circ$ (等弧或同弓形 $CD$ 上的圓周角)。",
      "考慮 $\\triangle EBC$。$\\angle AEB$ 是該三角形在頂點 $E$ 的外角。",
      "根據三角形外角定理，$\\angle AEB = \\angle EBC + \\angle ECB$。",
      "代入數值：",
      " $\\angle AEB = 40^\\circ + 35^\\circ = 75^\\circ$。"
    ],
    "diagram_json": {
      "canvas": { "width": 300, "height": 300, "viewBox": "0 0 300 300" },
      "elements": [
        { "type": "circle", "cx": 150, "cy": 150, "r": 100, "stroke": "black", "fill": "none" },
        { "type": "polygon", "points": [ {"x": 150, "y": 50}, {"x": 240, "y": 200}, {"x": 150, "y": 250}, {"x": 60, "y": 200} ], "stroke": "black", "fill": "none", "label": "ABCD" },
        { "type": "line", "x1": 150, "y1": 50, "x2": 150, "y2": 250, "stroke": "#cbd5e1" },
        { "type": "line", "x1": 60, "y1": 200, "x2": 240, "y2": 200, "stroke": "#cbd5e1" },
        { "type": "arc", "cx": 150, "cy": 50, "r": 25, "startAngle": 239, "endAngle": 270, "stroke": "#ef4444", "label": "40°" },
        { "type": "arc", "cx": 240, "cy": 200, "r": 25, "startAngle": 121, "endAngle": 180, "stroke": "#ef4444", "label": "45°" },
        { "type": "text", "x": 150, "y": 40, "text": "A" },
        { "type": "text", "x": 250, "y": 210, "text": "B" },
        { "type": "text", "x": 150, "y": 265, "text": "C" },
        { "type": "text", "x": 50, "y": 210, "text": "D" },
        { "type": "text", "x": 155, "y": 215, "text": "E" }
      ]
    },
    "tags": ["circle-geometry", "cyclic-quadrilateral"],
    "status": "approved"
  },
  {
    "id": "ct_sa_349",
    "type": "short_answer",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_alg_sequences"],
    "marks": 10,
    "difficulty": 7,
    "paper": 1,
    "section": "A",
    "question_en": "The first three terms of a geometric progression are $x - 2$, $x$, and $x + 3$.\n(a) Find the values of $x$. (5 marks)\n(b) Find the common ratio. (5 marks)",
    "question_zh": "一個等比數列的首三項分別為 $x - 2$，$x$ 及 $x + 3$。\n(a) 求 $x$ 的值。(5分)\n(b) 求公比。(5分)",
    "solution_steps_en": [
      "(a) For a GP, the middle term squared is the product of the other two.",
      " $x^2 = (x - 2)(x + 3)$.",
      " $x^2 = x^2 + 3x - 2x - 6$.",
      " $x = 6$.",
      "(b) First term $a = 6 - 2 = 4$.",
      " Second term $= 6$.",
      " Common ratio $r = 6 / 4 = 1.5$."
    ],
    "solution_steps_zh": [
      "(a) 由於是等比數列，$x^2 = (x-2)(x+3)$。",
      " $x^2 = x^2 + x - 6 \\Rightarrow x = 6$。",
      "(b) 首項為 $4$，次項為 $6$。",
      " 公比 $r = 6 / 4 = 1.5$。"
    ],
    "diagram_json": null,
    "tags": ["sequences", "geometric-progression"],
    "status": "approved"
  },
  {
    "id": "ct_sa_350",
    "type": "short_answer",
    "topic_id": "integrated_challenge",
    "prerequisite_topics": ["math_geo_coordinate_geo"],
    "marks": 13,
    "difficulty": 8,
    "paper": 1,
    "section": "B",
    "question_en": "Let $P$ be a moving point $(x, y)$ such that its distance from $(2, 3)$ is 5. Let $Q$ be the locus of points that are equidistant from the points $(0, 0)$ and $(8, 0)$.\n(a) Describe the locus of $P$ and $Q$. (4 marks)\n(b) Find the coordinates of the intersection of $P$ and $Q$. (9 marks)",
    "question_zh": "設 $P$ 為動點 $(x, y)$，且其與 $(2, 3)$ 的距離恆為 5。設 $Q$ 為所有與點 $(0, 0)$ 及 $(8, 0)$ 等距的點的軌跡。\n(a) 描述 $P$ 及 $Q$ 的軌跡。(4分)\n(b) 求 $P$ 與 $Q$ 交點的坐標。(9分)",
    "solution_steps_en": [
      "(a) Locus of $P$ is a circle with center $(2, 3)$ and radius 5.",
      " Locus of $Q$ is the perpendicular bisector of the segment joining $(0,0)$ and $(8,0)$. This is the vertical line $x = 4$.",
      "(b) Equation of Circle $P$: $(x - 2)^2 + (y - 3)^2 = 25$.",
      " Substitute $x = 4$ into the equation:",
      " $(4 - 2)^2 + (y - 3)^2 = 25$.",
      " $4 + (y - 3)^2 = 25 \\Rightarrow (y - 3)^2 = 21$.",
      " $y - 3 = \\pm \\sqrt{21} \\Rightarrow y = 3 \\pm \\sqrt{21}$.",
      " Intersection points: $(4, 3 + \\sqrt{21})$ and $(4, 3 - \\sqrt{21})$."
    ],
    "solution_steps_zh": [
      "(a) $P$ 的軌跡是以 $(2, 3)$ 為圓心、半徑為 5 的圓。",
      " $Q$ 的軌跡是連接 $(0,0)$ 及 $(8,0)$ 的垂直平分線，即直線 $x = 4$。",
      "(b) 將 $x=4$ 代入圓方程 $(x-2)^2 + (y-3)^2 = 25$：",
      " $(4-2)^2 + (y-3)^2 = 25$。",
      " $2^2 + (y-3)^2 = 25 \\Rightarrow (y-3)^2 = 21$。",
      " $y = 3 \\pm \\sqrt{21}$。",
      " 交點坐標：$(4, 3 + \\sqrt{21})$ 及 $(4, 3 - \\sqrt{21})$。"
    ],
    "diagram_json": null,
    "tags": ["locus", "coordinate-geo"],
    "status": "approved"
  }
];

fs.writeFileSync('c:/Users/user/Documents/ace-it-web/backend/data/maths/integrated_batch_25.json', JSON.stringify(data, null, 2));
console.log('Batch 25 JSON generated successfully with corrected professional solutions and specific Mathematical Bug fixes.');
