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

        ### THEME SPECIFICS (${theme}):
        - Part A: Registration for a Digital Literacy Workshop, Dr. Karen Choi presentation on Silver Surfers, Panel on Digital Deserts, Radio interview on Smart Health app.
        - Part B: The NGO "Digital Bridge" is dealing with "Generational Bridging". Task 8 is a letter to the Bureau Chief, Task 9 is an internal memo, Task 10 is a social media post.

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
        
        // Sync to Documents as well
        const docPath = path.join('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening', fileName);
        fs.writeFileSync(docPath, JSON.stringify(mockData, null, 2));
        
        return fileName;
    } catch (e) {
        console.error(`❌ Failed to regenerate ${theme}:`, e.message);
        return null;
    }
}

regeneratePremiumMock("Digital Literacy for All", "Bridging the generational gap in a digital-first government city.");
