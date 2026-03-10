const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verify() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        console.log("Checking API Key exists:", !!apiKey);
        if (!apiKey) throw new Error("API Key missing!");

        const genAI = new GoogleGenerativeAI(apiKey);

        // Test models including -latest variants which are often more stable in certain API versions
        const models = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest"
        ];

        for (const modelName of models) {
            console.log(`\n--- Testing Model: ${modelName} ---`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                console.log(`Calling generateContent for ${modelName}...`);
                const result = await model.generateContent("Say hello");
                console.log(`Result from ${modelName}:`, result.response.text());
            } catch (e) {
                console.error(`Error with ${modelName}:`, e.message);
                if (e.status) console.error(`Status: ${e.status}`);
            }
        }
        console.log("\nVerification complete.");
    } catch (err) {
        console.error("Verification failed:", err.message);
    }
}

verify();
