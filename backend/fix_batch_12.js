const fs = require('fs');
const path = 'c:/Users/user/Documents/ace-it-web/backend/data/maths/integrated_batch_12.json';
let content = fs.readFileSync(path, 'utf8');

// Replace any sequence of 2 or more backslashes with exactly 2
// In a JS string literal, \\\\ means 2 literal backslashes.
// In a regex, \\\\ matches a literal backslash.
// So we want to replace multiple literal backslashes with 2 literal backslashes.
content = content.replace(/\\{2,}/g, '\\\\');

// Also fix some potential single-backslash errors if any (though \l etc are invalid JSON and would have failed earlier)
// Actually, let's just make sure all LaTeX-like commands after $ have exactly 2 backslashes.

fs.writeFileSync(path, content);
console.log('Normalized backslashes in integrated_batch_12.json');
