const fs = require('fs');
const path = 'c:/Users/user/Documents/ace-it-web/backend/data/maths/integrated_batch_12.json';
let content = fs.readFileSync(path, 'utf8');

// Replace literal quadruple backslashes with double backslashes in the file
// This ensures that JSON.parse results in a single backslash for LaTeX commands
content = content.replace(/\\\\\\\\/g, '\\\\');

// Also ensure that \\n (literal \n in JSON) is converted to actual \n if it was incorrectly over-escaped
// (Wait, \\n is actually what we want if we want a newline in the string? 
// No, "\n" in JSON is a newline. "\\n" in JSON is literal \n string.
// KaTeX usually doesn't need \n inside its commands, and DSE style usually uses single lines or separate steps.
// But some fields like question_en have literal \n for formatting. 
// In JSON, "\n" is correctly parsed as a newline.
content = fs.readFileSync(path, 'utf8');
content = content.replace(/\\\\\\\\/g, '\\\\');
fs.writeFileSync(path, content);
console.log('Sanitization complete.');
