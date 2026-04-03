const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const optimizedQuestions = [
    {
        id: 'math-pinc-elite-1',
        solution_steps: [
            "Interest earned ($I$):",
            "$ I = 50000 \\times 4\\% \\times 3 = 6000 $",
            "Total amount ($A$):",
            "$ A = 50000 + 6000 = 56000 $"
        ]
    },
    {
        id: 'math-pinc-elite-2',
        solution_steps: [
            "Total amount ($A$):",
            "$ A = 80000 \\times (1 + 5\\%)^2 = 88200 $"
        ]
    },
    {
        id: 'math-pinc-elite-3',
        solution_steps: [
            "Value after Year 1 ($V_1$):",
            "$ V_1 = 120000 \\times (1 - 10\\%) = 108000 $",
            "Value after Year 2 ($V_2$):",
            "$ V_2 = 108000 \\times (1 + 5\\%) = 113400 $"
        ]
    },
    {
        id: 'math-pinc-elite-4',
        solution_steps: [
            "Marked price ($MP$):",
            "$ MP = 200 \\times (1 + 40\\%) = 280 $",
            "Selling price ($SP$):",
            "$ SP = 280 \\times (1 - 15\\%) = 238 $",
            "Profit percentage:",
            "$ \\frac{238 - 200}{200} \\times 100\\% = 19\\% $"
        ]
    },
    {
        id: 'math-pinc-elite-5',
        solution_steps: [
            "Total cost ($TC$):",
            "$ 300 \\times 60 = 18000 $",
            "Target revenue ($TR$):",
            "$ 18000 \\times (1 + 8\\%) = 19440 $",
            "Marked price ($MP$):",
            "$ 60 \\times (1 + 50\\%) = 90 $",
            "Sellable items:",
            "$ 300 \\times (1 - 10\\%) = 270 $",
            "Discount ($d$):",
            "$ 270 \\times 90 \\times (1 - d) = 19440 \\implies d = 20\\% $"
        ]
    },
    {
        id: 'math-pinc-elite-6',
        solution_steps: [
            "Plan A Amount ($A_A$):",
            "$ A_A = 100000 \\times (1 + 8\\%)^2 = 116640 $",
            "Plan B Amount ($A_B$):",
            "$ A_B = 100000 \\times (1 + \\frac{8\\%}{2})^4 \\approx 116985.86 $",
            "Difference:",
            "$ 116985.86 - 116640 = 345.86 $"
        ]
    },
    {
        id: 'math-pinc-elite-7',
        solution_steps: [
            "New area ($A'$):",
            "$ A' = \\frac{1}{2} \\times 1.2b \times 0.9h = 1.08 \times (\text{Initial Area}) $",
            "Percentage change:",
            "$ (1.08 - 1) \\times 100\\% = 8\\% $"
        ]
    },
    {
        id: 'math-pinc-elite-8',
        solution_steps: [
            "Principal ($P$):",
            "$ P \\times (1 + 10\\%)^4 = 146410 $",
            "$ P = \\frac{146410}{1.1^4} = 100000 $"
        ]
    },
    {
        id: 'math-pinc-elite-9',
        solution_steps: [
            "Marked price ($MP$):",
            "$ MP = \\frac{3400}{1 - 15\\%}$",
            "Cost price ($C$):",
            "$ C \times (1 + 25\%) = 3400 \implies C = 2720 $"
        ]
    },
    {
        id: 'math-pinc-elite-10',
        solution_steps: [
            "Value after Year 1:",
            "$ 500000 \\times (1 - 20\\%) = 400000 $",
            "Value after Year 2:",
            "$ 400000 \\times (1 - 15\\%) = 340000 $",
            "Percentage loss:",
            "$ \\frac{340000 - 289000}{340000} \\times 100\\% = 15\\% $"
        ]
    }
];

async function optimizeAnswers() {
    console.log("[Update] Optimizing 10 questions with intuitive LaTeX...");
    const batch = db.batch();
    
    for (const q of optimizedQuestions) {
        const docRef = db.collection('question_bank').doc(q.id);
        batch.update(docRef, {
            solution_steps: q.solution_steps,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    
    await batch.commit();
    console.log("[Update] SUCCESS: 10 questions optimized for MathLive display.");
}

optimizeAnswers().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
