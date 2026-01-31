const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function listModelsRest() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    try {
        console.log("Fetching models list from REST API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName}) | Supports: ${m.supportedGenerationMethods.join(', ')}`);
            });
            require('fs').writeFileSync('api_models_list.json', JSON.stringify(data, null, 2));
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModelsRest();
