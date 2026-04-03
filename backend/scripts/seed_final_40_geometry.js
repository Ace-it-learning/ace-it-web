const admin = require('firebase-admin');
const path = require('path');
const crypto = require('crypto');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}
const db = admin.firestore();

const generateHash = (topic, text) => {
    return crypto.createHash('md5').update(`${topic}_${text}`).digest('hex');
};

const v1_templates = [
    // Template 1: Triangle Angle Sum
    { text: "In $\\triangle ABC$, $\\angle B = {b}^\\circ$ and $\\angle C = {c}^\\circ$. Find $x$ (the value of $\\angle A$).", text_zh: "在 $\\triangle ABC$ 中，$\\angle B = {b}^\\circ$ 且 $\\angle C = {c}^\\circ$。求 $x$ (即 $\\angle A$ 的值)。", b: 58, c: 42, ans: "80^\\circ" },
    // Template 2: Isosceles Triangle
    { text: "In $\\triangle PQR$, $PQ = PR$. Given $\\angle Q = {q}^\\circ$, find $y$ (the exterior angle $\\angle PRS$).", text_zh: "在 $\\triangle PQR$ 中，$PQ = PR$。已知 $\\angle Q = {q}^\\circ$，求 $y$ (即外角 $\\angle PRS$ 的值)。", qVal: 65, ans: "115^\\circ" },
    // Template 3: Parallel Lines
    { text: "Given $AB \\parallel CD$. An acute angle formed by a transversal is {a}^\\circ. Find $z$ (the interior angle).", text_zh: "已知 $AB \\parallel CD$。由截線形成的銳角為 {a}^\\circ。求 $z$ (同旁內角)。", aVal: 70, ans: "110^\\circ" },
    // Template 4: Triangle Similarity (Parallel)
    { text: "In $\\triangle ABC$, $XY \\parallel BC$. Given $\\angle A = {a}^\\circ$ and $\\angle B = {b}^\\circ$, find $w$ ($\\angle AXY$).", text_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。已知 $\\angle A = {a}^\\circ$ 且 $\\angle B = {b}^\\circ$，求 $w$ (即 $\\angle AXY$ 的值)。", aVal: 55, bVal: 45, ans: "45^\\circ" },
    // Template 5: Basic Polygon Ext Angle
    { text: "A regular {n}-sided polygon is given. Find the size of one exterior angle.", text_zh: "已知一個正 {n} 邊形。求其一個外角的大小。", nVal: 12, ans: "30^\\circ" }
];

const full_v1 = [];
for (let i = 0; i < 20; i++) {
    const templateIdx = i % v1_templates.length;
    const template = v1_templates[templateIdx];
    const offset = Math.floor(i / 5) * 5; 
    
    let qText = template.text;
    let qZh = template.text_zh;
    let finalAns = "";

    let steps = [];
    let steps_zh = [];

    if (templateIdx === 0) { // Triangle Sum
        const b = 50 + offset + (i % 5);
        const c = 40 + offset - (i % 5);
        const sum = b + c;
        qText = qText.replace('{b}', b).replace('{c}', c);
        qZh = qZh.replace('{b}', b).replace('{c}', c);
        finalAns = `${180 - sum}^\\circ`;
        steps = [
            `$x + ${b}^\\circ + ${c}^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)`,
            `$x = 180^\\circ - ${b}^\\circ - ${c}^\\circ$`,
            `$x = ${finalAns}$`
        ];
        steps_zh = [
            `$x + ${b}^\\circ + ${c}^\\circ = 180^\\circ$ (三角形內角和)`,
            `$x = 180^\\circ - ${b}^\\circ - ${c}^\\circ$`,
            `$x = ${finalAns}$`
        ];
    } else if (templateIdx === 1) { // Isosceles
        const qValue = 60 + offset + (i % 5);
        qText = qText.replace('{q}', qValue);
        qZh = qZh.replace('{q}', qValue);
        finalAns = `${180 - qValue}^\\circ`;
        steps = [
            `$\\angle Q = \\angle R = ${qValue}^\\circ$ (base $\\angle$s, isos. $\\triangle$)`,
            `$y = 180^\\circ - \\angle R$ (adj. $\\angle$s on st. line)`,
            `$y = 180^\\circ - ${qValue}^\\circ = ${finalAns}$`
        ];
        steps_zh = [
            `$\\angle Q = \\angle R = ${qValue}^\\circ$ (等邊對等角)`,
            `$y = 180^\\circ - \\angle R$ (直線上的鄰角)`,
            `$y = 180^\\circ - ${qValue}^\\circ = ${finalAns}$`
        ];
    } else if (templateIdx === 2) { // Parallel
        const aValue = 70 - offset - (i % 5);
        qText = qText.replace('{a}', aValue);
        qZh = qZh.replace('{a}', aValue);
        finalAns = `${180 - aValue}^\\circ`;
        steps = [
            `$z + ${aValue}^\\circ = 180^\\circ$ (int. $\\angle$s, $AB \\parallel CD$)`,
            `$z = 180^\\circ - ${aValue}^\\circ = ${finalAns}$`
        ];
        steps_zh = [
            `$z + ${aValue}^\\circ = 180^\\circ$ (同旁內角, $AB \\parallel CD$)`,
            `$z = 180^\\circ - ${aValue}^\\circ = ${finalAns}$`
        ];
    } else if (templateIdx === 3) { // Similarity
        const aVal = 50 + offset;
        const bVal = 40 + offset + (i % 5);
        qText = qText.replace('{a}', aVal).replace('{b}', bVal);
        qZh = qZh.replace('{a}', aVal).replace('{b}', bVal);
        finalAns = `${bVal}^\\circ`;
        steps = [
            `$\\angle AXY = \\angle B$ (corr. $\\angle$s, $XY \\parallel BC$)`,
            `$w = \\angle AXY = ${finalAns}$`
        ];
        steps_zh = [
            `$\\angle AXY = \\angle B$ (同位角, $XY \\parallel BC$)`,
            `$w = \\angle AXY = ${finalAns}$`
        ];
    } else if (templateIdx === 4) { // Polygon Ext
        const validN = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24];
        const nValue = validN[Math.floor(i / 2) % validN.length];
        qText = qText.replace('{n}', nValue);
        qZh = qZh.replace('{n}', nValue);
        finalAns = `${360 / nValue}^\\circ`;
        steps = [
            `Sum of exterior angles of any polygon = $360^\\circ$`,
            `Size of one exterior angle = $360^\\circ / ${nValue}$`,
            `Exterior angle = ${finalAns}`
        ];
        steps_zh = [
            `多邊形外角和 = $360^\\circ$`,
            `一個外角的大小 = $360^\\circ / ${nValue}$`,
            `外角 = ${finalAns}`
        ];
    }

    full_v1.push({
        topic_id: "math_geo_rectilinear",
        level: 3,
        question: qText,
        question_zh: qZh,
        content: {
            final_answer: finalAns,
            solution_steps: steps,
            solution_steps_zh: steps_zh
        }
    });
}

