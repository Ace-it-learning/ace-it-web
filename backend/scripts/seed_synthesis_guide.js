const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const GUIDE_ID = "reading_synthesis";

const GUIDE_DATA = {
    micro_skill: "Synthesis",
    micro_skill_zh: "綜合分析 / 資訊整合",
    category: "Reading Comprehension",
    difficulty_target: "Level 4-5**",
    learning_content: {
        anatomy: {
            definition: "The ability to combine information from different parts of a text (or multiple texts) to form a coherent conclusion or summary.",
            definition_zh: "結合文本中不同部分（或多篇文本）的資訊，以形成完整結論或總結的能力。",
            formula: "Point A (Para 1) + Point B (Para 4) = Synthesized Conclusion",
            formula_zh: "論點 A (第一段) + 論點 B (第四段) = 綜合結論",
            examples: [
                {
                    scenario: "Cross-Paragraph Connection (跨段連結)",
                    text: "Para 1: The government proposed a new tax on sugar... Para 5: Local beverage companies reported a 20% drop in stock prices.",
                    clues: ["sugar tax proposal", "beverage stocks drop"],
                    logic: "The drop in stocks is a direct reaction to the proposed tax mentioned earlier.",
                    inference_en: "Investors fear the sugar tax will hurt the profitability of beverage companies.",
                    inference_zh: "投資者擔心糖稅會損害飲料公司的盈利能力。"
                },
                {
                    scenario: "Multi-Factor Summary (多因素總結)",
                    text: "Para 2 lists 'cost'; Para 3 lists 'lack of expertise'; Para 6 lists 'public fear' as barriers.",
                    clues: ["cost", "expertise", "fear"],
                    logic: "To answer 'What are the challenges?', you must combine these three distinct points.",
                    inference_en: "Nuclear energy faces financial, technical, and psychological obstacles.",
                    inference_zh: "核能面臨財務、技術及心理層面的多重障礙。"
                }
            ]
        },
        dse_appearance: [
            {
                type: "Summary Table (綜合表格)",
                description: "Filling in a table that requires data from various paragraphs.",
                examples: [
                    "Q: Based on the whole article, fill in the pros and cons of remote work."
                ]
            },
            {
                "type": "Comparison Questions (比較題)",
                "description": "Identifying similarities or differences between two people or ideas mentioned far apart.",
                "examples": [
                    "Q: How does the views of Dr. Smith differ from the findings of the 2020 report?"
                ]
            }
        ],
        common_traps: [
            {
                trap: "The 'Isolated Answer' (孤立答案)",
                description: "Answering based on only one paragraph when the question asks for the whole text's view.",
                solution_zh: "看清題號範圍。如果題目問 'According to the text' 而非 'According to Para 1'，答案通常分散在不同段落。"
            },
            {
                trap: "Contradiction Oversight (忽視矛盾)",
                description: "Failing to notice that the author's view changed from the beginning to the end of the text.",
                solution_zh: "注意語氣轉變。作者可能在開頭提出一個觀點，但在結尾透過新的證據將其推翻。"
            }
        ],
        pro_tips_en: [
            "The 'Common Thread' Hunt: Look for recurring themes in different contexts.",
            "Use Transition Links: Words like 'Similarly', 'In contrast', and 'Furthermore' are your maps.",
            "Categorization: Try to group details into buckets (e.g., Social, Economic, Environmental)."
        ]
    }
};

async function seedGuide() {
    try {
        console.log(`Seeding guide for ${GUIDE_ID}...`);
        await db.collection("micro_skill_landing").doc(GUIDE_ID).set(GUIDE_DATA);
        console.log("✅ Synthesis Guide seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding guide:", error);
    } finally {
        process.exit();
    }
}

seedGuide();
