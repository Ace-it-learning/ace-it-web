const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function probe() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Probing different variants
    const names = [
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
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
