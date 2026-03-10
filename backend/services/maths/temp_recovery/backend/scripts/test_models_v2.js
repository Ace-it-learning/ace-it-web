const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
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
        "gemini-2.0-pro-exp"
    ];

    let output = "--- Testing Models ---\n";
    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'hello'");
            const response = await result.response;
            const text = response.text().trim();
            output += `✅ ${modelName} works! Response: ${text}\n`;
        } catch (error) {
            output += `❌ ${modelName} failed: ${error.message}\n`;
        }
    }
    fs.writeFileSync('model_test_results.txt', output, 'utf8');
    console.log("Results written to model_test_results.txt");
}

testModels().catch(console.error);
