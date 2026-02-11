
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Analyze the importance of DSE for Hong Kong students in one sentence.");
        console.log(`✅ ${modelName} Success:`, result.response.text().trim());
        return true;
    } catch (e) {
        console.error(`❌ ${modelName} Failed:`, e.message);
        return false;
    }
}

async function run() {
    console.log("--- AI PRO Model Test ---");
    await testModel('gemini-pro-latest');
    await testModel('gemini-1.5-pro-latest');
}

run();
