const fs = require('fs');
const questions = [
  {
    "id": "math_num_ratio_01",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "Given that $a : b = 5 : 3$ and $b : c = 4 : 7$, find the ratio $a : b : c$.",
    "question_zh": "已知 $a : b = 5 : 3$ 及 $b : c = 4 : 7$，求 $a : b : c$ 的比。",
    "answer": "20:12:21",
    "correct_answer": "20:12:21",
    "solution_steps": [
      "Find the LCM (Least Common Multiple) of the shared variable $b$.",
      "The LCM of 3 and 4 is 12.",
      "Scale the first ratio: $a:b = 20:12$.",
      "Scale the second ratio: $b:c = 12:21$.",
      "Thus, $a:b:c = 20:12:21$."
    ],
    "solution_steps_zh": [
      "求共同項 $b$ 的最小公倍數 (LCM)。",
      "3 和 4 的最小公倍數是 12。",
      "縮放第一個比：$a:b = 20:12$。",
      "縮放第二個比：$b:c = 12:21$。",
      "因此，$a:b:c = 20:12:21$。"
    ]
  },
  {
    "id": "math_num_ratio_02",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "If $x : y : z = 1 : 2 : 3$, find the value of $\\frac{(x + y)^2 + (y + z)^2}{(x + z)^2}$.",
    "question_zh": "若 $x : y : z = 1 : 2 : 3$，求 $\\frac{(x + y)^2 + (y + z)^2}{(x + z)^2}$ 的值。",
    "answer": "2.125",
    "correct_answer": "2.125",
    "solution_steps": [
      "Let $x = k$, $y = 2k$, and $z = 3k$ where $k \\neq 0$.",
      "Numerator: $(3k)^2 + (5k)^2 = 34k^2$.",
      "Denominator: $(4k)^2 = 16k^2$.",
      "Value: $\\frac{34k^2}{16k^2} = 2.125$."
    ],
    "solution_steps_zh": [
      "設 $x = k$，$y = 2k$ 及 $z = 3k$，其中 $k \\neq 0$。",
      "分子：$(3k)^2 + (5k)^2 = 34k^2$。",
      "分母：$(4k)^2 = 16k^2$。",
      "數值：$\\frac{34k^2}{16k^2} = 2.125$。"
    ]
  },
  {
    "id": "math_num_ratio_03",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "Express the ratio $1.2 : 2 : 0.8$ in its simplest integer form.",
    "question_zh": "將比例 $1.2 : 2 : 0.8$ 化為最簡整數比。",
    "answer": "3:5:2",
    "correct_answer": "3:5:2",
    "solution_steps": [
      "Multiply by 10: $12 : 20 : 8$.",
      "HCF of 12, 20, 8 is 4.",
      "Divide by 4: $3 : 5 : 2$."
    ],
    "solution_steps_zh": [
      "乘以 10：$12 : 20 : 8$。",
      "12, 20, 8 的 HCF 為 4。",
      "除以 4：$3 : 5 : 2$。"
    ]
  },
  {
    "id": "math_num_ratio_04",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "A sum of money is divided between $A$ and $B$ in the ratio $3 : 7$. If the total sum of money is 450 dollars, find the amount received by $B$.",
    "question_zh": "一筆總額為 450 元的金錢按 $3 : 7$ 的比例分配給 $A$ 和 $B$。求 $B$ 所得的金額。",
    "answer": "315",
    "correct_answer": "315",
    "solution_steps": [
      "Total parts: $3 + 7 = 10$.",
      "Value of each part: $450 / 10 = 45$.",
      "Amount for $B$: $7 \\times 45 = 315$."
    ],
    "solution_steps_zh": [
      "總份數：$3 + 7 = 10$。",
      "每份價值：$450 / 10 = 45$。",
      "$B$ 的金額：$7 \\times 45 = 315$。"
    ]
  },
  {
    "id": "math_num_ratio_05",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "The ratio of the number of boys to the number of girls in a class is $4 : 5$. If there are 35 girls in the class, find the total number of boys in the class.",
    "question_zh": "某班內男學生人數與女學生人數的比例為 $4 : 5$。若班內有 35 名女學生，求校內男學生的總數。",
    "answer": "28",
    "correct_answer": "28",
    "solution_steps": [
      "5 parts = 35.",
      "1 part = 7.",
      "Boys = $4 \\times 7 = 28$."
    ],
    "solution_steps_zh": [
      "5 份 = 35。",
      "1 份 = 7。",
      "男學生 = $4 \\times 7 = 28$。"
    ]
  },
  {
    "id": "math_num_ratio_06",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "If $5a = 2b$, find the ratio $a : b$.",
    "question_zh": "若 $5a = 2b$，求 $a : b$ 的比。",
    "answer": "2:5",
    "correct_answer": "2:5",
    "solution_steps": [
      "$a/b = 2/5$.",
      "Ratio $a:b = 2:5$."
    ],
    "solution_steps_zh": [
      "$a/b = 2/5$。",
      "比例 $a:b = 2:5$。"
    ]
  },
  {
    "id": "math_num_ratio_07",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "The areas of two similar triangles $A$ and $B$ are $18\\text{ cm}^2$ and $50\\text{ cm}^2$ respectively. If the perimeter of triangle $A$ is $12\\text{ cm}$, find the perimeter of triangle $B$.",
    "question_zh": "兩個相似三角形 $A$ 及 $B$ 的面積分別為 $18\\text{ cm}^2$ 及 $50\\text{ cm}^2$。若三角形 $A$ 的周界為 $12\\text{ cm}$，求三角形 $B$ 的周界。",
    "answer": "20",
    "correct_answer": "20",
    "solution_steps": [
      "Area ratio: $18:50 = 9:25$.",
      "Length ratio: $3:5$.",
      "Perimeter of $B$: $12 \\times (5/3) = 20\\text{ cm}$."
    ],
    "solution_steps_zh": [
      "面積比：$18:50 = 9:25$。",
      "長度比：$3:5$。",
      "三角形 $B$ 的周界：$12 \\times (5/3) = 20\\text{ cm}$。"
    ]
  },
  {
    "id": "math_num_ratio_08",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "$A$, $B$, and $C$ share a sum of money. Initially, $A$ gives $\\frac{1}{4}$ of his share to $B$. Then, $B$ gives $\\frac{1}{3}$ of his new share to $C$. If they eventually have equal amounts, find the initial ratio $A : B : C$.",
    "question_zh": "$A$、$B$ 及 $C$ 分享一筆款項。最初，$A$ 將其款項的 $\\frac{1}{4}$ 給了 $B$。接著，$B$ 分別將其新款項的 $\\frac{1}{3}$ 給了 $C$。若他們最終擁有的金額相等，求他們最初款項的比例 $A : B : C$。",
    "answer": "8:7:3",
    "correct_answer": "8:7:3",
    "solution_steps": [
      "Work backwards from 1:1:1.",
      "Before $B \\rightarrow C$: $B=1.5, C=0.5, A=1$.",
      "Before $A \\rightarrow B$: $A=4/3, B=1.5 - 1/3 = 7/6, C=0.5$.",
      "Ratio $A:B:C = 8:7:3$."
    ],
    "solution_steps_zh": [
      "從 1:1:1 逆向計算。",
      "在 $B \\rightarrow C$ 之前：$B=1.5, C=0.5, A=1$。",
      "在 $A \\rightarrow B$ 之前：$A=4/3, B=1.5 - 1/3 = 7/6, C=0.5$。",
      "比例 $A:B:C = 8:7:3$。"
    ]
  },
  {
    "id": "math_num_ratio_09",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 4,
    "type": "short_answer",
    "marks": 3,
    "question": "Three partners share a business profit of 223200 dollars in the ratio $2 : 5 : 5$. Find the value of the largest share among the three partners.",
    "question_zh": "三位合夥人按 $2 : 5 : 5$ 的比例分配 223200 元的業務利潤。求三人中最大的一份利潤金額。",
    "answer": "93000",
    "correct_answer": "93000",
    "solution_steps": [
      "12 parts = 223200.",
      "1 part = 18600.",
      "Largest share = $5 \\times 18600 = 93000$."
    ],
    "solution_steps_zh": [
      "12 份 = 223200。",
      "1 份 = 18600。",
      "最大一份 = $5 \\times 18600 = 93000$。"
    ]
  },
  {
    "id": "math_num_ratio_10",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 4,
    "type": "short_answer",
    "marks": 3,
    "question": "An alloy contains Copper, Zinc, and Nickel in the weight ratio $5 : 2 : 3$. If the weight of Nickel in the alloy is 45 g, find the total weight of the alloy.",
    "question_zh": "一種合金含有銅、鋅和鎳，重量比例為 $5 : 2 : 3$。若合金中鎳的重量為 45 克，求合金的總重量。",
    "answer": "150",
    "correct_answer": "150",
    "solution_steps": [
      "3 parts = 45 g.",
      "1 part = 15 g.",
      "Total = $10 \\times 15 = 150$ g."
    ],
    "solution_steps_zh": [
      "3 份 = 45 克。",
      "1 份 = 15 克。",
      "總重量 = $10 \\times 15 = 150$ 克。"
    ]
  },
  {
    "id": "math_num_ratio_11",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 4,
    "type": "short_answer",
    "marks": 3,
    "question": "A model of a ship is built to a scale of $1 : 500$. If the length of the actual ship is 150 m, find the length of the model in cm.",
    "question_zh": "一艘船的模型按比例尺 $1 : 500$ 製作。若真船的長度為 150 米，求該模型的長度（以厘米為單位）。",
    "answer": "30",
    "correct_answer": "30",
    "solution_steps": [
      "150 m = 15000 cm.",
      "Model length = $15000 / 500 = 30$ cm."
    ],
    "solution_steps_zh": [
      "150 米 = 15000 厘米。",
      "模型長度 = $15000 / 500 = 30$ 厘米。"
    ]
  },
  {
    "id": "math_num_ratio_12",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 4,
    "type": "short_answer",
    "marks": 4,
    "question": "The ratio of the amount of money held by $A$ and $B$ is initially $6 : 4$. $A$ has 40 dollars more than $B$. If $A$ gives 25 dollars to $B$, find the new ratio of the amount of money held by $A$ to the amount held by $B$.",
    "question_zh": "$A$ 與 $B$ 擁有的款項之比最初為 $6 : 4$。已知 $A$ 比 $B$ 多出 40 元。若 $A$ 給予 $B$ 25 元，求 $A$ 與 $B$ 擁有的款項之新比例。",
    "answer": "19:21",
    "correct_answer": "19:21",
    "solution_steps": [
      "$2k = 40 \\implies k = 20$. $A=120, B=80$.",
      "After transfer: $A=95, B=105$.",
      "Ratio: $95:105 = 19:21$."
    ],
    "solution_steps_zh": [
      "$2k = 40 \\implies k = 20$。$A=120, B=80$。",
      "轉移後：$A=95, B=105$。",
      "比例：$95:105 = 19:21$。"
    ]
  },
  {
    "id": "math_num_ratio_13",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 4,
    "type": "short_answer",
    "marks": 3,
    "question": "Given that $x : y = 3 : 4$ and $x : z = 2 : 5$, find the ratio $x : y : z$.",
    "question_zh": "已知 $x : y = 3 : 4$ 及 $x : z = 2 : 5$，求 $x : y : z$ 的比。",
    "answer": "6:8:15",
    "correct_answer": "6:8:15",
    "solution_steps": [
      "$x:y = 6:8, x:z = 6:15$.",
      "Combined: $6:8:15$."
    ],
    "solution_steps_zh": [
      "$x:y = 6:8, x:z = 6:15$。",
      "合併後：$6:8:15$。"
    ]
  },
  {
    "id": "math_num_ratio_14",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "A mixture solution contains 300 ml of Water, 150 ml of Alcohol, and 50 ml of Oil. If 100 ml of Alcohol is added to the mixture, find the final ratio of Water : Alcohol : Oil.",
    "question_zh": "某混合溶液含有 300 毫升水、150 毫升酒精及 50 毫升油。加入 100 毫升酒精後，求水、酒精與油之體積的最終比例。",
    "answer": "6:5:1",
    "correct_answer": "6:5:1",
    "solution_steps": [
      "Alcohol: $150 + 100 = 250$ ml.",
      "Ratio: $300:250:50 = 6:5:1$."
    ],
    "solution_steps_zh": [
      "酒精：$150 + 100 = 250$ 毫升。",
      "比例：$300:250:50 = 6:5:1$。"
    ]
  },
  {
    "id": "math_num_ratio_15",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "The ratio of the number of red balls to the number of blue balls in a box is $2 : 3$. If 12 blue balls are removed from the box, the new ratio becomes $4 : 5$. Find the initial number of red balls.",
    "question_zh": "袋內紅球數目與藍球數目的比例為 $2 : 3$。從中取出 12 個藍球後，比例變為 $4 : 5$。求最初紅球數目。",
    "answer": "48",
    "correct_answer": "48",
    "solution_steps": [
      "$(2k)/(3k-12) = 4/5 \\implies 10k = 12k - 48 \\implies k=24$.",
      "Red = $2k = 48$."
    ],
    "solution_steps_zh": [
      "$(2k)/(3k-12) = 4/5 \\implies 10k = 12k - 48 \\implies k=24$。",
      "紅球數目 = $2k = 48$。"
    ]
  },
  {
    "id": "math_num_ratio_16",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "If $a : b : c = 2 : 3 : 5$, find the value of $\\frac{a^2 + b^2}{c^2}$.",
    "question_zh": "若 $a : b : c = 2 : 3 : 5$，求 $\\frac{a^2 + b^2}{c^2}$ 的值。",
    "answer": "0.52",
    "correct_answer": "0.52",
    "solution_steps": [
      "$\\frac{4k^2 + 9k^2}{25k^2} = 13/25 = 0.52$."
    ],
    "solution_steps_zh": [
      "$\\frac{4k^2 + 9k^2}{25k^2} = 13/25 = 0.52$。"
    ]
  },
  {
    "id": "math_num_ratio_17",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "The scale of a map is $1 : 20000$. If the distance between two towns on the map is 15 cm, find the actual distance in km.",
    "question_zh": "地圖比例尺為 $1 : 20000$。地圖上距離為 15 cm，求實際距離（km）。",
    "answer": "3",
    "correct_answer": "3",
    "solution_steps": [
      "$15 \\times 20000 = 300000$ cm = 3 km."
    ],
    "solution_steps_zh": [
      "$15 \\times 20000 = 300000$ cm = 3 km。"
    ]
  },
  {
    "id": "math_num_ratio_18",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "The scale of a map is $1 : 25000$. If the distance between two towns on the map is 9 cm, find the actual distance in km.",
    "question_zh": "地圖比例尺為 $1 : 25000$。地圖上距離為 9 cm，求實際距離（km）。",
    "answer": "2.25",
    "correct_answer": "2.25",
    "solution_steps": [
      "$9 \\times 25000 = 225000$ cm = 2.25 km."
    ],
    "solution_steps_zh": [
      "$9 \\times 25000 = 225000$ cm = 2.25 km。"
    ]
  },
  {
    "id": "math_num_ratio_19",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "The scale of a map is $1 : 2000$. If a playground has an area of $5\\text{ cm}^2$ on the map, find its actual area in $\\text{m}^2$.",
    "question_zh": "地圖比例尺為 $1 : 2000$。遊樂場地圖面積為 $5\\text{ cm}^2$，求實際面積（$\\text{m}^2$）。",
    "answer": "2000",
    "correct_answer": "2000",
    "solution_steps": [
      "Area scale: $2000^2 = 4,000,000$.",
      "Actual: $5 \\times 4,000,000 = 20,000,000\\text{ cm}^2 = 2000\\text{ m}^2$."
    ],
    "solution_steps_zh": [
      "面積比例：$2000^2 = 4,000,000$。",
      "實際：$5 \\times 4,000,000 = 20,000,000\\text{ cm}^2 = 2000\\text{ m}^2$。"
    ]
  },
  {
    "id": "math_num_ratio_20",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "A profit of 60000 dollars is shared among $A$, $B$, and $C$. If $A$ receives 20000, $B$ receives 15000, and $C$ receives the remainder, find the ratio $A : B : C$.",
    "question_zh": "60000 元利潤由 $A$、$B$ 及 $C$ 分享。若 $A$ 獲 20000，$B$ 獲 15000，求 $A:B:C$。",
    "answer": "4:3:5",
    "correct_answer": "4:3:5",
    "solution_steps": [
      "$C = 60000 - 20000 - 15000 = 25000$.",
      "Ratio: $4:3:5$."
    ],
    "solution_steps_zh": [
      "$C = 60000 - 20000 - 15000 = 25000$。",
      "比例：$4:3:5$。"
    ]
  },
  {
    "id": "math_num_ratio_21",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "Prices of $A$ and $B$ are in ratio $4 : 7$. Price of $A$ increases by 10%, $B$ decreases by 10%. Find new ratio $A:B$.",
    "question_zh": "$A$ 與 $B$ 價格比為 $4 : 7$。$A$ 增 10%，$B$ 減 10%。求新比例。",
    "answer": "44:63",
    "correct_answer": "44:63",
    "solution_steps": [
      "Ratio becomes $4.4 : 6.3 = 44 : 63$."
    ],
    "solution_steps_zh": [
      "新比例為 $4.4 : 6.3 = 44 : 63$。"
    ]
  },
  {
    "id": "math_num_ratio_22",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "Scale $1 : 40000$. Actual distance 5 km. Find distance on map in mm.",
    "question_zh": "比例尺 $1 : 40000$。實際距離 5 km，求地圖距離（mm）。",
    "answer": "125",
    "correct_answer": "125",
    "solution_steps": [
      "5 km = 5,000,000 mm. Map = $5000000 / 40000 = 125$ mm."
    ],
    "solution_steps_zh": [
      "5 km = 5,000,000 mm。地圖 = $5000000 / 40000 = 125$ mm。"
    ]
  },
  {
    "id": "math_num_ratio_23",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "If $\\frac{3a - b}{a + 2b} = 2$, find the ratio $a : b$.",
    "question_zh": "若 $\\frac{3a - b}{a + 2b} = 2$，求 $a : b$ 的比。",
    "answer": "5:1",
    "correct_answer": "5:1",
    "solution_steps": [
      "$3a-b = 2a+4b \\implies a=5b \\implies a:b = 5:1$."
    ],
    "solution_steps_zh": [
      "$3a-b = 2a+4b \\implies a=5b \\implies a:b = 5:1$。"
    ]
  },
  {
    "id": "math_num_ratio_24",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "Map scale $1 : 10000$. Model volume $8\\text{ cm}^3$. Find actual volume in $\\text{m}^3$.",
    "question_zh": "比例尺 $1 : 10000$。模型體積 $8\\text{ cm}^3$，求實際體積（$\\text{m}^3$）。",
    "answer": "8000000",
    "correct_answer": "8000000",
    "solution_steps": [
      "Vol scale: $(10^4)^3 = 10^{12}$.",
      "Actual: $8 \\times 10^{12}\\text{ cm}^3 = 8,000,000\\text{ m}^3$."
    ],
    "solution_steps_zh": [
      "體積比例：$(10^4)^3 = 10^{12}$。",
      "實際：$8 \\times 10^{12}\\text{ cm}^3 = 8,000,000\\text{ m}^3$。"
    ]
  },
  {
    "id": "math_num_ratio_25",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "Scale $1 : 50000$. Actual area 2.0 km$^2$. Find area on map in cm$^2$.",
    "question_zh": "比例尺 $1 : 50000$。實際面積 2.0 km$^2$，求地圖面積（cm$^2$）。",
    "answer": "8",
    "correct_answer": "8",
    "solution_steps": [
      "Area scale: $2.5 \\times 10^9$.",
      "Actual: $2 \\times 10^{10}\\text{ cm}^2$. Map: 8 cm$^2$."
    ],
    "solution_steps_zh": [
      "面積比例：$2.5 \\times 10^9$。",
      "實際：$2 \\times 10^{10}\\text{ cm}^2$。地圖：8 cm$^2$。"
    ]
  },
  {
    "id": "math_num_ratio_26",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "Scale $1 : 40000$. Actual area 4.0 km$^2$. Find area on map in cm$^2$.",
    "question_zh": "比例尺 $1 : 40000$。實際面積 4.0 km$^2$，求地圖面積（cm$^2$）。",
    "answer": "25",
    "correct_answer": "25",
    "solution_steps": [
      "Map area: $(4 \\times 10^{10}) / (1.6 \\times 10^9) = 25$."
    ],
    "solution_steps_zh": [
      "地圖面積：$(4 \\times 10^{10}) / (1.6 \\times 10^9) = 25$。"
    ]
  },
  {
    "id": "math_num_ratio_27",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "Areas of two squares are in ratio $16 : 25$. Find perimeter ratio.",
    "question_zh": "兩正方形面積比為 $16 : 25$。求周界比。",
    "answer": "4:5",
    "correct_answer": "4:5",
    "solution_steps": [
      "Length ratio: $4:5$."
    ],
    "solution_steps_zh": [
      "長度比：$4:5$。"
    ]
  },
  {
    "id": "math_num_ratio_28",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "1 cm represents 500 m. Forest map area 4 cm$^2$. Find actual area in hectares.",
    "question_zh": "1 cm 代表 500 m。地圖面積 4 cm$^2$，求實際公頃面積。",
    "answer": "100",
    "correct_answer": "100",
    "solution_steps": [
      "Actual: $1,000,000\\text{ m}^2 = 100$ hectares."
    ],
    "solution_steps_zh": [
      "實際：$1,000,000\\text{ m}^2 = 100$ 公頃。"
    ]
  },
  {
    "id": "math_num_ratio_29",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "Given $a:b = 3:4, b:c = 5:6$. $a+b+c = 118$. Find $c$.",
    "question_zh": "$a:b = 3:4, b:c = 5:6$。$a+b+c = 118$，求 $c$。",
    "answer": "48",
    "correct_answer": "48",
    "solution_steps": [
      "Ratio $a:b:c = 15:20:24$. $c = 118/59 \\times 24 = 48$."
    ],
    "solution_steps_zh": [
      "比例 $a:b:c = 15:20:24$。$c = 118/59 \\times 24 = 48$。"
    ]
  },
  {
    "id": "math_num_ratio_30",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "Men:Women = $3 : 2$. After 5 couples left, ratio becomes $5 : 3$. Find initial total people.",
    "question_zh": "男女比例為 $3 : 2$。5 對合侶離開後，比例變為 $5 : 3$。求最初總人數。",
    "answer": "50",
    "correct_answer": "50",
    "solution_steps": [
      "$(3k-5)/(2k-5) = 5/3 \\implies k=10$. Total = 50."
    ],
    "solution_steps_zh": [
      "$(3k-5)/(2k-5) = 5/3 \\implies k=10$。總人數 = 50。"
    ]
  }
];
const json = JSON.stringify(questions, null, 2);
fs.writeFileSync('c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_num_ratio_final.json', json);
console.log('Successfully wrote final math_num_ratio_final.json');
