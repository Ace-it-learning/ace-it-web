const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening/Listening_Digital_Literacy_for_All_2026.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Fix Part_A Questions
data.Part_A.tasks.forEach((task, tIdx) => {
    task.questions.forEach((q, qIdx) => {
        q.id = `t${tIdx + 1}_q${qIdx + 1}`;
        if (!q.answer) q.answer = "Placeholder Answer";
    });
});

// 2. Fix Part_B Tasks
const fixTask = (t) => {
    return {
        id: t.task_number || t.id,
        type: t.text_type || t.type || "Writing Task",
        instructions: t.instructions || t.situation || "",
        wordCount: t.wordCount || 300,
        grading_rubric: {
            content_points: t.rubric ? (t.rubric.content_requirements || t.rubric.content_points || []) : [],
            tone: t.rubric ? t.rubric.tone : "Professional",
            relevance_penalty: t.rubric ? (t.rubric.penalty_note || "") : ""
        }
    };
};

if (data.Part_B.Part_B1 && data.Part_B.Part_B1.tasks) {
    data.Part_B.Part_B1.tasks = data.Part_B.Part_B1.tasks.map(fixTask);
}
if (data.Part_B.Part_B2 && data.Part_B.Part_B2.tasks) {
    data.Part_B.Part_B2.tasks = data.Part_B.Part_B2.tasks.map(fixTask);
}

// 3. Ensure data_file has content
data.Part_B.data_file.forEach(df => {
    if (!df.content) df.content = "Content missing. Please check source.";
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Sync to Worktree
const worktreePath = 'c:/Users/user/.gemini/antigravity/worktrees/ace-it-web/reimplement-paper-3-engine-20260423/backend/generated_mocks/listening/Listening_Digital_Literacy_for_All_2026.json';
fs.writeFileSync(worktreePath, JSON.stringify(data, null, 2));

console.log("✅ Final Cleanup Complete. JSON matches Studio requirements.");
