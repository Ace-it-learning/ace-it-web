// Test multiple model names to find which one works
require('dotenv').config();

async function testMultipleModels() {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    for (const modelName of modelsToTest) {
        console.log(`\n🧪 Testing: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: "Say 'hello' in JSON format with a 'message' field." }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            console.log(`✅ SUCCESS with ${modelName}!`);
            console.log('Response:', result.response.text());
            console.log(`\n🎯 USE THIS MODEL: ${modelName}`);
            break;

        } catch (error) {
            console.log(`❌ Failed: ${error.message.substring(0, 100)}...`);
        }
    }
}

testMultipleModels();
