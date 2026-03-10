const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin using serviceAccountKey.json
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const sequencingData = {
    "micro_skill": "Sequencing",
    "micro_skill_zh": "排序能力 / 邏輯順序",
    "category": "Reading Comprehension",
    "difficulty_target": "Level 2-4",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to identify the order in which events occur or steps are taken, regardless of the order in which they are mentioned in the text.",
            "definition_zh": "辨識事件發生或步驟進行的先後順序，不受文本敘述順序影響的能力。",
            "formula": "Time Markers + Logical Connectives + Event Mapping = Correct Sequence",
            "formula_zh": "時間標記 + 邏輯連接詞 + 事件圖譜 = 正確排序",
            "examples": [
                {
                    "scenario": "Narrative Flashback",
                    "text": "Before he finally won the gold medal in 2022, John had spent years recovering from the injury he sustained during the 2018 qualifiers.",
                    "clues": ["finally won (2022)", "recovering (years)", "injury (2018)"],
                    "logic": "The text mentions the 2022 win first, but the injury happened first in time.",
                    "inference_en": "1. Sustained injury (2018) -> 2. Recovered -> 3. Won gold (2022).",
                    "inference_zh": "1. 2018年受傷 -> 2. 多年康復 -> 3. 2022年奪金。"
                },
                {
                    "scenario": "Process/Instructions",
                    "text": "The final report can only be generated once the data has been verified. However, you must first input the raw figures into the system.",
                    "clues": ["final report (last)", "verified (middle)", "input raw figures (first)"],
                    "logic": "Words like 'first' and 'only once' dictate the sequence regardless of sentence position.",
                    "inference_en": "1. Input figures -> 2. Verify data -> 3. Generate report.",
                    "inference_zh": "1. 輸入數據 -> 2. 驗證資料 -> 3. 生成報告。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Flowchart Completion (流程圖填空)",
                "description": "Placing events from the text into boxes with arrows indicating the order.",
                "examples": [
                    "Q: Fill in the flow chart below to show the development of the company."
                ]
            },
            {
                "type": "Ordering Events (事件排序)",
                "description": "Numbering a list of sentences (1-5) to show the correct order of occurrence.",
                "examples": [
                    "Q: Put the following events in the correct order by writing 1-4 in the boxes."
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Mention Order vs. Occurrence Order (敘述順序與發生順序)",
                "description": "Assuming the first thing the author writes is the first thing that happened.",
                "solution_zh": "不要按「出場順序」排序。尋找時間詞（如 'previously', 'initially', 'subsequently'）來定位真實的時間線。"
            },
            {
                "trap": "The 'After/Before' Confusion (前後混淆)",
                "description": "Misinterpreting complex sentences like 'Prior to X, Y happened.'",
                "solution_zh": "將複雜句拆解。看到 'Before X, Y'，即表示 Y 才是第一步。"
            }
        ],
        "pro_tips_en": [
            "Circle Time Markers: Immediately circle dates, years, and adverbs of time (e.g., 'meanwhile', 'eventually') during your first read.",
            "The 'Reverse Check': Once you have your sequence, read it backward. Does the logic still hold? If step 3 couldn't happen without step 2, you are on the right track.",
            "Look for Passive Clues: Phrases like 'Having finished...' or 'With the task completed...' indicate that an action happened before the main verb of the sentence."
        ]
    }
};

async function seed() {
    console.log('Seeding Sequencing guide...');
    try {
        await db.collection('micro_skill_landing').doc('reading_sequencing').set(sequencingData);
        console.log('Successfully seeded Sequencing guide to micro_skill_landing/reading_sequencing');
    } catch (error) {
        console.error('Error seeding guide:', error);
    }
}

seed();
