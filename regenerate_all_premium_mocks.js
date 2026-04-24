const fs = require('fs');
const path = require('path');
const GenerativeAIService = require('./backend/services/GenerativeAIService');

async function regeneratePremiumMock(theme, focus) {
    console.log(`\n💎 Regenerating PREMIUM Mock: ${theme}...`);
    
    await GenerativeAIService.init();
    
    const templatePath = path.join(__dirname, './backend/generated_mocks/listening/Listening_Smart_City_2026_FullMock.json');
    const template = fs.readFileSync(templatePath, 'utf8');

    const prompt = `
        You are a Master HKEAA HKDSE English Paper 3 Examiner.
        Your task is to generate a PREMIER, high-fidelity Mock Paper 3 JSON that is IDENTICAL in structure and quality to the provided template.

        THEME: ${theme}
        FOCUS: ${focus}

        ### MANDATORY ARCHITECTURAL RULES:
        1. SCHEMA: Must match the template exactly (e.g., "script" is an array of {speaker, text}, "data_file" is lowercase in Part_B).
        2. SCRIPT DEPTH: 
           - The script must be at least 100-150 lines of dialogue.
           - Include an "Integrated Skills Recording" (Briefing) at the end where the "Bureau Chief" or "Boss" gives instructions for Tasks 8, 9, and 10.
           - This briefing MUST contain "Audio-Only" points that are NOT in the Data Files.
        3. GRADING RUBRIC:
           - Each Task (5-10) MUST have a "grading_rubric" object.
           - "content_points" MUST explicitly reference sources (e.g., "Doc 1", "Audio").
           - Task 8, 9, and 10 MUST include content points that are ONLY from the Audio Briefing.
        4. DATA FILES:
           - 10 distinct Data Files (doc1 to doc10).
           - Mixture of minutes, brochures, emails, newspaper clippings, handwritten notes, tables, social media posts, and memos.
        5. STAMINA STRETCH: Text density must be high. Authentic HKEAA length.

        ### OUTPUT:
        Return ONLY the raw JSON object. NO markdown.
        
        ### REFERENCE TEMPLATE:
        ${template}
    `;

    try {
        const result = await GenerativeAIService.generateContent(prompt, {
            model: "ace-it-pro",
            responseMimeType: "application/json"
        });

        const jsonText = result.response.text();
        const mockData = JSON.parse(GenerativeAIService.extractJson(jsonText));
        
        // Finalize metadata
        if (!mockData.meta) mockData.meta = {};
        mockData.meta.title = `HKDSE Paper 3: ${theme} (Elite 2026 Edition)`;
        mockData.meta.topic = focus;
        
        const fileName = `Listening_${theme.replace(/\s+/g, '_')}_2026.json`;
        const outputPath = path.join(__dirname, './backend/generated_mocks/listening', fileName);
        
        fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
        console.log(`✅ Successfully REGENERATED PREMIUM: ${fileName}`);
        
        // Sync to Documents
        const docPath = path.join('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening', fileName);
        fs.writeFileSync(docPath, JSON.stringify(mockData, null, 2));
        
        return fileName;
    } catch (e) {
        console.error(`❌ Failed to regenerate ${theme}:`, e.message);
        return null;
    }
}

const remainingThemes = [
    { theme: "The Slashie Economy", focus: "Youth pursuing multiple careers; freedom vs. stability in HK." },
    { theme: "Heritage Revitalization", focus: "Turning old industrial buildings into Creative Hubs (like The Mills)." },
    { theme: "Sustainable Consumption", focus: "The Zero Waste movement and waste charging scheme impact in HK." },
    { theme: "Micro-Living and Wellbeing", focus: "Designing human-scale spaces in tiny apartments; mental health." },
    { theme: "The Future of Food", focus: "Vertical farming, lab-grown meat, and food security in HK." },
    { theme: "The Staycation Revolution", focus: "Modern tourism trends; glamping vs. traditional hotels in NT." },
    { theme: "The Experience Economy", focus: "Malls adding art and sports instead of just retail." },
    { theme: "The Right to Rest", focus: "Slow Living movement in a high-speed city; Third Places." }
];

async function runBatch() {
    for (const t of remainingThemes) {
        await regeneratePremiumMock(t.theme, t.focus);
        await new Promise(r => setTimeout(r, 15000));
    }
}

runBatch();
