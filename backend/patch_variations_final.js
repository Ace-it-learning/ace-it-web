const fs = require('fs');

const filePath = 'c:\\Users\\user\\Documents\\ace-it-web\\backend\\data\\math_content\\math_alg_variations_questions_utf8.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const patchText = (text) => {
    if (typeof text !== 'string') return text;
    
    // 1. Replace \\( and \\) with $
    let patched = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    
    // 2. Double-escape LaTeX macros in the JSON string (so in the string it has ONE backslash)
    // The user's rule: "all LaTeX macros... use exactly two backslashes"
    // This literally means JSON source should have "\\" before the command.
    // My previous script had a bug where it matched any number of backslashes.
    // I will replace any one or more literal backslashes with EXACTLY ONE backslash in the result STRING.
    // Which means in JSON output it will be \\.
    patched = patched.replace(/\\+(frac|sqrt|implies|propto|times|left|right|quad|neq|approx|alpha|beta|gamma|delta|theta|pi|sigma|omega|div|pm|mp|le|ge|triangle|sim|cong|angle|deg|parallel|circ|aligned|begin|end|{)/g, '\\$1');
    
    // 3. Fix percentages \\% to \% (which is \\% in JSON)
    patched = patched.replace(/\\%/g, '\\%');
    
    return patched;
};

const patchedData = data.map(q => {
    const newQ = { ...q };
    // Patch ALL relevant fields
    const fieldsToPatch = ['question', 'question_zh', 'answer', 'correct_answer'];
    fieldsToPatch.forEach(field => {
        if (newQ[field]) newQ[field] = patchText(newQ[field]);
    });
    
    if (newQ.solution_steps) {
        newQ.solution_steps = newQ.solution_steps.map(step => patchText(step));
    }
    if (newQ.solution_steps_zh) {
        newQ.solution_steps_zh = newQ.solution_steps_zh.map(step => patchText(step));
    }
    if (newQ.options) {
        newQ.options = newQ.options.map(opt => patchText(opt));
    }
    if (newQ.options_zh) {
        newQ.options_zh = newQ.options_zh.map(opt => patchText(opt));
    }
    return newQ;
});

// Output the full array
console.log(JSON.stringify(patchedData, null, 2));
