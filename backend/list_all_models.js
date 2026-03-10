const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5));

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        console.log("Available Models:");
        response.data.models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
            console.log(`  Supported Methods: ${m.supportedGenerationMethods.join(', ')}`);
        });
    } catch (e) {
        if (e.response) {
            console.error("Error Response:", e.response.status, e.response.data);
        } else {
            console.error("Error Message:", e.message);
        }
    }
}

listModels();
