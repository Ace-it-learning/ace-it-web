const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_factVsOpinion";

const GUIDE_DATA = {
    "micro_skill": "Fact vs. Opinion",
    "micro_skill_zh": "事實與意見辨析",
    "category": "Critical Reading",
    "difficulty_target": "Level 3-5",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to distinguish between objective information that can be proven (Fact) and subjective beliefs or emotional expressions (Opinion).",
            "definition_zh": "辨別客觀可證明的資訊（事實）與主觀信念或情感表達（意見）的能力。",
            "formula": "Verifiable Data = Fact; Emotional Adjectives/Predictions = Opinion",
            "formula_zh": "可證實數據 = 事實；情感形容詞/預測 = 意見",
            "examples": [
                {
                    "scenario": "Statistical vs. Evaluative",
                    "text": "The city's population grew by 10% last year, which is a disastrous trend for our local infrastructure.",
                    "clues": ["10% growth (Fact)", "disastrous (Opinion)"],
                    "logic": "The number is a verifiable statistic; the word 'disastrous' is a value judgment.",
                    "inference_en": "The growth rate is a fact, but the negative impact is the writer's opinion.",
                    "inference_zh": "增長率是事實，但其負面影響是作者的個人意見。"
                },
                {
                    "scenario": "Quote Attribution",
                    "text": "Dr. Wong stated that the vaccine is safe, though many protesters believe it was rushed.",
                    "clues": ["Dr. Wong stated (Fact - it happened)", "safe (Dr. Wong's Opinion)", "protesters believe (Fact - they have this belief)", "rushed (Protesters' Opinion)"],
                    "logic": "Reporting that someone *said* something is a fact; the *content* of what they said is often their opinion.",
                    "inference_en": "It is a fact that different groups hold these conflicting opinions.",
                    "inference_zh": "不同群體持有這些矛盾的意見，這本身是一個客觀事實。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Identification (辨識題)",
                "description": "Determining if a specific statement from the text is a fact or an opinion.",
                "examples": [
                    "Q: Based on paragraph 4, is the statement 'The festival was a success' a fact or an opinion? Explain."
                ]
            },
            {
                "type": "Writer's Stance (作者立場)",
                "description": "Analyzing how the writer uses opinions to persuade the reader.",
                "examples": [
                    "Q: Which of the following best describes the writer's opinion on the new law?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Expert Bias (專家誤導)",
                "description": "Assuming that because an expert said it, it must be a fact.",
                "solution_zh": "注意動詞。如果文中用 'suggests', 'claims', 'believes'，即便說者是專家，該內容仍屬意見。"
            },
            {
                "trap": "Hidden Opinions (隱藏意見)",
                "description": "Failing to notice 'loaded' adjectives that turn a factual sentence into an opinion.",
                "example_trap": "The 'small' crowd gathered. (The size is a fact, but 'small' is a subjective comparison).",
                "solution_zh": "尋找形容詞。形容詞（如 'wonderful', 'alarming', 'excessive'）通常是判斷意見的關鍵信號。"
            }
        ],
        "pro_tips_en": [
            "The Verification Test: Ask, 'Can this be proven with a clock, a ruler, a calculator, or a historical record?' If yes, it's likely a fact.",
            "Look for Modal Verbs: Words like 'should', 'must', 'could', or 'might' almost always signal an opinion or a recommendation.",
            "Identify Source Bias: Is the writer a scientist reporting data or a columnist writing an editorial? The source heavily influences the ratio of fact to opinion."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Fact vs. Opinion Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
