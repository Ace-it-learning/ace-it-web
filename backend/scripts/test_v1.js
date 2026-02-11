const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testV1() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Testing with API Version: v1");
    // Some SDK versions support apiVersion in config object
    const genAI = new GoogleGenerativeAI(apiKey);

    const names = ["gemini-1.5-flash", "gemini-1.5-pro"];

    for (const name of names) {
        try {
            // Note: Manual URL fetch might be safer to test v1 specifically
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("hi");
            console.log(`[v1beta SDK OK] ${name}`);
        } catch (e) {
            console.log(`[v1beta SDK FAIL] ${name}: ${e.message.substring(0, 100)}`);
        }
    }
}

testV1();
