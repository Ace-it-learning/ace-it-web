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

const detailRecognitionData = {
    "micro_skill": "Detail Recognition",
    "micro_skill_zh": "細節辨識",
    "category": "Reading Comprehension",
    "difficulty_target": "Level 2-4",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to pinpoint specific facts, figures, names, or sequences within a text to answer targeted questions.",
            "definition_zh": "從文本中精確定位特定事實、數據、名稱或順序，以回答針對性問題的能力。",
            "formula": "Scan for Nouns/Numbers + Compare with Options = Detail Verified",
            "formula_zh": "掃描名詞/數字 + 選項比對 = 確認細節",
            "examples": [
                {
                    "scenario": "Filtering Distractors",
                    "text": "While the concert was originally planned for the outdoor stadium, the 15% chance of rain forced organizers to move it to the City Hall basement.",
                    "clues": ["outdoor stadium (original)", "City Hall basement (final)"],
                    "logic": "The question asks where the concert *actually* took place, not where it was planned.",
                    "inference_en": "The concert took place at the City Hall basement.",
                    "inference_zh": "音樂會實際在市政廳地下室舉行。"
                },
                {
                    "scenario": "Numerical Accuracy",
                    "text": "The subscription fee is $50 per month, but early birds receive a 20% discount, bringing the total down to $40.",
                    "clues": ["$50 (original)", "20% (discount)", "$40 (final)"],
                    "logic": "DSE often tests if you can distinguish between the 'original' price and the 'discounted' price.",
                    "inference_en": "Early bird members pay $40.",
                    "inference_zh": "早鳥會員需支付 40 美元。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Fact vs. Fiction (是非判斷)",
                "description": "Identifying which detail in a list is NOT mentioned or is incorrect.",
                "examples": [
                    "Q: Which of the following is NOT true about the new library?",
                    "Q: According to the text, what are the THREE requirements for the scholarship?"
                ]
            },
            {
                "type": "Table/Flowchart Completion (圖表填空)",
                "description": "Extracting technical details to fill in a summary table.",
                "examples": [
                    "Q: Complete the table below using information from Paragraph 4."
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "The 'Half-Truth' (半真半假)",
                "description": "An option that uses words from the text but changes a key detail like the date or the person's name.",
                "solution_zh": "仔細核對。選項中可能 90% 的字都對，但只要有一個數字或名字不符，就是錯誤答案。"
            },
            {
                "trap": "Proximity Error (鄰近誤差)",
                "description": "Picking a detail simply because it is physically close to a keyword in the text, even if it's unrelated.",
                "solution_zh": "不要只看關鍵字旁邊的詞。要讀完完整個句子，確保該細節與題目要求的邏輯關係一致。"
            }
        ],
        "pro_tips_en": [
            "Spot the 'Qualifiers': Words like 'only', 'all', 'mostly', or 'sometimes' change the detail entirely. Be wary of these in MCQs.",
            "Use the 'Search & Destroy' Method: For 'Which of the following is NOT true' questions, find the three true ones in the text and cross them out.",
            "Mind the Tense: A detail about what 'will happen' is different from what 'has happened'."
        ]
    }
};

async function seed() {
    console.log('Seeding Detail Recognition guide...');
    try {
        await db.collection('micro_skill_landing').doc('reading_detailRecognition').set(detailRecognitionData);
        console.log('Successfully seeded Detail Recognition guide to micro_skill_landing/reading_detailRecognition');
    } catch (error) {
        console.error('Error seeding guide:', error);
    }
}

seed();
