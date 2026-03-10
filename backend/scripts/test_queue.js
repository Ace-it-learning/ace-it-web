const AIService = require('../services/GenerativeAIService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testQueue() {
    console.log("--- Testing Standard Queue (Flash) ---");
    try {
        const result = await AIService.generateContent("Say hello", { model: "gemini-2.0-flash" });
        console.log("Flash Success:", result.response.text());
    } catch (e) {
        console.error("Flash Error:", e.message);
    }

    console.log("\n--- Testing Premium Queue (Pro) ---");
    try {
        const result = await AIService.generateContent("Say hello pro", { model: "gemini-1.5-pro" });
        console.log("Pro Success:", result.response.text());
    } catch (e) {
        console.error("Pro Error:", e.message);
    }
}

testQueue();
