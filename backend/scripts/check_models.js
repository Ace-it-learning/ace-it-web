const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs');

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        fs.writeFileSync('models.txt', 'No API Key found!');
        return;
    }

    try {
        const fetch = require('node-fetch');
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        let output = '';
        if (data.models) {
            output += 'Available Models:\n';
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    output += `- ${m.name} (ver: ${m.version}) [Methods: ${m.supportedGenerationMethods}]\n`;
                }
            });
        } else {
            output += 'Error/No models: ' + JSON.stringify(data);
        }
        fs.writeFileSync('models.txt', output);
        console.log('Written to models.txt');

    } catch (error) {
        fs.writeFileSync('models.txt', 'Error: ' + error.message);
    }
}

listModels();
