const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("No API key");

        const genAI = new GoogleGenerativeAI(apiKey);
        // The SDK might not expose a listModels method directly on genAI, 
        // we can fetch it via REST directly.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        const modelNames = data.models.map(m => m.name);
        console.log("AVAILABLE MODELS:\n", modelNames.filter(m => m.includes('pro')).join('\n'));
    } catch (e) {
        console.error("FAILED:", e.message);
    }
}
listModels();
