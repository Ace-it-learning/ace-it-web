const fs = require('fs');
const path = require('path');

const files = [
    'c:\\Users\\user\\Documents\\ace-it-web\\backend\\data\\math_content\\math_alg_variations_questions_utf8.json',
    'c:\\Users\\user\\Documents\\ace-it-web\\backend\\data\\math_content\\math_alg_variations.json'
];

const performReplacements = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // As per user request:
    // \\\\frac to \\frac
    content = content.replace(/\\\\\\\\frac/g, '\\\\frac');
    // \\\\implies to \\implies
    content = content.replace(/\\\\\\\\implies/g, '\\\\implies');
    // \\\\times to \\times
    content = content.replace(/\\\\\\\\times/g, '\\\\times');
    // \\\\% to \\%
    content = content.replace(/\\\\\\\\%/g, '\\\\%');
    
    // Also handle \left and \right and delimiters if necessary, 
    // but the user only specified those 4. 
    // However, looking at the previous viewed content, there are others.
    // I will prioritize the user's list.
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned up ${path.basename(filePath)}`);
};

files.forEach(performReplacements);
