const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models...");
        // Note: listModels is on the genAI instance in newer versions, 
        // but it might be slightly different depending on the package version.
        // Actually, the standard way in @google/generative-ai is usually just trying models 
        // or using the discovery service if available, but let's try the listModels if it exists.

        // If listModels doesn't exist, we'll try common Pro variants.
        const variants = [
            "gemini-1.5-pro",
            "gemini-1.5-pro-002",
            "gemini-1.5-pro-latest",
            "gemini-1.5-flash",
            "gemini-1.5-flash-002",
            "gemini-2.0-flash",
            "gemini-2.0-flash-exp",
            "gemini-2.0-pro-exp"
        ];

        let output = "--- Probing Model Variants ---\n";
        for (const m of variants) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("hello");
                await result.response;
                output += `✅ ${m} is AVAILABLE\n`;
            } catch (e) {
                output += `❌ ${m} FAILED: ${e.message.split('\n')[0]}\n`;
            }
        }
        fs.writeFileSync('model_discovery.txt', output, 'utf8');
        console.log("Discovery complete. See model_discovery.txt");
    } catch (error) {
        console.error("Critical error listing models:", error);
    }
}

listAllModels();
