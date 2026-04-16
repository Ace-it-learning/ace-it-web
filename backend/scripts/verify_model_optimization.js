const GenerativeAIService = require('../services/GenerativeAIService');
require('dotenv').config();

async function verifyOptimization() {
    console.log("--- 🧪 AI Model Optimization Verification ---");
    
    const testCases = [
        { name: "Ace-it Flash Alias", model: "ace-it-flash", prompt: "Say 'Flash OK'" },
        { name: "Ace-it Pro Alias", model: "ace-it-pro", prompt: "Say 'Pro OK'" },
        { name: "Math Lab Optimised (Flash)", model: "ace-it-flash", prompt: "Simple math: 2+2?" },
        { name: "Math Assessment (Pro)", model: "ace-it-pro", prompt: "Briefly explain the role of a DSE marker." }
    ];

    for (const test of testCases) {
        try {
            console.log(`\n[Test] ${test.name} (Requested: ${test.model})...`);
            const result = await GenerativeAIService.generateContent(test.prompt, { model: test.model });
            const text = result.response.text();
            console.log(`[Result] Response: ${text.trim()}`);
            console.log(`[Status] ✅ PASS`);
        } catch (err) {
            console.error(`[Result] ❌ FAIL: ${err.message}`);
        }
    }

    console.log("\n--- 🧠 Context Caching Hook Check ---");
    try {
        console.log("[Test] Caching Param Parsing...");
        // This won't actually hit Vertex cache unless in PROD, but tests the config parsing
        const model = await GenerativeAIService.getModel({ 
            model: "ace-it-flash", 
            cachedContent: "projects/fake/locations/fake/cachedContents/123" 
        });
        console.log("[Status] ✅ getModel handles cachedContent without crashing.");
    } catch (err) {
        console.error(`[Status] ❌ FAIL: ${err.message}`);
    }

    process.exit(0);
}

verifyOptimization();
