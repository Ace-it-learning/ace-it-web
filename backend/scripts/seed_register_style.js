const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_registerStyle";

const GUIDE_DATA = {
    "micro_skill": "Register & Style",
    "micro_skill_zh": "語域與風格",
    "category": "Linguistic Analysis",
    "difficulty_target": "Level 4-5*",
    "learning_content": {
        "anatomy": {
            "definition": "The choice of language, sentence structure, and level of formality used by a writer to suit a specific purpose and audience.",
            "definition_zh": "作者根據特定目的和受眾所選擇的語言、句式結構及正式程度。",
            "formula": "Vocabulary Choice + Sentence Complexity + Personal Pronouns = Register/Style",
            "formula_zh": "詞彙選擇 + 句子複雜度 + 人稱代詞 = 語域/風格",
            "examples": [
                {
                    "scenario": "Formal/Academic Register",
                    "text": "The implementation of the aforementioned policy is anticipated to yield significant socio-economic benefits for the marginalized populace.",
                    "clues": ["implementation", "aforementioned", "yield", "passive voice"],
                    "logic": "The use of multi-syllabic Latinate vocabulary and passive voice indicates a formal, professional, or academic setting.",
                    "inference_en": "The register is formal/professional; the style is objective and authoritative.",
                    "inference_zh": "語域屬正式/專業；風格客觀且具權威性。"
                },
                {
                    "scenario": "Informal/Colloquial Register",
                    "text": "Check it out! The new rules are gonna totally change how we hang out after school. It's about time, right?",
                    "clues": ["Check it out!", "gonna", "slang ('hang out')", "direct address ('we', 'right?')"],
                    "logic": "The use of contractions, slang, and direct interaction with the reader indicates a casual or personal style.",
                    "inference_en": "The register is informal/conversational; the style is engaging and subjective.",
                    "inference_zh": "語域屬非正式/對話式；風格具吸引力且主觀。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Text Type Identification (文本類型辨析)",
                "description": "Identifying where the text was likely published based on its style.",
                "examples": [
                    "Q: Based on the register used, this passage is most likely taken from: (A. A scientific journal, B. A personal blog, C. A legal document, D. A tabloid newspaper)"
                ]
            },
            {
                "type": "Effect of Style (風格影響力)",
                "description": "Explaining why the author chose a specific style.",
                "examples": [
                    "Q: Why does the writer use personal pronouns like 'you' and 'we' throughout the article?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Inconsistency Overlook (忽視風格不一)",
                "description": "Missing a 'shift' in register where an author suddenly uses slang in a formal text to create irony.",
                "solution_zh": "留意「語氣轉折」。如果正式文章中突然出現俚語，通常是為了強調作者的諷刺或與讀者拉近距離。"
            },
            {
                "trap": "Vague Descriptions (描述過於籠統)",
                "description": "Using 'good' or 'bad' to describe style instead of precise terms like 'eloquent', 'concise', or 'verbose'.",
                "solution_zh": "使用專業術語。練習使用學術詞彙，如 Academic (學術), Colloquial (口語), Technical (技術性), 或 Persuasive (具說服力)。"
            }
        ],
        "pro_tips_en": [
            "The 'I/You' Test: Frequent use of 'I' and 'You' usually signals an informal or persuasive register. A lack of personal pronouns signals an objective, formal register.",
            "Sentence Length: Long, complex sentences with multiple clauses often indicate a formal style; short, punchy sentences indicate a modern or casual style.",
            "Identify Jargon: Technical terms (e.g., 'photosynthesis', 'arbitration') indicate a specialized register aimed at an educated audience."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Register & Style Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
