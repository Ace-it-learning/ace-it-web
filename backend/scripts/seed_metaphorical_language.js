const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_metaphoricalLanguage";

const GUIDE_DATA = {
    "micro_skill": "Metaphorical Language",
    "micro_skill_zh": "隱喻與修辭語言",
    "category": "Linguistic Analysis",
    "difficulty_target": "Level 4-5**",
    "learning_content": {
        "anatomy": {
            "definition": "The use of words or phrases in a non-literal way to create a vivid image, emphasize a point, or evoke an emotional response.",
            "definition_zh": "以非字面意義的方式使用詞語或短語，以創造生動形象、強調重點或喚起情感反應。",
            "formula": "The Image (Vehicle) + Shared Quality + The Subject (Tenor) = Metaphorical Meaning",
            "formula_zh": "修辭意象 + 共同特徵 + 描述主體 = 比喻意義",
            "examples": [
                {
                    "scenario": "Metaphor in Social Commentary",
                    "text": "The city’s housing market has become a ticking time bomb for the younger generation.",
                    "clues": ["ticking time bomb"],
                    "logic": "A bomb is dangerous, hidden, and set to explode. This suggests the housing market is reaching a point of sudden, violent crisis.",
                    "inference_en": "The housing market is in a dangerous state and is likely to collapse or cause a crisis soon.",
                    "inference_zh": "房地產市場處於危險狀態，很可能很快就會崩潰或引發危機。"
                },
                {
                    "scenario": "Simile in Character Description",
                    "text": "The memory of the event was like a stain on his conscience that no amount of apology could wash away.",
                    "clues": ["like a stain", "wash away"],
                    "logic": "A stain is permanent and ruins the appearance of something. This shows the guilt is lasting and difficult to remove.",
                    "inference_en": "The guilt from the event is permanent and deeply affects his sense of morality.",
                    "inference_zh": "該事件帶來的罪惡感是永久性的，深深影響了他的道德觀。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Meaning of Phrases (短語含義)",
                "description": "Explaining what the author means by a specific metaphorical expression.",
                "examples": [
                    "Q: What does the writer mean by the phrase 'an island of calm in a sea of chaos' in line 14?"
                ]
            },
            {
                "type": "Effect of Language (修辭效果)",
                "description": "Analyzing why the author used a specific metaphor or simile.",
                "examples": [
                    "Q: Why does the author describe the internet as a 'double-edged sword'?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Literal Interpretation (字面陷阱)",
                "description": "Describing the physical image instead of the symbolic meaning.",
                "example_trap": "Saying a 'ticking time bomb' means a literal explosive device with a clock.",
                "solution_zh": "進行「去意象化」。問自己：作者想用這個東西的哪種特性（如：危險、美麗、快速）來形容主體？"
            },
            {
                "trap": "Incomplete Explanation (解釋不全)",
                "description": "Explaining the image but failing to connect it back to the subject of the sentence.",
                "solution_zh": "使用「橋接法」。解釋完意象後，必須明確指出這反映了主體的什麼特徵（例如：...這反映了該政策的不可預測性）。"
            }
        ],
        "pro_tips_en": [
            "The 'Shared Quality' Test: If the author calls a person a 'lion,' focus on the qualities of a lion (bravery, strength, leadership) that fit a human.",
            "Identify the Emotion: Metaphors are rarely neutral. Ask, 'Does this image make me feel positive (e.g., sunshine) or negative (e.g., shadow)?'",
            "Cultural Context: Some metaphors are idiomatic. If a metaphor sounds strange literally (e.g., 'barking up the wrong tree'), check if it’s a common English idiom."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Metaphorical Language Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
