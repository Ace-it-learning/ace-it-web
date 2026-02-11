const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        const msg = `[SUCCESS] ${modelName}: ${response.text()}\n`;
        console.log(msg);
        fs.appendFileSync('test_output.txt', msg);
        return true;
    } catch (error) {
        const msg = `[FAILED] ${modelName}: ${error.message}\n`;
        console.error(msg);
        fs.appendFileSync('test_output.txt', msg);
        return false;
    }
}

async function run() {
    console.log("Checking API Key:", process.env.GOOGLE_API_KEY ? "Present" : "Missing");

    await testModel("gemini-2.5-flash");
    await testModel("models/gemini-2.5-flash");
    await testModel("gemini-2.0-flash");
}

run();
