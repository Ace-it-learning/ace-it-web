const fs = require('fs');
let b = fs.readFileSync('server.js', 'utf8');

// The string we are looking for is literally: let systemPrompt = ${GLOBAL_BASE_RULES}\n\n;
// Wait, since my powershell evaluated the $ globally before, maybe it literally wrote:
// let systemPrompt = \n\n; 
// Let's check with a regex that just replaces the line.
b = b.split(/\r?\n/).map(line => {
    if (line.includes('let systemPrompt =') && line.includes('GLOBAL_BASE_RULES')) {
        return '            let systemPrompt = `${GLOBAL_BASE_RULES}\\n\\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;';
    }
    return line;
}).join('\n');

fs.writeFileSync('server.js', b, 'utf8');
console.log('Fixed properly using JS script.');
