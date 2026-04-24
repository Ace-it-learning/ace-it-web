const fs = require('fs');
const path = require('path');
const GenerativeAIService = require('./backend/services/GenerativeAIService');

async function generateChunk(prompt, model = "ace-it-pro") {
    await GenerativeAIService.init();
    try {
        const result = await GenerativeAIService.generateContent(prompt, { model });
        return JSON.parse(GenerativeAIService.extractJson(result.response.text()));
    } catch (e) {
        console.error("Chunk failed, falling back to flash:", e.message);
        const result = await GenerativeAIService.generateContent(prompt, { model: "gemini-flash-latest" });
        return JSON.parse(GenerativeAIService.extractJson(result.response.text()));
    }
}

async function run() {
    const theme = "Digital Literacy for All";
    const focus = "Bridging the generational gap in a digital-first government city.";
    
    console.log("🚀 Starting REPAIR & OVERHAUL for Digital Literacy...");

    // 1. Part A Questions
    console.log("🏗️ Generating Part A Questions (50 items)...");
    const qPrompt = `
        Generate Part A questions for a HKDSE Paper 3 Mock.
        THEME: ${theme}
        REQUIREMENTS:
        - Exactly 50 items total.
        - Task 1: 12 items. Task 2: 13 items. Task 3: 13 items. Task 4: 12 items.
        - Labels must be actual questions (e.g., "Full Name of Delegate:", "Launch Year:"). 
        - Types: Fill_in_Blanks, Multiple_Choice, Short_Answer.
        
        FORMAT: Return a JSON object: { "tasks": [ { "id": "Task_1", "instructions": "...", "questions": [...] }, ... ] }
    `;
    const partA_Tasks = await generateChunk(qPrompt);

    // 2. Part A Script (4,000+ words)
    console.log("🎙️ Generating Master Script (4,000+ words)...");
    const sPrompt = `
        Generate a COMPLETE HKDSE Paper 3 Listening Script.
        WORD COUNT: 3,500 - 4,500 words.
        THEME: ${theme}
        INCLUDE ALL TRAPS: Beatrice Thorne (not Beatrix), 6221 8890 (not 8809), $400M budget compromise, 2024 launch year.
        INCLUDE Cecilia Ma briefing with "Patience First" and "MTR Help Desks".
        
        FORMAT: Return a JSON array: [ { "speaker": "...", "text": "..." }, ... ]
    `;
    const partA_Script = await generateChunk(sPrompt);

    // 3. Part B Data Files (12 docs)
    console.log("📂 Generating Data Files (12 docs)...");
    const dPrompt = `
        Generate 12 Data Files for Part B.
        THEME: ${theme}
        REQUIREMENTS:
        - doc1 to doc12.
        - doc12 is a Red Herring (Staff Canteen Menu).
        - doc5: type "handwritten_note".
        - doc7: type "social_media_post" (Viral, Shared 4,500 times).
        - IMPORTANT: Do NOT include "Patience First" or "MTR Help Desks" in the docs.
        
        FORMAT: Return a JSON array: [ { "id": "doc1", "type": "...", "title": "...", "content": "..." }, ... ]
    `;
    const partB_DataFile = await generateChunk(dPrompt);

    // 4. Part B Tasks (B1 & B2)
    console.log("📝 Generating Part B Tasks (B1 & B2)...");
    const tPrompt = `
        Generate Part B1 and B2 tasks for a HKDSE Paper 3 Mock.
        REQUIREMENTS:
        - Part_B1 tasks: Task 5, 6, 7.
        - Part_B2 tasks: Task 8, 9, 10.
        - Task 8 MUST include "Patience First" and "MTR Help Desks" in rubric.
        - Task 8 MUST include relevance penalty note.
        
        FORMAT: Return a JSON object: { "Part_B1": { "tasks": [...] }, "Part_B2": { "tasks": [...] } }
    `;
    const partB_Tasks = await generateChunk(tPrompt);

    // 5. Assemble
    const mock = {
        meta: {
            title: "HKDSE Paper 3: Digital Literacy for All (Ultimate Edition 2026)",
            topic: focus,
            difficulty: "Level 5** Authentic (High Stamina)",
            total_marks_part_a: 50,
            total_marks_part_b: 50
        },
        Part_A: {
            tasks: partA_Tasks.tasks,
            script: partA_Script
        },
        Part_B: {
            data_file: partB_DataFile,
            Part_B1: partB_Tasks.Part_B1,
            Part_B2: partB_Tasks.Part_B2
        }
    };

    const fileName = `Listening_Digital_Literacy_for_All_2026.json`;
    const outputPath = path.join(__dirname, './backend/generated_mocks/listening', fileName);
    fs.writeFileSync(outputPath, JSON.stringify(mock, null, 2));
    
    const docPath = path.join('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening', fileName);
    fs.writeFileSync(docPath, JSON.stringify(mock, null, 2));
    
    console.log(`\n✅ REPAIR COMPLETE: ${fileName}`);
}

run();
