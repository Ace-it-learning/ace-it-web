const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testV1Forced() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log("Testing with FORCED API Version: v1");

    // Pass the apiVersion in the constructor options
    const genAI = new GoogleGenerativeAI(apiKey);

    // In some SDK versions, it's passed differently or not supported. 
    // Let's try raw fetch if this fails.
    const names = ["gemini-1.5-flash", "gemini-1.5-pro"];

    for (const name of names) {
        try {
            const model = genAI.getGenerativeModel({ model: name }, { apiVersion: 'v1' });
            const result = await model.generateContent("hi");
            console.log(`[v1 FORCED OK] ${name}`);
        } catch (e) {
            console.log(`[v1 FORCED FAIL] ${name}: ${e.message}`);
        }
    }
}

testV1Forced();
