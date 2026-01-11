const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testSDK() {
    console.log("Testing SDK Chat...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    try {
        console.log("Sending message to gemini-2.0-flash...");
        const result = await model.generateContent("Hello friend");
        const response = result.response;
        const text = response.text();
        console.log("SUCCESS:", text);
    } catch (error) {
        console.error("SDK FAILURE DETAILS:");
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("Status:", error.status);
        if (error.response) {
            console.error("Response:", await error.response.text());
        }

        // Check if 404
        if (error.message.includes("404")) {
            console.log("Diagnosis: Model not found or API endpoint mismatch.");
        }
    }
}

testSDK();
