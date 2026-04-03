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

const cleanQuestions = [
    {
        id: 'math-pinc-elite-1',
        question: "A sum of $50000 is deposited into a bank for 3 years at a simple interest rate of 4% per annum. Find the simple interest earned and the total amount.\n\n陳先生將 $50000 存入銀行，為期 3 年，按年利率 4% 計算單利息。求賺取的單利息及總本利和。"
    },
    {
        id: 'math-pinc-elite-2',
        question: "Mary invests $80000 in a bank account that pays compound interest at a rate of 5% per annum, compounded yearly. Find the total amount in the account after 2 years.\n\n瑪麗將 $80000 投資於一個銀行戶口，年利率為 5%，每年結算一次。求 2 年後的總本利和。"
    },
    {
        id: 'math-pinc-elite-3',
        question: "A car is purchased for $120000. Its value depreciates by 10% in the first year and then appreciates by 5% in the second year. Find the value of the car at the end of the second year.\n\n一輛汽車以 $120000 購得。其價值在第一年貶值 10%，隨後在第二年升值 5%。求該汽車在第二年年末的價值。"
    },
    {
        id: 'math-pinc-elite-4',
        question: "The cost price of an item is $200. A merchant marks up the price by 40% and then offers a 15% discount on the marked price. Find the profit percentage.\n\n一件商品的成本價為 $200。商人將價格加成 40%，然後按標價提供 15% 的折扣售出。求盈利百分率。"
    },
    {
        id: 'math-pinc-elite-5',
        question: "A bookstore owner buys 300 books at a cost of $60 each. The marked price is set with a markup of 50%. However, 10% of the books are damaged and cannot be sold. If the owner wants to achieve a target profit of 8% on the total cost of all 300 books, what discount percentage should be offered on the marked price of the remaining books?\n\n書店主人以每本 $60 的成本購買了 300 本書。標價按成本加成 50% 設定。然而，發現其中 10% 的書已損壞且無法出售。若主人希望在全部 300 本書的總成本中獲得 8% 的目標盈利，應對剩餘書籍的標價提供多少折扣百分率？"
    },
    {
        id: 'math-pinc-elite-6',
        question: "An investment of $100000 is held for 2 years. Plan A offers interest at 8% per annum, compounded yearly. Plan B offers interest at 8% per annum, compounded half-yearly. Find the difference in the total amount between the two plans, correct to the nearest cent.\n\n現將 $100000 投資 2 年。計劃 A 提供年利率為 8% 的複利息，每年結算一次。計劃 B 提供年利率為 8% 的複利息，每半年結算一次。求兩個計劃所得總金額之差（準確至最接近的仙）。"
    },
    {
        id: 'math-pinc-elite-7',
        question: "If the base of a triangle increases by 20% and its height decreases by 10%, find the percentage change in its area.\n\n若三角形的底增加 20% 且高減少 10%，求其面積的百分比變化。"
    },
    {
        id: 'math-pinc-elite-8',
        question: "The total amount of a 4-year investment is $146410. If the interest rate was 10% per annum, compounded yearly, find the original principal.\n\n一項為期 4 年的投資，其總本利和為 $146410。若年利率為 10% 並每年結算一次，求原先的本金。"
    },
    {
        id: 'math-pinc-elite-9',
        question: "An item is sold for $3400 at a 15% discount on its marked price. If the profit percentage is 25%, find the cost of the item.\n\n一件商品按其標價打八五折（即 15% 折扣）後售出，售價為 $3400。若盈利百分率為 25%，求商品的成本。"
    },
    {
        id: 'math-pinc-elite-10',
        question: "A machine is purchased for $500000. Its value depreciates by 20% in the first year and 15% in the second year. At the start of the third year, the machine is sold for $289000. Find the percentage loss on the sale compared to its value at the start of year 3.\n\n一台機器以 $500000 購得。其價值在第一年貶值 20%，第二年貶值 15%。在第三年年初，機器以 $289000 售出。求該次銷售相對於第三年年初價值的虧蝕百分率。"
    }
];

async function restoreBilingual() {
    console.log("[Update] Restoring clean bilingual text for 10 questions...");
    const batch = db.batch();
    
    for (const q of cleanQuestions) {
        const docRef = db.collection('question_bank').doc(q.id);
        batch.update(docRef, {
            question: q.question,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    
    await batch.commit();
    console.log("[Update] SUCCESS: Bilingual text restored and formatted with double newlines.");
}

restoreBilingual().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
