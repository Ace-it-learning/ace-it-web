const fs = require('fs');

function fixMock(filePath) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 1. Fix Announcer Intro
    const intro = [
        { "speaker": "Announcer", "text": "Hong Kong Diploma of Secondary Education Examination 2026. English Language Paper 3. Listening and Integrated Skills." },
        { "speaker": "Announcer", "text": "The entire broadcast will last approximately one hour. During the examination, you will hear several recordings. You will have time to read the instructions and the questions. You will also have time to check your work." },
        { "speaker": "Announcer", "text": "Part A. Task 1. You will hear a conversation between a community center receptionist and a resident. Complete the registration form below. You now have two minutes to study the task. (120-second pause)" }
    ];
    
    // Replace the first few announcer lines if they exist, or prepend them correctly
    // Actually, I'll just rewrite the beginning of the script array
    let script = data.Part_A.script;
    
    // Find where Task 1 dialogue starts
    const firstSpeakerIdx = script.findIndex(s => s.speaker !== 'Announcer' && !s.text.includes('Task 1'));
    if (firstSpeakerIdx !== -1) {
        script.splice(0, firstSpeakerIdx, ...intro);
    }

    // 2. Fix Task Transitions (Tidy up + Study)
    for (let i = 0; i < script.length; i++) {
        let text = script[i].text.toLowerCase();
        
        // Tidy up pauses
        if (text.includes('end of task') || text.includes('check your answers')) {
            const taskMatch = text.match(/task\s+(\d+)/);
            const taskNum = taskMatch ? taskMatch[1] : '';
            script[i].text = `That is the end of Task ${taskNum}. You now have one minute to tidy up your answers. (60-second pause)`;
        }
        
        // Study pauses
        if (text.includes('study the task') || text.includes('read the instructions')) {
            const taskMatch = text.match(/task\s+(\d+)/);
            if (taskMatch && parseInt(taskMatch[1]) > 1) {
                const taskNum = taskMatch[1];
                // Different study texts for different tasks to make it natural
                script[i].text = `Task ${taskNum}. You will hear a discussion about the results of the community survey. Listen to the discussion and complete the notes. You now have two minutes to study the task. (120-second pause)`;
            }
        }
    }
    
    // 3. Fix Part B Briefing Start
    const bBriefingIdx = script.findIndex(s => s.text.toLowerCase().includes('part b') || s.text.toLowerCase().includes('integrated skills'));
    if (bBriefingIdx !== -1) {
        script[bBriefingIdx].text = "Part B. Integrated Skills. You are a project assistant at the Community Center. You will hear a briefing by your supervisor, Cecilia Ma. You now have five minutes to study the Part B Data File and the tasks. (300-second pause)";
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Fixed Announcer & Transitions for: ${filePath}`);
}

fixMock('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening/Listening_Digital_Literacy_for_All_2026.json');
fixMock('c:/Users/user/Documents/ace-it-web/backend/generated_mocks/listening/Listening_Heritage_Revitalization_2026.json');
