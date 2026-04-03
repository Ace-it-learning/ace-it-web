const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

const generateHash = (topic, text) => {
    return crypto.createHash('md5').update(`${topic}_${text}`).digest('hex');
};

const questions = [
  // BATCH 1
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 3 (Easy)",
    question: "In $\\triangle ABC$, $\\angle B = 58^\\circ$ and $\\angle C = 42^\\circ$. Find $x$ (the value of $\\angle A$).",
    question_zh: "在 $\\triangle ABC$ 中，$\\angle B = 58^\\circ$ 且 $\\angle C = 42^\\circ$。求 $x$ (即 $\\angle A$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 250,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">A</text><text x=\"35\" y=\"180\">B</text><text x=\"255\" y=\"180\">C</text><text x=\"65\" y=\"160\">58°</text><text x=\"210\" y=\"160\">42°</text><text x=\"145\" y=\"60\">x</text></svg>",
    solution_steps: ["$x + 58^\\circ + 42^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)", "$x + 100^\\circ = 180^\\circ$", "$x = 80^\\circ$"],
    solution_steps_zh: ["$x + 58^\\circ + 42^\\circ = 180^\\circ$ (三角形內角和)", "$x + 100^\\circ = 180^\\circ$", "$x = 80^\\circ$"],
    final_answer: "80^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 3 (Easy)",
    question: "In $\\triangle ABC$, $\\angle B = 65^\\circ$ and $\\angle C = 35^\\circ$. Find $x$ (the value of $\\angle A$).",
    question_zh: "在 $\\triangle ABC$ 中，$\\angle B = 65^\\circ$ 且 $\\angle C = 35^\\circ$。求 $x$ (即 $\\angle A$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 250,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">A</text><text x=\"35\" y=\"180\">B</text><text x=\"255\" y=\"180\">C</text><text x=\"65\" y=\"160\">65°</text><text x=\"210\" y=\"160\">35°</text><text x=\"145\" y=\"60\">x</text></svg>",
    solution_steps: ["$x + 65^\\circ + 35^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)", "$x + 100^\\circ = 180^\\circ$", "$x = 80^\\circ$"],
    solution_steps_zh: ["$x + 65^\\circ + 35^\\circ = 180^\\circ$ (三角形內角和)", "$x + 100^\\circ = 180^\\circ$", "$x = 80^\\circ$"],
    final_answer: "80^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 4 (Medium)",
    question: "In $\\triangle PQR$, $PQ = PR$. Given $\\angle Q = 65^\\circ$, find $y$ (the exterior angle $\\angle PRS$).",
    question_zh: "在 $\\triangle PQR$ 中，$PQ = PR$。已知 $\\angle Q = 65^\\circ$，求 $y$ (即外角 $\\angle PRS$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 200,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"200\" y1=\"170\" x2=\"280\" y2=\"170\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">P</text><text x=\"35\" y=\"180\">Q</text><text x=\"195\" y=\"190\">R</text><text x=\"275\" y=\"190\">S</text><text x=\"65\" y=\"160\">65°</text><text x=\"145\" y=\"60\">50°</text><text x=\"210\" y=\"160\">y</text><line x1=\"90\" y1=\"100\" x2=\"110\" y2=\"110\" stroke=\"#333\"/><line x1=\"190\" y1=\"110\" x2=\"170\" y2=\"100\" stroke=\"#333\"/></svg>",
    solution_steps: ["$\\angle PRQ = 65^\\circ$ (base $\\angle$s, isos. $\\triangle$)", "$y + 65^\\circ = 180^\\circ$ (adj. $\\angle$s on st. line)", "$y = 115^\\circ$"],
    solution_steps_zh: ["$\\angle PRQ = 65^\\circ$ (等腰三角形底角)", "$y + 65^\\circ = 180^\\circ$ (直線上的鄰角)", "$y = 115^\\circ$"],
    final_answer: "115^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "DSE Standard",
    question: "Given $AB \\parallel CD$. The top acute angle formed by a transversal is $70^\\circ$. Find $z$ (the interior angle).",
    question_zh: "已知 $AB \\parallel CD$。由截線形成的上方銳角為 $70^\\circ$。求 $z$ (同旁內角)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"50\" y1=\"50\" x2=\"250\" y2=\"50\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"150\" x2=\"250\" y2=\"150\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"20\" x2=\"200\" y2=\"180\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,45 160,50 150,55\" fill=\"#333\"/><polygon points=\"150,145 160,150 150,155\" fill=\"#333\"/><text x=\"40\" y=\"45\">A</text><text x=\"260\" y=\"45\">B</text><text x=\"40\" y=\"145\">C</text><text x=\"260\" y=\"145\">D</text><text x=\"145\" y=\"40\">70°</text><text x=\"155\" y=\"140\">z</text></svg>",
    solution_steps: ["Corresponding $\\angle$ = $70^\\circ$ ($AB \\parallel CD$)", "$z + 70^\\circ = 180^\\circ$ (int. $\\angle$s, $AB \\parallel CD$)", "$z = 110^\\circ$"],
    solution_steps_zh: ["同位角 = $70^\\circ$ ($AB \\parallel CD$)", "$z + 70^\\circ = 180^\\circ$ (同旁內角, $AB \\parallel CD$)", "$z = 110^\\circ$"],
    final_answer: "110^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5** (Elite)",
    question: "In $\\triangle ABC$, $XY \\parallel BC$. Given $\\angle A = 55^\\circ$ and $\\angle B = 45^\\circ$, find $w$ ($\\angle AXY$).",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。已知 $\\angle A = 55^\\circ$ 且 $\\angle B = 45^\\circ$，求 $w$ (即 $\\angle AXY$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"140\" y=\"55\">55°</text><text x=\"65\" y=\"210\">45°</text><text x=\"105\" y=\"115\">w</text></svg>",
    solution_steps: ["$w = \\angle B$ (corr. $\\angle$s, $XY \\parallel BC$)", "$w = 45^\\circ$"],
    solution_steps_zh: ["$w = \\angle B$ (同位角, $XY \\parallel BC$)", "$w = 45^\\circ$"],
    final_answer: "45^\\circ"
  },
  // BATCH 2
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 3 (Easy)",
    question: "In $\\triangle ABC$, $\\angle B = 72^\\circ$ and $\\angle C = 48^\\circ$. Find $x$ (the value of $\\angle A$).",
    question_zh: "在 $\\triangle ABC$ 中，$\\angle B = 72^\\circ$ 且 $\\angle C = 48^\\circ$。求 $x$ (即 $\\angle A$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 250,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">A</text><text x=\"35\" y=\"180\">B</text><text x=\"255\" y=\"180\">C</text><text x=\"65\" y=\"160\">72°</text><text x=\"210\" y=\"160\">48°</text><text x=\"145\" y=\"60\">x</text></svg>",
    solution_steps: ["$x + 72^\\circ + 48^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)", "$x + 120^\\circ = 180^\\circ$", "$x = 60^\\circ$"],
    solution_steps_zh: ["$x + 72^\\circ + 48^\\circ = 180^\\circ$ (三角形內角和)", "$x + 120^\\circ = 180^\\circ$", "$x = 60^\\circ$"],
    final_answer: "60^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 4 (Medium)",
    question: "In $\\triangle PQR$, $PQ = PR$. Given $\\angle Q = 70^\\circ$, find $y$ (the exterior angle $\\angle PRS$).",
    question_zh: "在 $\\triangle PQR$ 中，$PQ = PR$。已知 $\\angle Q = 70^\\circ$，求 $y$ (即外角 $\\angle PRS$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 200,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"200\" y1=\"170\" x2=\"280\" y2=\"170\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">P</text><text x=\"35\" y=\"180\">Q</text><text x=\"195\" y=\"190\">R</text><text x=\"275\" y=\"190\">S</text><text x=\"65\" y=\"160\">70°</text><text x=\"145\" y=\"60\">40°</text><text x=\"210\" y=\"160\">y</text><line x1=\"90\" y1=\"100\" x2=\"110\" y2=\"110\" stroke=\"#333\"/><line x1=\"190\" y1=\"110\" x2=\"170\" y2=\"100\" stroke=\"#333\"/></svg>",
    solution_steps: ["$\\angle PRQ = 70^\\circ$ (base $\\angle$s, isos. $\\triangle$)", "$y + 70^\\circ = 180^\\circ$ (adj. $\\angle$s on st. line)", "$y = 110^\\circ$"],
    solution_steps_zh: ["$\\angle PRQ = 70^\\circ$ (等腰三角形底角)", "$y + 70^\\circ = 180^\\circ$ (直線上的鄰角)", "$y = 110^\\circ$"],
    final_answer: "110^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5 (Standard)",
    question: "Given $AB \\parallel CD$. The alternating internal angle is $55^\\circ$. Find $z$ (the interior angle on the same side).",
    question_zh: "已知 $AB \\parallel CD$。內錯角為 $55^\\circ$。求 $z$ (同旁內角)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"50\" y1=\"50\" x2=\"250\" y2=\"50\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"150\" x2=\"250\" y2=\"150\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"20\" x2=\"200\" y2=\"180\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,45 160,50 150,55\" fill=\"#333\"/><polygon points=\"150,145 160,150 150,155\" fill=\"#333\"/><text x=\"40\" y=\"45\">A</text><text x=\"260\" y=\"45\">B</text><text x=\"40\" y=\"145\">C</text><text x=\"260\" y=\"145\">D</text><text x=\"145\" y=\"40\">55°</text><text x=\"155\" y=\"140\">z</text></svg>",
    solution_steps: ["$\\angle = 55^\\circ$ (alt. $\\angle$s, $AB \\parallel CD$)", "$z + 55^\\circ = 180^\\circ$ (int. $\\angle$s, $AB \\parallel CD$)", "$z = 125^\\circ$"],
    solution_steps_zh: ["角 = $55^\\circ$ (內錯角, $AB \\parallel CD$)", "$z + 55^\\circ = 180^\\circ$ (同旁內角, $AB \\parallel CD$)", "$z = 125^\\circ$"],
    final_answer: "125^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5** (Elite)",
    question: "In $\\triangle ABC$, $XY \\parallel BC$. Given $\\angle A = 65^\\circ$ and $\\angle B = 52^\\circ$, find $w$ ($\\angle AXY$).",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。已知 $\\angle A = 65^\\circ$ 且 $\\angle B = 52^\\circ$，求 $w$ (即 $\\angle AXY$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"140\" y=\"55\">65°</text><text x=\"65\" y=\"210\">52°</text><text x=\"105\" y=\"115\">w</text></svg>",
    solution_steps: ["$w = \\angle B$ (corr. $\\angle$s, $XY \\parallel BC$)", "$w = 52^\\circ$"],
    solution_steps_zh: ["$w = \\angle B$ (同位角, $XY \\parallel BC$)", "$w = 52^\\circ$"],
    final_answer: "52^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 3 (Easy)",
    question: "In $\\triangle ABC$, $\\angle B = 45^\\circ$ and $\\angle C = 62^\\circ$. Find $x$ (the value of $\\angle A$).",
    question_zh: "在 $\\triangle ABC$ 中，$\\angle B = 45^\\circ$ 且 $\\angle C = 62^\\circ$。求 $x$ (即 $\\angle A$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 250,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">A</text><text x=\"35\" y=\"180\">B</text><text x=\"255\" y=\"180\">C</text><text x=\"65\" y=\"160\">45°</text><text x=\"210\" y=\"160\">62°</text><text x=\"145\" y=\"60\">x</text></svg>",
    solution_steps: ["$x + 45^\\circ + 62^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)", "$x + 107^\\circ = 180^\\circ$", "$x = 73^\\circ$"],
    solution_steps_zh: ["$x + 45^\\circ + 62^\\circ = 180^\\circ$ (三角形內角和)", "$x + 107^\\circ = 180^\\circ$", "$x = 73^\\circ$"],
    final_answer: "73^\\circ"
  },
  // BATCH 3
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 4 (Medium)",
    question: "In $\\triangle PQR$, $PQ = PR$. Given $\\angle Q = 55^\\circ$, find $y$ (the exterior angle $\\angle PRS$).",
    question_zh: "在 $\\triangle PQR$ 中，$PQ = PR$。已知 $\\angle Q = 55^\\circ$，求 $y$ (即外角 $\\angle PRS$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 200,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"200\" y1=\"170\" x2=\"280\" y2=\"170\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">P</text><text x=\"35\" y=\"180\">Q</text><text x=\"195\" y=\"190\">R</text><text x=\"275\" y=\"190\">S</text><text x=\"65\" y=\"160\">55°</text><text x=\"145\" y=\"60\">70°</text><text x=\"210\" y=\"160\">y</text><line x1=\"90\" y1=\"100\" x2=\"110\" y2=\"110\" stroke=\"#333\"/><line x1=\"190\" y1=\"110\" x2=\"170\" y2=\"100\" stroke=\"#333\"/></svg>",
    solution_steps: ["$\\angle PRQ = 55^\\circ$ (base $\\angle$s, isos. $\\triangle$)", "$y + 55^\\circ = 180^\\circ$ (adj. $\\angle$s on st. line)", "$y = 125^\\circ$"],
    solution_steps_zh: ["$\\angle PRQ = 55^\\circ$ (等腰三角形底角)", "$y + 55^\\circ = 180^\\circ$ (直線上的鄰角)", "$y = 125^\\circ$"],
    final_answer: "125^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5 (Standard)",
    question: "Given $AB \\parallel CD$. The transversal forms an alternating internal angle of $68^\\circ$. Find $z$ (the interior angle).",
    question_zh: "已知 $AB \\parallel CD$。截線形成一個 $68^\\circ$ 的內錯角。求 $z$ (同旁內角)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"50\" y1=\"50\" x2=\"250\" y2=\"50\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"150\" x2=\"250\" y2=\"150\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"20\" x2=\"200\" y2=\"180\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,45 160,50 150,55\" fill=\"#333\"/><polygon points=\"150,145 160,150 150,155\" fill=\"#333\"/><text x=\"40\" y=\"45\">A</text><text x=\"260\" y=\"45\">B</text><text x=\"40\" y=\"145\">C</text><text x=\"260\" y=\"145\">D</text><text x=\"145\" y=\"40\">68°</text><text x=\"155\" y=\"140\">z</text></svg>",
    solution_steps: ["Corresponding $\\angle$ = $68^\\circ$ ($AB \\parallel CD$)", "$z + 68^\\circ = 180^\\circ$ (int. $\\angle$s, $AB \\parallel CD$)", "$z = 112^\\circ$"],
    solution_steps_zh: ["同位角 = $68^\\circ$ ($AB \\parallel CD$)", "$z + 68^\\circ = 180^\\circ$ (同旁內角, $AB \\parallel CD$)", "$z = 112^\\circ$"],
    final_answer: "112^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5** (Elite)",
    question: "In $\\triangle ABC$, $XY \\parallel BC$. Given $\\angle A = 72^\\circ$ and $\\angle B = 44^\\circ$, find $w$ ($\\angle AXY$).",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。已知 $\\angle A = 72^\\circ$ 且 $\\angle B = 44^\\circ$，求 $w$ (即 $\\angle AXY$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"140\" y=\"55\">72°</text><text x=\"65\" y=\"210\">44°</text><text x=\"105\" y=\"115\">w</text></svg>",
    solution_steps: ["$w = \\angle B$ (corr. $\\angle$s, $XY \\parallel BC$)", "$w = 44^\\circ$"],
    solution_steps_zh: ["$w = \\angle B$ (同位角, $XY \\parallel BC$)", "$w = 44^\\circ$"],
    final_answer: "44^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 3 (Easy)",
    question: "In $\\triangle ABC$, $\\angle B = 52^\\circ$ and $\\angle C = 68^\\circ$. Find $x$ (the value of $\\angle A$).",
    question_zh: "在 $\\triangle ABC$ 中，$\\angle B = 52^\\circ$ 且 $\\angle C = 68^\\circ$。求 $x$ (即 $\\angle A$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 250,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">A</text><text x=\"35\" y=\"180\">B</text><text x=\"255\" y=\"180\">C</text><text x=\"65\" y=\"160\">52°</text><text x=\"210\" y=\"160\">68°</text><text x=\"145\" y=\"60\">x</text></svg>",
    solution_steps: ["$x + 52^\\circ + 68^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)", "$x + 120^\\circ = 180^\\circ$", "$x = 60^\\circ$"],
    solution_steps_zh: ["$x + 52^\\circ + 68^\\circ = 180^\\circ$ (三角形內角和)", "$x + 120^\\circ = 180^\\circ$", "$x = 60^\\circ$"],
    final_answer: "60^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 4 (Medium)",
    question: "In $\\triangle PQR$, $PQ = PR$. Given $\\angle Q = 38^\\circ$, find $y$ (the exterior angle $\\angle PRS$).",
    question_zh: "在 $\\triangle PQR$ 中，$PQ = PR$。已知 $\\angle Q = 38^\\circ$，求 $y$ (即外角 $\\angle PRS$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 200,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"200\" y1=\"170\" x2=\"280\" y2=\"170\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">P</text><text x=\"35\" y=\"180\">Q</text><text x=\"195\" y=\"190\">R</text><text x=\"275\" y=\"190\">S</text><text x=\"65\" y=\"160\">38°</text><text x=\"145\" y=\"60\">104°</text><text x=\"210\" y=\"160\">y</text><line x1=\"90\" y1=\"100\" x2=\"110\" y2=\"110\" stroke=\"#333\"/><line x1=\"190\" y1=\"110\" x2=\"170\" y2=\"100\" stroke=\"#333\"/></svg>",
    solution_steps: ["$\\angle PRQ = 38^\\circ$ (base $\\angle$s, isos. $\\triangle$)", "$y + 38^\\circ = 180^\\circ$ (adj. $\\angle$s on st. line)", "$y = 142^\\circ$"],
    solution_steps_zh: ["$\\angle PRQ = 38^\\circ$ (等腰三角形底角)", "$y + 38^\\circ = 180^\\circ$ (直線上的鄰角)", "$y = 142^\\circ$"],
    final_answer: "142^\\circ"
  },
  // BATCH 4
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5 (Standard)",
    question: "Given $AB \\parallel CD$. A transversal creates an alternating angle of $42^\\circ$. Find $z$ (the interior angle).",
    question_zh: "已知 $AB \\parallel CD$。截線產生一個 $42^\\circ$ 的內錯角。求 $z$ (同旁內角)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"50\" y1=\"50\" x2=\"250\" y2=\"50\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"150\" x2=\"250\" y2=\"150\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"20\" x2=\"200\" y2=\"180\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,45 160,50 150,55\" fill=\"#333\"/><polygon points=\"150,145 160,150 150,155\" fill=\"#333\"/><text x=\"40\" y=\"45\">A</text><text x=\"260\" y=\"45\">B</text><text x=\"40\" y=\"145\">C</text><text x=\"260\" y=\"145\">D</text><text x=\"145\" y=\"40\">42°</text><text x=\"155\" y=\"140\">z</text></svg>",
    solution_steps: ["$\\angle = 42^\\circ$ (alt. $\\angle$s, $AB \\parallel CD$)", "$z + 42^\\circ = 180^\\circ$ (int. $\\angle$s, $AB \\parallel CD$)", "$z = 138^\\circ$"],
    solution_steps_zh: ["角 = $42^\\circ$ (內錯角, $AB \\parallel CD$)", "$z + 42^\\circ = 180^\\circ$ (同旁內角, $AB \\parallel CD$)", "$z = 138^\\circ$"],
    final_answer: "138^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5** (Elite)",
    question: "In $\\triangle ABC$, $XY \\parallel BC$. Given $\\angle A = 58^\\circ$ and $\\angle B = 62^\\circ$, find $w$ ($\\angle AXY$).",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。已知 $\\angle A = 58^\\circ$ 且 $\\angle B = 62^\\circ$，求 $w$ (即 $\\angle AXY$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"140\" y=\"55\">58°</text><text x=\"65\" y=\"210\">62°</text><text x=\"105\" y=\"115\">w</text></svg>",
    solution_steps: ["$\\angle AXY = \\angle B$ (corr. $\\angle$s, $XY \\parallel BC$)", "$w = 62^\\circ$"],
    solution_steps_zh: ["$\\angle AXY = \\angle B$ (同位角, $XY \\parallel BC$)", "$w = 62^\\circ$"],
    final_answer: "62^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 3 (Easy)",
    question: "In $\\triangle ABC$, $\\angle B = 60^\\circ$ and $\\angle C = 60^\\circ$. Find $x$ (the value of $\\angle A$).",
    question_zh: "在 $\\triangle ABC$ 中，$\\angle B = 60^\\circ$ 且 $\\angle C = 60^\\circ$。求 $x$ (即 $\\angle A$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 250,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">A</text><text x=\"35\" y=\"180\">B</text><text x=\"255\" y=\"180\">C</text><text x=\"65\" y=\"160\">60°</text><text x=\"210\" y=\"160\">60°</text><text x=\"145\" y=\"60\">x</text></svg>",
    solution_steps: ["$x + 60^\\circ + 60^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)", "$x + 120^\\circ = 180^\\circ$", "$x = 60^\\circ$"],
    solution_steps_zh: ["$x + 60^\\circ + 60^\\circ = 180^\\circ$ (三角形內角和)", "$x + 120^\\circ = 180^\\circ$", "$x = 60^\\circ$"],
    final_answer: "60^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 4 (Medium)",
    question: "In $\\triangle PQR$, $PQ = PR$. Given $\\angle Q = 45^\\circ$, find $y$ (the exterior angle $\\angle PRS$).",
    question_zh: "在 $\\triangle PQR$ 中，$PQ = PR$。已知 $\\angle Q = 45^\\circ$，求 $y$ (即外角 $\\angle PRS$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 200\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,170 200,170\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"200\" y1=\"170\" x2=\"280\" y2=\"170\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"20\">P</text><text x=\"35\" y=\"180\">Q</text><text x=\"195\" y=\"190\">R</text><text x=\"275\" y=\"190\">S</text><text x=\"65\" y=\"160\">45°</text><text x=\"145\" y=\"60\">90°</text><text x=\"210\" y=\"160\">y</text><line x1=\"90\" y1=\"100\" x2=\"110\" y2=\"110\" stroke=\"#333\"/><line x1=\"190\" y1=\"110\" x2=\"170\" y2=\"100\" stroke=\"#333\"/></svg>",
    solution_steps: ["$\\angle PRQ = 45^\\circ$ (base $\\angle$s, isos. $\\triangle$)", "$y + 45^\\circ = 180^\\circ$ (adj. $\\angle$s on st. line)", "$y = 135^\\circ$"],
    solution_steps_zh: ["$\\angle PRQ = 45^\\circ$ (等腰三角形底角)", "$y + 45^\\circ = 180^\\circ$ (直線上的鄰角)", "$y = 135^\\circ$"],
    final_answer: "135^\\circ"
  },
  {
    topic: "math_geo_rectilinear",
    difficulty: "Level 5** (Elite)",
    question: "In $\\triangle ABC$, $XY \\parallel BC$. Given $\\angle A = 50^\\circ$ and $\\angle B = 75^\\circ$, find $w$ ($\\angle AXY$).",
    question_zh: "在 $\\triangle ABC$ 中，$XY \\parallel BC$。已知 $\\angle A = 50^\\circ$ 且 $\\angle B = 75^\\circ$，求 $w$ (即 $\\angle AXY$ 的值)。",
    diagram_svg: "<svg viewBox=\"0 0 300 250\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"150,30 50,220 250,220\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"100\" y1=\"125\" x2=\"200\" y2=\"125\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150,120 160,125 150,130\" fill=\"#333\"/><polygon points=\"150,215 160,220 150,225\" fill=\"#333\"/><text x=\"145\" y=\"20\">A</text><text x=\"30\" y=\"230\">B</text><text x=\"260\" y=\"230\">C</text><text x=\"80\" y=\"125\">X</text><text x=\"215\" y=\"125\">Y</text><text x=\"140\" y=\"55\">50°</text><text x=\"65\" y=\"210\">75°</text><text x=\"105\" y=\"115\">w</text></svg>",
    solution_steps: ["$\\angle AXY = \\angle B$ (corr. $\\angle$s, $XY \\parallel BC$)", "$w = 75^\\circ$"],
    solution_steps_zh: ["$\\angle AXY = \\angle B$ (同位角, $XY \\parallel BC$)", "$w = 75^\\circ$"],
    final_answer: "75^\\circ"
  }
];

async function seed() {
    try {
        console.log(`[Seed] Starting import of ${questions.length} questions...`);
        const batch = db.batch();
        
        for (const q of questions) {
            const hash = generateHash(q.topic, q.question);
            const ref = db.collection('question_bank').doc(hash);
            
            // Map difficulty string to numeric levels (3, 4, 5, 7)
            let numericLevel = 3;
            if (q.difficulty.includes('Medium') || q.difficulty.includes('Level 4')) numericLevel = 4;
            else if (q.difficulty.includes('Standard') || q.difficulty.includes('Level 5')) numericLevel = 5;
            else if (q.difficulty.includes('Elite') || q.difficulty.includes('5**')) numericLevel = 7;

            batch.set(ref, {
                ...q,
                id: hash,
                topic_id: q.topic, // Compatibility
                topic: "Rectilinear Figures", // Display name
                type: "conventional", // Since they have solution steps
                level: numericLevel,
                is_approved: true,
                is_factory: true,
                created_at: new Date().toISOString(),
                visual_version: "3.1-Elite",
                standard_version: "3.1-Elite",
                marks: numericLevel >= 5 ? 4 : 3
            });
        }
        
        await batch.commit();
        console.log("✅ Seed successful!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    }
}

seed();
