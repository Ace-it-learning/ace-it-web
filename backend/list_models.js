const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Note: The SDK doesn't have a direct listModels method on the client instance in some versions,
        // but we can try the model manager if available, or fallback to REST if SDK is limited.
        // Actually, the error message in previous steps said: "Call ListModels to see..." which implies an endpoint.

        // Let's stick to the REST API but use standard fetch with better logging
        const apiKey = process.env.GOOGLE_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("--- START MODEL LIST ---");
            const geminiModels = data.models.filter(m => m.name.includes('gemini-2.0')).map(m => m.name).slice(0, 10);
            console.log(JSON.stringify(geminiModels, null, 2));
            console.log("--- END MODEL LIST ---");
        } else {
            console.log("No models found or error:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("List failed:", error);
    }
}

listModels();
