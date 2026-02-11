// Save models list to JSON file for easy reading
require('dotenv').config();
const fs = require('fs');

async function saveModelsList() {
    const apiKey = process.env.GOOGLE_API_KEY;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        const data = await response.json();

        // Save full response
        fs.writeFileSync('models_full.json', JSON.stringify(data, null, 2));

        // Create a simple list
        if (data.models) {
            const modelList = data.models.map(m => ({
                name: m.name,
                displayName: m.displayName,
                methods: m.supportedGenerationMethods
            }));

            fs.writeFileSync('models_simple.json', JSON.stringify(modelList, null, 2));

            console.log('✅ Saved to models_simple.json');
            console.log(`\nFound ${modelList.length} models:`);
            modelList.forEach(m => {
                console.log(`- ${m.name}`);
                if (m.methods && m.methods.includes('generateContent')) {
                    console.log(`  ✓ Supports generateContent`);
                }
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

saveModelsList();
