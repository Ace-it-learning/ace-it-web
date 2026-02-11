
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello.");
        console.log(`✅ ${modelName} Success:`, result.response.text().trim());
        return true;
    } catch (e) {
        console.error(`❌ ${modelName} Failed:`, e.message);
        return false;
    }
}

async function run() {
    console.log("--- AI Model Connectivity Test (Round 3) ---");
    const candidates = [
        'gemini-2.0-flash-lite',
        'gemini-flash-latest',
        'gemini-2.5-flash'
    ];

    for (const model of candidates) {
        await testModel(model);
        await new Promise(r => setTimeout(r, 1000));
    }
}

run();
