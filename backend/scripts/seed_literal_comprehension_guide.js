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

const literalComprehensionData = {
    "micro_skill": "Literal Comprehension",
    "micro_skill_zh": "字面理解 / 直接理解",
    "category": "Reading Comprehension",
    "difficulty_target": "Level 1-3 (Foundation for all levels)",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to identify and retrieve information that is explicitly stated in the text.",
            "definition_zh": "準確辨識並提取文本中直接陳述的資訊。",
            "formula": "Question Keywords + Textual Scanning = Direct Answer",
            "formula_zh": "題目關鍵字 + 文本掃描 = 直接答案",
            "examples": [
                {
                    "scenario": "Identifying Specific Data",
                    "text": "The research team, led by Dr. Aris, surveyed 4,500 students across three continents over a period of six months.",
                    "clues": ["Dr. Aris", "4,500 students", "six months"],
                    "logic": "The question asks for 'who' and 'how many'; the text provides these numbers directly.",
                    "inference_en": "Dr. Aris led the team and they surveyed 4,500 students.",
                    "inference_zh": "由 Aris 博士帶領的團隊共調查了 4,500 名學生。"
                },
                {
                    "scenario": "Following Instructions/Steps",
                    "text": "Before applying the sealant, ensure the surface is scrubbed clean and completely dry to avoid peeling.",
                    "clues": ["scrubbed clean", "completely dry"],
                    "logic": "The text lists specific conditions that must be met before an action.",
                    "inference_en": "The surface must be clean and dry before applying the sealant.",
                    "inference_zh": "在使用密封劑之前，表面必須擦洗乾淨並保持完全乾燥。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Wh- Questions (基本問答)",
                "description": "Questions starting with Who, When, Where, or How many.",
                "examples": [
                    "Q: According to paragraph 1, when was the bridge built?",
                    "Q: Who is the target audience of this advertisement?"
                ]
            },
            {
                "type": "True/False/Not Given (是非題)",
                "description": "Checking if a statement matches the facts in the text.",
                "examples": [
                    "Q: State whether the following statement is True, False, or Not Given: 'The company made a profit in 2022.'"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Over-thinking (想得太多)",
                "description": "Adding your own logic to a simple factual question.",
                "example_trap": "The text says 'It rained'; the student answers 'The game was cancelled' (The text didn't say that!).",
                "solution_zh": "不要推論。題目問什麼，就回原文找那個事實，不要替作者解釋後果。"
            },
            {
                "trap": "Lifting Errors (抄錄錯誤)",
                "description": "Copying too much or too little from the text, including irrelevant pronouns.",
                "example_trap": "Writing 'He said...' instead of 'The principal said...'",
                "solution_zh": "確保答案完整。如果引用原句，要檢查人稱代詞（如 he/she/they）是否需要更改為具體名詞以便清晰。"
            }
        ],
        "pro_tips_en": [
            "Keyword Matching: Underline the nouns and verbs in the question and hunt for the exact same words (or synonyms) in the passage.",
            "The 'Point-and-Check' Method: Once you find the answer, put one finger on the question and one on the text. Do they match 100%?",
            "Grammar Consistency: Ensure your copied answer fits the grammatical structure of the question (e.g., if the question is in the past tense, your answer should be too)."
        ]
    }
};

async function seed() {
    console.log('Seeding Literal Comprehension guide...');
    try {
        await db.collection('micro_skill_landing').doc('reading_literalComprehension').set(literalComprehensionData);
        console.log('Successfully seeded Literal Comprehension guide to micro_skill_landing/reading_literalComprehension');
    } catch (error) {
        console.error('Error seeding guide:', error);
    }
}

seed();
