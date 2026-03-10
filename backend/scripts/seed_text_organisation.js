const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_textOrganization";

const GUIDE_DATA = {
    "micro_skill": "Text Organisation",
    "micro_skill_zh": "文本組織 / 文章結構",
    "category": "Structural Analysis",
    "difficulty_target": "Level 3-5",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to recognize how a text is structured and how ideas are connected logically through transitions and cohesive devices.",
            "definition_zh": "辨識文本結構以及想法如何透過轉折詞和銜接手段進行邏輯連接的能力。",
            "formula": "Connectives (Transitions) + Paragraph Function + Logical Flow = Text Organisation",
            "formula_zh": "連接詞 + 段落功能 + 邏輯流向 = 文本組織",
            "examples": [
                {
                    "scenario": "Problem-Solution Structure",
                    "text": "Para 1: The city is facing a waste crisis. Para 2: To address this, the government is introducing a plastic ban.",
                    "clues": ["facing a crisis", "To address this"],
                    "logic": "The first paragraph presents a negative situation, and the second offers a remedy.",
                    "inference_en": "The relationship between Para 1 and Para 2 is Problem and Solution.",
                    "inference_zh": "第一段與第二段之間的關係是「問題與解決方案」。"
                },
                {
                    "scenario": "Cause and Effect",
                    "text": "The massive influx of tourists led to an increase in local prices, which consequently pushed many long-term residents out of the neighborhood.",
                    "clues": ["led to", "consequently"],
                    "logic": "The text shows a chain reaction where one event triggers another.",
                    "inference_en": "The sentence structure illustrates a cause-and-effect relationship.",
                    "inference_zh": "句子結構展示了「因果關係」。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Paragraph Function (段落功能)",
                "description": "Identifying what a specific paragraph does for the whole text.",
                "examples": [
                    "Q: What is the main purpose of paragraph 4? (e.g., To provide a counter-argument, To give a specific example, To conclude the discussion)"
                ]
            },
            {
                "type": "Connective Identification (連接詞填空)",
                "description": "Choosing the right logical link (e.g., However, Moreover, Therefore) to join two ideas.",
                "examples": [
                    "Q: Based on the context of paragraph 2, which word best fits the blank in line 5?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Misidentifying Transitions (轉折詞誤判)",
                "description": "Confusing 'Moreover' (Addition) with 'However' (Contrast).",
                "solution_zh": "建立「連接詞分類表」。將詞彙按功能分類：Addition (補充), Contrast (對比), Result (結果), Time (時間)。"
            },
            {
                "trap": "Ignoring Pronoun References (無視代詞指代)",
                "description": "Failing to see how words like 'This' or 'Such' link back to the previous paragraph's idea.",
                "solution_zh": "追蹤「代詞指代」。當看到 'This trend' 時，立刻回頭找前一段描述的是什麼趨勢。"
            }
        ],
        "pro_tips_en": [
            "The 'Anchor' Method: Identify the first and last paragraphs first. They usually contain the 'Introduction' and 'Conclusion/Call to Action'.",
            "Look for 'Echo' Words: If Para 1 ends with 'economic challenges' and Para 2 starts with 'Financial hurdles', they are logically linked by synonyms.",
            "Check the Visuals: Subheadings, bullet points, and bold text are intentional structural choices that signal a change in sub-topic."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Text Organisation Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
