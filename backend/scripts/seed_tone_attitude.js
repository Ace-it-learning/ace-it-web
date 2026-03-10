const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_toneAttitude";

const GUIDE_DATA = {
    "micro_skill": "Tone & Attitude",
    "micro_skill_zh": "語調與態度",
    "category": "Critical Reading",
    "difficulty_target": "Level 4-5**",
    "learning_content": {
        "anatomy": {
            "definition": "The writer's emotional perspective or stance toward the subject matter, conveyed through word choice and sentence structure.",
            "definition_zh": "作者對主題的情緒立場或態度，透過選詞和句式結構來表達。",
            "formula": "Diction (Loaded Words) + Punctuation/Emphasis + Context = Tone/Attitude",
            "formula_zh": "用詞 (強烈情感詞) + 標點/強調 + 語境 = 語調/態度",
            "examples": [
                {
                    "scenario": "Sarcastic/Cynical Tone",
                    "text": "Oh great! Another 'groundbreaking' shopping mall in a city that already has five on every street corner.",
                    "clues": ["Oh great!", "'groundbreaking' in quotes", "five on every street corner"],
                    "logic": "The use of 'Oh great' for something clearly redundant, combined with sarcastic quotes, shows the writer is mocking the idea.",
                    "inference_en": "The writer's tone is cynical/sarcastic; they feel the new mall is unnecessary.",
                    "inference_zh": "作者的語調帶有諷刺/憤世嫉俗；他們認為新商場是多餘的。"
                },
                {
                    "scenario": "Objective/Neutral Tone",
                    "text": "The report indicates a 5% increase in annual rainfall. While significant, further data is required to determine a long-term trend.",
                    "clues": ["indicates", "further data is required", "determine"],
                    "logic": "The language is clinical and avoids emotional adjectives. It focuses on evidence and caution.",
                    "inference_en": "The tone is objective and professional; the attitude is cautious.",
                    "inference_zh": "語調客觀專業；態度審慎。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Adjective Identification (形容詞選擇)",
                "description": "Choosing the best adjective to describe the writer's feelings.",
                "examples": [
                    "Q: Which of the following words best describes the writer’s attitude in lines 20-25? (A. Indifferent, B. Apprehensive, C. Enthusiastic, D. Mocking)"
                ]
            },
            {
                "type": "Textual Evidence (證據支持)",
                "description": "Finding words in the text that prove a specific tone.",
                "examples": [
                    "Q: Give one example of a word or phrase from paragraph 3 that shows the writer is skeptical of the plan."
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Confusing the Subject's Tone with the Writer's Tone (對象與作者的混淆)",
                "description": "If a writer quotes an angry person, it doesn't mean the *writer* is angry.",
                "solution_zh": "區分「引文」與「作者敘述」。作者可能用客觀的語氣來描述一個非常憤怒的抗議活動。"
            },
            {
                "trap": "Vocabulary Deficit (詞彙量不足)",
                "description": "Knowing how the writer feels but not knowing the English word for it (e.g., 'Resentful' vs. 'Indifferent').",
                "solution_zh": "建立「情緒詞彙庫」。背誦 DSE 常見語調詞，如 Objective, Sarcastic, Empathetic, Nostalgic。"
            }
        ],
        "pro_tips_en": [
            "The 'Punctuation' Hint: Frequent use of exclamation marks (!) suggests excitement or anger; rhetorical questions (?) often suggest sarcasm or skepticism.",
            "Check the 'Adverbs': Words like 'unfortunately', 'allegedly', or 'surprisingly' are huge clues to the author's stance.",
            "Irony Alert: If the author says something is 'brilliant' but then lists 10 reasons why it failed, the attitude is definitely negative."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Tone & Attitude Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
