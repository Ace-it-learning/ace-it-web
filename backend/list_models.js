const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");

    try {
        // Direct REST fetch to avoid SDK abstraction obscuring the error
        const key = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);

        console.log("Status:", response.status, response.statusText);

        if (!response.ok) {
            const text = await response.text();
            console.error("API Error Body:", text);
            return;
        }

        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models returned in list.");
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listModels();
