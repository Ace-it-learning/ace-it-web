const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening';
const files = fs.readdirSync(targetDir).filter(f => f.startsWith('Listening_') && f.endsWith('_2026.json'));

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;

    // 1. Fix Part_B.data_files (PascalCase or different keys)
    if (data.Part_B && data.Part_B.Data_Files && !data.Part_B.data_files) {
        data.Part_B.data_files = data.Part_B.Data_Files.map(df => ({
            id: df.id,
            type: df.type || df.title || 'Source',
            content: df.content,
            sender: df.sender || '',
            recipient: df.recipient || ''
        }));
        delete data.Part_B.Data_Files;
        changed = true;
    }

    // 2. Fix Section_B1 / Section_B2 (Tasks as object instead of array)
    ['Section_B1', 'Section_B2'].forEach(section => {
        if (data.Part_B && data.Part_B[section] && !Array.isArray(data.Part_B[section].tasks)) {
            const tasks = [];
            for (let key in data.Part_B[section]) {
                if (key.startsWith('Task_')) {
                    const task = data.Part_B[section][key];
                    tasks.push({
                        id: key,
                        type: task.type || task.title || 'Integrated Task',
                        instructions: task.instructions,
                        marks: task.marks || 10
                    });
                }
            }
            if (tasks.length > 0) {
                data.Part_B[section].tasks = tasks;
                // Clean up old keys
                tasks.forEach(t => delete data.Part_B[section][t.id]);
                changed = true;
            }
        }
    });

    // 3. Fix Script (Separate keys into one content string)
    if (data.Script && !data.Script.content) {
        let fullContent = "";
        let announcerText = data.Script.announcer || data.Script.Announcer || "";
        
        for (let key in data.Script) {
            if (key !== 'announcer' && key !== 'Announcer' && key !== 'end_instruction' && key !== 'Transitions') {
                fullContent += `\n\n[${key.replace(/_/g, ' ')}]\n${data.Script[key]}`;
            }
        }
        
        data.Script = {
            announcer: announcerText,
            content: fullContent.trim(),
            end_instruction: data.Script.end_instruction || "This is the end of Part A. Now turn to Part B."
        };
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Standardized: ${file}`);
    } else {
        console.log(`ℹ️ Already standard: ${file}`);
    }
});
