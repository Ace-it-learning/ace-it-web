const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const GenerativeAIService = require('../services/GenerativeAIService');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const TOPIC_ID = 'math_num_percentages';
const TOPIC_NAME = 'Percentages & Interest';

const SPECS = [
    { level: 'HKDSE Level 3 (Adequate)', count: 5, prompt: 'Easy foundation questions on basic percentages, percentage change, and simple discounts.' },
    { level: 'HKDSE Level 4 (Developing)', count: 5, prompt: 'Intermediate questions on successive percentage change and simple interest.' },
    { level: 'HKDSE Level 5 (Strong)', count: 10, prompt: 'DSE Standard Section A2 questions on compound interest (compounded monthly/quarterly), growth/decay, and taxation.' },
    { level: 'HKDSE Level 5** (Mastery)', count: 10, prompt: 'Elite Section B questions combining compound interest with logs, algebra, or multi-step variations.' }
];

async function generateMath() {
    console.log(`--- GENERATING MATH: ${TOPIC_NAME} ---`);

    for (const spec of SPECS) {
        console.log(`Generating ${spec.count} questions for Level: ${spec.level}...`);
        
        for (let i = 0; i < spec.count; i++) {
            const prompt = `Generate a high-quality HKDSE Mathematics question for the topic "${TOPIC_NAME}".
Difficulty Level: ${spec.level}
Context: ${spec.prompt}

Return ONLY a JSON object compatible with the following format:
{
  "topic": "${TOPIC_NAME}",
  "topic_id": "${TOPIC_ID}",
  "level": "${spec.level}",
  "question": "The question text (English)...",
  "options": ["A", "B", "C", "D"],
  "answer": "A",
  "explanation": "Step-by-step logic in English...",
  "is_approved": true,
  "is_premium": true,
  "area": "Number & Algebra"
}`;

            try {
                // Use ace-it-pro for the best accuracy in Math
                const result = await GenerativeAIService.generateContent(prompt, {
                    model: "ace-it-pro",
                    generationConfig: { responseMimeType: "application/json" }
                });
                
                let text = result.response.text().trim();
                // Basic cleanup if needed
                if (text.startsWith('```')) {
                    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                }
                
                const qData = JSON.parse(text);
                
                await db.collection('question_bank').add({
                    ...qData,
                    created_at: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`  [OK] Saved question ${i+1}/${spec.count} for ${spec.level}`);
                
                // Rate limiting protection
                await new Promise(r => setTimeout(r, 2000));
            } catch (e) {
                console.error(`  [FAIL] Error generating question ${i+1}:`, e.message);
                // Pause longer on error
                await new Promise(r => setTimeout(r, 10000));
                i--; // Retry
            }
        }
    }
    console.log('=== MATH GENERATION COMPLETE ===');
    process.exit(0);
}

generateMath().catch(console.error);
