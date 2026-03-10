const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_authorPurpose";

const GUIDE_DATA = {
    "micro_skill": "Author's Purpose",
    "micro_skill_zh": "作者意圖 / 寫作目的",
    "category": "Critical Reading",
    "difficulty_target": "Level 3-5",
    "learning_content": {
        "anatomy": {
            "definition": "The reason why an author writes a specific text or includes a particular detail—usually categorized into Informing, Persuading, Entertaining, or Criticizing.",
            "definition_zh": "作者創作特定文本或加入特定細節的原因——通常分為提供資訊、說服、娛樂或批評。",
            "formula": "Text Type + Tone + Targeted Audience = Author's Purpose",
            "formula_zh": "文本類型 + 語調 + 目標受眾 = 寫作目的",
            "examples": [
                {
                    "scenario": "Specific Detail Purpose",
                    "text": "The author includes a heartbreaking story about a family losing their home to rising sea levels in a report about climate change.",
                    "clues": ["heartbreaking story", "family losing home"],
                    "logic": "Anecdotes are often used to evoke empathy and make a dry scientific topic feel more urgent.",
                    "inference_en": "To humanize the statistics and persuade the reader to take environmental action.",
                    "inference_zh": "將數據人性化，並說服讀者採取環保行動。"
                },
                {
                    "scenario": "Overall Text Purpose",
                    "text": "A travel guide that lists the history, ticket prices, and opening hours of the Palace Museum.",
                    "clues": ["history", "prices", "hours"],
                    "logic": "The content is purely factual and designed to help a visitor plan a trip.",
                    "inference_en": "To provide practical information and educate the reader about a cultural landmark.",
                    "inference_zh": "提供實用資訊，並教育讀者了解文化地標。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "The 'Why' Question (目的題)",
                "description": "Asking why a specific phrase, example, or paragraph was included.",
                "examples": [
                    "Q: What is the main purpose of paragraph 1?",
                    "Q: Why does the writer mention 'The Titanic' in line 12?"
                ]
            },
            {
                "type": "Overall Intent (整體意圖)",
                "description": "Identifying the writer's goal for the entire passage.",
                "examples": [
                    "Q: The writer wrote this article mainly to...",
                    "Q: Who is the intended audience of this passage?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Confusing Topic with Purpose (主題與目的混淆)",
                "description": "Answering 'what the book is about' instead of 'why it was written'.",
                "example_trap": "Purpose: 'To talk about dogs' (This is a topic, not a purpose like 'to encourage dog adoption').",
                "solution_zh": "使用動詞開頭。正確答案通常由動詞（如 'to argue', 'to highlight', 'to criticize', 'to promote'）引領。"
            },
            {
                "trap": "Surface-Level Purpose (過於表面)",
                "description": "Missing the underlying irony or sarcasm.",
                "solution_zh": "注意語氣。如果作者在讚美一個顯然很糟糕的政策，他的目的可能是「嘲諷 (to satirize)」而非真的支持。"
            }
        ],
        "pro_tips_en": [
            "The 'P.I.E.E.' Framework: Is it to Persuade, Inform, Entertain, or Explain?",
            "Check the Conclusion: The final paragraph often contains a 'call to action' which clearly states the author's ultimate goal.",
            "Analyze the Source: An article from a 'Science Journal' aims to inform; an 'Opinion Piece' in a newspaper aims to persuade."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Author's Purpose Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
