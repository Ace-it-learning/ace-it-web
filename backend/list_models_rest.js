
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log(`Fetching models from: ${url.replace(key, 'HIDDEN')}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        console.log("\n--- Available Models ---");
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                    console.log(`  Supported: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log("No models found in response.");
        }
    } catch (e) {
        console.error("List Models Failed:", e.message);
    }
}

listModels();