const v2Questions = [
    {
        "topic_id": "math_geo_rectilinear",
        "level": 3,
        "question": "A convex polygon has $5$ sides. Find the sum of its interior angles.",
        "question_zh": "一個凸五邊形有 $5$ 條邊。求其內角和。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of interior angles of an $n$-sided polygon = $(n - 2) \\times 180^\\circ$",
                "Sum = $(5 - 2) \\times 180^\\circ$",
                "Sum = $3 \\times 180^\\circ = 540^\\circ$"
            ],
            "solution_steps_zh": [
                "$n$ 邊形的內角和 = $(n - 2) \\times 180^\\circ$",
                "內角和 = $(5 - 2) \\times 180^\\circ$",
                "內角和 = $3 \\times 180^\\circ = 540^\\circ$"
            ],
            "final_answer": "540^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 3,
        "question": "A convex polygon has $11$ sides. Find the sum of its interior angles.",
        "question_zh": "一個凸十一邊形有 $11$ 條邊。求其內角和。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of interior angles = $(n - 2) \\times 180^\\circ$",
                "Sum = $(11 - 2) \\times 180^\\circ$",
                "Sum = $9 \\times 180^\\circ = 1620^\\circ$"
            ],
            "solution_steps_zh": [
                "內角和 = $(n - 2) \\times 180^\\circ$",
                "內角和 = $(11 - 2) \\times 180^\\circ$",
                "內角和 = $9 \\times 180^\\circ = 1620^\\circ$"
            ],
            "final_answer": "1620^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 3,
        "question": "A convex polygon has $10$ sides. Find the sum of its interior angles.",
        "question_zh": "一個凸十邊形有 $10$ 條邊。求其內角和。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of interior angles = $(n - 2) \\times 180^\\circ$",
                "Sum = $(10 - 2) \\times 180^\\circ = 1440^\\circ$"
            ],
            "solution_steps_zh": [
                "內角和 = $(10 - 2) \\times 180^\\circ = 1440^\\circ$"
            ],
            "final_answer": "1440^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 3,
        "question": "A regular $12$-sided polygon is given. Find the size of one exterior angle.",
        "question_zh": "已知一個正十二邊形。求其一個外角的大小。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of exterior angles = $360^\\circ$",
                "Exterior angle = $360^\\circ / 12 = 30^\\circ$"
            ],
            "solution_steps_zh": [
                "外角和 = $360^\\circ$",
                "一個外角 = $360^\\circ / 12 = 30^\\circ$"
            ],
            "final_answer": "30^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 3,
        "question": "A regular $9$-sided polygon is given. Find the size of one exterior angle.",
        "question_zh": "已知一個正九邊形。求其一個外角的大小。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of exterior angles = $360^\\circ$",
                "Exterior angle = $360^\\circ / 9 = 40^\\circ$"
            ],
            "solution_steps_zh": [
                "外角和 = $360^\\circ$",
                "一個外角 = $360^\\circ / 9 = 40^\\circ$"
            ],
            "final_answer": "40^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 4,
        "question": "The interior angles of a $5$-sided polygon are in the ratio $2:3:4:4:5$. Find the largest interior angle.",
        "question_zh": "一個五邊形的內角之比為 $2:3:4:4:5$。求最大的內角。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of interior angles = $(5 - 2) \\times 180^\\circ = 540^\\circ$",
                "Total parts in ratio = $2 + 3 + 4 + 4 + 5 = 18$",
                "Value of one part = $540^\\circ / 18 = 30^\\circ$",
                "Largest angle (5 parts) = $5 \\times 30^\\circ = 150^\\circ$"
            ],
            "solution_steps_zh": [
                "內角和 = $(5 - 2) \\times 180^\\circ = 540^\\circ$",
                "比例總份數 = $2 + 3 + 4 + 4 + 5 = 18$",
                "每份的大小 = $540^\\circ / 18 = 30^\\circ$",
                "最大角 (5 份) = $5 \\times 30^\\circ = 150^\\circ$"
            ],
            "final_answer": "150^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 4,
        "question": "The interior angles of a $5$-sided polygon are in the ratio $1:2:3:4:5$. Find the smallest interior angle.",
        "question_zh": "一個五邊形的內角之比為 $1:2:3:4:5$。求最小的內角。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of interior angles = $540^\\circ$",
                "Total parts in ratio = $1 + 2 + 3 + 4 + 5 = 15$",
                "Smallest angle (1 part) = $(1/15) \\times 540^\\circ = 36^\\circ$"
            ],
            "solution_steps_zh": [
                "內角和 = $540^\\circ$",
                "比例總份數 = $15$",
                "最小角 (1 份) = $(1/15) \\times 540^\\circ = 36^\\circ$"
            ],
            "final_answer": "36^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 4,
        "question": "The interior angles of a $6$-sided polygon are in the ratio $3:4:4:5:5:9$. Find the largest interior angle.",
        "question_zh": "一個六邊形的內角之比為 $3:4:4:5:5:9$。求最大的內角。",
        "content": {
            "solution_steps": [
                "Sum of interior angles = $(6 - 2) \\times 180^\\circ = 720^\\circ$",
                "Total parts = $3+4+4+5+5+9 = 30$",
                "Largest (9 parts) = $(9/30) \\times 720^\\circ = 216^\\circ$"
            ],
            "solution_steps_zh": [
                "內角和 = $720^\\circ$",
                "比例總份數 = $30$",
                "最大角 (9 份) = $(9/30) \\times 720^\\circ = 216^\\circ$"
            ],
            "final_answer": "216^\\circ"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 4,
        "question": "Each interior angle of a regular polygon is $135^\\circ$. Find the number of sides.",
        "question_zh": "正多邊形的每個內角為 $135^\\circ$。求其邊數。",
        "content": {
            "solution_steps": [
                "Exterior angle = $180^\\circ - 135^\\circ = 45^\\circ$ (adj. $\\angle$s on st. line)",
                "Number of sides $n = 360^\\circ / (\\text{Ext angle})$",
                "$n = 360/45 = 8$"
            ],
            "solution_steps_zh": [
                "外角 = $180^\\circ - 135^\\circ = 45^\\circ$ (直線上的鄰角)",
                "邊數 $n = 360^\\circ / 45^\\circ$",
                "$n = 8$"
            ],
            "final_answer": "8"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 4,
        "question": "Each interior angle of a regular polygon is $150^\\circ$. Find the number of sides.",
        "question_zh": "正多邊形的每個內角為 $150^\\circ$。求其邊數。",
        "content": {
            "solution_steps": [
                "Exterior angle = $180^\\circ - 150^\\circ = 30^\\circ$",
                "$n = 360/30 = 12$"
            ],
            "solution_steps_zh": [
                "外角 = $30^\\circ$",
                "$n = 360/30 = 12$"
            ],
            "final_answer": "12"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 5,
        "question": "The sum of the interior angles of a regular polygon is $3$ times the sum of its exterior angles. Find the number of sides.",
        "question_zh": "正多邊形的內角和是其外角和的 $3$ 倍。求其邊數。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Sum of exterior angles = $360^\\circ$",
                "Sum of interior angles = $(n - 2) \\times 180^\\circ$",
                "Given: $(n - 2) \\times 180^\\circ = 3 \\times 360^\\circ$",
                "$n - 2 = (3 \\times 360) / 180 = 6$",
                "$n = 8$"
            ],
            "solution_steps_zh": [
                "外角和 = $360^\\circ$",
                "內角和 = $(n - 2) \\times 180^\\circ$",
                "已知: $(n - 2) \\times 180^\\circ = 3 \\times 360^\\circ$",
                "$n - 2 = 6$",
                "$n = 8$"
            ],
            "final_answer": "8"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 5,
        "question": "The sum of the interior angles of a regular polygon is $5$ times the sum of its exterior angles. Find the number of sides.",
        "question_zh": "正多邊形的內角和是其外角和的 $5$ 倍。求其邊數。",
        "content": {
            "solution_steps": [
                "$(n - 2) \\times 180^\\circ = 5 \\times 360^\\circ$",
                "$n - 2 = 10 \\Rightarrow n = 12$"
            ],
            "solution_steps_zh": [
                "$(n - 2) \\times 180^\\circ = 5 \\times 360^\\circ$",
                "$n - 2 = 10 \\Rightarrow n = 12$"
            ],
            "final_answer": "12"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 5,
        "question": "The sum of the interior angles of a regular polygon is $6$ times the sum of its exterior angles. Find the number of sides.",
        "question_zh": "正多邊形的內角和是其外角和的 $6$ 倍。求其邊數。",
        "content": {
            "solution_steps": [
                "$(n - 2) \\times 180^\\circ = 6 \\times 360^\\circ$",
                "$n - 2 = 12 \\Rightarrow n = 14$"
            ],
            "solution_steps_zh": [
                "$(n - 2) \\times 180^\\circ = 6 \\times 360^\\circ$",
                "$n - 2 = 12 \\Rightarrow n = 14$"
            ],
            "final_answer": "14"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 5,
        "question": "Given $\\triangle ABC \\sim \\triangle XYZ$. $AB = 5\\text{ cm}$, $BC = 8\\text{ cm}$, $XY = 15\\text{ cm}$. Find $YZ$.",
        "question_zh": "已知 $\\triangle ABC \\sim \\triangle XYZ$。$AB = 5\\text{ cm}$，$BC = 8\\text{ cm}$，$XY = 15\\text{ cm}$。求 $YZ$。",
        "content": {
            "solution_steps": [
                "Since $\\triangle ABC \\sim \\triangle XYZ$, corresponding sides are proportional.",
                "$AB/XY = BC/YZ$",
                "$5/15 = 8/YZ$",
                "$1/3 = 8/YZ$",
                "$YZ = 24\\text{ cm}$"
            ],
            "solution_steps_zh": [
                "由於 $\\triangle ABC \\sim \\triangle XYZ$, 對應邊成比例。",
                "$AB/XY = BC/YZ$",
                "$5/15 = 8/YZ$",
                "$YZ = 24\\text{ cm}$"
            ],
            "final_answer": "24\\text{ cm}"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 5,
        "question": "Given $\\triangle ABC \\sim \\triangle XYZ$. $AB = 4\\text{ cm}$, $BC = 6\\text{ cm}$, $XY = 12\\text{ cm}$. Find $YZ$.",
        "question_zh": "已知 $\\triangle ABC \\sim \\triangle XYZ$。$AB = 4\\text{ cm}$，$BC = 6\\text{ cm}$，$XY = 12\\text{ cm}$。求 $YZ$。",
        "content": {
            "solution_steps": [
                "$AB/XY = BC/YZ$",
                "$4/12 = 6/YZ \\Rightarrow 1/3 = 6/YZ$",
                "$YZ = 18\\text{ cm}$"
            ],
            "solution_steps_zh": [
                "$AB/XY = BC/YZ$",
                "$4/12 = 6/YZ$",
                "$YZ = 18\\text{ cm}$"
            ],
            "final_answer": "18\\text{ cm}"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 7,
        "question": "In $\\triangle ABC$, $XY \\parallel BC$. $AX = 3$, $XB = 2$, $XY = 6$. Find $BC$.",
        "question_zh": "在 $\\triangle ABC$ 中，$XY \\parallel BC$。$AX = 3$，$XB = 2$，$XY = 6$。求 $BC$。",
        "content": {
            "diagram_svg": "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"65\" y=\"100\">3</text><text x=\"60\" y=\"180\">2</text><text x=\"145\" y=\"115\">6</text></svg>",
            "solution_steps": [
                "$\\triangle AXY \\sim \\triangle ABC$ (AA)",
                "$AX/AB = XY/BC$ (corr. sides, $\\sim \\triangle$s)",
                "$3/(3+2) = 6/BC \\Rightarrow BC = 10$"
            ],
            "solution_steps_zh": [
                "$\\triangle AXY \\sim \\triangle ABC$ (AA)",
                "$AX/AB = XY/BC$ (相似三角形對應邊)",
                "$3/(3+2) = 6/BC \\Rightarrow BC = 10$"
            ],
            "final_answer": "10"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 7,
        "question": "In $\\triangle ABC$, $XY \\parallel BC$. $AX = 4$, $XB = 3$, $XY = 8$. Find $BC$.",
        "question_zh": "在 $\\triangle ABC$ 中，$XY \\parallel BC$。$AX = 4$，$XB = 3$，$XY = 8$。求 $BC$。",
        "content": {
            "diagram_svg": "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"65\" y=\"100\">4</text><text x=\"60\" y=\"180\">3</text><text x=\"145\" y=\"115\">8</text></svg>",
            "solution_steps": [
                "$AX/AB = XY/BC$",
                "$4/7 = 8/BC \\Rightarrow BC = 14$"
            ],
            "solution_steps_zh": [
                "$AX/AB = XY/BC$",
                "$4/7 = 8/BC \\Rightarrow BC = 14$"
            ],
            "final_answer": "14"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 7,
        "question": "In $\\triangle ABC$, $XY \\parallel BC$. $AX = 2$, $XB = 2$, $XY = 4$. Find $BC$.",
        "question_zh": "在 $\\triangle ABC$ 中，$XY \\parallel BC$。$AX = 2$，$XB = 2$，$XY = 4$。求 $BC$。",
        "content": {
            "diagram_svg": "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"65\" y=\"100\">2</text><text x=\"60\" y=\"180\">2</text><text x=\"145\" y=\"115\">4</text></svg>",
            "solution_steps": [
                "$AX/AB = 2/4 = 1/2$",
                "$BC = 8$"
            ],
            "solution_steps_zh": [
                "$AX/AB = 2/4 = 1/2$",
                "$BC = 8$"
            ],
            "final_answer": "8"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 7,
        "question": "Given $\\triangle ABC \\sim \\triangle PQR$. The ratio of their corresponding sides is $2:3$. If the area of $\\triangle ABC$ is $12\\text{ cm}^2$, find the area of $\\triangle PQR$.",
        "question_zh": "已知 $\\triangle ABC \\sim \\triangle PQR$。對應邊之比為 $2:3$。若 $\\triangle ABC$ 面積為 $12\\text{ cm}^2$，求 $\\triangle PQR$ 面積。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Area ratio = (Side ratio)$^2 = (2/3)^2 = 4/9$",
                "$12 / \\text{Area}_2 = 4/9 \\Rightarrow \\text{Area}_2 = 27\\text{ cm}^2$"
            ],
            "solution_steps_zh": [
                "面積比 = $4/9$",
                "$12 / \\text{面積}_2 = 4/9 \\Rightarrow \\text{面積}_2 = 27\\text{ cm}^2$"
            ],
            "final_answer": "27\\text{ cm}^2"
        }
    },
    {
        "topic_id": "math_geo_rectilinear",
        "level": 7,
        "question": "Given two similar figures with side ratio $3:5$. If the smaller area is $18\\text{ m}^2$, find the larger area.",
        "question_zh": "兩個相似圖形的邊長比為 $3:5$。若較小面積為 $18\\text{ m}^2$，求較大面積。",
        "content": {
            "diagram_svg": null,
            "solution_steps": [
                "Area ratio = $(3/5)^2 = 9/25$",
                "$18 / \\text{Area}_2 = 9/25 \\Rightarrow \\text{Area}_2 = 50\\text{ m}^2$"
            ],
            "solution_steps_zh": [
                "面積比 = $(3/5)^2 = 9/25$",
                "$18 / \\text{面積}_2 = 9/25 \\Rightarrow \\text{面積}_2 = 50\\text{ m}^2$"
            ],
            "final_answer": "50\\text{ m}^2"
        }
    }
];

async function seed() {
    try {
        console.log("[Seed] Clearing old questions for topic: math_geo_rectilinear...");
        const oldSnap = await db.collection('question_bank').where('topic_id', '==', 'math_geo_rectilinear').get();
        const deleteBatch = db.batch();
        oldSnap.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();
        console.log(`✅ Deleted ${oldSnap.size} old questions.`);

        const allQuestions = [...full_v1, ...v2Questions];
        console.log(`[Seed] Importing ${allQuestions.length} total questions...`);
        
        let batch = db.batch();
        let count = 0;
        
        for (const q of allQuestions) {
            const hash = generateHash(q.topic_id, q.question);
            const ref = db.collection('question_bank').doc(hash);
            batch.set(ref, {
                ...q,
                id: hash,
                subject: q.subject || "Maths", // Ensure subject is set for UI filtering
                topic: q.topic || "Rectilinear Figures", // Ensure topic name is set
                is_approved: true,
                is_released: true,
                is_factory: true,
                standard_version: q.level >= 5 ? "3.1-Elite" : "3.0",
                created_at: new Date().toISOString()
            });
            count++;
            
            if (count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
        
        await batch.commit();
        console.log("✅ Final Merge (40 items) successful!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    }
}

seed();
