// Test without responseMimeType to see if that's the issue
require('dotenv').config();

async function testWithoutJsonMode() {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-pro"
    ];

    for (const modelName of modelsToTest) {
        console.log(`\n🧪 Testing: ${modelName} (without JSON mode)`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            // Test WITHOUT responseMimeType
            const result = await model.generateContent("Say hello");

            console.log(`✅ SUCCESS with ${modelName}!`);
            console.log('Response:', result.response.text());

            // Now test WITH JSON mode
            console.log(`\n🧪 Testing: ${modelName} (WITH JSON mode)`);
            const jsonResult = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: "Respond with JSON: {\"message\": \"hello\"}" }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            console.log(`✅ JSON mode also works!`);
            console.log('JSON Response:', jsonResult.response.text());
            console.log(`\n🎯 WORKING MODEL: ${modelName}`);
            break;

        } catch (error) {
            console.log(`❌ Failed: ${error.message.substring(0, 150)}`);
        }
    }
}

testWithoutJsonMode();
