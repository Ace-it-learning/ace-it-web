const fs = require('fs');
const questions = [
  {
    "id": "math_num_ratio_01",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "Given that $a:b = 5:3$ and $b:c = 4:7$. Find $a:b:c$.",
    "question_zh": "已知 $a:b = 5:3$ 及 $b:c = 4:7$。求 $a:b:c$。",
    "answer": "$20:12:21$",
    "correct_answer": "$20:12:21$",
    "solution_steps": [
      "Find the LCM of the shared variable $b$.",
      "LCM of $3$ and $4$ is $12$.",
      "Scale the first ratio: $a:b = 5 \\times 4 : 3 \\times 4 = 20:12$.",
      "Scale the second ratio: $b:c = 4 \\times 3 : 7 \\times 3 = 12:21$.",
      "Thus, $a:b:c = 20:12:21$."
    ],
    "solution_steps_zh": [
      "求共同項 $b$ 的最小公倍數 (LCM)。",
      "$3$ 和 $4$ 的最小公倍數是 $12$。",
      "縮放第一個比：$a:b = 5 \\times 4 : 3 \\times 4 = 20:12$。",
      "縮放第二個比：$b:c = 4 \\times 3 : 7 \\times 3 = 12:21$。",
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
    "question": "If $x:y:z = 1:2:3$, find the value of $\\frac{(x+y)^2 + (y+z)^2}{(x+z)^2}$.",
    "question_zh": "若 $x:y:z = 1:2:3$，求 $\\frac{(x+y)^2 + (y+z)^2}{(x+z)^2}$ 的值。",
    "answer": "2.125",
    "correct_answer": "2.125",
    "solution_steps": [
      "Let $x=k$, $y=2k$, and $z=3k$ where $k \\neq 0$.",
      "$(x+y)^2 = (k+2k)^2 = 9k^2$.",
      "$(y+z)^2 = (2k+3k)^2 = 25k^2$.",
      "$(x+z)^2 = (k+3k)^2 = 16k^2$.",
      "Substitute: $\\frac{9k^2 + 25k^2}{16k^2} = \\frac{17}{8} = 2.125$."
    ],
    "solution_steps_zh": [
      "設 $x=k$，$y=2k$ 及 $z=3k$。其中 $k \\neq 0$。",
      "$(x+y)^2 = (k+2k)^2 = 9k^2$。",
      "$(y+z)^2 = (2k+3k)^2 = 25k^2$。",
      "$(x+z)^2 = (k+3k)^2 = 16k^2$。",
      "代入算式：$\\frac{9k^2 + 25k^2}{16k^2} = \\frac{17}{8} = 2.125$。"
    ]
  },
  {
    "id": "math_num_ratio_03",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "Simplify the ratio $1.2 : 2 : 0.8$ into its simplest integer form.",
    "question_zh": "將比例 $1.2 : 2 : 0.8$ 化為最簡整數比。",
    "answer": "3:5:2",
    "correct_answer": "3:5:2",
    "solution_steps": [
      "Multiply by 10 to remove decimals: $12 : 20 : 8$.",
      "The HCF of 12, 20, 8 is 4.",
      "Divide by 4: $12 \\div 4 : 20 \\div 4 : 8 \\div 4 = 3 : 5 : 2$."
    ],
    "solution_steps_zh": [
      "乘以 10 以消去小數：$12 : 20 : 8$。",
      "$12, 20, 8$ 的最大公因數 (HCF) 是 4。",
      "除以 4：$12 \\div 4 : 20 \\div 4 : 8 \\div 4 = 3 : 5 : 2$。"
    ]
  },
  {
    "id": "math_num_ratio_04",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "A sum of money is shared between $A$ and $B$ in the ratio $3:7$. If the sum of money is $450$, find the amount $B$ receives.",
    "question_zh": "一筆金錢按 $3:7$ 的比例分配給 $A$ 和 $B$。若總金額為 450，求 $B$ 所得的金額。",
    "answer": "315",
    "correct_answer": "315",
    "solution_steps": [
      "Total parts = $3 + 7 = 10$.",
      "Amount of one part = $450 \\div 10 = 45$.",
      "$B$ receives 7 parts: $7 \\times 45 = 315$."
    ],
    "solution_steps_zh": [
      "總份數 = $3 + 7 = 10$。",
      "每份的金額 = $450 \\div 10 = 45$。",
      "$B$ 得 7 份：$7 \\times 45 = 315$。"
    ]
  },
  {
    "id": "math_num_ratio_05",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 2,
    "question": "If $a:b = 4:9$ and $b=36$, find the value of $a$.",
    "question_zh": "若 $a:b = 4:9$ 及 $b=36$，求 $a$ 的值。",
    "answer": "16",
    "correct_answer": "16",
    "solution_steps": [
      "Write as a fraction: $a/36 = 4/9$.",
      "Multiply both sides by 36: $a = (4 \\times 36) / 9$.",
      "$a = 4 \\times 4 = 16$."
    ],
    "solution_steps_zh": [
      "寫成分數：$a/36 = 4/9$。",
      "兩邊乘以 36：$a = (4 \\times 36) / 9$。",
      "$a = 4 \\times 4 = 16$。"
    ]
  },
  {
    "id": "math_num_ratio_06",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 3,
    "type": "short_answer",
    "marks": 3,
    "question": "If $x:y = 3:5$, find the value of $(5x + 2y) / (3x - y)$.",
    "question_zh": "若 $x:y = 3:5$，求 $(5x + 2y) / (3x - y)$ 的值。",
    "answer": "6.25",
    "correct_answer": "6.25",
    "solution_steps": [
      "Let $x = 3k$ and $y = 5k$.",
      "Substitute: $(5(3k) + 2(5k)) / (3(3k) - 5k)$.",
      "Numerator = $15k + 10k = 25k$.",
      "Denominator = $9k - 5k = 4k$.",
      "Value = $25/4 = 6.25$."
    ],
    "solution_steps_zh": [
      "設 $x = 3k$ 及 $y = 5k$。",
      "代入：$(5(3k) + 2(5k)) / (3(3k) - 5k)$。",
      "分子 = $15k + 10k = 25k$。",
      "分母 = $9k - 5k = 4k$。",
      "數值 = $25/4 = 6.25$。"
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
    "question_zh": "兩個相似三角形 $A$ 及 $B$ 的面積分別為 $18\\text{ 厘米}^2$ 及 $50\\text{ 厘米}^2$。若三角形 $A$ 的周界為 $12\\text{ 厘米}$，求三角形 $B$ 的周界。",
    "answer": "20 cm",
    "correct_answer": "20",
    "solution_steps": [
      "The ratio of areas is $18:50 = 9:25$.",
      "Since they are similar, area ratio = (length ratio)$^2$.",
      "Length ratio = $\\sqrt{9} : \\sqrt{25} = 3:5$.",
      "Ratio of perimeters = length ratio = $3:5$.",
      "Perimeter of $B = 12 \\times (5/3) = 20\\text{ cm}$."
    ],
    "solution_steps_zh": [
      "面積之比為 $18:50 = 9:25$。",
      "由於兩者相似，面積比 = (長度比)$^2$。",
      "長度比 = $\\sqrt{9} : \\sqrt{25} = 3:5$。",
      "周界之比 = 長度比 = $3:5$。",
      "三角形 $B$ 的周界 = $12 \\times (5/3) = 20\\text{ 厘米}$。"
    ]
  },
  {
    "id": "math_num_ratio_08",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "$A$, $B$, and $C$ share a sum of money. Initially, $A$ gives $1/4$ of his share to $B$. Then, $B$ gives $1/3$ of his new share to $C$. If they eventually have equal amounts, find the initial ratio $A:B:C$.",
    "question_zh": "$A$、$B$ 及 $C$ 分享一筆款項。最初，$A$ 將其款項的 $1/4$ 給了 $B$。接著，$B$ 將其新款項的 $1/3$ 給了 $C$。若他們最終擁有的金額相等，求他們最初款項的比例 $A:B:C$。",
    "answer": "8:7:3",
    "correct_answer": "8:7:3",
    "solution_steps": [
      "Work backwards. Let the final amount each has be 1 unit (Total = 3).",
      "Step 2 reverse: $B$ gave $1/3$ to $C$, leaving $B$ with $2/3$. $2/3$ of $B = 1 \\implies B=1.5$. $C$ received $0.5$, so $C$ had $1-0.5 = 0.5$.",
      "Step 1 reverse: $A$ gave $1/4$ to $B$, leaving $A$ with $3/4$. $3/4$ of $A = 1 \\implies A = 4/3 \\approx 1.333$. $B$ received $1/3$, so $B$ had $1.5 - 1/3 = 7/6$.",
      "Initial Ratio $A:B:C = 4/3 : 7/6 : 1/2$. Multiply by 6: $8:7:3$."
    ],
    "solution_steps_zh": [
      "逆向計算。設最終每人有 1 單位（總額 = 3）。",
      "逆向步驟 2：$B$ 給了 $C$ $1/3$，剩下 $2/3$。$2/3$ 的 $B = 1 \\implies B=1.5$。$C$ 收到 $0.5$，所以 $C$ 原本有 $1-0.5 = 0.5$。",
      "逆向步驟 1：$A$ 給了 $B$ $1/4$，剩下 $3/4$。$3/4$ 的 $A = 1 \\implies A = 4/3$。$B$ 收到 $1/3$，所以 $B$ 原本有 $1.5 - 1/3 = 7/6$。",
      "最初比例 $A:B:C = 4/3 : 7/6 : 1/2$。乘以 6 得 $8:7:3$。"
    ]
  },
  {
    "id": "math_num_ratio_09",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 4,
    "type": "short_answer",
    "marks": 3,
    "question": "Three partners share a profit of 223200 in the ratio $2:5:5$. Find the largest share.",
    "question_zh": "三位合夥人按 $2:5:5$ 的比例分配利潤 223200。求最大的一份金額。",
    "answer": "93000",
    "correct_answer": "93000",
    "solution_steps": [
      "Total parts = $2 + 5 + 5 = 12$.",
      "One part = $223200 / 12 = 18600$.",
      "Largest = $5 \\times 18600 = 93000$."
    ],
    "solution_steps_zh": [
      "總份數 = $2 + 5 + 5 = 12$。",
      "每份 = $223200 / 12 = 18600$。",
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
    "question": "Copper, Zinc and Nickel in the ratio $5:2:3$. Nickel weight is 45 g. Find total weight.",
    "question_zh": "銅、鋅、鎳的比例為 $5:2:3$。鎳重 45 克。求總重量。",
    "answer": "150 g",
    "correct_answer": "150",
    "solution_steps": [
      "Nickel corresponds to 3 parts.",
      "One part = $45 / 3 = 15$ g.",
      "Total parts = $5+2+3=10$.",
      "Total weight = $10 \\times 15 = 150$ g."
    ],
    "solution_steps_zh": [
      "鎳對應 3 份。",
      "每份 = $45 / 3 = 15$ 克。",
      "總份數 = $5+2+3=10$。",
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
    "question": "Ship model scale $1:500$. Actual ship length 150 m. Find model length in cm.",
    "question_zh": "船的模型比例尺為 $1:500$。真船長 150 米。求模型長度（厘米）。",
    "answer": "30 cm",
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
    "question": "$A:B = 6:4$. $A$ has 40 more than $B$. If $A$ gives 25 to $B$, find new ratio $A:B$.",
    "question_zh": "$A:B = 6:4$。$A$ 比 $B$ 多 40。若 $A$ 給 $B$ 25，求新比例 $A:B$。",
    "answer": "19:21",
    "correct_answer": "19:21",
    "solution_steps": [
      "$2k = 40 \\implies k=20$. $A=120, B=80$.",
      "After transfer: $A=95, B=105$. New ratio = $19:21$."
    ],
    "solution_steps_zh": [
      "$2k = 40 \\implies k=20$。$A=120, B=80$。",
      "轉移後：$A=95, B=105$。新比例 = $19:21$。"
    ]
  },
  {
    "id": "math_num_ratio_13",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 4,
    "type": "short_answer",
    "marks": 3,
    "question": "Given $x:y = 3:4$ and $x:z = 2:5$. Find $x:y:z$.",
    "question_zh": "已知 $x:y = 3:4$ 及 $x:z = 2:5$。求 $x:y:z$。",
    "answer": "6:8:15",
    "correct_answer": "6:8:15",
    "solution_steps": [
      "Common term $x$. LCM of 3, 2 is 6.",
      "$x:y = 6:8$, $x:z = 6:15$.",
      "So $x:y:z = 6:8:15$."
    ],
    "solution_steps_zh": [
      "共同項 $x$。3 與 2 的最小公倍數是 6。",
      "$x:y = 6:8$，$x:z = 6:15$。",
      "因此 $x:y:z = 6:8:15$。"
    ]
  },
  {
    "id": "math_num_ratio_14",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "300ml Water, 150ml Alcohol, 50ml Oil. Add 100ml Alcohol. Find final ratio.",
    "question_zh": "300 毫升水，150 毫升酒精，50 毫升油。加入 100 毫升酒精。求最終比例。",
    "answer": "6:5:1",
    "correct_answer": "6:5:1",
    "solution_steps": [
      "Alcohol becomes 250ml. Ratio = $300:250:50 = 6:5:1$."
    ],
    "solution_steps_zh": [
      "酒精變為 250 毫升。比例 = $300:250:50 = 6:5:1$。"
    ]
  },
  {
    "id": "math_num_ratio_15",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "Red:Blue = $2:3$. Remove 12 Blue, new ratio $4:5$. Find initial red balls.",
    "question_zh": "紅：藍 = $2:3$。移除 12 個藍球後比例為 $4:5$。求最初紅球數。",
    "answer": "48",
    "correct_answer": "48",
    "solution_steps": [
      "$2k / (3k-12) = 4/5 \\implies 10k = 12k - 48 \\implies k=24$.",
      "Red = $2k = 48$."
    ],
    "solution_steps_zh": [
      "$2k / (3k-12) = 4/5 \\implies 10k = 12k - 48 \\implies k=24$。",
      "紅球 = $2k = 48$。"
    ]
  },
  {
    "id": "math_num_ratio_16",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "If $a:b:c = 2:3:5$, find $(a^2+b^2)/c^2$.",
    "question_zh": "若 $a:b:c = 2:3:5$，求 $(a^2+b^2)/c^2$ 的值。",
    "answer": "0.52",
    "correct_answer": "0.52",
    "solution_steps": [
      "$(4k^2+9k^2)/25k^2 = 13/25 = 0.52$."
    ],
    "solution_steps_zh": [
      "$(4k^2+9k^2)/25k^2 = 13/25 = 0.52$。"
    ]
  },
  {
    "id": "math_num_ratio_17",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "Map scale $1:20000$. 15 cm on map. Find actual distance in km.",
    "question_zh": "比例尺 $1:20000$。地圖上 15 厘米。求實際距離（公里）。",
    "answer": "3 km",
    "correct_answer": "3",
    "solution_steps": [
      "$15 \\times 20000 = 300000$ cm = 3 km."
    ],
    "solution_steps_zh": [
      "$15 \\times 20000 = 300000$ 厘米 = 3 公里。"
    ]
  },
  {
    "id": "math_num_ratio_18",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "Map scale $1:25000$. 9 cm on map. Find actual distance in km.",
    "question_zh": "比例尺 $1:25000$。地圖上 9 厘米。求實際距離（公里）。",
    "answer": "2.25 km",
    "correct_answer": "2.25",
    "solution_steps": [
      "$9 \\times 25000 = 225000$ cm = 2.25 km."
    ],
    "solution_steps_zh": [
      "$9 \\times 25000 = 225000$ 厘米 = 2.25 公里。"
    ]
  },
  {
    "id": "math_num_ratio_19",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "Map scale $1:2000$. Playground area on map is 5 cm$^2$. Find actual area in m$^2$.",
    "question_zh": "比例尺 $1:2000$。遊樂場地圖面積 5 厘米$^2$。求實際面積（平方米）。",
    "answer": "2000",
    "correct_answer": "2000",
    "solution_steps": [
      "Area scale = $1 : 2000^2 = 1 : 4,000,000$.",
      "Actual area = $5 \\times 4,000,000 = 20,000,000$ cm$^2 = 2000$ m$^2$."
    ],
    "solution_steps_zh": [
      "面積比例 = $1 : 2000^2 = 1 : 4,000,000$。",
      "實際面積 = $5 \\times 4,000,000 = 20,000,000$ 厘米$^2 = 2000$ 平方米。"
    ]
  },
  {
    "id": "math_num_ratio_20",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "Profit 60000. $A$ gets 20000, $B$ gets 15000, $C$ gets rest. Find ratio $A:B:C$.",
    "question_zh": "利潤 60000。$A$ 獲 20000，$B$ 獲 15000，其餘歸 $C$。求比例 $A:B:C$。",
    "answer": "4:3:5",
    "correct_answer": "4:3:5",
    "solution_steps": [
      "$C = 25000$. Ratio = $20000:15000:25000 = 4:3:5$."
    ],
    "solution_steps_zh": [
      "$C = 25000$。比例 = $20000:15000:25000 = 4:3:5$。"
    ]
  },
  {
    "id": "math_num_ratio_21",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 4,
    "question": "$A:B = 4:7$. $A$ increases by 10%, $B$ decreases by 10%. Find new ratio.",
    "question_zh": "$A:B = 4:7$。$A$ 增 10%，$B$ 減 10%。求新比例。",
    "answer": "44:63",
    "correct_answer": "44:63",
    "solution_steps": [
      "New ratio = $4.4 : 6.3 = 44 : 63$."
    ],
    "solution_steps_zh": [
      "新比例 = $4.4 : 6.3 = 44 : 63$。"
    ]
  },
  {
    "id": "math_num_ratio_22",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "Map scale $1:40000$. Actual distance 5 km. Find depth on map in mm.",
    "question_zh": "比例尺 $1:40000$。實際距離 5 公里。求地圖距離（毫米）。",
    "answer": "125",
    "correct_answer": "125",
    "solution_steps": [
      "5 km = 5,000,000 mm. Map distance = $5,000,000 / 40,000 = 125$ mm."
    ],
    "solution_steps_zh": [
      "5 公里 = 5,000,000 毫米。地圖距離 = $5,000,000 / 40,000 = 125$ 毫米。"
    ]
  },
  {
    "id": "math_num_ratio_23",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 5,
    "type": "short_answer",
    "marks": 3,
    "question": "If $(3a-b)/(a+2b) = 2$, find ratio $a:b$.",
    "question_zh": "若 $(3a-b)/(a+2b) = 2$，求比例 $a:b$。",
    "answer": "5:1",
    "correct_answer": "5:1",
    "solution_steps": [
      "$3a-b = 2a+4b \\implies a=5b$."
    ],
    "solution_steps_zh": [
      "$3a-b = 2a+4b \\implies a=5b$。"
    ]
  },
  {
    "id": "math_num_ratio_24",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "Map scale $1:10000$. Volume on model 8 cm$^3$. Find actual volume in m$^3$.",
    "question_zh": "比例尺 $1:10000$。模型體積 8 厘米$^3$。求實際體積（立方米）。",
    "answer": "8,000,000",
    "correct_answer": "8,000,000",
    "solution_steps": [
      "Volume scale = $10000^3$. Actual = $8 \\times 10^{12}$ cm$^3 = 8,000,000$ m$^3$."
    ],
    "solution_steps_zh": [
      "體積比例 = $10000^3$。實際 = $8 \\times 10^{12}$ 厘米$^3 = 8,000,000$ 立方米。"
    ]
  },
  {
    "id": "math_num_ratio_25",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "Map scale $1:50000$. Actual area 2.0 km$^2$. Find area on map in cm$^2$.",
    "question_zh": "比例尺 $1:50000$。實際面積 2.0 公里$^2$。求地圖面積（厘米$^2$）。",
    "answer": "8",
    "correct_answer": "8",
    "solution_steps": [
      "Area scale = $50000^2$. Actual = $2 \\times 10^{10}$ cm$^2$. Map = 8 cm$^2$."
    ],
    "solution_steps_zh": [
      "面積比例 = $50000^2$。實際 = $2 \\times 10^{10}$ 厘米$^2$。地圖 = 8 厘米$^2$。"
    ]
  },
  {
    "id": "math_num_ratio_26",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "Map scale $1:40000$. Actual area 4.0 km$^2$. Find area on map in cm$^2$.",
    "question_zh": "比例尺 $1:40000$。實際面積 4.0 公里$^2$。求地圖面積（厘米$^2$）。",
    "answer": "25",
    "correct_answer": "25",
    "solution_steps": [
      "Map area = $4 \\times 10^{10} / 1,600,000,000 = 25$."
    ],
    "solution_steps_zh": [
      "地圖面積 = $4 \\times 10^{10} / 1,600,000,000 = 25$。"
    ]
  },
  {
    "id": "math_num_ratio_27",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "Area of two squares ratio $16:25$. Find perimeter ratio.",
    "question_zh": "兩正方形面積比 $16:25$。求周界比。",
    "answer": "4:5",
    "correct_answer": "4:5",
    "solution_steps": [
      "Side ratio = $4:5 = $ Perimeter ratio."
    ],
    "solution_steps_zh": [
      "邊長比 = $4:5 = $ 周界比。"
    ]
  },
  {
    "id": "math_num_ratio_28",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 4,
    "question": "1 cm represents 500 m. Map area 4 cm$^2$. Find actual area in hectares.",
    "question_zh": "1 厘米代表 500 米。地圖面積 4 厘米$^2$。求實際面積（公頃）。",
    "answer": "100",
    "correct_answer": "100",
    "solution_steps": [
      "Actual area = $4 \\times 500^2$ m$^2 = 1,000,000$ m$^2 = 100$ hectares."
    ],
    "solution_steps_zh": [
      "實際面積 = $4 \\times 500^2$ 平方米 = $1,000,000$ 平方米 = 100 公頃。"
    ]
  },
  {
    "id": "math_num_ratio_29",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "$a:b = 3:4$, $b:c = 5:6$. $a+b+c = 118$. Find $c$.",
    "question_zh": "$a:b = 3:4$，$b:c = 5:6$。$a+b+c = 118$。求 $c$ 值。",
    "answer": "48",
    "correct_answer": "48",
    "solution_steps": [
      "$a:b:c = 15:20:24$. Total parts = 59. $c = 118 / 59 \\times 24 = 48$."
    ],
    "solution_steps_zh": [
      "$a:b:c = 15:20:24$。總份數 = 59。$c = 118 / 59 \\times 24 = 48$。"
    ]
  },
  {
    "id": "math_num_ratio_30",
    "topic_id": "math_num_ratio",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 5,
    "question": "Men:Women = $3:2$. 5 couples leave, new ratio $5:3$. Find initial total.",
    "question_zh": "男：女 = $3:2$。5 對合侶離開後新比 $5:3$。求最初總人數。",
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
console.log('Successfully wrote math_num_ratio_final.json');
