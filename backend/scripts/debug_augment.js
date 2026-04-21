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
};

async function debugAugment() {
    const topicName = 'Inference';
    const cfg = CONFIG['Level 5'];

    console.log(`🚀 DEBUG: Augmenting "Inference" [Level 5]`);

    const snapshot = await db.collection('question_bank')
        .where('topic', '==', topicName)
        .where('level', '==', cfg.name)
        .get();

    const existingDocs = snapshot.docs.map(d => d.data());
    const passage = existingDocs[0].passage;
    const existingQuestions = existingDocs.map((d, i) => `${i+1}. ${d.question}`).join('\n');

    const prompt = `PASSAGE:\n${passage}\n\nEXISTING QUESTIONS:\n${existingQuestions}\n\nGenerate exactly 4 ADDITIONAL questions for this passage in JSON format like {"questions": [...]}.`;

    const result = await AIService.generateJson(prompt, { model: 'ace-it-pro' });
    console.log('DEBUG AI RESULT:', JSON.stringify(result, null, 2));
    
    process.exit(0);
}

debugAugment().catch(console.error);
