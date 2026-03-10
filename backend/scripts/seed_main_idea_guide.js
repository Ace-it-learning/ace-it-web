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

const mainIdeaData = {
    "micro_skill": "Main Idea Identification",
    "micro_skill_zh": "主旨辨識",
    "category": "Reading Comprehension",
    "difficulty_target": "Level 3-5",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to summarize the central point or primary message of a paragraph or an entire passage.",
            "definition_zh": "辨識並概括段落或整篇文章的核心點或主要訊息的能力。",
            "formula": "Topic Sentence + Repeated Keywords + Concluding Summary = Main Idea",
            "formula_zh": "主題句 + 重複關鍵詞 + 總結句 = 主旨大意",
            "examples": [
                {
                    "scenario": "Paragraph Level",
                    "text": "While urban farming provides fresh produce, its most significant impact is community building. Neighbors meet at the soil, children learn about nature together, and elderly residents find a renewed sense of purpose. It is a social glue disguised as a garden.",
                    "clues": ["significant impact is community building", "social glue"],
                    "logic": "The author mentions produce briefly but spends the rest of the text listing social benefits.",
                    "inference_en": "The main purpose of urban farming is to strengthen social ties rather than just grow food.",
                    "inference_zh": "都市耕種的主要目的是增進社交聯繫，而不僅則產出食物。"
                },
                {
                    "scenario": "Article Level",
                    "text": "The opening explores the history of AI. The middle sections debate its ethical risks in medicine. The conclusion calls for global regulation. Overall, the text weighs progress against safety.",
                    "clues": ["history", "ethical risks", "regulation"],
                    "logic": "The text moves from past to present to future, all centered around the management of technology.",
                    "inference_en": "The passage provides a comprehensive overview of the ethical challenges and need for AI oversight.",
                    "inference_zh": "本文全面概述了人工智能面臨的倫理挑戰及監管必要性。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Heading Matching (標題配對)",
                "description": "Matching a list of potential titles to specific paragraphs.",
                "examples": [
                    "Q: Which of the following is the best title for the whole passage?",
                    "Q: Match the headings to Paragraphs 2-5."
                ]
            },
            {
                "type": "Summary Completion (總結填空)",
                "description": "Filling in a cloze-style summary of a section of the text.",
                "examples": [
                    "Q: Complete the summary of the writer's argument by choosing one word from the text for each blank."
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "The 'Too Broad' Trap (過於籠統)",
                "description": "Choosing a main idea that covers the general topic but ignores the specific focus of the text.",
                "example_trap": "The text is about 'Plastic in the Atlantic,' but the student chooses 'Environmental Issues'.",
                "solution_zh": "確保主旨涵蓋了文章的具體範疇。如果文章只講大西洋，就不能選全球環境問題。"
            },
            {
                "trap": "The 'Too Narrow' Trap (過於片面)",
                "description": "Focusing on a supporting detail or a single example instead of the whole paragraph.",
                "example_trap": "Choosing 'Elderly residents' as the main idea for the urban farming example above.",
                "solution_zh": "問自己：這個句子能概括整段內容嗎？如果它只是其中一個例子，那它就不是主旨。"
            }
        ],
        "pro_tips_en": [
            "The First & Last Sentence Rule: In DSE texts, the 'Topic Sentence' is usually at the start or end of a paragraph.",
            "Identify the 'Turning Point': Look for words like 'But', 'However', or 'Yet'. The main idea often shifts after these words.",
            "The 'Elevator Pitch': If you had to explain the paragraph to a friend in 5 seconds, what would you say? That is your main idea."
        ]
    }
};

async function seed() {
    console.log('Seeding Main Idea Identification guide...');
    try {
        await db.collection('micro_skill_landing').doc('reading_mainIdea').set(mainIdeaData);
        console.log('Successfully seeded Main Idea Identification guide to micro_skill_landing/reading_mainIdea');
    } catch (error) {
        console.error('Error seeding guide:', error);
    }
}

seed();
