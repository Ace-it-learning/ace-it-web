const WritingQuestService = require('../../backend/services/writing/WritingQuestService');

async function debug() {
    const topic = "AI Tutors in Hong Kong Schools";
    const textType = "Essay";
    const content = "I am writing to discuss about the use of AI tutors in Hong Kong schools. Recently, more and more students are using AI to help them with their homework. I think this is a good thing because AI can answer questions very quickly. However, we also need to be careful because AI might make some mistakes sometimes.";
    
    console.log("--- Starting Debug Grading ---");
    const result = await WritingQuestService.gradeFinalPiece(topic, textType, content);
    console.log("--- Result Received ---");
    console.log(JSON.stringify(result, null, 2));
}

debug().catch(err => {
    console.error("DEBUG FAILED:", err);
    process.exit(1);
});
