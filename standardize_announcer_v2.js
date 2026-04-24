const fs = require('fs');

function fixMock(filePath, task1Context) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 1. Reconstruct Script with Golden Standard Announcer
    const goldenIntro = [
        { "speaker": "Announcer", "text": "Hong Kong Diploma of Secondary Education Examination 2026. English Language Paper 3. Listening and Integrated Skills." },
        { "speaker": "Announcer", "text": "The entire broadcast will last approximately one hour. During the examination, you will hear several recordings. You will have time to read the instructions and the questions. You will also have time to check your work." },
        { "speaker": "Announcer", "text": `Part A. Task 1. ${task1Context} You now have two minutes to study the task. (120-second pause)` }
    ];
    
    let originalScript = data.Part_A.script;
    // Find where the actual dialogue starts (Task 1)
    // For Digital Literacy, it's David Lam. For Heritage, it's Alistair.
    const dialogueStartIdx = originalScript.findIndex(s => s.speaker !== 'Announcer' && !s.text.includes('Task'));
    
    let newScript = [...goldenIntro];
    let remainingScript = originalScript.slice(dialogueStartIdx);
    
    // Process remaining script for transitions
    for (let i = 0; i < remainingScript.length; i++) {
        let s = remainingScript[i];
        if (s.speaker === 'Announcer') {
            let text = s.text.toLowerCase();
            // End of Task -> Tidy up
            if (text.includes('end of task')) {
                const match = text.match(/task\s+(\d+)/);
                const num = match ? match[1] : '';
                s.text = `That is the end of Task ${num}. You now have one minute to tidy up your answers. (60-second pause)`;
            }
            // Start of Task -> Study
            else if (text.includes('task') && (text.includes('study') || text.includes('read'))) {
                const match = text.match(/task\s+(\d+)/);
                const num = match ? match[1] : '';
                if (num) {
                    s.text = `Task ${num}. You will hear the next part of the recording. Listen carefully and complete the tasks. You now have two minutes to study the task. (120-second pause)`;
                }
            }
            // Part B transition
            else if (text.includes('part b') || text.includes('integrated skills')) {
                s.text = "Part B. Integrated Skills. You will now take part in a series of integrated tasks. You will hear a briefing session. As you listen, take notes which may help you to complete the tasks. You now have five minutes to study the Part B Data File and the tasks. (300-second pause)";
            }
        }
    }
    
    data.Part_A.script = [...newScript, ...remainingScript];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

fixMock('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening/Listening_Digital_Literacy_for_All_2026.json', "You are at the community center. You will hear a conversation between a receptionist and a resident. Complete the registration form below.");
fixMock('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening/Listening_Heritage_Revitalization_2026.json', "You are at the Heritage Hub. You will hear a conversation between a staff member and a visitor. Complete the registration form below.");
