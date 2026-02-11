const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching models...");
        // Note: listModels is not directly on genAI in all versions, 
        // sometimes it's a separate method or needs a raw fetch.
        // In @google/generative-ai, there isn't a direct listModels yet usually.
        // We can try to just test a few names.

        const models = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-2.0-flash-exp",
            "gemini-1.0-pro"
        ];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("test");
                console.log(`✅ Model "${modelName}" is AVAILABLE.`);
            } catch (e) {
                console.log(`❌ Model "${modelName}" is NOT available. Error: ${e.message.substring(0, 100)}`);
            }
        }
    } catch (err) {
        console.error("List failed:", err);
    }
}

listModels();
