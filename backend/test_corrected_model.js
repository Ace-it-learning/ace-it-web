// Test with corrected model name
require('dotenv').config();

async function testCorrectedModel() {
    console.log('🧪 Testing with corrected model name...\n');

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        console.log('⏳ Testing model: gemini-1.5-flash');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: "Calculate 2+2 and respond in JSON format with a 'result' field." }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        console.log('✅ SUCCESS! Response:', result.response.text());

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCorrectedModel();
