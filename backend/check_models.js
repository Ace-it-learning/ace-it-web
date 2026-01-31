const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const variations = [
        { m: "gemini-1.5-pro", v: "v1beta" },
        { m: "gemini-1.5-pro-001", v: "v1beta" },
        { m: "gemini-1.5-pro-002", v: "v1beta" },
        { m: "gemini-pro-1.5", v: "v1beta" },
        { m: "gemini-2.0-pro-exp-02-05", v: "v1beta" },
        { m: "gemini-2.0-pro-exp", v: "v1beta" },
        { m: "gemini-1.5-flash-8b", v: "v1beta" },
        { m: "gemini-1.5-flash-8b-latest", v: "v1beta" },
        { m: "gemini-2.0-flash-exp", v: "v1beta" },
        { m: "gemini-1.5-flash", v: "v1beta" }
    ];

    console.log("--- Exhaustive Pro Test ---");
    for (const v of variations) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: v.m }, { apiVersion: v.v });
            await model.generateContent("hi");
            console.log(`✅ ${v.m}: AVAILABLE`);
        } catch (e) {
            console.log(`❌ ${v.m}: FAILED (${e.message.substring(0, 100)})`);
        }
    }
}

listModels();
