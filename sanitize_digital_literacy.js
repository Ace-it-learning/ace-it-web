const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening/Listening_Digital_Literacy_for_All_2026.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Sanitize Doc 1 (Remove Audio Exclusive info)
if (data.Part_B.data_file[0]) {
    data.Part_B.data_file[0].content = "Discussed the need for 'Human-First AI'. Public is worried about job security. Action: Cecilia Ma to lead the outreach program.";
}

// 2. Sanitize Doc 5 (Remove Audio Exclusive info)
if (data.Part_B.data_file[4]) {
    data.Part_B.data_file[4].content = "Urgent: Tell the staff that when they help seniors at the booths, they must be extremely respectful. Also, mentions of local community centers should be included in the flyers—seniors go there often.";
}

// 3. Check for any other leaks in Data Files
data.Part_B.data_file.forEach(df => {
    df.content = df.content.replace(/Patience First/g, "Standard").replace(/MTR Help Desks/g, "Community Booths");
});

// 4. Ensure Audio Briefing HAS the info
const briefingIdx = data.Part_A.script.findIndex(s => s.speaker === "Cecilia Ma");
if (briefingIdx !== -1) {
    data.Part_A.script[briefingIdx].text = "Project Manager, listen carefully. Our rollout is sensitive. For Task 8, remember the 'Patience First' protocol. We aren't just teaching tech; we are teaching confidence. I've also secured a deal to set up 'MTR Help Desks' across five major stations. This is crucial—it's not in your data files, so make sure it's in your report. We must emphasize the human touch over automated AI support.";
} else {
    // Add it if missing
    data.Part_A.script.push({
        speaker: "Cecilia Ma",
        text: "Project Manager, listen carefully. Our rollout is sensitive. For Task 8, remember the 'Patience First' protocol. We aren't just teaching tech; we are teaching confidence. I've also secured a deal to set up 'MTR Help Desks' across five major stations. This is crucial—it's not in your data files, so make sure it's in your report. We must emphasize the human touch over automated AI support."
    });
}

// 5. Check Part B2 Rubric for the relevance penalty
if (data.Part_B.Part_B2 && data.Part_B.Part_B2.tasks) {
    data.Part_B.Part_B2.tasks.forEach(t => {
        if (!t.grading_rubric) t.grading_rubric = { content_points: [] };
        if (!t.grading_rubric.content_points.includes("Deduct 0.5 marks for each instance of Irrelevant Content")) {
            t.grading_rubric.content_points.push("Deduct 0.5 marks for each instance of Irrelevant Content (copying non-task-related Data File info like canteen menu).");
        }
    });
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Sync to Worktree as well
const worktreePath = 'c:/Users/user/.gemini/antigravity/worktrees/ace-it-web/reimplement-paper-3-engine-20260423/backend/generated_mocks/listening/Listening_Digital_Literacy_for_All_2026.json';
fs.writeFileSync(worktreePath, JSON.stringify(data, null, 2));

console.log("✅ Data Sanitized & Audio-Exclusives Protected.");
