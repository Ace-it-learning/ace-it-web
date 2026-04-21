const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, './backend/.env') });

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");
    if (!apiKey) return;
    
    try {
        // List models via v1beta using raw fetch
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("API ERROR:", data.error.message);
            return;
        }

        console.log("Available models (v1beta):");
        if (data.models) {
            data.models.forEach(m => console.log(` - ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log("No models returned.");
        }
    } catch (e) {
        console.error("List Models FAILED:", e.message);
    }
}

listModels();
