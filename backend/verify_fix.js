
const GenerativeAIService = require('./services/GenerativeAIService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyFallback() {
    console.log("--- Integrated Fallback Verification ---");

    // 1. Test Tier Pro (Should use gemini-pro-latest)
    console.log("\n[Test 1] Testing Tier Pro (Intelligence Task)...");
    try {
        const result = await GenerativeAIService.generateContent("Explain HKDSE in 5 words.", { model: "gemini-pro-latest" });
        console.log("✅ Pro Model Response:", result.response.text().trim());
    } catch (e) {
        console.error("❌ Pro Model Test Failed:", e.message);
    }

    // 2. Test Fallback (Should survive a 429 if it happens, or just work via the verified queue)
    console.log("\n[Test 2] Testing Fallback Queue (Routine Task)...");
    try {
        // We simulate a routine task which normally uses 2.0-flash
        const result = await GenerativeAIService.generateContent("Hello!", { model: "gemini-2.0-flash" });
        console.log("✅ Response:", result.response.text().trim());
    } catch (e) {
        console.error("❌ Fallback Queue Test Failed:", e.message);
    }
}

verifyFallback();
