const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening/Listening_Heritage_Revitalization_2026.json';
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
        id: (t.id || t.task_number || "").replace('Task ', 'Task_'),
        type: t.text_type || t.type || "Writing Task",
        instructions: t.instructions || t.situation || "",
        wordCount: t.wordCount || 300,
        grading_rubric: {
            content_points: t.grading_rubric ? (t.grading_rubric.content_points || t.grading_rubric.content_requirements || []) : [],
            tone: t.grading_rubric ? (t.grading_rubric.tone || "Professional") : "Professional",
            relevance_penalty: t.grading_rubric ? (t.grading_rubric.relevance_penalty || t.grading_rubric.penalty_note || "") : ""
        }
    };
};

if (data.Part_B.Part_B1 && data.Part_B.Part_B1.tasks) {
    data.Part_B.Part_B1.tasks = data.Part_B.Part_B1.tasks.map(fixTask);
}
if (data.Part_B.Part_B2 && data.Part_B.Part_B2.tasks) {
    data.Part_B.Part_B2.tasks = data.Part_B.Part_B2.tasks.map(fixTask);
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Sync to Worktree
const worktreePath = 'c:/Users/user/.gemini/antigravity/worktrees/ace-it-web/reimplement-paper-3-engine-20260423/backend/generated_mocks/listening/Listening_Heritage_Revitalization_2026.json';
fs.writeFileSync(worktreePath, JSON.stringify(data, null, 2));

console.log("✅ Heritage Revitalization Cleanup Complete.");
