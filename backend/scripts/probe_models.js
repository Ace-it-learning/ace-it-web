const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function probe() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Probing different variants
    const names = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log("--- PROBING MODELS ---");
    for (const name of names) {
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("hi");
            console.log(`[OK] ${name}`);
        } catch (e) {
            console.log(`[FAIL] ${name}: ${e.message.substring(0, 150)}`);
        }
    }
}

probe();
