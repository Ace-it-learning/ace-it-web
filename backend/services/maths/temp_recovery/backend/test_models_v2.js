const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API key");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);

    const modelsToTest = ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-pro-latest"];

    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            console.log(`✅ ${modelName} works: ${result.response.text().substring(0, 20)}`);
        } catch (e) {
            console.error(`❌ ${modelName} failed: ${e.message}`);
        }
    }
}

testModels();
