const admin = require('firebase-admin');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

const generateQuestionHash = (topic_id, type, questionText, level) => {
    const str = `${topic_id.toLowerCase()}-${type}-${level}-${questionText.trim().substring(0, 500)}`;
    return crypto.createHash('md5').update(str).digest('hex');
};

const questionsData = [
  {
    "level": 3,
    "question": "Convert the denary number 25 to a binary number.",
    "question_zh": "將十進制數 25 轉換為二進制數。",
    "solution_steps": [
      "Step 1: Divide 25 by 2 repeatedly and record the remainders: $ 25 \\div 2 = 12 \\dots 1 $",
      "Step 2: $ 12 \\div 2 = 6 \\dots 0 $",
      "Step 3: $ 6 \\div 2 = 3 \\dots 0 $",
      "Step 4: $ 3 \\div 2 = 1 \\dots 1 $",
      "Step 5: $ 1 \\div 2 = 0 \\dots 1 $",
      "Step 6: Reading remainders from bottom to top: $ 11001_{2} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將 25 連續除以 2 並記錄餘數：$ 25 \\div 2 = 12 \\dots 1 $",
      "步驟 2：$ 12 \\div 2 = 6 \\dots 0 $",
      "步驟 3：$ 6 \\div 2 = 3 \\dots 0 $",
      "步驟 4：$ 3 \\div 2 = 1 \\dots 1 $",
      "步驟 5：$ 1 \\div 2 = 0 \\dots 1 $",
      "步驟 6：從下往上讀取餘數：$ 11001_{2} $"
    ],
    "answer": "11001_{2}"
  },
  {
    "level": 3,
    "question": "Convert the binary number $ 10110_{2} $ to a denary (decimal) number.",
    "question_zh": "將二進制數 $ 10110_{2} $ 轉換為十進制數。",
    "solution_steps": [
      "Step 1: Expand using powers of 2: $ 1 \\times 2^{4} + 0 \\times 2^{3} + 1 \\times 2^{2} + 1 \\times 2^{1} + 0 \\times 2^{0} $",
      "Step 2: Calculate values: $ 16 + 0 + 4 + 2 + 0 = 22 $"
    ],
    "solution_steps_zh": [
      "步驟 1：使用 2 的冪展開：$ 1 \\times 2^{4} + 0 \\times 2^{3} + 1 \\times 2^{2} + 1 \\times 2^{1} + 0 \\times 2^{0} $",
      "步驟 2：計算數值：$ 16 + 0 + 4 + 2 + 0 = 22 $"
    ],
    "answer": "22"
  },
  {
    "level": 3,
    "question": "Convert the denary number 45 to a hexadecimal number.",
    "question_zh": "將十進制數 45 轉換為十六進制數。",
    "solution_steps": [
      "Step 1: Divide 45 by 16 and record the remainder: $ 45 \\div 16 = 2 \\dots 13 $",
      "Step 2: In hexadecimal, 13 is represented by the letter $ \\mathrm{D} $.",
      "Step 3: $ 2 \\div 16 = 0 \\dots 2 $",
      "Step 4: Reading from bottom to top: $ 2\\mathrm{D}_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將 45 除以 16 並記錄餘數：$ 45 \\div 16 = 2 \\dots 13 $",
      "步驟 2：在十六進制中，13 由字母 $ \\mathrm{D} $ 表示。",
      "步驟 3：$ 2 \\div 16 = 0 \\dots 2 $",
      "步驟 4：從下往上讀取：$ 2\\mathrm{D}_{16} $"
    ],
    "answer": "2\\mathrm{D}_{16}"
  },
  {
    "level": 3,
    "question": "Convert $ \\mathrm{B}4_{16} $ to a denary (decimal) number.",
    "question_zh": "將十六進制數 $ \\mathrm{B}4_{16} $ 轉換為十進制數。",
    "solution_steps": [
      "Step 1: Map hex digits to decimal: $ \\mathrm{B} = 11 $.",
      "Step 2: Expand using powers of 16: $ 11 \\times 16^{1} + 4 \\times 16^{0} $",
      "Step 3: Calculate values: $ 176 + 4 = 180 $"
    ],
    "solution_steps_zh": [
      "步驟 1：映射十六進制位：$ \\mathrm{B} = 11 $。",
      "步驟 2：使用 16 的冪展開：$ 11 \\times 16^{1} + 4 \\times 16^{0} $",
      "步驟 3：計算數值：$ 176 + 4 = 180 $"
    ],
    "answer": "180"
  },
  {
    "level": 4,
    "question": "Express $ 2^{6} + 2^{3} + 2^{1} + 1 $ as a binary number.",
    "question_zh": "將 $ 2^{6} + 2^{3} + 2^{1} + 1 $ 表示為二進制數。",
    "solution_steps": [
      "Step 1: Identify the powers of 2 present: $ 2^{6}, 2^{3}, 2^{1}, 2^{0} $.",
      "Step 2: Fill in bits from $ 2^{6} $ to $ 2^{0} $: $ (1)2^{6} + (0)2^{5} + (0)2^{4} + (1)2^{3} + (0)2^{2} + (1)2^{1} + (1)2^{0} $",
      "Step 3: Combine to form the binary string: $ 1001011_{2} $"
    ],
    "solution_steps_zh": [
      "步驟 1：識別存在的 2 的冪：$ 2^{6}, 2^{3}, 2^{1}, 2^{0} $。",
      "步驟 2：從 $ 2^{6} $ 到 $ 2^{0} $ 填寫位：$ (1)2^{6} + (0)2^{5} + (0)2^{4} + (1)2^{3} + (0)2^{2} + (1)2^{1} + (1)2^{0} $",
      "步驟 3：組合成二進制字串：$ 1001011_{2} $"
    ],
    "answer": "1001011_{2}"
  },
  {
    "level": 4,
    "question": "Express $ 3 \\times 16^{3} + 10 \\times 16^{2} + 14 $ as a hexadecimal number.",
    "question_zh": "將 $ 3 \\times 16^{3} + 10 \\times 16^{2} + 14 $ 表示為十六進制數。",
    "solution_steps": [
      "Step 1: Map coefficients to hex digits: $ 3 \\rightarrow 3 $, $ 10 \\rightarrow \\mathrm{A} $, $ 14 \\rightarrow \\mathrm{E} $.",
      "Step 2: Arrange by powers: $ 3 \\times 16^{3} + \\mathrm{A} \\times 16^{2} + 0 \\times 16^{1} + \\mathrm{E} \\times 16^{0} $",
      "Step 3: Combine to hex result: $ 3\\mathrm{A}0\\mathrm{E}_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將係數映射到十六進制位：$ 3 \\rightarrow 3 $，$ 10 \\rightarrow \\mathrm{A} $，$ 14 \\rightarrow \\mathrm{E} $。",
      "步驟 2：按冪排列：$ 3 \\times 16^{3} + \\mathrm{A} \\times 16^{2} + 0 \\times 16^{1} + \\mathrm{E} \\times 16^{0} $",
      "步驟 3：組合成十六進制結果：$ 3\\mathrm{A}0\\mathrm{E}_{16} $"
    ],
    "answer": "3\\mathrm{A}0\\mathrm{E}_{16}"
  },
  {
    "level": 4,
    "question": "Express 137 as a sum of powers of 2.",
    "question_zh": "將 137 表示為 2 的冪之和。",
    "solution_steps": [
      "Step 1: Find the largest power of 2 less than 137: $ 2^{7} = 128 $.",
      "Step 2: Subtract: $ 137 - 128 = 9 $.",
      "Step 3: Find the largest power of 2 less than 9: $ 2^{3} = 8 $.",
      "Step 4: Subtract: $ 9 - 8 = 1 $.",
      "Step 5: $ 1 = 2^{0} $.",
      "Step 6: Final expression: $ 2^{7} + 2^{3} + 2^{0} $"
    ],
    "solution_steps_zh": [
      "步驟 1：找出小於 137 的最大 2 的冪：$ 2^{7} = 128 $。",
      "步驟 2：減法：$ 137 - 128 = 9 $。",
      "步驟 3：找出小於 9 的最大 2 的冪：$ 2^{3} = 8 $。",
      "步驟 4：減法：$ 9 - 8 = 1 $。",
      "步驟 5：$ 1 = 2^{0} $。",
      "步驟 6：最終表達式：$ 2^{7} + 2^{3} + 2^{0} $"
    ],
    "answer": "2^{7} + 2^{3} + 2^{0}"
  },
  {
    "level": 4,
    "question": "Convert $ 1101011010_{2} $ directly to a hexadecimal number.",
    "question_zh": "直接將 $ 1101011010_{2} $ 轉換為十六進制數。",
    "solution_steps": [
      "Step 1: Group binary digits into fours from right to left: $ 0011 $, $ 0101 $, $ 1010 $.",
      "Step 2: Convert each group: $ 0011_{2} = 3 $, $ 0101_{2} = 5 $, $ 1010_{2} = \\mathrm{A} $.",
      "Step 3: Combine numbers: $ 35\\mathrm{A}_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：從右到左將二進制位每四位分組：$ 0011 $, $ 0101 $, $ 1010 $。",
      "步驟 2：轉換每一組：$ 0011_{2} = 3 $, $ 0101_{2} = 5 $, $ 1010_{2} = \\mathrm{A} $。",
      "步驟 3：組合數字：$ 35\\mathrm{A}_{16} $"
    ],
    "answer": "35\\mathrm{A}_{16}"
  },
  {
    "level": 5,
    "question": "Express $ 2^{11} + 2^{5} + 13 $ as a binary number.",
    "question_zh": "將 $ 2^{11} + 2^{5} + 13 $ 表示為二進制數。",
    "solution_steps": [
      "Step 1: Expand the integer 13 into powers of 2: $ 13 = 8 + 4 + 1 = 2^{3} + 2^{2} + 2^{0} $.",
      "Step 2: Combine all terms: $ 2^{11} + 2^{5} + 2^{3} + 2^{2} + 2^{0} $.",
      "Step 3: Represent as a binary string: $ 100000101101_{2} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將整數 13 展開為 2 的冪：$ 13 = 8 + 4 + 1 = 2^{3} + 2^{2} + 2^{0} $。",
      "步驟 2：組合所有項：$ 2^{11} + 2^{5} + 2^{3} + 2^{2} + 2^{0} $。",
      "步驟 3：表示為二進制字串：$ 100000101101_{2} $"
    ],
    "answer": "100000101101_{2}"
  },
  {
    "level": 5,
    "question": "Express $ 2^{14} + 2^{9} + 2^{3} $ as a hexadecimal number.",
    "question_zh": "將 $ 2^{14} + 2^{9} + 2^{3} $ 表示為十六進制數。",
    "solution_steps": [
      "Step 1: Group binary powers into base 16 ($ 2^{4n} $): $ 2^{14} = 2^{2} \\times 2^{12} = 4 \\times 16^{3} $.",
      "Step 2: $ 2^{9} = 2^{1} \\times 2^{8} = 2 \\times 16^{2} $.",
      "Step 3: $ 2^{3} = 8 = 8 \\times 16^{0} $.",
      "Step 4: Combine into hexadecimal string: $ 4208_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將二進制冪分組為十六進制 ($ 2^{4n} $)：$ 2^{14} = 2^{2} \\times 2^{12} = 4 \\times 16^{3} $。",
      "步驟 2：$ 2^{9} = 2^{1} \\times 2^{8} = 2 \\times 16^{2} $。",
      "步驟 3：$ 2^{3} = 8 = 8 \\times 16^{0} $。",
      "步驟 4：組合成十六進制字串：$ 4208_{16} $"
    ],
    "answer": "4208_{16}"
  },
  {
    "level": 5,
    "question": "Express $ \\mathrm{B}000000\\mathrm{E}_{16} $ in expanded polynomial form (using powers of 16).",
    "question_zh": "以展開多項式形式（使用 16 的冪）表示 $ \\mathrm{B}000000\\mathrm{E}_{16} $。",
    "solution_steps": [
      "Step 1: Identify positions of digits. $ \\mathrm{B} $ is at the $ 16^{7} $ position.",
      "Step 2: Identify $ \\mathrm{E} $ at the $ 16^{0} $ position.",
      "Step 3: Map hex letters: $ \\mathrm{B} = 11, \\mathrm{E} = 14 $.",
      "Step 4: Polynomial form: $ 11 \\times 16^{7} + 14 \\times 16^{0} = 11 \\times 16^{7} + 14 $"
    ],
    "solution_steps_zh": [
      "步驟 1：識別數位的位置。$ \\mathrm{B} $ 位於 $ 16^{7} $ 處。",
      "步驟 2：識別 $ \\mathrm{E} $ 位於 $ 16^{0} $ 處。",
      "步驟 3：映射十六進制字母：$ \\mathrm{B} = 11, \\mathrm{E} = 14 $。",
      "步驟 4：多項式形式：$ 11 \\times 16^{7} + 14 \\times 16^{0} = 11 \\times 16^{7} + 14 $"
    ],
    "answer": "11 \\times 16^{7} + 14"
  },
  {
    "level": 5,
    "question": "Express $ 16^{4} + 10 \\times 16^{2} + 15 $ as a hexadecimal number.",
    "question_zh": "將 $ 16^{4} + 10 \\times 16^{2} + 15 $ 表示為十六進制數。",
    "solution_steps": [
      "Step 1: Identify coefficients: $ 16^{4} $ coefficient is 1. $ 16^{3} $ is 0. $ 16^{2} $ is 10 ($ \\mathrm{A} $). $ 16^{1} $ is 0. $ 16^{0} $ is 15 ($ \\mathrm{F} $).",
      "Step 2: Combine to form hex string: $ 10\\mathrm{A}0\\mathrm{F}_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：識別係數：$ 16^{4} $ 係數為 1。$ 16^{3} $ 為 0。$ 16^{2} $ 為 10 ($ \\mathrm{A} $)。$ 16^{1} $ 為 0。$ 16^{0} $ 為 15 ($ \\mathrm{F} $)。",
      "步驟 2：組合成十六進制字串：$ 10\\mathrm{A}0\\mathrm{F}_{16} $"
    ],
    "answer": "10\\mathrm{A}0\\mathrm{F}_{16}"
  },
  {
    "level": 5,
    "question": "Express $ 16^{3} - 1 $ as a hexadecimal number.",
    "question_zh": "將 $ 16^{3} - 1 $ 表示為十六進制數。",
    "solution_steps": [
      "Step 1: $ 16^{3} $ in hex is $ 1000_{16} $.",
      "Step 2: Subtract 1: $ 1000_{16} - 1_{16} = \\mathrm{FFF}_{16} $."
    ],
    "solution_steps_zh": [
      "步驟 1：$ 16^{3} $ 的十六進制表示為 $ 1000_{16} $。",
      "步驟 2：減 1：$ 1000_{16} - 1_{16} = \\mathrm{FFF}_{16} $。"
    ],
    "answer": "\\mathrm{FFF}_{16}"
  },
  {
    "level": 5,
    "question": "Convert $ \\mathrm{C}7_{16} $ to a binary number.",
    "question_zh": "將 $ \\mathrm{C}7_{16} $ 轉換為二進制數。",
    "solution_steps": [
      "Step 1: Convert each hex digit to a 4-bit binary group: $ \\mathrm{C}_{16} = 12 = 1100_{2} $.",
      "Step 2: $ 7_{16} = 0111_{2} $.",
      "Step 3: Combine groups: $ 11000111_{2} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將每個十六進制位轉換為 4 位二進制組：$ \\mathrm{C}_{16} = 12 = 1100_{2} $。",
      "步驟 2：$ 7_{16} = 0111_{2} $。",
      "步驟 3：組合各組：$ 11000111_{2} $"
    ],
    "answer": "11000111_{2}"
  },
  {
    "level": 7,
    "question": "Express $ 2^{15} + 2^{10} + 26 $ as a hexadecimal number.",
    "question_zh": "將 $ 2^{15} + 2^{10} + 26 $ 表示為十六進制數。",
    "solution_steps": [
      "Step 1: Convert $ 2^{15} $ to base 16: $ 2^{3} \\times 2^{12} = 8 \\times 16^{3} $.",
      "Step 2: Convert $ 2^{10} $ to base 16: $ 2^{2} \\times 2^{8} = 4 \\times 16^{2} $.",
      "Step 3: Expand 26 into base 16: $ 26 = 16^{1} + 10 = 16^{1} + \\mathrm{A} $.",
      "Step 4: Combine coefficients: $ 8 \\times 16^{3} + 4 \\times 16^{2} + 1 \\times 16^{1} + \\mathrm{A} \\times 16^{0} $.",
      "Step 5: Hexadecimal result: $ 841\\mathrm{A}_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將 $ 2^{15} $ 轉換為十六進制：$ 2^{3} \\times 2^{12} = 8 \\times 16^{3} $。",
      "步驟 2：將 $ 2^{10} $ 轉換為十六進制：$ 2^{2} \\times 2^{8} = 4 \\times 16^{2} $。",
      "步驟 3：將 26 展開為十六進制：$ 26 = 16^{1} + 10 = 16^{1} + \\mathrm{A} $。",
      "步驟 4：組合係數：$ 8 \\times 16^{3} + 4 \\times 16^{2} + 1 \\times 16^{1} + \\mathrm{A} \\times 16^{0} $。",
      "步驟 5：十六進制結果：$ 841\\mathrm{A}_{16} $"
    ],
    "answer": "841\\mathrm{A}_{16}"
  },
  {
    "level": 7,
    "question": "Express $ 2^{10} + 3 \\times 2^{4} + 5 $ as a binary number.",
    "question_zh": "將 $ 2^{10} + 3 \\times 2^{4} + 5 $ 表示為二進制數。",
    "solution_steps": [
      "Step 1: Break down the mixed terms: $ 3 \\times 2^{4} = (2 + 1)2^{4} = 2^{5} + 2^{4} $.",
      "Step 2: Break down the integer 5: $ 5 = 4 + 1 = 2^{2} + 2^{0} $.",
      "Step 3: Combine all powers of 2: $ 2^{10} + 2^{5} + 2^{4} + 2^{2} + 2^{0} $.",
      "Step 4: Form the binary number: $ 10000110101_{2} $"
    ],
    "solution_steps_zh": [
      "步驟 1：分解混合環：$ 3 \\times 2^{4} = (2 + 1)2^{4} = 2^{5} + 2^{4} $。",
      "步驟 2：分解整數 5：$ 5 = 4 + 1 = 2^{2} + 2^{0} $。",
      "步驟 3：組合所有 2 的冪：$ 2^{10} + 2^{5} + 2^{4} + 2^{2} + 2^{0} $。",
      "步驟 4：形成二進制數：$ 10000110101_{2} $"
    ],
    "answer": "10000110101_{2}"
  },
  {
    "level": 7,
    "question": "If $ x = 1010_{2} $, find the value of $ x \\times 2^{3} $ in binary.",
    "question_zh": "若 $ x = 1010_{2} $，求 $ x \\times 2^{3} $ 的二進制值。",
    "solution_steps": [
      "Step 1: Multiplying a binary number by $ 2^{n} $ is equivalent to shifting the number left by $ n $ positions.",
      "Step 2: $ x = 1010_{2} $ multiplied by $ 2^{3} $ means appending three zeros to the end.",
      "Step 3: Result: $ 1010000_{2} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將二進制數乘以 $ 2^{n} $ 等同於將數位向左移動 $ n $ 位。",
      "步驟 2：$ x = 1010_{2} $ 乘以 $ 2^{3} $ 意味著在末尾添加三個零。",
      "步驟 3：結果：$ 1010000_{2} $"
    ],
    "answer": "1010000_{2}"
  },
  {
    "level": 7,
    "question": "Express $ 16^{5} + 16^{2} + 10 $ as a hexadecimal number.",
    "question_zh": "將 $ 16^{5} + 16^{2} + 10 $ 表示為十六進制數。",
    "solution_steps": [
      "Step 1: Identify coefficients of powers of 16. $ 16^{5} $ has coefficient 1. $ 16^{4}, 16^{3} $ have coefficient 0.",
      "Step 2: $ 16^{2} $ has coefficient 1. $ 16^{1} $ has coefficient 0. $ 16^{0} $ has coefficient 10 ($ \\mathrm{A} $).",
      "Step 3: Arrange digits: $ 10010\\mathrm{A}_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：識別 16 的冪的係數。$ 16^{5} $ 的係數為 1。$ 16^{4}, 16^{3} $ 的係數為 0。",
      "步驟 2：$ 16^{2} $ 的係數為 1。$ 16^{1} $ 的係數為 0。$ 16^{0} $ 的係數為 10 ($ \\mathrm{A} $)。",
      "步驟 3：排列位數：$ 10010\\mathrm{A}_{16} $"
    ],
    "answer": "10010\\mathrm{A}_{16}"
  },
  {
    "level": 7,
    "question": "Express $ 2^{17} + 2^{13} + 2^{5} + 3 $ as a hexadecimal number.",
    "question_zh": "將 $ 2^{17} + 2^{13} + 2^{5} + 3 $ 表示為十六進制數。",
    "solution_steps": [
      "Step 1: Group terms using $ 2^{4n} $: $ 2^{17} = 2^{1} \\times 2^{16} = 2 \\times 16^{4} $.",
      "Step 2: $ 2^{13} = 2^{1} \\times 2^{12} = 2 \\times 16^{3} $.",
      "Step 3: $ 2^{5} = 2^{1} \\times 2^{4} = 2 \\times 16^{1} $.",
      "Step 4: The integer $ 3 = 3 \\times 16^{0} $.",
      "Step 5: Hexadecimal form: $ 2 \\times 16^{4} + 2 \\times 16^{3} + 0 \\times 16^{2} + 2 \\times 16^{1} + 3 \\times 16^{0} = 22023_{16} $."
    ],
    "solution_steps_zh": [
      "步驟 1：使用 $ 2^{4n} $ 將項分組：$ 2^{17} = 2^{1} \\times 2^{16} = 2 \\times 16^{4} $。",
      "步驟 2：$ 2^{13} = 2^{1} \\times 2^{12} = 2 \\times 16^{3} $。",
      "步驟 3：$ 2^{5} = 2^{1} \\times 2^{4} = 2 \\times 16^{1} $。",
      "步驟 4：整數 $ 3 = 3 \\times 16^{0} $。",
      "步驟 5：十六進制形式：$ 2 \\times 16^{4} + 2 \\times 16^{3} + 0 \\times 16^{2} + 2 \\times 16^{1} + 3 \\times 16^{0} = 22023_{16} $。"
    ],
    "answer": "22023_{16}"
  },
  {
    "level": 7,
    "question": "Calculate $ \\mathrm{A} 2_{16} + 1\\mathrm{B}_{16} $ and express the answer in hexadecimal.",
    "question_zh": "計算 $ \\mathrm{A} 2_{16} + 1\\mathrm{B}_{16} $ 並以十六進制表示答案。",
    "solution_steps": [
      "Step 1: Add the rightmost digits: $ 2 + \\mathrm{B} = 2 + 11 = 13 = \\mathrm{D}_{16} $.",
      "Step 2: Add the leftmost digits: $ \\mathrm{A} + 1 = 10 + 1 = 11 = \\mathrm{B}_{16} $.",
      "Step 3: Concatenate the results: $ \\mathrm{BD}_{16} $"
    ],
    "solution_steps_zh": [
      "步驟 1：將最右側數位元相加：$ 2 + \\mathrm{B} = 2 + 11 = 13 = \\mathrm{D}_{16} $。",
      "步驟 2：將最左側數位元相加：$ \\mathrm{A} + 1 = 10 + 1 = 11 = \\mathrm{B}_{16} $。",
      "步驟 3：串聯結果：$ \\mathrm{BD}_{16} $"
    ],
    "answer": "\\mathrm{BD}_{16}"
  }
];

async function seed() {
    console.log(`Starting to seed ${questionsData.length} Number Systems questions...`);
    const batch = db.batch();
    const topicId = 'math_num_num_systems';
    const topicName = 'Number Systems';

    for (const q of questionsData) {
        const qHash = generateQuestionHash(topicId, 'factory', q.question, q.level);
        const ref = db.collection('question_bank').doc(qHash);
        
        const quest = {
            ...q,
            id: qHash,
            topic: topicName,
            topic_id: topicId,
            subject: 'Maths',
            type: 'conventional',
            is_approved: true,
            is_factory: true,
            created_at: new Date().toISOString(),
            marks: 3,
            visual_version: "3.1-Elite",
            standard_version: "3.1-Elite",
            answer_logic: q.solution_steps.join('\n'),
            answer_logic_zh: q.solution_steps_zh.join('\n')
        };
        
        batch.set(ref, quest);
        console.log(`Prepared: ${qHash} (Level ${q.level})`);
    }

    try {
        await batch.commit();
        console.log('✅ Successfully seeded all questions to question_bank!');
    } catch (err) {
        console.error('❌ Failed to seed questions:', err);
    } finally {
        process.exit(0);
    }
}

seed();
