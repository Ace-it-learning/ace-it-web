const AIService = require('./backend/services/GenerativeAIService');

async function testPro() {
    console.log("Testing AIService with 'ace-it-pro'...");
    try {
        const result = await AIService.generateContent("Hello, respond with ONE word: SUCCESS.", {
            model: "ace-it-pro"
        });
        console.log("Result:", result.response.text());
        console.log("Used Model:", result.usedModel);
    } catch (e) {
        console.error("FAILED:", e.message);
    }
}

testPro();
