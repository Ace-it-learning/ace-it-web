const fs = require('fs');
const path = require('path');
const MathsLabService = require('../services/maths/MathsLabService');

const pendingPath = path.join(__dirname, '../../pending_dump.json');

async function repair() {
    if (!fs.existsSync(pendingPath)) {
        console.error("pending_dump.json not found at", pendingPath);
        return;
    }

    const data = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
    console.log(`Loaded ${data.length} pending questions.`);

    const repairedData = data.map(q => {
        return MathsLabService.postProcessQuestion(q);
    });

    fs.writeFileSync(pendingPath, JSON.stringify(repairedData, null, 2), 'utf8');
    console.log("Successfully repaired and saved pending_dump.json");
}

repair();
