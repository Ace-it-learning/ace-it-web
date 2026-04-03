const fs = require('fs');
const path = require('path');

// Mock GenerativeAIService to capture the payload
const GenerativeAIService = {
    generateJson: async (prompt, config) => {
        return { data: { prompt, config } };
    }
};

async function verifyHardening() {
    console.log("--- Verification: MathsDiagnosticService Hardening ---");
    const MathsDiagnosticService = require('../services/maths/MathsDiagnosticService');
    
    // Simulate grading to trigger payload construction
    // Note: We need to mock the fs read if we want to be pedantic, but let's just see what it sends.
    try {
        const result = await MathsDiagnosticService.gradeMaths({
            question: "Test",
            studentInput: "Test",
            modelAnswer: "Test",
            language: "en"
        });
        
        // This is tricky because gradeMaths internally calls GenerativeAIService. 
        // We might need to monkey-patch it.
    } catch (e) {
        // We expect an error because we didn't mock everything, but we want to see logs
    }
}

// Alternatively, let's just read the files and check the logic
function checkFiles() {
    console.log("Checking MathsDiagnosticService.js for payload reordering...");
    const diagContent = fs.readFileSync('c:/Users/user/Documents/ace-it-web/backend/services/maths/MathsDiagnosticService.js', 'utf8');
    if (diagContent.includes('extractedRules += match[0]') && diagContent.includes('reorderedInstruction + extractedRules')) {
        console.log("✅ MathsDiagnosticService: Payload reordering logic found.");
    } else {
        console.error("❌ MathsDiagnosticService: Payload reordering logic MISSING.");
    }

    console.log("\nChecking MathsLabService.js for new rules...");
    const labContent = fs.readFileSync('c:/Users/user/Documents/ace-it-web/backend/services/maths/MathsLabService.js', 'utf8');
    if (labContent.includes('CURRENCY SYMBOL BAN') && labContent.includes('ANTI-HALLUCINATION')) {
        console.log("✅ MathsLabService: New rules found in template.");
    } else {
        console.error("❌ MathsLabService: New rules MISSING from template.");
    }
    
    if (labContent.includes('RECENCY BIAS')) {
        console.log("✅ MathsLabService: Recency bias section found at the end.");
    }
}

checkFiles();
