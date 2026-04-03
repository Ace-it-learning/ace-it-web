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

async function fixDuplicatePercentages() {
    console.log("[Cleanup] Removing all existing 'math_num_percentages' questions to resolve duplication...");
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_num_percentages')
        .get();

    if (snapshot.empty) {
        console.log("[Cleanup] No questions found to delete.");
    } else {
        const batchSize = 100;
        let batch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
            count++;
            if (count % batchSize === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
        await batch.commit();
        console.log(`[Cleanup] Successfully deleted ${count} existing questions.`);
    }

    console.log("[Upload] Re-uploading 10 corrected elite questions...");
    
    // Copy the corrected questions from my previous turn 
    // BUT use a more stable QID if we need to update in the future, 
    // though for now simple sequence is fine.
    
    const correctedQuestions = [
        {
            topic_id: 'math_num_percentages',
            level: 3, 
            language: 'en',
            question: "A sum of $50000 is deposited into a bank for 3 years at a simple interest rate of 4% per annum. Find the simple interest earned and the total amount.\n陳先生將 $50000 存入銀行，為期 3 年，按年利率 4% 計算單利息。求賺取的單利息及總本利和。",
            solution_steps: [
                "Interest earned ($I$) after 3 years:",
                "$$ I = 50000 \\\\times 4\\\\% \\\\times 3 $$",
                "$$ I = 50000 \\\\times 0.04 \\\\times 3 $$",
                "$$ I = 6000 $$",
                "Total amount ($A$) after 3 years:",
                "$$ A = 50000 + 6000 $$",
                "$$ A = 56000 $$"
            ],
            answer: "$6000 and $56000",
            difficulty: 3
        },
        {
            topic_id: 'math_num_percentages',
            level: 3,
            language: 'en',
            question: "Mary invests $80000 in a bank account that pays compound interest at a rate of 5% per annum, compounded yearly. Find the total amount in the account after 2 years.\n瑪麗將 $80000 投資於一個銀行戶口，年利率為 5%，每年結算一次。求 2 年後的總本利和。",
            solution_steps: [
                "Total amount ($A$) after 2 years ($n = 2$):",
                "$$ A = 80000 \\\\times (1 + 5\\\\% )^2 $$",
                "$$ A = 80000 \\\\times (1.05)^2 $$",
                "$$ A = 80000 \\\\times 1.1025 $$",
                "$$ A = 88200 $$"
            ],
            answer: "$88200",
            difficulty: 3
        },
        {
            topic_id: 'math_num_percentages',
            level: 4,
            language: 'en',
            question: "A car is purchased for $120000. Its value depreciates by 10% in the first year and then appreciates by 5% in the second year. Find the value of the car at the end of the second year.\n一輛汽車以 $120000 購得。其價值在第一年貶值 10%，隨後在第二年升值 5%。求該汽車在第二年年末的價值。",
            solution_steps: [
                "Value ($V_1$) after the first year:",
                "$$ V_1 = 120000 \\\\times (1 - 10\\\\% ) $$",
                "$$ V_1 = 120000 \\\\times 0.9 $$",
                "$$ V_1 = 108000 $$",
                "Value ($V_2$) after the second year:",
                "$$ V_2 = 108000 \\\\times (1 + 5\\\\% ) $$",
                "$$ V_2 = 108000 \\\\times 1.05 $$",
                "$$ V_2 = 113400 $$"
            ],
            answer: "$113400",
            difficulty: 4
        },
        {
            topic_id: 'math_num_percentages',
            level: 4,
            language: 'en',
            question: "The cost price of an item is $200. A merchant marks up the price by 40% and then offers a 15% discount on the marked price. Find the profit percentage.\n一件商品的成本價為 $200。商人將價格加成 40%，然後按標價提供 15% 的折扣售出。求盈利百分率。",
            solution_steps: [
                "Marked price ($MP$) of the item:",
                "$$ MP = 200 \\\\times (1 + 40\\\\% ) $$",
                "$$ MP = 200 \\\\times 1.4 $$",
                "$$ MP = 280 $$",
                "Selling price ($SP$) of the item:",
                "$$ SP = 280 \\\\times (1 - 15\\\\% ) $$",
                "$$ SP = 280 \\\\times 0.85 $$",
                "$$ SP = 238 $$",
                "Profit percentage:",
                "$$ \\\\text{Profit } \\\\% = \\\\frac{238 - 200}{200} \\\\times 100\\\\% $$",
                "$$ \\\\text{Profit } \\\\% = \\\\frac{38}{200} \\\\times 100\\\\% $$",
                "$$ \\\\text{Profit } \\\\% = 19\\\\% $$"
            ],
            answer: "19%",
            difficulty: 4
        },
        {
            topic_id: 'math_num_percentages',
            level: 5,
            language: 'en',
            question: "A bookstore owner buys 300 books at a cost of $60 each. The marked price is set with a markup of 50%. However, 10% of the books are damaged and cannot be sold. If the owner wants to achieve a target profit of 8% on the total cost of all 300 books, what discount percentage should be offered on the marked price of the remaining books?\n書店主人以每本 $60 的成本購買了 300 本書。標價按成本加成 50% 設定。然而，發現其中 10% 的書已損壞且無法出售。若主人希望在全部 300 本書的總成本中獲得 8% 的目標盈利，應對剩餘書籍的標價提供多少折扣百分率？",
            solution_steps: [
                "Total cost ($TC$) of all items:",
                "$$ TC = 300 \\\\times 60 = 18000 $$",
                "Target revenue ($TR$) to achieve 8% profit:",
                "$$ TR = 18000 \\\\times (1 + 8\\\\% ) = 18000 \\\\times 1.08 = 19440 $$",
                "Marked price ($MP$) per item:",
                "$$ MP = 60 \\\\times (1 + 50\\\\% ) = 60 \\\\times 1.5 = 90 $$",
                "Number of sellable items ($n$):",
                "$$ n = 300 \\\\times (1 - 10\\\\% ) = 300 \\\\times 0.9 = 270 $$",
                "Let $d$ be the discount rate.",
                "$$ 270 \\\\times 90 \\\\times (1 - d) = 19440 $$",
                "$$ 24300 \\\\times (1 - d) = 19440 $$",
                "$$ 1 - d = \\\\frac{19440}{24300} = 0.8 $$",
                "$$ d = 0.2 = 20\\\\% $$"
            ],
            answer: "20%",
            difficulty: 5
        },
        {
            topic_id: 'math_num_percentages',
            level: 5,
            language: 'en',
            question: "An investment of $100000 is held for 2 years. Plan A offers interest at 8% per annum, compounded yearly. Plan B offers interest at 8% per annum, compounded half-yearly. Find the difference in the total amount between the two plans, correct to the nearest cent.\n現將 $100000 投資 2 年。計劃 A 提供年利率為 8% 的複利息，每年結算一次。計劃 B 提供年利率為 8% 的複利息，每半年結算一次。求兩個計劃所得總金額之差（準確至最接近的仙）。",
            solution_steps: [
                "Amount ($A_A$) under Plan A:",
                "$$ A_A = 100000 \\\\times (1 + 8\\\\% )^2 $$",
                "$$ A_A = 100000 \\\\times (1.08)^2 $$",
                "$$ A_A = 116640 $$",
                "Amount ($A_B$) under Plan B (compounded half-yearly):",
                "$$ A_B = 100000 \\\\times (1 + \\\\frac{8\\\\%}{2})^{2 \\\\times 2} $$",
                "$$ A_B = 100000 \\\\times (1.04)^4 $$",
                "$$ A_B \\\\approx 116985.856 $$",
                "Difference in amounts:",
                "$$ \\\\text{Difference} = 116985.856 - 116640 = 345.856 $$"
            ],
            answer: "$345.86",
            difficulty: 5
        },
        {
            topic_id: 'math_num_percentages',
            level: 5,
            language: 'en',
            question: "If the base of a triangle increases by 20% and its height decreases by 10%, find the percentage change in its area.\n若三角形的底增加 20% 且高減少 10%，求其面積的百分比變化。",
            solution_steps: [
                "Let the original base be $b$ and the original height be $h$.",
                "Original area ($A_1$):",
                "$$ A_1 = \\\\frac{1}{2}bh $$",
                "New area ($A_2$):",
                "$$ A_2 = \\\\frac{1}{2} (b \\\\times 120\\\\% ) \\\\times (h \\\\times 90\\\\% ) $$",
                "$$ A_2 = \\\\frac{1}{2} \\\\times 1.2b \\\\times 0.9h $$",
                "$$ A_2 = 1.08 \\\\times (\\\\frac{1}{2}bh) = 1.08A_1 $$",
                "Percentage change:",
                "$$ \\\\text{Change } \\\\% = \\\\frac{1.08A_1 - A_1}{A_1} \\\\times 100\\\\% = 8\\\\% $$"
            ],
            answer: "8%",
            difficulty: 5
        },
        {
            topic_id: 'math_num_percentages',
            level: 7,
            language: 'en',
            question: "The total amount of a 4-year investment is $146410. If the interest rate was 10% per annum, compounded yearly, find the original principal.\n一項為期 4 年的投資，其總本利和為 $146410。若年利率為 10% 並每年結算一次，求原先的本金。",
            solution_steps: [
                "Let $P$ be the original principal.",
                "$$ 146410 = P \\\\times (1 + 10\\\\% )^4 $$",
                "$$ 146410 = P \\\\times (1.1)^4 $$",
                "$$ 146410 = P \\\\times 1.4641 $$",
                "$$ P = \\\\frac{146410}{1.4641} = 100000 $$"
            ],
            answer: "$100000",
            difficulty: 7
        },
        {
            topic_id: 'math_num_percentages',
            level: 7,
            language: 'en',
            question: "An item is sold for $3400 at a 15% discount on its marked price. If the profit percentage is 25%, find the cost of the item.\n一件商品按其標價打八五折（即 15% 折扣）後售出，售價為 $3400。若盈利百分率為 25%，求商品的成本。",
            solution_steps: [
                "Let $MP$ be the marked price.",
                "$$ 3400 = MP \\\\times (1 - 15\\\\% ) $$",
                "$$ 3400 = MP \\\\times 0.85 $$",
                "$$ MP = \\\\frac{3400}{0.85} = 4000 $$",
                "Let $C$ be the cost price.",
                "$$ 3400 = C \\\\times (1 + 25\\\\% ) $$",
                "$$ 3400 = C \\\\times 1.25 $$",
                "$$ C = \\\\frac{3400}{1.25} = 2720 $$"
            ],
            answer: "$2720",
            difficulty: 7
        },
        {
            topic_id: 'math_num_percentages',
            level: 7,
            language: 'en',
            question: "A machine is purchased for $500000. Its value depreciates by 20% in the first year and 15% in the second year. At the start of the third year, the machine is sold for $289000. Find the percentage loss on the sale compared to its value at the start of year 3.\n一台機器以 $500000 購得。其價值在第一年貶值 20%，第二年貶值 15%。在第三年年初，機器以 $289000 售出。求該次銷售相對於第三年年初價值的虧蝕百分率。",
            solution_steps: [
                "Value ($V_1$) after the first year:",
                "$$ V_1 = 500000 \\\\times (1 - 20\\\\% ) = 400000 $$",
                "Value ($V_2$) after the second year (Value at start of year 3):",
                "$$ V_2 = 400000 \\\\times (1 - 15\\\\% ) = 340000 $$",
                "Loss amount on the sale:",
                "$$ \\\\text{Loss} = 340000 - 289000 = 51000 $$",
                "Percentage loss:",
                "$$ \\\\text{Loss } \\\\% = \\\\frac{51000}{340000} \\\\times 100\\\\% = 15\\\\% $$"
            ],
            answer: "15%",
            difficulty: 7
        }
    ];

    const finalBatch = db.batch();
    for (let i = 0; i < correctedQuestions.length; i++) {
        const q = correctedQuestions[i];
        // Use a persistent ID for "Percentages Part 1" so it doesn't duplicate
        const qid = `math-pinc-elite-${i + 1}`; 
        
        const docRef = db.collection('question_bank').doc(qid);
        const doc = {
            ...q,
            subject: 'Maths',
            topic: 'Percentages & Interest',
            type: 'AI_Generator',
            is_approved: true,
            status: 'released',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        finalBatch.set(docRef, doc);
    }
    
    await finalBatch.commit();
    console.log("[Upload] SUCCESS: Re-uploaded 10 unique elite questions.");
}

fixDuplicatePercentages().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
