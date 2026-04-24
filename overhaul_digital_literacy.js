const fs = require('fs');
const path = require('path');
const GenerativeAIService = require('./backend/services/GenerativeAIService');

async function regenerateEliteOverhaul() {
    console.log(`\n🏛️  Executing FINAL ELITE OVERHAUL: Digital Literacy for All...`);
    
    await GenerativeAIService.init();
    
    const templatePath = path.join(__dirname, './backend/generated_mocks/listening/Listening_Smart_City_2026_FullMock.json');
    const template = fs.readFileSync(templatePath, 'utf8');

    const prompt = `
        You are a Master HKEAA HKDSE English Paper 3 Examiner. 
        Perform a "Paper 3 Elite Overhaul" on the "Digital Literacy for All" Mock JSON.
        Objective: Upgrade to 5** "Stamina Stretch" standards.

        ### 1. METADATA & SCORING:
        - total_marks_part_a: 50.
        - total_marks_part_b: 50.
        - Ensure Task 4 has exactly 12 questions (to reach 50 marks total in Part A).
        - GRADING LOGIC: In Section_B2 grading rubrics, add a note: "Deduct 0.5 marks for each instance of Irrelevant Content (copying non-task-related Data File info)."

        ### 2. SCRIPT "DEPTH & PADDING" (PHASE II - IV):
        - NATURALISM: Include "Um", "Let me think", "Actually, let me correct that", "If I remember correctly".
        - THE HKEAA TRAPS:
            - TASK 1 (Name/Number Trap): The staff initially mishears "Beatrice" (maybe writes "Beatrix") or swaps digits in the phone number. Beatrice MUST correct them.
            - TASK 2 (Number Blitz): Dr. Choi discusses 2018 (proposal), 2020 (funding), 2021 (pilot), and 2024 (official launch). The question asks for "Launch Year".
            - TASK 3 (Conflict/Agreement): Experts argue about the cost ($300M vs $500M) before settling on $400 Million.
        - SIGNPOSTING: Use clear transitions ("Now, moving away from...", "I almost forgot...").

        ### 3. PART B INTEGRATED SKILLS (STRESS TEST):
        - DATA FILE DENSITY: Must have exactly 11 Documents (doc1 to doc11).
        - doc1 to doc10: Must contain a mix of Minutes, Brochures, Emails, News Clips, Handwritten Notes, and Tables.
        - RED HERRING (Doc 11): Must be a "Staff Holiday Schedule" or "Cafeteria Menu"—completely irrelevant.
        - AUDIO-EXCLUSIVE: The briefing from Cecilia Ma MUST contain "Patience First" protocol and "MTR Help Desks". These MUST NOT appear in the Data Files.
        - UI ALIGNMENT: 
            - doc5 MUST have type: "handwritten_note".
            - doc7 MUST have type: "social_media_post" and mention "Viral" stats (Shared 4,500 times).

        ### OUTPUT:
        Return ONLY the raw JSON object. NO markdown.
        Follow the structure of the template below EXACTLY.

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
        
        mockData.meta.title = "HKDSE Paper 3: Digital Literacy for All (Elite Overhaul 2026)";
        
        const fileName = `Listening_Digital_Literacy_for_All_2026.json`;
        const outputPath = path.join(__dirname, './backend/generated_mocks/listening', fileName);
        
        fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
        console.log(`✅ FINAL ELITE OVERHAUL COMPLETE: ${fileName}`);
        
        // Sync to Documents
        const docPath = path.join('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening', fileName);
        fs.writeFileSync(docPath, JSON.stringify(mockData, null, 2));
        
    } catch (e) {
        console.error(`❌ Overhaul Failed:`, e.message);
    }
}

regenerateEliteOverhaul();
