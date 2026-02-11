// Enhanced test script with full error logging
require('dotenv').config();
const fs = require('fs');

async function testAIDirectly() {
    console.log('🧪 Testing Google AI API directly...\n');

    if (!process.env.GOOGLE_API_KEY) {
        console.error('❌ GOOGLE_API_KEY not found!');
        return;
    }

    console.log('✅ API Key found:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...');

    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        console.log('\n⏳ Creating model instance...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

        console.log('✅ Model created');
        console.log('\n⏳ Sending test prompt...');

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: "What is 2+2?" }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        console.log('✅ Response received!');
        console.log('\nResponse:', result.response.text());

    } catch (error) {
        console.error('\n❌ ERROR DETAILS:');
        console.error('Type:', error.constructor.name);
        console.error('Message:', error.message);
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('\nFull error object:', JSON.stringify(error, null, 2));
        console.error('\nStack:', error.stack);

        // Write to file for complete details
        fs.writeFileSync('error_log.txt', JSON.stringify({
            type: error.constructor.name,
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            stack: error.stack,
            fullError: error
        }, null, 2));

        console.log('\n📝 Full error written to error_log.txt');
    }
}

testAIDirectly();
