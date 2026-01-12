require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
    console.log("Testing Gemini API Connection...");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY is missing in .env file");
        return;
    }
    console.log(`API Key found: ${apiKey.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    try {
        console.log("Attempting to generate content...");
        const result = await model.generateContent("Hello, are you online?");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("Connection Failed!");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testConnection();
