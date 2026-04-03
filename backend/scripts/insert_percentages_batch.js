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

// 20 UNIQUE QUESTIONS (10 Restored + 10 Final)
const questions = [
  // --- BATCH 1 (Restored from save_elite_percentages.js) ---
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "A sum of HKD 50,000 is deposited into a bank for 3 years at a simple interest rate of 4% per annum. Find the simple interest earned and the total amount.",
      "question_zh": "將 HKD 50,000 存入銀行，為期 3 年，按年利率 4% 計算單利息。求賺取的單利息及總本利和。",
      "solution_steps": [
        "Step 1: Calculate the simple interest $50,000 \\times 4\\% \\times 3 = 6,000$",
        "Step 2: Calculate the total amount $50,000 + 6,000 = 56,000$"
      ],
      "solution_steps_zh": [
        "第一步：計算單利息 $50,000 \\times 4\\% \\times 3 = 6,000$",
        "第二步：計算本利和 $50,000 + 6,000 = 56,000$"
      ],
      "explanation": "Simple Interest is calculated using $I = P \\times r \\times t$. The amount is Principal + Interest.",
      "explanation_zh": "單利息使用公式 $I = P \\times r \\times t$ 計算。本利和則為本金加上利息。",
      "answer": "56000",
      "final_answer": "HKD 56,000",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "Mary invests HKD 80,000 in a bank account that pays compound interest at a rate of 5% per annum, compounded yearly. Find the total amount in the account after 2 years.",
      "question_zh": "瑪麗將 HKD 80,000 投資於一個銀行戶口，年利率為 5%，每年結算一次。求 2 年後的總本利和。",
      "solution_steps": [
        "Step 1: Calculate the final amount using the compound interest formula $80,000 \\times (1 + 5\\%)^{2} = 88,200$"
      ],
      "solution_steps_zh": [
        "第一步：使用複利息公式計算本利和 $80,000 \\times (1 + 5\\%)^{2} = 88,200$"
      ],
      "explanation": "Compound Interest grows exponentially. The formula is $A = P(1 + r)^n$.",
      "explanation_zh": "複利息呈指數級增長。公式為 $A = P(1 + r)^n$。",
      "answer": "88200",
      "final_answer": "HKD 88,200",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 4" },
    "content": {
      "type": "short_answer",
      "question": "A car is purchased for HKD 120,000. Its value depreciates by 10% in the first year and then appreciates by 5% in the second year. Find the value of the car at the end of the second year.",
      "question_zh": "一輛汽車以 HKD 120,000 購得。其價值在第一年貶值 10%，隨後在第二年升值 5%。求該汽車在第二年年末的價值。",
      "solution_steps": [
        "Step 1: Value after first year $120,000 \\times (1 - 10\\%) = 108,000$",
        "Step 2: Value after second year $108,000 \\times (1 + 5\\%) = 113,400$"
      ],
      "solution_steps_zh": [
        "第一步：第一年後的價值 $120,000 \\times (1 - 10\\%) = 108,000$",
        "第二步：第二年後的價值 $108,000 \\times (1 + 5\\%) = 113,400$"
      ],
      "explanation": "Successive changes multiply original value by each factor: $(1 - 10\\%)$ then $(1 + 5\\%)$.",
      "explanation_zh": "連續變動是通過將原始價值乘以每個因子來計算的：先乘以 $$(1 - 10\\%)$$，再乘以 $$(1 + 5\\%)$$.",
      "answer": "113400",
      "final_answer": "HKD 113,400",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 4" },
    "content": {
      "type": "short_answer",
      "question": "The cost price of an item is HKD 200. A merchant marks up the price by 40% and then offers a 15% discount on the marked price. Find the profit percentage.",
      "question_zh": "一件商品的成本價為 HKD 200。商人將價格加成 40%，然後按標價提供 15% 的折扣售出。求盈利百分率。",
      "solution_steps": [
        "Step 1: Calculate the marked price.",
        "$$200 \\times (1 + 40\\%) = 280$$",
        "Step 2: Calculate the selling price.",
        "$$280 \\times (1 - 15\\%) = 238$$",
        "Step 3: Calculate the profit percentage.",
        "$$\\text{Profit } \\% = \\frac{238 - 200}{200} \\times 100\\% = 19\\%$$"
      ],
      "solution_steps_zh": [
        "第一步：計算標價。",
        "$$200 \\times (1 + 40\\%) = 280$$",
        "第二步：計算售價。",
        "$$280 \\times (1 - 15\\%) = 238$$",
        "第三步：計算盈利百分率。",
        "$$\\text{盈利百分率} = \\frac{238 - 200}{200} \\times 100\\% = 19\\%$$"
      ],
      "explanation": "Profit % is based on the cost price: $(SP - Cost) / Cost \\times 100\\%$.",
      "explanation_zh": "盈利百分率是基於成本價計算的：$(售價 - 成本) / 成本 \\times 100\\%$。",
      "answer": "19",
      "final_answer": "19%",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 5" },
    "content": {
      "type": "short_answer",
      "question": "A bookstore owner buys 300 books at a cost of HKD 60 each. The marked price is set with a markup of 50%. However, 10% of the books are damaged and cannot be sold. If the owner wants to achieve a target profit of 8% on the total cost of all 300 books, what discount percentage should be offered on the marked price of the remaining books?",
      "question_zh": "書店主人以每本 HKD 60 的成本購買了 300 本書。標價按成本加成 50% 設定。然而，發現其中 10% 的書已損壞且無法出售。若主人希望在全部 300 本書的總成本中獲得 8% 的目標盈利，應對剩餘書籍的標價提供多少折扣百分率？",
      "solution_steps": [
        "Step 1: Total Cost = $300 \\times 60 = 18,000$, Target Revenue = $18,000 \\times (1.08) = 19,440$",
        "Step 2: Marked Price = $60 \\times 1.5 = 90$, Sellable Quantity = $300 \\times 0.9 = 270$",
        "Step 3: Solve for $d$: $270 \\times 90 \\times (1 - d) = 19,440 \\Rightarrow 24,300(1 - d) = 19,440 \\Rightarrow d = 20\\%$"
      ],
      "solution_steps_zh": [
        "第一步：總成本 = $300 \\times 60 = 18,000$，目標收入 = $18,000 \\times (1.08) = 19,440$",
        "第二步：標價 = $60 \\times 1.5 = 90$，可售數量 = $300 \\times 0.9 = 270$",
        "第三步：解 $d$: $270 \\times 90 \\times (1 - d) = 19,440 \\Rightarrow 24,300(1 - d) = 19,440 \\Rightarrow d = 20\\%$"
      ],
      "explanation": "The target profit is based on the initial cost. Solve for the needed discount on available stock.",
      "explanation_zh": "目標盈利是基於最初成本計算的。解方程求出可用庫存所需的折扣。",
      "answer": "20",
      "final_answer": "20%",
      "marks": 5
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 5" },
    "content": {
      "type": "short_answer",
      "question": "An investment of HKD 100,000 is held for 2 years. Plan A offers interest at 8% per annum, compounded yearly. Plan B offers interest at 8% per annum, compounded half-yearly. Find the difference in the total amount between the two plans, correct to the nearest cent.",
      "question_zh": "現將 HKD 100,000 投資 2 年。計劃 A 提供年利率為 8% 的複利息，每年結算一次。計劃 B 提供年利率為 8% 的複利息，每半年結算一次。求兩個計劃所得總金額之差（準確至最接近的仙）。",
      "solution_steps": [
        "Step 1: Amount A = $100,000 \\times (1.08)^{2} = 116,640$",
        "Step 2: Amount B = $100,000 \\times (1 + 4\\%)^{4} = 116,985.856$",
        "Step 3: Difference = $116,985.856 - 116,640 = 345.856 \\approx 345.86$"
      ],
      "solution_steps_zh": [
        "第一步：金額 A = $100,000 \\times (1.08)^{2} = 116,640$",
        "第二步：金額 B = $100,000 \\times (1 + 4\\%)^{4} = 116,985.856$",
        "第三步：差額 = $116,985.856 - 116,640 = 345.856 \\approx 345.86$"
      ],
      "explanation": "Compounded half-yearly means divide the rate by 2 and multiply the periods by 2.",
      "explanation_zh": "每半年結算一次意味著利率除以 2，期數乘以 2。",
      "answer": "345.86",
      "final_answer": "HKD 345.86",
      "marks": 5
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 5" },
    "content": {
      "type": "short_answer",
      "question": "If the base of a triangle increases by 20% and its height decreases by 10%, find the percentage change in its area.",
      "question_zh": "若三角形的底增加 20% 且高減少 10%，求其面積的百分比變化。",
      "solution_steps": [
        "Step 1: Let the original area be $A$. New Area = $(1 + 20\\%) \\times (1 - 10\\%) \\times A$",
        "Step 2: Calculate the factor $1.2 \\times 0.9 = 1.08$",
        "Step 3: Percentage change $1.08 - 1 = 0.08 = 8\\%$"
      ],
      "solution_steps_zh": [
        "第一步：設原始面積為 $A$。新面積 = $(1 + 20\\%) \\times (1 - 10\\%) \\times A$",
        "第二步：計算因子 $1.2 \\times 0.9 = 1.08$",
        "第三步：百分比變化 $1.08 - 1 = 0.08 = 8\\%$"
      ],
      "explanation": "The change in product equals the product of changes. Area depends on $Base \\times Height$.",
      "explanation_zh": "乘積的變化等於變化倍數的乘積。面積取決於底乘以高。",
      "answer": "8",
      "final_answer": "8%",
      "marks": 4
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 7" },
    "content": {
      "type": "short_answer",
      "question": "The total amount of a 4-year investment is HKD 146,410. If the interest rate was 10% per annum, compounded yearly, find the original principal.",
      "question_zh": "一項為期 4 年的投資，其總本利和為 HKD 146,410。若年利率為 10% 並每年結算一次，求原先的本金。",
      "solution_steps": [
        "Step 1: Set up the equation $P \\times (1.1)^{4} = 146,410$",
        "Step 2: Solve for $P$: $P = 146,410 \\div 1.4641 = 100,000$"
      ],
      "solution_steps_zh": [
        "第一步：建立方程 $P \\times (1.1)^{4} = 146,410$",
        "第二步：解 $P$: $P = 146,410 \\div 1.4641 = 100,000$"
      ],
      "explanation": "This is a reverse compound interest problem. Solve for $P$ in $A = P(1+r)^n$.",
      "explanation_zh": "這是一個逆向複利息問題。求解公式 $A = P(1+r)^n$ 中的 $P$。",
      "answer": "100000",
      "final_answer": "HKD 100,000",
      "marks": 5
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 7" },
    "content": {
      "type": "short_answer",
      "question": "An item is sold for HKD 3,400 at a 15% discount on its marked price. If the profit percentage is 25%, find the cost of the item.",
      "question_zh": "一件商品按其標價打八五折（即 15% 折扣）後售出，售價為 HKD 3,400。若盈利百分率為 25%，求商品的成本。",
      "solution_steps": [
        "Step 1: Selling Price = $3,400$",
        "Step 2: Use Selling Price and Profit % to find Cost: $Cost \\times (1 + 25\\%) = 3,400 \\Rightarrow Cost = 2,720$"
      ],
      "solution_steps_zh": [
        "第一步：售價 = $3,400$",
        "第二步：使用售價和盈利百分率求成本：$成本 \\times (1 + 25\\%) = 3,400 \\Rightarrow 成本 = 2,720$"
      ],
      "explanation": "Profit is always calculated on top of the cost price.",
      "explanation_zh": "盈利總是基於成本價計算的。",
      "answer": "2720",
      "final_answer": "HKD 2,720",
      "marks": 5
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 7" },
    "content": {
      "type": "short_answer",
      "question": "A machine is purchased for HKD 500,000. Its value depreciates by 20% in the first year and 15% in the second year. At the start of the third year, the machine is sold for HKD 289,000. Find the percentage loss on the sale compared to its value at the start of year 3.",
      "question_zh": "一台機器以 HKD 500,000 購得。其價值在第一年貶值 20%，第二年貶值 15%。在第三年年初，機器以 HKD 289,000 售出。求該次銷售相對於第三年年初價值的虧蝕百分率。",
      "solution_steps": [
        "Step 1: Value after 2 years $500,000 \\times 0.8 \\times 0.85 = 340,000$",
        "Step 2: Loss on sale $340,000 - 289,000 = 51,000$",
        "Step 3: Percentage loss $\\frac{51,000}{340,000} \\times 100\\% = 15\\%$"
      ],
      "solution_steps_zh": [
        "第一步：計算 2 年後的價值 $500,000 \\times 0.8 \\times 0.85 = 340,000$",
        "第二步：計算銷售虧蝕 $340,000 - 289,000 = 51,000$",
        "第三步：虧蝕百分率 $\\frac{51,000}{340,000} \\times 100\\% = 15\\%$"
      ],
      "explanation": "The basis for the final loss is the depreciated value at the start of Year 3.",
      "explanation_zh": "最終虧蝕的基準是第三年年初貶值後的價值。",
      "answer": "15",
      "final_answer": "15%",
      "marks": 5
    }
  },

  // --- BATCH 2 (The "Perfect Seeds" from previous message) ---
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "A sum of HKD 120,000 is deposited in a bank at a simple interest rate of 5% per annum. Find the total amount after 4 years.",
      "question_zh": "將 HKD 120,000 存入銀行，年利率為 5%，以單利息計算。求 4 年後的本利和。",
      "solution_steps": [
        "Step 1: Calculate the simple interest $120,000 \\times 5\\% \\times 4 = 24,000$",
        "Step 2: Calculate the total amount $120,000 + 24,000 = 144,000$"
      ],
      "solution_steps_zh": [
        "第一步：計算單利息 $120,000 \\times 5\\% \\times 4 = 24,000$",
        "第二步：計算本利和 $120,000 + 24,000 = 144,000$"
      ],
      "explanation": "To find the total amount under simple interest, calculate the interest using $$I = P \\times r \\times t$$ and add it to the principal.",
      "explanation_zh": "在單利息計算中，先使用公式 $$I = P \\times r \\times t$$ 求出利息，然後將其加上本金以求得本利和。",
      "answer": "144000",
      "final_answer": "HKD 144,000",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "HKD 60,000 is invested at an interest rate of 8% per annum, compounded half-yearly. Find the final amount at the end of 1.5 years, correct to the nearest integer.",
      "question_zh": "將 HKD 60,000 以年利率 8% 投資，每半年計息一次。求 1.5 年後的本利和，答案準確至最接近的整數。",
      "solution_steps": [
        "Step 1: per period: Rate = $8\\% \\div 2 = 4\\%$, Periods = $1.5 \\times 2 = 3$",
        "Step 2: Final amount $60,000 \\times (1 + 4\\%)^{3} = 67,491.84$",
        "Step 3: Rounding $67,491.84 \\approx 67,492$"
      ],
      "solution_steps_zh": [
        "第一步：計算每期率且期數：利率 = $8\\% \\div 2 = 4\\%$，期數 = $1.5 \\times 2 = 3$",
        "第二步：計算本利和 $60,000 \\times (1 + 4\\%)^{3} = 67,491.84$",
        "第三步：取值 $67,491.84 \\approx 67,492$"
      ],
      "explanation": "For half-yearly compounding, the periodic rate is the annual rate divided by 2, and the number of periods is the years multiplied by 2.",
      "explanation_zh": "對於每半年計息一次的情況，每期利率為年利率除以 2，期數為年數乘以 2。",
      "answer": "67492",
      "final_answer": "HKD 67,492",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "The marked price of a handbag is HKD 8,000. It is sold at two successive discounts of 15% and 10%. Find the selling price.",
      "question_zh": "某手袋的身標價為 HKD 8,000。現以兩次連續折扣 15% 及 10% 出售。求售價。",
      "solution_steps": [
        "Step 1: Calculate the selling price $8,000 \\times (1 - 15\\%) \\times (1 - 10\\%) = 6,120$"
      ],
      "solution_steps_zh": [
        "第一步：計算兩次連續折扣後的售價 $8,000 \\times (1 - 15\\%) \\times (1 - 10\\%) = 6,120$"
      ],
      "explanation": "To find the final selling price after successive discounts, multiply the marked price by each $$(1 - \\text{Discount Rate})$$.",
      "explanation_zh": "要計算連續折扣後的最終售價，將標價乘以每個 $$(1 - \\text{折扣率})$$。",
      "answer": "6120",
      "final_answer": "HKD 6,120",
      "marks": 2
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "A refrigerator is bought for HKD 250,000. Its value depreciates by 12% in the first year and 15% in the second year. Find its value at the end of the second year.",
      "question_zh": "某雪櫃以 HKD 250,000 購入。其價值在第一年貶值 12%，在第二年貶值 15%。求第二年年末該雪櫃的價值。",
      "solution_steps": [
        "Step 1: Final value $250,000 \\times (1 - 12\\%) \\times (1 - 15\\%) = 187,000$"
      ],
      "solution_steps_zh": [
        "第一步：計算第二年後的價值 $250,000 \\times (1 - 12\\%) \\times (1 - 15\\%) = 187,000$"
      ],
      "explanation": "Depreciation is calculated similarly to successive discounts. Multiply the original value by $$(1 - r_1) \\times (1 - r_2)$$.",
      "explanation_zh": "貶值的計算方法與連續折扣類似。將原始價值乘以 $$(1 - r_1) \\times (1 - r_2)$$。",
      "answer": "187000",
      "final_answer": "HKD 187,000",
      "marks": 2
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "The cost of a watch is HKD 3,000. It is marked up by 40% to set the marked price. It is then sold at a discount of 15%. Find the profit percentage.",
      "question_zh": "某手錶的成本為 HKD 3,000。按成本增加 40% 作為標價。隨後以 15% 的折扣售出。求盈利百分率。",
      "solution_steps": [
        "Step 1: Marked price $3,000 \\times (1 + 40\\%) = 4,200$",
        "Step 2: Selling price $4,200 \\times (1 - 15\\%) = 3,570$",
        "Step 3: Profit % = $\\frac{3,570 - 3,000}{3,000} \\times 100\\% = 19\\%$"
      ],
      "solution_steps_zh": [
        "第一步：計算標價 $3,000 \\times (1 + 40\\%) = 4,200$",
        "第二步：計算售價 $4,200 \\times (1 - 15\\%) = 3,570$",
        "第三步：計算盈利百分率 $\\frac{3,570 - 3,000}{3,000} \\times 100\\% = 19\\%$"
      ],
      "explanation": "Calculate the marked price first, then the selling price after discount. Profit % = profit / cost.",
      "explanation_zh": "先計算標價，再計算折扣後的售價。盈利百分率為利潤除以成本。",
      "answer": "19",
      "final_answer": "19%",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 4" },
    "content": {
      "type": "short_answer",
      "question": "A trader buys 200 items at a cost of HKD 50 each. He marks up the items by 60%. If 25 items are damaged and thrown away, what discount percentage must he offer on the remaining items to achieve an overall profit of 12%?",
      "question_zh": "某商人以每件 HKD 50 的成本購入 200 件貨品。他將貨品按成本增加 60% 定價。若有 25 件貨品損壞並被丟棄，他必須為餘下的貨品提供多少折扣百分率，才能獲得 12% 的總盈利？",
      "solution_steps": [
        "Step 1: Calculate the total cost and target revenue.",
        "Total Cost = $$200 \\times 50 = 10,000$$",
        "Target Revenue = $$10,000 \\times (1.12) = 11,200$$",
        "Step 2: Calculate the marked price per item.",
        "Marked price = $$50 \\times 1.6 = 80$$",
        "Step 3: Let $x$ be the discount percentage. For 175 remaining items:",
        "$$175 \\times 80 \\times (1 - x) = 11,200 \\Rightarrow 14,000(1 - x) = 11,200 \\Rightarrow x = 20\\%$$"
      ],
      "solution_steps_zh": [
        "第一步：計算總成本和目標收入。",
        "總成本 = $$200 \\times 50 = 10,000$$",
        "目標收入 = $$10,000 \\times (1.12) = 11,200$$",
        "第二步：計算每件貨品的標價。",
        "標價 = $$50 \\times 1.6 = 80$$",
        "第三步：設 $x$ 為折扣百分率。對於餘下的 175 件貨品：",
        "$$175 \\times 80 \\times (1 - x) = 11,200 \\Rightarrow 14,000(1 - x) = 11,200 \\Rightarrow x = 20\\%$$"
      ],
      "explanation": "Target revenue is based on the initial total cost. Solve for the discount rate $x$.",
      "explanation_zh": "目標收入是基於最初的總成本計算的。解方程求出折扣率 $x$。",
      "answer": "20",
      "final_answer": "20%",
      "marks": 4
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 4" },
    "content": {
      "type": "short_answer",
      "question": "A digital camera is sold for HKD 6,800 at a discount of 15%. If the profit made is 25%, find the original cost of the camera.",
      "question_zh": "某數碼相機以 15% 的折扣售出，售價為 HKD 6,800。若盈利為 25%，求該相機的原始成本。",
      "solution_steps": [
        "Step 1: Note that the selling price is given directly as HKD 6,800.",
        "Step 2: Calculate the cost price from the selling price and profit %.",
        "$$Cost \\times (1.25) = 6,800 \\Rightarrow Cost = 5,440$$"
      ],
      "solution_steps_zh": [
        "第一步：請注意，售價直接給出為 HKD 6,800。",
        "第二步：根據售價和盈利百分率計算成本價。",
        "$$成本 \\times (1.25) = 6,800 \\Rightarrow 成本 = 5,440$$"
      ],
      "explanation": "The selling price is given directly alongside the profit percentage.",
      "explanation_zh": "售價與盈利百分率已直接給出。",
      "answer": "5440",
      "final_answer": "HKD 5,440",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "The length of a rectangle increases by 25% and its width decreases by 20%. Find the percentage change in the area.",
      "question_zh": "某長方形的長度增加 25%，寬度減少 20%。求面積的百分變動。",
      "solution_steps": [
        "Step 1: Let the original area be $A$.",
        "New Area = $$(1 + 25\\%) \\times (1 - 20\\%) \\times A$$",
        "Step 2: Calculate the result.",
        "$$1.25 \\times 0.8 = 1.00$$",
        "Step 3: Conclusion.",
        "$$1.00 - 1 = 0 \\Rightarrow 0\\% \\text{ change.}$$"
      ],
      "solution_steps_zh": [
        "第一步：設原始面積為 $A$。",
        "新面積 = $$(1 + 25\\%) \\times (1 - 20\\%) \\times A$$",
        "第二步：計算結果。",
        "$$1.25 \\times 0.8 = 1.00$$",
        "第三步：結論。",
        "$$1.00 - 1 = 0 \\Rightarrow 0\\% \\text{ 變動。}$$"
      ],
      "explanation": "Multiply the factors of change: $$1.25 \\times 0.8 = 1$$. No change.",
      "explanation_zh": "將變化因子相乘：$$1.25 \\times 0.8 = 1$$。沒有變動。",
      "answer": "0",
      "final_answer": "0%",
      "marks": 3
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "The population of a city is 500,000. It increases by 4% every year. Find the population of the city after 2 years.",
      "question_zh": "某城市的入口為 500,000。人口每年增加 4%。求該城市 2 年後的人口。",
      "solution_steps": [
        "Step 1: Use the growth formula (similar to compound interest).",
        "$$500,000 \\times (1.04)^{2} = 540,800$$"
      ],
      "solution_steps_zh": [
        "第一步：使用增長公式（與複利息類似）。",
        "$$500,000 \\times (1.04)^{2} = 540,800$$"
      ],
      "explanation": "Population growth follows the compound interest pattern.",
      "explanation_zh": "人口增長遵循複利息模式。",
      "answer": "540800",
      "final_answer": "540,800",
      "marks": 2
    }
  },
  {
    "meta": { "topic": "Percentages & Interest", "difficulty": "Level 3" },
    "content": {
      "type": "short_answer",
      "question": "A sum of HKD 40,000 is deposited for 2 years at an interest rate of 5% per annum. Find the difference between the compound interest (compounded yearly) and the simple interest earned.",
      "question_zh": "將 HKD 40,000 存入銀行 2 年，年利率為 5%。求以複利息（每年計息一次）和單利息計算所得利息之差。",
      "solution_steps": [
        "Step 1: Calculate simple interest.",
        "$$40,000 \\times 5\\% \\times 2 = 4,000$$",
        "Step 2: Calculate compound interest.",
        "$$40,000 \\times (1.05)^{2} - 40,000 = 4,100$$",
        "Step 3: Find the difference.",
        "$$4,100 - 4,000 = 100$$"
      ],
      "solution_steps_zh": [
        "第一步：計算單利息。",
        "$$40,000 \\times 5\\% \\times 2 = 4,000$$",
        "第二步：計算複利息。",
        "$$40,000 \\times (1.05)^{2} - 40,000 = 4,100$$",
        "第三步：求差額。",
        "$$4,100 - 4,000 = 100$$"
      ],
      "explanation": "Compound interest earns more because it earns interest on previous interest.",
      "explanation_zh": "複利息賺取更多，因為它會對之前的利息產生利息。",
      "answer": "100",
      "final_answer": "HKD 100",
      "marks": 3
    }
  }
];

async function insertAll() {
    console.log(`[Upload] Starting Clean Deployment of ${questions.length} unique questions...`);
    
    let totalSaved = 0;
    const batch = db.batch();

    questions.forEach((q, index) => {
        // Extract level from q.meta.difficulty (e.g. "Level 3" -> 3)
        const level = parseInt(q.meta.difficulty.replace('Level ', '')) || 3;
        
        const hashStr = `math_num_percentages-${level}-${q.content.question.substring(0, 30)}-${index}`;
        const qid = crypto.createHash('md5').update(hashStr).digest('hex');
        const docRef = db.collection('question_bank').doc(qid);
        
        const doc = {
            topic_id: 'math_num_percentages',
            level: level,
            type: q.content.type || 'short_answer',
            question: q.content.question,
            question_zh: q.content.question_zh,
            solution_steps: q.content.solution_steps,
            solution_steps_zh: q.content.solution_steps_zh,
            explanation: q.content.explanation,
            explanation_zh: q.content.explanation_zh,
            answer: q.content.answer,
            final_answer: q.content.final_answer,
            marks: q.content.marks || 3,
            subject: 'Maths',
            topic: 'Percentages & Interest',
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
    console.log(`[Upload] SUCCESS: Generated ${totalSaved} unique documents.`);
}

insertAll().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
