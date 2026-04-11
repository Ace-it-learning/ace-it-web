const GenerativeAIService = require('../services/GenerativeAIService');
const genrePrompts = require('../data/genre_prompts.json');
const fs = require('fs');
const path = require('path');

async function generateLibrary() {
    const library = {};
    const scenarios = [];

    // Flatten all scenarios
    Object.keys(genrePrompts.prompts).forEach(genre => {
        genrePrompts.prompts[genre].forEach(p => {
            scenarios.push({ ...p, genre });
        });
    });

    console.log(`[CheatGen] Total Scenarios to process: ${scenarios.length}`);

    for (const scenario of scenarios) {
        console.log(`[CheatGen] Processing: ${scenario.title} (${scenario.id})`);
        library[scenario.id] = {};

        const levels = ['4', '5', '5**'];

        for (const level of levels) {
            console.log(`  - Generating Level ${level}...`);
            
            const prompt = `
                Role: Senior HKDSE English Writing Marker (Expert).
                Task: Write a full writing piece for the following prompt at a Level ${level} standard.
                
                Topic: ${scenario.title}
                Genre: ${scenario.genre}
                Prompt Message: "${scenario.prompt}"
                
                LEVEL GUIDELINES (HKDSE):
                ${level === '5**' ? 'Elite excellence. Sophisticated vocabulary, complex and varied sentence structures (inversion, subjunctive), impeccable logic, and engaging tone. 450+ words.' : ''}
                ${level === '5' ? 'Strong performance. Good range of vocabulary and structures with high accuracy. Clear and logical development. 400+ words.' : ''}
                ${level === '4' ? 'Solid standard. Clear and mostly accurate. Vocabulary is appropriate but less sophisticated. Logical structure but maybe mechanical transitions. 350+ words.' : ''}
                
                Output JSON Format:
                {
                    "essay_content": "The full text of the essay here..."
                }
            `;

            try {
                // Using 2.0 Flash for speed and robustness
                const result = await GenerativeAIService.generateJson(prompt, { model: 'gemini-2.0-flash' }); 
                library[scenario.id][level] = result.data.essay_content;
                console.log(`    DONE.`);
            } catch (err) {
                console.error(`    FAILED Level ${level}:`, err.message);
                library[scenario.id][level] = `Error: Generation failed for ${scenario.id} at level ${level}.`;
            }
            
            // Wait slightly to avoid rate limit
            await new Promise(r => setTimeout(r, 2000));
        }

        // Save progress after each scenario to avoid total loss on failure
        fs.writeFileSync(
            path.join(__dirname, '../data/writing_cheat_library.json'), 
            JSON.stringify(library, null, 2)
        );
    }

    console.log("[CheatGen] Generation Complete! Library saved to backend/data/writing_cheat_library.json");
}

generateLibrary().catch(console.error);
