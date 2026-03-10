const fetch = require('node-fetch');

const themes = [
    "Technology in Education",
    "Environmental Protection",
    "Mental Health Awareness",
    "Part-time Jobs for Students",
    "Pop Culture Impacts",
    "Benefits of Sports",
    "Artificial Intelligence Ethics",
    "Tourism in Hong Kong",
    "E-learning vs Face-to-Face",
    "Healthy Eating Habits"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generate() {
    console.log("Starting Batch Generation...");
    for (const theme of themes) {
        try {
            console.log(`Generating: ${theme}...`);
            const res = await fetch('http://localhost:3001/api/speaking/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme })
            });
            const data = await res.json();
            console.log(data);
            await sleep(5000); // 5s delay to avoid quota hit
        } catch (e) {
            console.error("Failed:", e.message);
        }
    }
    console.log("Done!");
}

generate();
