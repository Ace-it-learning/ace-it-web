const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_cohesionReference";

const GUIDE_DATA = {
    "micro_skill": "Cohesion and Reference",
    "micro_skill_zh": "銜接與指代",
    "category": "Linguistic Analysis",
    "difficulty_target": "Level 2-4",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to identify how words (pronouns, determiners) and phrases link back to previously mentioned ideas or forward to upcoming ones.",
            "definition_zh": "辨識詞語（代詞、限定詞）與短語如何連結至前文提到的概念或預示後文內容的能力。",
            "formula": "Reference Word (It/This/They) + Contextual Backtracking = Antecedent (The Answer)",
            "formula_zh": "指代詞 (It/This/They) + 語境回溯 = 先行詞 (答案)",
            "examples": [
                {
                    "scenario": "Pronoun Reference",
                    "text": "The local residents were unhappy with the new park regulations. They argued that these rules were too restrictive.",
                    "clues": ["They", "these rules"],
                    "logic": "'They' is a plural pronoun referring to the people mentioned earlier. 'These rules' refers to the 'regulations'.",
                    "inference_en": "'They' refers to the local residents; 'these rules' refers to the new park regulations.",
                    "inference_zh": "「They」指代當地居民；「these rules」指代新的公園條例。"
                },
                {
                    "scenario": "Abstract Reference",
                    "text": "Rising sea levels, extreme heatwaves, and frequent flooding have become the new normal. This reality is forcing cities to rethink urban planning.",
                    "clues": ["This reality"],
                    "logic": "'This reality' summarizes the entire previous sentence's list of environmental issues.",
                    "inference_en": "'This reality' refers to the fact that rising sea levels, heatwaves, and flooding have become common.",
                    "inference_zh": "「This reality」指代海平面上升、極端熱浪和頻繁洪水已成常態的事實。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Reference Questions (指代題)",
                "description": "Identifying the noun or idea a pronoun stands for.",
                "examples": [
                    "Q: In line 15, what does the word 'them' refer to?",
                    "Q: What does 'this trend' (line 22) refer to?"
                ]
            },
            {
                "type": "Cohesive Devices (銜接手段)",
                "description": "Understanding how transition words link paragraphs together.",
                "examples": [
                    "Q: How does the word 'However' in paragraph 3 change the direction of the argument?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "The 'Nearest Noun' Trap (就近原則陷阱)",
                "description": "Picking the noun physically closest to the pronoun, even if it doesn't make sense.",
                "solution_zh": "進行「代入測試」。將你找到的答案放回原句替換代詞，如果句子語意不通，那就找錯了。"
            },
            {
                "trap": "Plural/Singular Mismatch (單複數不符)",
                "description": "Choosing a singular noun for a plural pronoun like 'them' or 'those'.",
                "solution_zh": "語法匹配。如果代詞是 'they'，你的答案必須是一個複數名詞或一個代表複數概念的詞組。"
            }
        ],
        "pro_tips_en": [
            "The 'Substitution' Rule: Replace the pronoun with your answer. If the sentence sounds perfect, you've found it.",
            "Look for 'Such': Words like 'such a problem' or 'such people' always link back to a description in the previous sentence.",
            "Track the Subject: Often, the subject of the previous sentence remains the subject of the next one, even if it becomes a pronoun."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Cohesion and Reference Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
