const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/data/math_content/math_alg_apgp_questions_utf8.json');
let content = fs.readFileSync(filePath, 'utf8');

// Remove BOM if present
content = content.replace(/^\uFEFF/, '');
const questions = JSON.parse(content);

function patchMathBlock(text) {
    if (typeof text !== 'string') return text;
    
    // Regex to find $ ... $ blocks (non-greedy)
    return text.replace(/\$([^\$]+)\$/g, (match, mathContent) => {
        // We need to return literal backslashes for the JSON string
        let patched = mathContent
            .replace(/\[/g, '\\\\left[')
            .replace(/\]/g, '\\\\right]')
            .replace(/>/g, '\\\\gt')
            .replace(/</g, '\\\\lt');
        return `$${patched}$`;
    });
}

const patchedQuestions = questions.map(q => {
    const updated = { ...q };
    
    // Fields to patch
    ['question', 'question_zh', 'answer', 'correct_answer'].forEach(field => {
        if (updated[field]) {
            updated[field] = patchMathBlock(updated[field]);
        }
    });

    ['solution_steps', 'solution_steps_zh'].forEach(field => {
        if (updated[field] && Array.isArray(updated[field])) {
            updated[field] = updated[field].map(step => patchMathBlock(step));
        }
    });

    return updated;
});

const result = JSON.stringify(patchedQuestions, null, 4);
fs.writeFileSync(filePath, result, 'utf8');
console.log('Successfully patched math blocks in AP & GP bank.');
