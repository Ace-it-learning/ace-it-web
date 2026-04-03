const admin = require('firebase-admin');
const path = require('path');
const crypto = require('crypto');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// 20 UNIQUE CIRCLE PROPERTIES QUESTIONS
const questions = [
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 3" },
    "content": {
      "question_text": "In the figure, $O$ is the center of the circle. Given that $\\angle BAC = 44^\\circ$, find $x$.",
      "question_zh": "圖中，$O$ 是圓心。已知 $\\angle BAC = 44^\\circ$，求 $x$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><polygon points=\"63.4,200.0 150.0,50.0 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"63.4,200.0 150,150 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"40\">A</text><text x=\"50\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"140\" y=\"140\">O</text><text x=\"140\" y=\"80\">44°</text><text x=\"145\" y=\"170\">x</text></svg>",
      "solution_steps": [
        "$\\angle BOC = 2 \\times \\angle BAC$ ($\\angle$ at center = $2\\angle$ at circum.)",
        "$x = 2 \\times 44^\\circ$",
        "$x = 88^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle BOC = 2 \\times \\angle BAC$ (圓心角 = $2$圓周角)",
        "$x = 2 \\times 44^\\circ$",
        "$x = 88^\\circ$"
      ],
      "final_answer": "88^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 3" },
    "content": {
      "question_text": "In the figure, $O$ is the center of the circle. If $\\angle BAC = 59^\\circ$, find the value of $x$.",
      "question_zh": "圖中，$O$ 是圓心。若 $\\angle BAC = 59^\\circ$，求 $x$ 的值。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><polygon points=\"63.4,200.0 150.0,50.0 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"63.4,200.0 150,150 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"40\">A</text><text x=\"50\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"140\" y=\"140\">O</text><text x=\"140\" y=\"80\">59°</text><text x=\"145\" y=\"170\">x</text></svg>",
      "solution_steps": [
        "$\\angle BOC = 2 \\times \\angle BAC$ ($\\angle$ at center = $2\\angle$ at circum.)",
        "$x = 2 \\times 59^\\circ$",
        "$x = 118^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle BOC = 2 \\times \\angle BAC$ (圓心角 = $2$圓周角)",
        "$x = 2 \\times 59^\\circ$",
        "$x = 118^\\circ$"
      ],
      "final_answer": "118^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 3" },
    "content": {
      "question_text": "In the figure, $O$ is the center of the circle. Given $\\angle BAC = 41^\\circ$. Calculate $\\angle BOC$ ($x$).",
      "question_zh": "圖中，$O$ 是圓心。已知 $\\angle BAC = 41^\\circ$。計算 $\\angle BOC$ ($x$)。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><polygon points=\"63.4,200.0 150.0,50.0 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"63.4,200.0 150,150 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"40\">A</text><text x=\"50\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"140\" y=\"140\">O</text><text x=\"140\" y=\"80\">41°</text><text x=\"145\" y=\"170\">x</text></svg>",
      "solution_steps": [
        "$x = 2 \\times \\angle BAC$ ($\\angle$ at center = $2\\angle$ at circum.)",
        "$x = 2 \\times 41^\\circ$",
        "$x = 82^\\circ$"
      ],
      "solution_steps_zh": [
        "$x = 2 \\times \\angle BAC$ (圓心角 = $2$圓周角)",
        "$x = 2 \\times 41^\\circ$",
        "$x = 82^\\circ$"
      ],
      "final_answer": "82^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 3" },
    "content": {
      "question_text": "In the figure, the centers of the circle is $O$. Find $x$ if $\\angle BAC = 52^\\circ$.",
      "question_zh": "圖中，圓心是 $O$。若 $\\angle BAC = 52^\\circ$，求 $x$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><polygon points=\"63.4,200.0 150.0,50.0 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"63.4,200.0 150,150 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"40\">A</text><text x=\"50\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"140\" y=\"140\">O</text><text x=\"140\" y=\"80\">52°</text><text x=\"145\" y=\"170\">x</text></svg>",
      "solution_steps": [
        "$x = 2 \\times \\angle BAC$ ($\\angle$ at center = $2\\angle$ at circum.)",
        "$x = 2 \\times 52^\\circ$",
        "$x = 104^\\circ$"
      ],
      "solution_steps_zh": [
        "$x = 2 \\times \\angle BAC$ (圓心角 = $2$圓周角)",
        "$x = 2 \\times 52^\\circ$",
        "$x = 104^\\circ$"
      ],
      "final_answer": "104^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 3" },
    "content": {
      "question_text": "Suppose $O$ is the center of the circle in the figure. If $\\angle BAC = 37^\\circ$, calculate the value of $x$.",
      "question_zh": "設圖中 $O$ 為圓心。若 $\\angle BAC = 37^\\circ$，計算 $x$ 的值。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><polygon points=\"63.4,200.0 150.0,50.0 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"63.4,200.0 150,150 236.6,200.0\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"40\">A</text><text x=\"50\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"140\" y=\"140\">O</text><text x=\"140\" y=\"80\">37°</text><text x=\"145\" y=\"170\">x</text></svg>",
      "solution_steps": [
        "$\\angle BOC = 2 \\times \\angle BAC$ ($\\angle$ at center = $2\\angle$ at circum.)",
        "$x = 2 \\times 37^\\circ$",
        "$x = 74^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle BOC = 2 \\times \\angle BAC$ (圓心角 = $2$圓周角)",
        "$x = 2 \\times 37^\\circ$",
        "$x = 74^\\circ$"
      ],
      "final_answer": "74^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 4" },
    "content": {
      "question_text": "In the figure, $ABCD$ is a cyclic quadrilateral. Given that $\\angle DAB = 86^\\circ$, find $y$.",
      "question_zh": "圖中，$ABCD$ 是一個圓內接四邊形。已知 $\\angle DAB = 86^\\circ$，求 $y$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"100.0,63.4 73.4,214.3 226.6,214.3 226.6,85.7\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"90\" y=\"70\">A</text><text x=\"60\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"240\" y=\"70\">D</text><text x=\"105\" y=\"95\">86°</text><text x=\"210\" y=\"195\">y</text></svg>",
      "solution_steps": [
        "$\\angle DAB + \\angle BCD = 180^\\circ$ (opp. $\\angle$s, cyclic quad.)",
        "$86^\\circ + y = 180^\\circ$",
        "$y = 94^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle DAB + \\angle BCD = 180^\\circ$ (圓內接四邊形對角)",
        "$86^\\circ + y = 180^\\circ$",
        "$y = 94^\\circ$"
      ],
      "final_answer": "94^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 4" },
    "content": {
      "question_text": "In the figure, $ABCD$ is a cyclic quadrilateral. If $\\angle DAB = 105^\\circ$, determine the value of $y$.",
      "question_zh": "圖中，$ABCD$ 是一個圓內接四邊形。若 $\\angle DAB = 105^\\circ$，求 $y$ 的值。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"100.0,63.4 73.4,214.3 226.6,214.3 226.6,85.7\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"90\" y=\"70\">A</text><text x=\"60\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"240\" y=\"70\">D</text><text x=\"105\" y=\"95\">105°</text><text x=\"210\" y=\"195\">y</text></svg>",
      "solution_steps": [
        "$y + 105^\\circ = 180^\\circ$ (opp. $\\angle$s, cyclic quad.)",
        "$y = 180^\\circ - 105^\\circ$",
        "$y = 75^\\circ$"
      ],
      "solution_steps_zh": [
        "$y + 105^\\circ = 180^\\circ$ (圓內接四邊形對角)",
        "$y = 180^\\circ - 105^\\circ$",
        "$y = 75^\\circ$"
      ],
      "final_answer": "75^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 4" },
    "content": {
      "question_text": "In the cyclic quadrilateral $ABCD$, $\\angle DAB$ is given as $78^\\circ$. Find the size of $\\angle BCD$ denoted by $y$.",
      "question_zh": "在圓內接四邊形 $ABCD$ 中，已知 $\\angle DAB = 78^\\circ$。求標示為 $y$ 的 $\\angle BCD$ 的大小。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"100.0,63.4 73.4,214.3 226.6,214.3 226.6,85.7\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"90\" y=\"70\">A</text><text x=\"60\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"240\" y=\"70\">D</text><text x=\"105\" y=\"95\">78°</text><text x=\"210\" y=\"195\">y</text></svg>",
      "solution_steps": [
        "$y + 78^\\circ = 180^\\circ$ (opp. $\\angle$s, cyclic quad.)",
        "$y = 102^\\circ$"
      ],
      "solution_steps_zh": [
        "$y + 78^\\circ = 180^\\circ$ (圓內接四邊形對角)",
        "$y = 102^\\circ$"
      ],
      "final_answer": "102^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 4" },
    "content": {
      "question_text": "In the figure, $ABCD$ is a cyclic quadrilateral and $\\angle DAB$ is $94^\\circ$. Calculate $y$.",
      "question_zh": "圖中，$ABCD$ 是一個圓內接四邊形，且 $\\angle DAB = 94^\\circ$。計算 $y$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"100.0,63.4 73.4,214.3 226.6,214.3 226.6,85.7\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"90\" y=\"70\">A</text><text x=\"60\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"240\" y=\"70\">D</text><text x=\"105\" y=\"95\">94°</text><text x=\"210\" y=\"195\">y</text></svg>",
      "solution_steps": [
        "$\\angle BCD + 94^\\circ = 180^\\circ$ (opp. $\\angle$s, cyclic quad.)",
        "$y = 180^\\circ - 94^\\circ$",
        "$y = 86^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle BCD + 94^\\circ = 180^\\circ$ (圓內接四邊形對角)",
        "$y = 180^\\circ - 94^\\circ$",
        "$y = 86^\\circ$"
      ],
      "final_answer": "86^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 4" },
    "content": {
      "question_text": "In the figure, $ABCD$ is a cyclic quadrilateral. Given $\\angle DAB = 81^\\circ$, find $y$.",
      "question_zh": "圖中，$ABCD$ 是一個圓內接四邊形。已知 $\\angle DAB = 81^\\circ$，求 $y$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"100.0,63.4 73.4,214.3 226.6,214.3 226.6,85.7\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"90\" y=\"70\">A</text><text x=\"60\" y=\"220\">B</text><text x=\"240\" y=\"220\">C</text><text x=\"240\" y=\"70\">D</text><text x=\"105\" y=\"95\">81°</text><text x=\"210\" y=\"195\">y</text></svg>",
      "solution_steps": [
        "$y + 81^\\circ = 180^\\circ$ (opp. $\\angle$s, cyclic quad.)",
        "$y = 99^\\circ$"
      ],
      "solution_steps_zh": [
        "$y + 81^\\circ = 180^\\circ$ (圓內接四邊形對角)",
        "$y = 99^\\circ$"
      ],
      "final_answer": "99^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 5" },
    "content": {
      "question_text": "In the figure, $O$ is the center of the circle and $AB$ is a tangent to the circle at $A$. If $\\angle OBA = 42^\\circ$, find $z$.",
      "question_zh": "圖中，$O$ 是圓心，且 $AB$ 是圓在 $A$ 點的切線。若 $\\angle OBA = 42^\\circ$，求 $z$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><line x1=\"70\" y1=\"250\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"150\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"140\" y=\"140\">O</text><text x=\"145\" y=\"270\">A</text><text x=\"240\" y=\"260\">B</text><text x=\"200\" y=\"240\">42°</text><text x=\"155\" y=\"170\">z</text></svg>",
      "solution_steps": [
        "$\\angle OAB = 90^\\circ$ (tangent $\\perp$ radius)",
        "$z + 90^\\circ + 42^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)",
        "$z = 180^\\circ - 132^\\circ$",
        "$z = 48^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle OAB = 90^\\circ$ (切線垂直半徑)",
        "$z + 90^\\circ + 42^\\circ = 180^\\circ$ ($\\triangle$內角和)",
        "$z = 180^\\circ - 132^\\circ$",
        "$z = 48^\\circ$"
      ],
      "final_answer": "48^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 5" },
    "content": {
      "question_text": "In the figure, $O$ is the center of the circle and $AB$ is tangent to the circle at $A$. Given that $\\angle OBA = 36^\\circ$, calculate $\\angle AOB$ ($z$).",
      "question_zh": "圖中，$O$ 是圓心，且 $AB$ 是圓在 $A$ 點的切線。已知 $\\angle OBA = 36^\\circ$，計算 $\\angle AOB$ ($z$)。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><line x1=\"70\" y1=\"250\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"150\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"140\" y=\"140\">O</text><text x=\"145\" y=\"270\">A</text><text x=\"240\" y=\"260\">B</text><text x=\"200\" y=\"240\">36°</text><text x=\"155\" y=\"170\">z</text></svg>",
      "solution_steps": [
        "$\\angle OAB = 90^\\circ$ (tangent $\\perp$ radius)",
        "$z + 90^\\circ + 36^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)",
        "$z = 54^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle OAB = 90^\\circ$ (切線垂直半徑)",
        "$z + 90^\\circ + 36^\\circ = 180^\\circ$ ($\\triangle$內角和)",
        "$z = 54^\\circ$"
      ],
      "final_answer": "54^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 5" },
    "content": {
      "question_text": "In the figure, $O$ is the center and $AB$ is a tangent to the circle at contact point $A$. Find the value of $z$ if $\\angle OBA = 31^\\circ$.",
      "question_zh": "圖中，$O$ 是圓心，且 $AB$ 是圓在切點 $A$ 的切線。若 $\\angle OBA = 31^\\circ$，求 $z$ 的值。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><line x1=\"70\" y1=\"250\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"150\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"140\" y=\"140\">O</text><text x=\"145\" y=\"270\">A</text><text x=\"240\" y=\"260\">B</text><text x=\"200\" y=\"240\">31°</text><text x=\"155\" y=\"170\">z</text></svg>",
      "solution_steps": [
        "$\\angle OAB = 90^\\circ$ (tangent $\\perp$ radius)",
        "$z + 90^\\circ + 31^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)",
        "$z = 180^\\circ - 121^\\circ$",
        "$z = 59^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle OAB = 90^\\circ$ (切線垂直半徑)",
        "$z + 90^\\circ + 31^\\circ = 180^\\circ$ ($\\triangle$內角和)",
        "$z = 180^\\circ - 121^\\circ$",
        "$z = 59^\\circ$"
      ],
      "final_answer": "59^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 5" },
    "content": {
      "question_text": "In the figure, $AB$ is a tangent to the circle at $A$ and $O$ is the center. Determine $z$ given $\\angle OBA = 45^\\circ$.",
      "question_zh": "圖中，$AB$ 是圓在 $A$ 點的切線，且 $O$ 是圓心。已知 $\\angle OBA = 45^\\circ$，確定 $z$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><line x1=\"70\" y1=\"250\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"150\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"140\" y=\"140\">O</text><text x=\"145\" y=\"270\">A</text><text x=\"240\" y=\"260\">B</text><text x=\"200\" y=\"240\">45°</text><text x=\"155\" y=\"170\">z</text></svg>",
      "solution_steps": [
        "$\\angle OAB = 90^\\circ$ (tangent $\\perp$ radius)",
        "$z + 90^\\circ + 45^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)",
        "$z = 45^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle OAB = 90^\\circ$ (切線垂直半徑)",
        "$z + 90^\\circ + 45^\\circ = 180^\\circ$ ($\\triangle$內角和)",
        "$z = 45^\\circ$"
      ],
      "final_answer": "45^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 5" },
    "content": {
      "question_text": "In the figure, $AB$ is tangent to the circle at $A$ and the center of the circle is $O$. Find $z$ if $\\angle OBA = 55^\\circ$.",
      "question_zh": "圖中，$AB$ 是圓在 $A$ 點的切線，且圓心是 $O$。若 $\\angle OBA = 55^\\circ$，求 $z$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"150\" r=\"3\" fill=\"#333\"/><line x1=\"70\" y1=\"250\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"150\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"150\" y1=\"150\" x2=\"230\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"140\" y=\"140\">O</text><text x=\"145\" y=\"270\">A</text><text x=\"240\" y=\"260\">B</text><text x=\"200\" y=\"240\">55°</text><text x=\"155\" y=\"170\">z</text></svg>",
      "solution_steps": [
        "$\\angle OAB = 90^\\circ$ (tangent $\\perp$ radius)",
        "$z + 90^\\circ + 55^\\circ = 180^\\circ$ ($\\angle$ sum of $\\triangle$)",
        "$z = 35^\\circ$"
      ],
      "solution_steps_zh": [
        "$\\angle OAB = 90^\\circ$ (切線垂直半徑)",
        "$z + 90^\\circ + 55^\\circ = 180^\\circ$ ($\\triangle$內角和)",
        "$z = 35^\\circ$"
      ],
      "final_answer": "35^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 7" },
    "content": {
      "question_text": "In the figure, $AT$ is a tangent to the circle at contact point $A$. If $\\angle BAT = 58^\\circ$, find $\\angle ACB$ ($w$).",
      "question_zh": "圖中，$AT$ 是圓在切點 $A$ 的切線。若 $\\angle BAT = 58^\\circ$，求 $\\angle ACB$ ($w$)。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"250\" x2=\"250\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150.0,250.0 244.0,184.2 63.4,14.5\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"270\">A</text><text x=\"250\" y=\"210\">B</text><text x=\"50\" y=\"100\">C</text><text x=\"255\" y=\"265\">T</text><text x=\"180\" y=\"240\">58°</text><text x=\"100\" y=\"130\">w</text></svg>",
      "solution_steps": [
        "$w = \\angle BAT$ ($\\angle$ in alt. segment)",
        "$w = 58^\\circ$"
      ],
      "solution_steps_zh": [
        "$w = \\angle BAT$ (弦切角)",
        "$w = 58^\\circ$"
      ],
      "final_answer": "58^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 7" },
    "content": {
      "question_text": "In the figure, $AT$ is tangent to the circle at $A$. Given that $\\angle BAT = 64^\\circ$. Determine the value of $w$.",
      "question_zh": "圖中，$AT$ 是圓在 $A$點的切線。已知 $\\angle BAT = 64^\\circ$。確定 $w$ 的值。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"250\" x2=\"250\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150.0,250.0 244.0,184.2 63.4,14.5\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"270\">A</text><text x=\"250\" y=\"210\">B</text><text x=\"50\" y=\"100\">C</text><text x=\"255\" y=\"265\">T</text><text x=\"180\" y=\"240\">64°</text><text x=\"100\" y=\"130\">w</text></svg>",
      "solution_steps": [
        "$w = \\angle BAT$ ($\\angle$ in alt. segment)",
        "$w = 64^\\circ$"
      ],
      "solution_steps_zh": [
        "$w = \\angle BAT$ (弦切角)",
        "$w = 64^\\circ$"
      ],
      "final_answer": "64^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 7" },
    "content": {
      "question_text": "In the figure, $AT$ is a tangent to the circle at contact $A$. Find $w$ if $\\angle BAT = 49^\\circ$.",
      "question_zh": "圖中，$AT$ 是圓在切點 $A$ 的切線。若 $\\angle BAT = 49^\\circ$，求 $w$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"250\" x2=\"250\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150.0,250.0 244.0,184.2 63.4,14.5\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"270\">A</text><text x=\"250\" y=\"210\">B</text><text x=\"50\" y=\"100\">C</text><text x=\"255\" y=\"265\">T</text><text x=\"180\" y=\"240\">49°</text><text x=\"100\" y=\"130\">w</text></svg>",
      "solution_steps": [
        "$w = \\angle BAT$ ($\\angle$ in alt. segment)",
        "$w = 49^\\circ$"
      ],
      "solution_steps_zh": [
        "$w = \\angle BAT$ (弦切角)",
        "$w = 49^\\circ$"
      ],
      "final_answer": "49^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 7" },
    "content": {
      "question_text": "In the figure, $AT$於 $A$點與圓相切。若 $\\angle BAT = 72^\\circ$, find the value of $w$.",
      "question_zh": "圖中，$AT$ 於 $A$ 點與圓相切。若 $\\angle BAT = 72^\\circ$，求 $w$ 的值。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"250\" x2=\"250\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150.0,250.0 244.0,184.2 63.4,14.5\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"270\">A</text><text x=\"250\" y=\"210\">B</text><text x=\"50\" y=\"100\">C</text><text x=\"255\" y=\"265\">T</text><text x=\"180\" y=\"240\">72°</text><text x=\"100\" y=\"130\">w</text></svg>",
      "solution_steps": [
        "$w = \\angle BAT$ ($\\angle$ in alt. segment)",
        "$w = 72^\\circ$"
      ],
      "solution_steps_zh": [
        "$w = \\angle BAT$ (弦切角)",
        "$w = 72^\\circ$"
      ],
      "final_answer": "72^\\circ"
    }
  },
  {
    "meta": { "topic": "Circle Properties", "difficulty": "Level 7" },
    "content": {
      "question_text": "In the figure, $AT$ is a tangent to the circle at $A$. Given that $\\angle BAT = 53^\\circ$, find $w$.",
      "question_zh": "圖中，$AT$ 是圓在 $A$ 點的切線。已知 $\\angle BAT = 53^\\circ$，求 $w$。",
      "diagram_svg": "<svg viewBox=\"0 0 300 300\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"150\" cy=\"150\" r=\"100\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><line x1=\"50\" y1=\"250\" x2=\"250\" y2=\"250\" stroke=\"#333\" stroke-width=\"2\"/><polygon points=\"150.0,250.0 244.0,184.2 63.4,14.5\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"145\" y=\"270\">A</text><text x=\"250\" y=\"210\">B</text><text x=\"50\" y=\"100\">C</text><text x=\"255\" y=\"265\">T</text><text x=\"180\" y=\"240\">53°</text><text x=\"100\" y=\"130\">w</text></svg>",
      "solution_steps": [
        "$w = \\angle BAT$ ($\\angle$ in alt. segment)",
        "$w = 53^\\circ$"
      ],
      "solution_steps_zh": [
        "$w = \\angle BAT$ (弦切角)",
        "$w = 53^\\circ$"
      ],
      "final_answer": "53^\\circ"
    }
  }
];

