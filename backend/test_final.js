// Final test with correct model name
require('dotenv').config();

async function finalTest() {
    console.log('🧪 Final test with models/gemini-2.5-flash\n');

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: "Calculate 2+2 and respond in JSON format with a 'result' field." }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        console.log('✅ SUCCESS!');
        console.log('Response:', result.response.text());
        console.log('\n🎉 AI grading service is now ready!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

finalTest();
