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
    const theme = "Heritage Revitalization";
    const focus = "Transforming historic industrial buildings into vibrant creative hubs while preserving local identity.";
    
    console.log(`🚀 Starting ULTIMATE OVERHAUL for: ${theme}...`);

    // 1. Part A Questions (50 items)
    console.log("🏗️ Generating Part A Questions...");
    const qPrompt = `
        Generate Part A questions for a HKDSE Paper 3 Mock.
        THEME: ${theme}
        REQUIREMENTS:
        - Exactly 50 items total.
        - Task 1: 12, Task 2: 13, Task 3: 13, Task 4: 12.
        - Labels must be descriptive (e.g., "Full Name of Architect:", "Year of Completion:").
        - SCHEMA: { "tasks": [ { "id": "Task_1", "instructions": "...", "questions": [ { "id": "t1_q1", "type": "Fill_in_Blanks", "label": "...", "answer": "..." }, ... ] }, ... ] }
    `;
    const partA_Tasks = await generateChunk(qPrompt);

    // 2. Script (4,000+ words) - In 3 chunks to avoid timeout
    console.log("🎙️ Generating Script Chunk 1 (Tasks 1 & 2)...");
    const s1Prompt = `
        Generate Part A Script for Tasks 1 & 2.
        THEME: ${theme}
        TARGET: 1,800 words.
        INCLUDE TRAPS: Alistair Montgomery (A-L-I-S-T-A-I-R), Building Code REV-772-B (Staff says REV-727-A first).
        Timeline: 2015 (Proposal), 2017 (Start), 2019 (Opening), 2024 (Expansion).
        FORMAT: [ { "speaker": "...", "text": "..." }, ... ]
    `;
    const s1 = await generateChunk(s1Prompt);

    console.log("🎙️ Generating Script Chunk 2 (Tasks 3 & 4)...");
    const s2Prompt = `
        Generate Part A Script for Tasks 3 & 4.
        THEME: ${theme}
        TARGET: 1,800 words.
        INCLUDE CONFLICT: Debate over $200M vs $400M budget. Argument about "Gentrifaction" vs "Revitalization". Settle on $350M.
        FORMAT: [ { "speaker": "...", "text": "..." }, ... ]
    `;
    const s2 = await generateChunk(s2Prompt);

    console.log("🎙️ Generating Script Chunk 3 (Briefing)...");
    const s3Prompt = `
        Generate Part B Briefing script.
        THEME: ${theme}
        TARGET: 800 words.
        MUST INCLUDE AUDIO-EXCLUSIVE SECRETS: "Heritage Harmony" architectural protocol and "Local Artisan Vouchers".
        FORMAT: [ { "speaker": "...", "text": "..." }, ... ]
    `;
    const s3 = await generateChunk(s3Prompt);

    // 3. Data Files (12 docs)
    console.log("📂 Generating Data Files...");
    const dPrompt = `
        Generate 12 Data Files for Part B.
        THEME: ${theme}
        REQUIREMENTS:
        - doc1 to doc12.
        - doc12: Red Herring (Office Stationery Order).
        - doc5: handwritten_note (Notes from a local resident).
        - doc7: social_media_post (Viral complaint about coffee prices).
        - IMPORTANT: Do NOT include "Heritage Harmony" or "Artisan Vouchers" in the docs.
        - FORMAT: [ { "id": "doc1", "type": "...", "title": "...", "content": "..." }, ... ]
    `;
    const partB_DataFile = await generateChunk(dPrompt);

    // 4. Part B Tasks
    console.log("📝 Generating Part B Tasks...");
    const tPrompt = `
        Generate Part B1 and B2 tasks.
        REQUIREMENTS:
        - Task 8: Write a proposal for the 'Heritage Harmony' project.
        - Rubric MUST include the audio-exclusive secrets.
        - Include relevance penalty note.
        - SCHEMA: { "Part_B1": { "tasks": [ { "id": "Task_5", "type": "...", "instructions": "...", "wordCount": 150, "grading_rubric": { "content_points": [...] } }, ... ] }, "Part_B2": { ... } }
    `;
    const partB_Tasks = await generateChunk(tPrompt);

    // Assemble
    const mock = {
        meta: {
            title: "HKDSE Paper 3: Heritage Revitalization (Ultimate Edition 2026)",
            topic: focus,
            difficulty: "Level 5** Authentic (High Stamina)",
            total_marks_part_a: 50,
            total_marks_part_b: 50
        },
        Part_A: {
            tasks: partA_Tasks.tasks,
            script: [...s1, ...s2, ...s3]
        },
        Part_B: {
            data_file: partB_DataFile,
            Part_B1: partB_Tasks.Part_B1,
            Part_B2: partB_Tasks.Part_B2
        }
    };

    const fileName = `Listening_Heritage_Revitalization_2026.json`;
    const outputPath = path.join(__dirname, './backend/generated_mocks/listening', fileName);
    fs.writeFileSync(outputPath, JSON.stringify(mock, null, 2));
    
    const docPath = path.join('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening', fileName);
    fs.writeFileSync(docPath, JSON.stringify(mock, null, 2));
    
    console.log(`\n✅ ULTIMATE OVERHAUL COMPLETE: ${fileName}`);
}

run();
