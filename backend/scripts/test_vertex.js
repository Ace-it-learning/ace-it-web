const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testVertex() {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '../serviceAccountKey.json');
    const project = 'ace-it-learning';
    const location = 'asia-east2'; // HK Region

    console.log(`Connecting to Vertex AI: Project=${project}, Location=${location}`);

    try {
        const vertex = new VertexAI({ project, location });
        const model = vertex.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log("Calling generateContent on Vertex...");
        const result = await model.generateContent("Say hello");
        console.log("Vertex Success!");
        console.log("Response text:", result.response.candidates[0].content.parts[0].text);
    } catch (e) {
        console.error("--- Vertex Error Detail ---");
        console.error("Message:", e.message);
        if (e.response) {
            console.error("Response Details:", JSON.stringify(e.response, null, 2));
        }
    }
}

testVertex();
