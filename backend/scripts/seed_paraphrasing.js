const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_paraphrasing";

const GUIDE_DATA = {
    "micro_skill": "Paraphrasing",
    "micro_skill_zh": "文字改寫 / 意譯能力",
    "category": "Linguistic Transformation",
    "difficulty_target": "Level 4-5**",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to rewrite a piece of information from the text using different words and structures while keeping the original meaning 100% intact.",
            "definition_zh": "在保持原意完全不變的前提下，利用不同的詞彙和句式結構重寫文本資訊的能力。",
            "formula": "Synonyms (Same Meaning) + Syntax Shift (New Structure) = Successful Paraphrase",
            "formula_zh": "同義詞 (意思不變) + 句式轉換 (結構改變) = 成功的改寫",
            "examples": [
                {
                    "scenario": "Synonym & Voice Swap",
                    "text": "The government abandoned the controversial project due to public outcry.",
                    "clues": ["abandoned -> scrapped", "controversial -> disputed", "public outcry -> citizens' protests"],
                    "logic": "Changing 'abandoned' to 'scrapped' and moving from active to passive voice prevents direct lifting.",
                    "inference_en": "The disputed plan was scrapped because citizens protested against it.",
                    "inference_zh": "由於市民的反對，這項引發爭議的計劃被取消了。"
                },
                {
                    "scenario": "Word Class Transformation",
                    "text": "The scientist was successful in discovering a new species.",
                    "clues": ["successful (adj) -> successfully (adv)", "discovering (verb) -> discovery (noun)"],
                    "logic": "Changing an adjective to an adverb or a verb to a noun is a high-level DSE trick.",
                    "inference_en": "The scientist's discovery of a new species was conducted successfully.",
                    "inference_zh": "該科學家成功地發現了一個新物種。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Own Words Questions (自選詞彙題)",
                "description": "Questions that strictly forbid copying from the text.",
                "examples": [
                    "Q: Based on paragraph 3, why was the campaign effective? Answer in your own words."
                ]
            },
            {
                "type": "Summary Cloze (總結填空)",
                "description": "Filling in a summary where the text uses one word but the summary requires a different but related word.",
                "examples": [
                    "Q: Complete the summary. Use ONE word not found in the text."
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Meaning Drift (意思偏離)",
                "description": "Changing the words so much that the original meaning is lost or exaggerated.",
                "solution_zh": "進行「回檢」。改寫後，將你的句子與原句對照，確保程度（如：'often' 變為 'always' 就是錯誤的）完全一致。"
            },
            {
                "trap": "The Thesaurus Trap (同義詞誤用)",
                "description": "Choosing a synonym that doesn't fit the context (e.g., using 'huge' to describe an 'important' person).",
                "solution_zh": "考慮語境。並非所有同義詞都能互換，要注意詞彙的搭配 (Collocation) 和語境。"
            }
        ],
        "pro_tips_en": [
            "The 'Noun to Verb' Trick: If the text says 'made a decision,' you write 'decided.' This is the fastest way to paraphrase.",
            "Flip the Sentence: Start from the end of the author's sentence and work backward to the beginning.",
            "Identify 'Non-negotiable' Words: Proper nouns (Hong Kong), technical terms (DNA), and dates should not be paraphrased."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Paraphrasing Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
