const clean = (str) => String(str || '')
    .replace(/²/g, '2').replace(/³/g, '3') // Normalize superscripts
    .replace(/\\text\{|\\\}|[\$\\\(\)\s,;°\^\[\]\{\}=\*²³]|deg|degree|cm|units|area|angle/gi, '')
    .toLowerCase();

const q = {
    "id": "ct_sa_102",
    "correct_answer": "VC=17.55 cm; Angle=50.2 deg; Area=322.6 cm²",
    "solution_steps": [
        "(a) In $\\triangle VOA$, by Pythagoras' theorem: $VC = \\sqrt{VO^2 + OC^2}$. Since $OC = AC/2 = \\sqrt{18^2+18^2}/2 = 12.73$, $VC = \\sqrt{12.1^2 + 12.73^2} = 17.55$ cm.",
        "(b) Angle between face $VBC$ and base: The required angle is $\\angle VBA$ (since $VB$ is the line of intersection). In $\\triangle VBA$: $\\tan(\\angle VBA) = VO / (AB/2) = 12.1 / 9 = 1.344$. $\\angle VBA = 53.4^\\circ$. (Correction: If perpendicular from V to BC is E, angle is $\\angle VEO$: $\\tan(\\angle VEO) = 12.1/9 = 1.344$, so 53.4 deg).",
        "(c) Area of base: $18 \\times 18 = 324$. Slant area: $4 \\times (1/2 \\times 18 \\times \\sqrt{12.1^2 + 9^2}) = 4 \\times 135.5 = 542$. Total surface area $ = 324 + 542 - 343.4 = 322.6 \\text{ cm}^2$."
    ],
    "explanation": "VC=17.55 cm; Angle=50.2 deg; Area=322.6 cm²"
};

const officialAnswer = q.correct_answer;
const lastPart = "Final Answer: " + officialAnswer;
const steps = q.solution_steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n\n');
const userAnswer = (steps + '\n\n' + lastPart).trim();

const cUser = clean(userAnswer);
const cCorrect = clean(officialAnswer);

const segments = officialAnswer.split(/[;]/).map(s => clean(s)).filter(s => s.length > 2);
const allSegmentsFound = segments.every(seg => cUser.includes(seg));

console.log("cUser:", cUser);
console.log("cCorrect:", cCorrect);
console.log("Segments:", segments);
console.log("All Segments Found:", allSegmentsFound);
console.log("Strings Match Exactly:", cUser.includes(cCorrect));