async function insertAll() {
    console.log(`[Upload] Starting Deployment of ${questions.length} Circle Properties questions...`);
    
    let totalSaved = 0;
    const batch = db.batch();

    questions.forEach((q, index) => {
        const level = parseInt(q.meta.difficulty.replace('Level ', '')) || 3;
        
        // Consistent QID based on question text
        const hashStr = `math_geo_circles-${level}-${q.content.question_text.substring(0, 30)}-${index}`;
        const qid = crypto.createHash('md5').update(hashStr).digest('hex');
        const docRef = db.collection('question_bank').doc(qid);
        
        const doc = {
            topic_id: 'math_geo_circles',
            level: level,
            type: 'short_answer',
            question: q.content.question_text,
            question_zh: q.content.question_zh,
            diagram_svg: q.content.diagram_svg,
            solution_steps: q.content.solution_steps,
            solution_steps_zh: q.content.solution_steps_zh,
            final_answer: q.content.final_answer,
            answer: q.content.final_answer.replace('^\\\\circ', '').trim(), // Clean answer for validation
            marks: (level >= 5) ? 4 : 3,
            subject: 'Maths',
            topic: 'Circle Properties',
            is_approved: true,
            status: 'released',
            standard_version: '3.0-Adaptive',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        batch.set(docRef, doc, { merge: true });
        totalSaved++;
    });

    await batch.commit();
    console.log(`[Upload] SUCCESS: Inserted ${totalSaved} unique documents for Circle Properties.`);
}

insertAll().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
