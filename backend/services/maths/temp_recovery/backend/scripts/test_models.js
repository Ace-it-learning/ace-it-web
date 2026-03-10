const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash",
        "gemini-pro"
    ];

    console.log("--- Testing Models ---");
    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'hello'");
            const response = await result.response;
            console.log(`✅ ${modelName} works! Response: ${response.text().trim()}`);
        } catch (error) {
            console.log(`❌ ${modelName} failed: ${error.message}`);
        }
    }
}

testModels();
