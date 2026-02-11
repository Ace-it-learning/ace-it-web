const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/lab/writing';

async function testWritingLab() {
    console.log("=== WRITING LAB VERIFICATION ===");

    // 1. Test Generation (Paragraph Planner)
    console.log("\n[1] Testing GENERATION (Paragraph Planner)...");
    try {
        const genRes = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: "Social Issues",
                level: "5",
                mode: "PARAGRAPH_PLANNER"
            })
        });

        const session = await genRes.json();
        console.log("Generation Result Status:", genRes.status);
        if (session.prompt_text) {
            console.log("✅ Prompt Generated:", session.prompt_text);
            console.log("   Theme:", session.theme);
        } else {
            console.error("❌ Generation Failed:", session);
            return;
        }

        // 2. Test Evaluation (The Polisher)
        console.log("\n[2] Testing EVALUATION (The Polisher)...");
        const studentText = "The problem of waste in Hong Kong is very bad. Many people throw away plastic every day. This creates a big burden on landfills. We must do something to stop this.";

        const evalRes = await fetch(`${API_URL}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentText: studentText,
                context: {
                    mode: "PARAGRAPH_PLANNER",
                    theme: session.theme,
                    instruction: session.prompt_text,
                    target_level: "5"
                }
            })
        });

        const feedback = await evalRes.json();
        console.log("Evaluation Result Status:", evalRes.status);

        if (feedback.polished_text) {
            console.log("✅ Polished Text:", feedback.polished_text);
            console.log("✅ Critique Points:", feedback.critique_points);
            console.log("✅ Key Changes:", JSON.stringify(feedback.key_changes, null, 2));
        } else {
            console.error("❌ Evaluation Failed:", feedback);
        }

    } catch (e) {
        console.error("Test Error:", e);
    }
}

testWritingLab();
