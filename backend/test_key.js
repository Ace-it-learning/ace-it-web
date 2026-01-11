require('dotenv').config({ path: __dirname + '/.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("Checking Environment...");
    const key = process.env.GEMINI_API_KEY;
    console.log("Key length:", key ? key.length : "undefined");
    console.log("Key starts with:", key ? key.substring(0, 5) : "undefined");

    if (!key || key === "YOUR_API_KEY") {
        console.error("ERROR: Invalid Key in .env");
        return;
    }

    console.log("Initializing Gemini...");
    try {
        const genAI = new GoogleGenerativeAI(key);

        // List verified models
        /*
        console.log("Listing available models...");
        const modelList = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).name; 
        // SDK doesn't have direct listModels on client? 
        // Actually it does on the GoogleGenerativeAI instance manager but let's try a direct fetch if SDK is obscure
        */

        // Correct way in new SDK? 
        // Documentation says: 
        // const genAI = new GoogleGenerativeAI(API_KEY);
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Let's try to just hit the API with fetch to list models if SDK fails us, 
        // but actual SDK usage for listing models is not always exposed clearly in the simplified client.
        // However, let's try 'gemini-1.5-flash-001' or 'gemini-1.0-pro'

        const triedModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];

        for (const mName of triedModels) {
            console.log(`Trying model: ${mName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: mName });
                const result = await model.generateContent("Test");
                console.log(`SUCCESS: Working model found: ${mName}`);
                console.log("Response:", result.response.text());
                return; // Exit on first success
            } catch (e) {
                console.log(`Failed ${mName}: ${e.message}`);
            }
        }
        console.error("ALL MODELS FAILED.");

    } catch (error) {
        console.error("FATAL ERROR:", error);
        if (error.message.includes("API key not valid")) {
            console.error("CONCLUSION: The API Key is invalid.");
        }
    }
}

test();
