const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();
const AIService = require('../services/GenerativeAIService');

const CONFIG = {
    'Level 5': { name: 'HKDSE Level 5 (Strong)', count: 12 },
    'Level 7': { name: 'HKDSE Level 5** (Mastery)', count: 12 }
};

const READING_TOPICS = [
    'Literal Comprehension', 'Inference', 'Main Idea Identification', 
    'Detail Recognition', 'Sequencing', 'Synthesis', 'Fact vs Opinion', 
    'Author\'s Purpose', 'Tone & Attitude', 'Register & Style', 
    'Metaphorical Language', 'Text Organisation', 'Skimming & Scanning', 
    'Paraphrasing', 'Cohesion & Reference'
];

async function augmentBank() {
    console.log('🚀 Starting Curriculum Augmentation (Goal: All L5/L7 topics reaching 12 questions)...\n');

    for (const topicName of READING_TOPICS) {
        for (const [levelKey, cfg] of Object.entries(CONFIG)) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topicName)
                .where('level', '==', cfg.name)
                .get();

            if (snapshot.size > 0 && snapshot.size < 12) {
                const existingDocs = snapshot.docs.map(d => d.data());
                const passage = existingDocs[0].passage;
                const currentCount = snapshot.size;
                const needed = 12 - currentCount;

                console.log(`📍 Augmenting "${topicName}" [${levelKey}]: ${currentCount} -> 12 (Need ${needed} more)`);

                const existingQuestions = existingDocs.map((d, i) => `${i+1}. ${d.question}`).join('\n');

                const prompt = `You are an expert HKDSE English Language curriculum designer.
                
Attached is a Reading passage and a set of ${currentCount} existing questions for DSE ${levelKey}.
Your task is to generate exactly ${needed} ADDITIONAL questions that follow the same HKDSE standard.

PASSAGE:
${passage}

EXISTING QUESTIONS (DO NOT REPEAT THESE TOPICS OR CONCEPTS):
${existingQuestions}

INSTRUCTIONS:
1. Generate exactly ${needed} unique multiple-choice questions (MCQs).
2. Every question must have exactly 4 options (A, B, C, D) and exactly one correct answer.
3. Response must be in valid JSON format with a "questions" array holding the objects.

JSON Structure:
{
  "questions": [
    {
      "question": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A",
      "explanation": "Why this is correct...",
      "skills": ["reading_inference"]
    }
  ]
}`;

                try {
                    const result = await AIService.generateJson(prompt, { model: 'ace-it-pro' });
                    // Handle the wrapper from GenerativeAIService.js
                    const innerData = result.data || result;
                    const newQuestions = innerData.questions || (Array.isArray(innerData) ? innerData : []);

                    if (newQuestions.length > 0) {
                        const batch = db.batch();
                        newQuestions.slice(0, needed).forEach(q => {
                            const docRef = db.collection('question_bank').doc();
                            batch.set(docRef, {
                                ...q,
                                topic: topicName,
                                level: cfg.name,
                                passage: passage,
                                is_approved: true,
                                type: 'reading_mission',
                                created_at: admin.firestore.FieldValue.serverTimestamp()
                            });
                        });
                        await batch.commit();
                        console.log(`  ✅ Added ${newQuestions.length} supplementary questions.`);
                    } else {
                        console.warn(`  ⚠️  AI returned empty questions for ${topicName}. Result was:`, JSON.stringify(result).substring(0, 100));
                    }
                } catch (err) {
                    console.error(`  ❌ Failed to augment ${topicName}:`, err.message);
                }
            }
        }
    }

    console.log('\n🏁 Augmentation Complete.');
    process.exit(0);
}

augmentBank().catch(console.error);
