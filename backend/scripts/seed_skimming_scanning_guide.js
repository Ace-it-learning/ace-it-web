const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin (assuming it can find the credentials or is already configured in the environment)
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const skimmingScanningData = {
    "micro_skill": "Skimming & Scanning",
    "micro_skill_zh": "略讀與掃描",
    "category": "Reading Strategy",
    "difficulty_target": "Level 3-5",
    "learning_content": {
        "anatomy": {
            "definition": "Skimming is for the 'Big Picture'; Scanning is for 'Specific Details'.",
            "definition_zh": "略讀用於掌握大意；掃描用於尋找特定細節。",
            "formula": "Speed + Keyword Identification = Efficiency",
            "formula_zh": "速度 + 關鍵詞識別 = 高效率解題",
            "examples": [
                {
                    "scenario": "Skimming for Gist",
                    "text": "The first sentence of a paragraph discusses 'rising sea levels,' and the last sentence mentions 'economic catastrophe.'",
                    "clues": ["Topic sentence", "Concluding sentence"],
                    "logic": "The first and last sentences usually contain the main argument.",
                    "inference_en": "I can skip the middle examples and know this paragraph is about the negative impact of climate change.",
                    "inference_zh": "通過首尾句即可得知本段主旨是關於氣候變化的負面影響，無需深究中間細節。"
                },
                {
                    "scenario": "Scanning for Names",
                    "text": "The question asks for a study conducted by 'Professor Higgins' in '2014'.",
                    "clues": ["Capital letters (Higgins)", "Numbers (2014)"],
                    "logic": "Proper nouns and dates stand out visually in a block of text.",
                    "inference_en": "I should let my eyes 'float' over the text until I see 'Higgins' or '2014'.",
                    "inference_zh": "目光快速掃過文本，直到發現大寫字母 'Higgins' 或數字 '2014'，精確定位答案點。"
                }
            ]
        },
        "dse_appearance": [
            {
                "type": "Heading Matching (配對標題)",
                "description": "Requires Skimming to understand the focus of multiple paragraphs quickly.",
                "examples": [
                    "Q: Match the following headings (A-E) to paragraphs 1-4."
                ]
            },
            {
                "type": "Data Retrieval (提取資料)",
                "description": "Requires Scanning to find specific figures or terms in a long passage.",
                "examples": [
                    "Q: According to the text, how many people attended the 2018 summit?"
                ]
            }
        ],
        "common_traps": [
            {
                "trap": "Reading Every Word (閱讀強迫症)",
                "description": "Treating a 1,000-word DSE text like a novel.",
                "solution_zh": "練習「跳讀」。在尋找特定答案時，有意識地忽視與關鍵詞無關的句子。"
            },
            {
                "trap": "Scanning for the Wrong Word (關鍵詞失誤)",
                "description": "Scanning for a word that the author has paraphrased in the text.",
                "solution_zh": "不要只找題目出現的字，也要找它的同義詞 (Synonyms)."
            }
        ],
        "pro_tips_en": [
            "The T-S-C Method: Read the Title, Subheadings, and Captions first to prime your brain.",
            "Use Your Finger: Physically moving your finger or pen under the line helps maintain focus during high-speed scanning.",
            "Identify Signposts: Words like 'However,' 'Therefore,' or 'In contrast' tell you when the 'gist' is changing direction."
        ]
    }
};

async function seed() {
    console.log('Seeding Skimming & Scanning guide...');
    try {
        await db.collection('micro_skill_landing').doc('reading_skimmingScanning').set(skimmingScanningData);
        console.log('Successfully seeded Skimming & Scanning guide to micro_skill_landing/reading_skimmingScanning');
    } catch (error) {
        console.error('Error seeding guide:', error);
    }
}

seed();
