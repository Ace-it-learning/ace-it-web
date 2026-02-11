const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testModels() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "FOUND" : "NOT FOUND");
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash-latest"
    ];

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await Promise.race([
                model.generateContent("Say 'hello'"),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 10s")), 10000))
            ]);
            console.log(`✅ ${modelName}: SUCCESS`);
        } catch (e) {
            console.log(`❌ ${modelName}: FAILED - ${e.message}`);
        }
    }
}

testModels();
