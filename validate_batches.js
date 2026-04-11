const fs = require('fs');

function checkFile(filename) {
    console.log(`Checking ${filename}...`);
    try {
        const content = fs.readFileSync(filename, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${filename} is valid.`);
    } catch (e) {
        console.error(`❌ ${filename} has error: ${e.message}`);
        // Find position
        const match = e.message.match(/at position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            const content = fs.readFileSync(filename, 'utf8');
            const snippet = content.substring(Math.max(0, pos - 50), Math.min(content.length, pos + 50));
            console.log(`Snippet near error:\n...${snippet}...`);
            console.log('Pos in snippet:', 50);
        }
    }
}

checkFile('backend/data/math_content/math_stat_charts_q1_10.json');
checkFile('backend/data/math_content/math_stat_charts_q11_20.json');
checkFile('backend/data/math_content/math_stat_charts_q21_30.json');
