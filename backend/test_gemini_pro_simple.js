require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testSimple() {
    console.log("Testing gemini-2.5-pro connectivity...");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }, { timeout: 30000 });

    try {
        const result = await model.generateContent("Hello, are you online?");
        console.log("Response:", result.response.text());
        console.log("✅ Success!");
    } catch (e) {
        console.error("❌ Failed:", e.message);
        console.error("Cause:", e.cause);
    }
}

testSimple();
