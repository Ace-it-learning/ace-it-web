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

const questions = [
  // --- LEVEL 1: EASY (POLYGONS) ---
  {
    topic_id: "math_geo_rectilinear",
    level: 3,
    question: "A convex polygon has $5$ sides. Find the sum of its interior angles.",
    question_zh: "一個凸五邊形有 $5$ 條邊。求其內角和。",
    solution_steps: [
      "Sum of interior angles of an $n$-sided polygon = $(n - 2) \times 180^\circ$",
      "Sum = $(5 - 2) \times 180^\circ$",
      "Sum = $3 \times 180^\circ = 540^\circ$"
    ],
    solution_steps_zh: [
      "$n$ 邊形的內角和 = $(n - 2) \times 180^\circ$",
      "內角和 = $(5 - 2) \times 180^\circ$",
      "內角和 = $3 \times 180^\circ = 540^\circ$"
    ],
    final_answer: "540^\circ"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 3,
    question: "A convex polygon has $11$ sides. Find the sum of its interior angles.",
    question_zh: "一個凸十一邊形有 $11$ 條邊。求其內角和。",
    solution_steps: [
      "Sum = $(n - 2) \times 180^\circ$",
      "Sum = $(11 - 2) \times 180^\circ$",
      "Sum = $9 \times 180^\circ = 1620^\circ$"
    ],
    solution_steps_zh: [
      "內角和 = $(n - 2) \times 180^\circ$",
      "內角和 = $(11 - 2) \times 180^\circ$",
      "內角和 = $9 \times 180^\circ = 1620^\circ$"
    ],
    final_answer: "1620^\circ"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 3,
    question: "A convex polygon has $10$ sides. Find the sum of its interior angles.",
    question_zh: "一個凸十邊形有 $10$ 條邊。求其內角和。",
    solution_steps: [
      "Sum = $(10 - 2) \times 180^\circ = 1440^\circ$"
    ],
    solution_steps_zh: [
      "內角和 = $(10 - 2) \times 180^\circ = 1440^\circ$"
    ],
    final_answer: "1440^\circ"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 3,
    question: "A regular $12$-sided polygon is given. Find the size of one exterior angle.",
    question_zh: "已知一個正十二邊形。求其一個外角的大小。",
    solution_steps: [
      "Sum of exterior angles of any convex polygon = $360^\circ$",
      "Each exterior angle of a regular $n$-sided polygon = $360^\circ / n$",
      "Exterior angle = $360^\circ / 12 = 30^\circ$"
    ],
    solution_steps_zh: [
      "任何凸多邊形的外角和 = $360^\circ$",
      "正 $n$ 邊形的每個外角 = $360^\circ / n$",
      "外角 = $360^\circ / 12 = 30^\circ$"
    ],
    final_answer: "30^\circ"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 3,
    question: "A regular $9$-sided polygon is given. Find the size of one exterior angle.",
    question_zh: "已知一個正九邊形。求其一個外角的大小。",
    solution_steps: [
      "Exterior angle = $360^\circ / 9 = 40^\circ$"
    ],
    solution_steps_zh: [
      "外角 = $360^\circ / 9 = 40^\circ$"
    ],
    final_answer: "40^\circ"
  },
  // --- LEVEL 2: MEDIUM (RATIOS & ALGEBRA) ---
  {
    topic_id: "math_geo_rectilinear",
    level: 4,
    question: "The interior angles of a $5$-sided polygon are in the ratio $2:3:4:4:5$. Find the largest interior angle.",
    question_zh: "一個五邊形的內角之比為 $2:3:4:4:5$。求最大的內角。",
    solution_steps: [
      "Sum of interior angles = $(5 - 2) \times 180^\circ = 540^\circ$",
      "Total parts = $2 + 3 + 4 + 4 + 5 = 18$",
      "Size of one part = $540^\circ / 18 = 30^\circ$",
      "Largest angle = $5 \times 30^\circ = 150^\circ$"
    ],
    solution_steps_zh: [
      "內角和 = $(5 - 2) \times 180^\circ = 540^\circ$",
      "總份數 = $2 + 3 + 4 + 4 + 5 = 18$",
      "每份的大小 = $540^\circ / 18 = 30^\circ$",
      "最大角 = $5 \times 30^\circ = 150^\circ$"
    ],
    final_answer: "150^\circ"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 4,
    question: "The interior angles of a $5$-sided polygon are in the ratio $1:2:3:4:5$. Find the smallest interior angle.",
    question_zh: "一個五邊形的內角之比為 $1:2:3:4:5$。求最小的內角。",
    solution_steps: [
      "Sum of interior angles = $540^\circ$",
      "Total parts = $1 + 2 + 3 + 4 + 5 = 15$",
      "Smallest angle = $(1 / 15) \times 540^\circ = 36^\circ$"
    ],
    solution_steps_zh: [
      "內角和 = $540^\circ$",
      "總份數 = $1 + 2 + 3 + 4 + 5 = 15$",
      "最小角 = $(1 / 15) \times 540^\circ = 36^\circ$"
    ],
    final_answer: "36^\circ"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 4,
    question: "The interior angles of a $6$-sided polygon are in the ratio $3:4:4:5:5:9$. Find the largest interior angle.",
    question_zh: "一個六邊形的內角之比為 $3:4:4:5:5:9$。求最大的內角。",
    solution_steps: [
      "Sum = $(6 - 2) \times 180^\circ = 720^\circ$",
      "Total parts = $3+4+4+5+5+9 = 30$",
      "Largest angle = $(9 / 30) \times 720^\circ = 216^\circ$"
    ],
    solution_steps_zh: [
      "內角和 = $(6 - 2) \times 180^\circ = 720^\circ$",
      "總份數 = $3+4+4+5+5+9 = 30$",
      "最大角 = $(9 / 30) \times 720^\circ = 216^\circ$"
    ],
    final_answer: "216^\circ"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 4,
    question: "Each interior angle of a regular polygon is $135^\circ$. Find the number of sides.",
    question_zh: "正多邊形的每個內角為 $135^\circ$。求其邊數。",
    solution_steps: [
      "Size of each exterior angle = $180^\circ - 135^\circ = 45^\circ$",
      "Number of sides $n = 360^\circ / 45^\circ = 8$"
    ],
    solution_steps_zh: [
      "每個外角的大小 = $180^\circ - 135^\circ = 45^\circ$",
      "邊數 $n = 360^\circ / 45^\circ = 8$"
    ],
    final_answer: "8"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 4,
    question: "Each interior angle of a regular polygon is $150^\circ$. Find the number of sides.",
    question_zh: "正多邊形的每個內角為 $150^\circ$。求其邊數。",
    solution_steps: [
      "Exterior angle = $180^\circ - 150^\circ = 30^\circ$",
      "Number of sides $n = 360^\circ / 30^\circ = 12$"
    ],
    solution_steps_zh: [
      "外角 = $180^\circ - 150^\circ = 30^\circ$",
      "邊數 $n = 360^\circ / 30^\circ = 12$"
    ],
    final_answer: "12"
  },
  // --- LEVEL 3: DSE STANDARD (SIMILARITY ALGEBRA) ---
  {
    topic_id: "math_geo_rectilinear",
    level: 5,
    question: "The sum of the interior angles of a regular polygon is $3$ times the sum of its exterior angles. Find the number of sides.",
    question_zh: "正多邊形的內角和是其外角和的 $3$ 倍。求其邊數。",
    solution_steps: [
      "Sum of interior angles = $(n - 2) \times 180^\circ$",
      "Sum of exterior angles = $360^\circ$",
      "$(n - 2) \times 180^\circ = 3 \times 360^\circ$",
      "$n -  2 = 3 \times 2 = 6$",
      "$n = 8$"
    ],
    solution_steps_zh: [
      "內角和 = $(n - 2) \times 180^\circ$",
      "外角和 = $360^\circ$",
      "$(n - 2) \times 180^\circ = 3 \times 360^\circ$",
      "$n - 2 = 3 \times 2 = 6$",
      "$n = 8$"
    ],
    final_answer: "8"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 5,
    question: "The sum of the interior angles of a regular polygon is $5$ times the sum of its exterior angles. Find the number of sides.",
    question_zh: "正多邊形的內角和是其外角和的 $5$ 倍。求其邊數。",
    solution_steps: [
      "$(n - 2) \times 180^\circ = 5 \times 360^\circ$",
      "$n - 2 = 10 \implies n = 12$"
    ],
    solution_steps_zh: [
      "$(n - 2) \times 180^\circ = 5 \times 360^\circ$",
      "$n - 2 = 10 \implies n = 12$"
    ],
    final_answer: "12"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 5,
    question: "The sum of the interior angles of a regular polygon is $6$ times the sum of its exterior angles. Find the number of sides.",
    question_zh: "正多邊形的內角和是其外角和的 $6$ 倍。求其邊數。",
    solution_steps: [
      "$(n - 2) \times 180^\circ = 6 \times 360^\circ$",
      "$n = 14$"
    ],
    solution_steps_zh: [
      "$(n - 2) \times 180^\circ = 6 \times 360^\circ$",
      "$n = 14$"
    ],
    final_answer: "14"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 5,
    question: "Given $\\triangle ABC \\sim \\triangle XYZ$. $AB = 5\\text{ cm}$, $BC = 8\\text{ cm}$, $XY = 15\\text{ cm}$. Find $YZ$.",
    question_zh: "已知 $\\triangle ABC \\sim \\triangle XYZ$。$AB = 5\\text{ cm}$，$BC = 8\\text{ cm}$，$XY = 15\\text{ cm}$。求 $YZ$。",
    solution_steps: [
      "$AB/XY = BC/YZ$ (corresponding sides, $\\sim \\triangle$s)",
      "$5/15 = 8/YZ$",
      "$YZ = (8 \times 15) / 5 = 24\\text{ cm}$"
    ],
    solution_steps_zh: [
      "$AB/XY = BC/YZ$ (相似三角形的對應邊)",
      "$5/15 = 8/YZ$",
      "$YZ = (8 \times 15) / 5 = 24\\text{ cm}$"
    ],
    final_answer: "24\\text{ cm}"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 5,
    question: "Given $\\triangle ABC \\sim \\triangle XYZ$. $AB = 4\\text{ cm}$, $BC = 6\\text{ cm}$, $XY = 12\\text{ cm}$. Find $YZ$.",
    question_zh: "已知 $\\triangle ABC \\sim \\triangle XYZ$。$AB = 4\\text{ cm}$，$BC = 6\\text{ cm}$，$XY = 12\\text{ cm}$。求 $YZ$。",
    solution_steps: [
      "$AB/XY = BC/YZ = 4/12 = 1/3$",
      "$YZ = 6 \times 3 = 18\\text{ cm}$"
    ],
    solution_steps_zh: [
      "$AB/XY = BC/YZ = 4/12 = 1/3$",
      "$YZ = 6 \times 3 = 18\\text{ cm}$"
    ],
    final_answer: "18\\text{ cm}"
  },
  // --- LEVEL 4: ELITE (OVERLAPPING & AREAS) ---
  {
    topic_id: "math_geo_rectilinear",
    level: 7,
    question: "In $\\triangle ABC$, $XY \\parallel BC$. $AX = 3$, $XB = 2$, $XY = 6$. Find $BC$.",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。$AX = 3$，$XB = 2$，$XY = 6$。求 $BC$。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"65\" y=\"100\">3</text><text x=\"60\" y=\"180\">2</text><text x=\"145\" y=\"115\">6</text></svg>",
    solution_steps: [
      "$\\triangle AXY \\sim \\triangle ABC$ (AA)",
      "$AX/AB = XY/BC$ (corresponding sides, $\\sim \\triangle$s)",
      "$AB = AX + XB = 3 + 2 = 5$",
      "$3/5 = 6/BC$",
      "$BC = (6 \times 5) / 3 = 10$"
    ],
    solution_steps_zh: [
      "$\\triangle AXY \\sim \\triangle ABC$ (AA)",
      "$AX/AB = XY/BC$ (相似三角形的對應邊)",
      "$AB = AX + XB = 3 + 2 = 5$",
      "$3/5 = 6/BC$",
      "$BC = (6 \times 5) / 3 = 10$"
    ],
    final_answer: "10"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 7,
    question: "In $\\triangle ABC$, $XY \\parallel BC$. $AX = 4$, $XB = 3$, $XY = 8$. Find $BC$.",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。$AX = 4$，$XB = 3$，$XY = 8$。求 $BC$。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"65\" y=\"100\">4</text><text x=\"60\" y=\"180\">3</text><text x=\"145\" y=\"115\">8</text></svg>",
    solution_steps: [
      "$AX/AB = XY/BC$",
      "$AB = 4 + 3 = 7$",
      "$4/7 = 8/BC \\implies BC = 14$"
    ],
    solution_steps_zh: [
      "$AX/AB = XY/BC$",
      "$AB = 4 + 3 = 7$",
      "$4/7 = 8/BC \\implies BC = 14$"
    ],
    final_answer: "14"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 7,
    question: "In $\\triangle ABC$, $XY \\parallel BC$. $AX = 2$, $XB = 2$, $XY = 4$. Find $BC$.",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。$AX = 2$，$XB = 2$，$XY = 4$。求 $BC$。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"65\" y=\"100\">2</text><text x=\"60\" y=\"180\">2</text><text x=\"145\" y=\"115\">4</text></svg>",
    solution_steps: [
      "$AX/AB = 2/(2+2) = 1/2$",
      "$1/2 = 4/BC \\implies BC = 8$"
    ],
    solution_steps_zh: [
      "$AX/AB = 2/(2+2) = 1/2$",
      "$1/2 = 4/BC \\implies BC = 8$"
    ],
    final_answer: "8"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 7,
    question: "Given $\\triangle ABC \\sim \\triangle PQR$. The ratio of their corresponding sides is $2:3$. If the area of $\\triangle ABC$ is $12\\text{ cm}^2$, find the area of $\\triangle PQR$.",
    question_zh: "已知 $\\triangle ABC \\sim \\triangle PQR$。對應邊之比為 $2:3$。若 $\\triangle ABC$ 的面積為 $12\\text{ cm}^2$，求 $\\triangle PQR$ 的面積。",
    solution_steps: [
      "$\\text{Area Ratio} = (\\text{Side Ratio})^2$",
      "Area of $\\triangle ABC$ / Area of $\\triangle PQR = (2/3)^2 = 4/9$",
      "$12 / \\text{Area of } \\triangle PQR = 4/9$",
      "Area of $\\triangle PQR = (12 \times 9) / 4 = 27\\text{ cm}^2$"
    ],
    solution_steps_zh: [
      "面積比 = $(\\text{對應邊之比})^2$",
      "$\\triangle ABC$ 面積 / $\\triangle PQR$ 面積 = $(2/3)^2 = 4/9$",
      "$12 / \\triangle PQR \\text{ 面積} = 4/9$",
      "$\\triangle PQR$ 面積 = $(12 \times 9) / 4 = 27\\text{ cm}^2$"
    ],
    final_answer: "27\\text{ cm}^2"
  },
  {
    topic_id: "math_geo_rectilinear",
    level: 7,
    question: "Given two similar figures with side ratio $3:5$. If the smaller area is $18\\text{ m}^2$, find the larger area.",
    question_zh: "已知兩個相似圖形的邊長比為 $3:5$。若較小的面積為 $18\\text{ m}^2$，求較大的面積。",
    solution_steps: [
      "Area ratio = $(3/5)^2 = 9/25$",
      "$18 / A = 9/25 \\implies A = 50\\text{ m}^2$"
    ],
    solution_steps_zh: [
      "面積比 = $(3/5)^2 = 9/25$",
      "$18 / A = 9/25 \\implies A = 50\\text{ m}^2$"
    ],
    final_answer: "50\\text{ m}^2"
  }
];

async function seed() {
    try {
        // 1. CLEAR OLD QUESTIONS
        console.log("[Seed] Clearing old questions for topic: math_geo_rectilinear...");
        const oldSnap = await db.collection('question_bank').where('topic_id', '==', 'math_geo_rectilinear').get();
        const deleteBatch = db.batch();
        oldSnap.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();
        console.log(`✅ Deleted ${oldSnap.size} old questions.`);

        // 2. SEED NEW V2 QUESTIONS
        console.log(`[Seed] Starting import of ${questions.length} V2 questions...`);
        const batch = db.batch();
        
        for (const q of questions) {
            const hash = generateHash(q.topic_id, q.question);
            const ref = db.collection('question_bank').doc(hash);
            
            batch.set(ref, {
                ...q,
                id: hash,
                topic: "Rectilinear Figures",
                type: "conventional",
                is_approved: true,
                is_released: true,
                is_factory: true,
                created_at: new Date().toISOString(),
                visual_version: "3.2-Elite-V2",
                standard_version: "3.2-Elite-V2",
                marks: q.level >= 5 ? 4 : 3
            });
        }
        
        await batch.commit();
        console.log("✅ V2 Seed successful!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    }
}

seed();
