const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function debugAIStudio() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log('Using API Key starts with:', apiKey.substring(0, 10));
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        const result = await model.generateContent("Say 'hello' once.");
        console.log('AI Studio Response:', result.response.text());
    } catch (e) {
        console.error('AI Studio Debug Failed:', e.message);
    }
}

debugAIStudio();
