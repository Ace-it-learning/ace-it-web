const http = require('http');

const id = 'Listening_Career_Fair_Preparation_1770552448683';
http.get(`http://localhost:3001/api/listening/exam/${id}`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const exam = JSON.parse(data);
            console.log('--- DIAGNOSTIC ---');
            console.log(`Title: ${exam.metadata?.title}`);
            console.log(`Part A Tasks Count: ${exam.Part_A?.tasks?.length || 0}`);
            if (exam.Part_A?.tasks?.length > 0) {
                console.log(`Task 1 ID: ${exam.Part_A.tasks[0].id}`);
                console.log(`Task 1 Questions Count: ${exam.Part_A.tasks[0].questions?.length || 0}`);
                console.log(`Q1 Label: ${exam.Part_A.tasks[0].questions[0]?.label}`);
            }
            console.log(`Part B Tasks Count: ${exam.Part_B?.tasks?.length || 0}`);
            console.log(`Part A Script Count: ${exam.Part_A?.script?.length || 0}`);
            console.log('--- END ---');
        } catch (e) {
            console.error('JSON Error:', e.message);
        }
    });
}).on('error', (err) => {
    console.error('Request failed:', err.message);
});
