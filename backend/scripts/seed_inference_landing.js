const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const inferenceData = {
    "micro_skill": "Inference",
    "micro_skill_zh": "推斷能力",
    "category": "Reading Comprehension",
    "difficulty_target": "Level 4-5**",
    "learning_content": {
        "anatomy": {
            "definition": "The ability to deduce unstated meanings by combining textual clues with logical reasoning.",
            "definition_zh": "結合文字線索與邏輯推理，推導出作者未直接言明的深層意義。",
            "formula": "Textual Evidence (Clues) + Prior Knowledge (Logic) = Inference",
            "formula_zh": "文本證據 (線索) + 常識背景 (邏輯) = 推斷結論",
            "examples": [
                {
                    "scenario": "Physical Cues",
                    "text": "The CEO's hands trembled slightly as she approached the podium, and she avoided eye contact with the journalists.",
                    "clues": ["hands trembled", "avoided eye contact"],
                    "logic": "Shaking and avoiding gaze are universal signs of anxiety or hiding something.",
                    "inference_en": "The CEO is likely nervous or apprehensive about the announcement.",
                    "inference_zh": "執行長對即將發表的聲明感到緊張或憂慮。"
                },
                {
                    "scenario": "Environmental Cues",
                    "text": "The once-bustling high street was now a row of boarded-up windows and 'For Lease' signs.",
                    "clues": ["boarded-up windows", "For Lease signs"],
                    "logic": "Empty shops and lack of people suggest a failing local economy.",
                    "inference_en": "The neighborhood is experiencing a significant economic downturn.",
                    "inference_zh": "該社區正經歷嚴重的經濟衰退。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Tone and Attitude (語氣與態度)",
                "description": "Identifying the writer's feelings toward a subject based on word choice.",
                "examples": [
                    "Q: What is the writer’s tone in paragraph 3? (e.g., Cynical, Optimistic, Objective)",
                    "Q: How does the writer feel about the rise of social media? (e.g., Skeptical, Supportive)"
                ]
            },
            {
                "type": "Implicit Meaning (隱含意義)",
                "description": "Understanding the 'subtext' or why a specific detail was included.",
                "examples": [
                    "Q: What does the writer imply by saying 'the project was a drop in the ocean'?",
                    "Q: Why does the author mention the failure of the 1990s initiative?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Over-inferencing (過度推論)",
                "description": "Using personal bias rather than textual evidence.",
                "example_trap": "The text says 'he was late'; you infer 'he is a lazy person' (No evidence for personality).",
                "solution_zh": "堅持「證據鏈」原則。如果無法從原文找到對應詞彙支撐，該推論極可能是錯誤的。"
            },
            {
                "trap": "The Literal Trap (字面陷阱)",
                "description": "Choosing a factually true statement from the text that fails to 'read between the lines'.",
                "example_trap": "The question asks what 'the dark clouds' suggest, and you answer 'it was cloudy'.",
                "solution_zh": "若題目問的是「暗示 (imply)」，答案通常需要進行意思轉述 (Paraphrase) 而非直接引用。"
            }
        ],
        "pro_tips_en": [
            "Check the Adjectives: Words like 'supposedly' or 'so-called' often imply the author doubts the truth of something.",
            "The 'Purpose' Test: Ask yourself, 'If the author deleted this sentence, what would the reader miss?' The answer is usually the inference.",
            "Two-Part Answers: In open-ended DSE questions, always state the 'Clue' from the text first, then explain your 'Inference'."
        ]
    },
    "updated_at": admin.firestore.FieldValue.serverTimestamp()
};

async function seed() {
    try {
        // Topic ID is reading_inference based on microSkills.js
        await db.collection('micro_skill_landing').doc('reading_inference').set(inferenceData);
        console.log('Successfully seeded Inference landing content!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
