const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { JOURNALIST_PROMPT_TEMPLATE } = require('../prompts/journalistAgent');

const GEN_AI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
const MODEL_NAME = "gemini-2.0-flash-exp";

const OUTPUT_DIR = path.join(__dirname, '..', 'generated_mocks');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const generateRawText = async (topic) => {
    console.log(`[Journalist] Generating Raw Text for: "${topic}"...`);

    // Using Module 3 Prompt Logic
    const searchContext = `(Simulated Search Context: Recent real-world news about ${topic})`;
    const prompt = JOURNALIST_PROMPT_TEMPLATE.replace('{{TOPIC}}', `${topic} ${searchContext}`);

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json" }
    });

    try {
        const result = await model.generateContent(prompt);
        const responseJson = JSON.parse(result.response.text());

        // Format as Readable Text
        let outputText = `MOCK 001: ${topic.toUpperCase()}\n`;
        outputText += `Generated At: ${new Date().toISOString()}\n`;
        outputText += `=================================================\n\n`;

        // Text 1
        const t1 = responseJson.Text_1;
        outputText += `[TEXT 1] (${t1.metadata.genre} - ${t1.metadata.word_count} words)\n`;
        outputText += `TITLE: ${t1.title}\n`;
        outputText += `SUBHEADING: ${t1.subheading}\n`;
        outputText += `\n${Object.values(t1.content).join('\n\n')}\n`;
        outputText += `\n-------------------------------------------------\n\n`;

        // Text 2
        const t2 = responseJson.Text_2;
        outputText += `[TEXT 2] (${t2.metadata.genre} - ${t2.metadata.word_count} words)\n`;
        outputText += `TITLE: ${t2.title}\n`;
        outputText += `SUBHEADING: ${t2.subheading}\n`;
        outputText += `\n${Object.values(t2.content).join('\n\n')}\n`;
        outputText += `=================================================\n`;

        const filename = `Mock001_Bamboo_Scaffolding_Raw.txt`;
        const filePath = path.join(OUTPUT_DIR, filename);

        fs.writeFileSync(filePath, outputText);
        console.log(`✅ Raw Text Saved to: ${filePath}`);

    } catch (error) {
        console.error("❌ Generation Failed:", error);
    }
};

generateRawText("Bamboo Scaffolding");
