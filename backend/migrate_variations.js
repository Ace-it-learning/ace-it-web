const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\user\\Documents\\ace-it-web\\backend\\data\\math_content\\math_alg_variations_questions_utf8.json';
const jsonContent = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(jsonContent);

const migrateDelimiters = (text) => {
    if (typeof text !== 'string') return text;
    // Replace $...$ with \\( ... \\)
    // In JS string, we need 4 backslashes for 2 literal backslashes in JSON output.
    // Wait! Let's be careful.
    // In the JSON file, it should be "\\( ... \\)"
    // So in the JS object, it should be "\( ... \)" which is written as "\\( ... \\)" in JS source.
    // So text.replace(/\$(.*?)\$/g, '\\($1\\)') results in "\( $1 \)" which becomes "\\( $1 \\)" in JSON.
    return text.replace(/\$(.*?)\$/g, '\\($1\\)');
};

const migrateFields = (obj) => {
    const fieldsToProcess = ['question', 'question_zh', 'answer', 'correct_answer'];
    fieldsToProcess.forEach(field => {
        if (obj[field]) obj[field] = migrateDelimiters(obj[field]);
    });

    const arrayFields = ['solution_steps', 'solution_steps_zh'];
    arrayFields.forEach(field => {
        if (obj[field] && Array.isArray(obj[field])) {
            obj[field] = obj[field].map(step => migrateDelimiters(step));
        }
    });

    if (obj.options && Array.isArray(obj.options)) {
        obj.options = obj.options.map(opt => migrateDelimiters(opt));
    }
    if (obj.options_zh && Array.isArray(obj.options_zh)) {
        obj.options_zh = obj.options_zh.map(opt => migrateDelimiters(opt));
    }
};

data.forEach(q => migrateFields(q));

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully migrated Variations delimiters.');
