const fs = require('fs');
const pdf = require('pdf-parse');

const files = [
    'c:/Users/user/Documents/ace-it-web/backend/Maths/2024/2024_Maths_Paper2.pdf',
    'c:/Users/user/Documents/ace-it-web/backend/Maths/2023/2023_Maths_Paper2.pdf',
    'c:/Users/user/Documents/ace-it-web/backend/Maths/2022/2022_Maths_Paper2.pdf',
    'c:/Users/user/Documents/ace-it-web/backend/Maths/2024/2024_Maths_Paper1.pdf',
    'c:/Users/user/Documents/ace-it-web/backend/Maths/2023/2023_Maths_Paper1.pdf',
    'c:/Users/user/Documents/ace-it-web/backend/Maths/2022/2022_Maths_Paper1.pdf',
    'c:/Users/user/Documents/ace-it-web/backend/Maths/Assessment framework/Maths_syllabus_Eng.pdf',
    'c:/Users/user/Documents/ace-it-web/backend/Maths/Assessment framework/Maths_syllabus_Chi.pdf'
];

async function extract() {
    for (const file of files) {
        if (fs.existsSync(file)) {
            console.log(`Extracting: ${file}`);
            const dataBuffer = fs.readFileSync(file);
            try {
                const data = await pdf(dataBuffer);
                const outputPath = file.replace('.pdf', '_extracted.txt');
                fs.writeFileSync(outputPath, data.text);
                console.log(`Success: ${outputPath}`);
            } catch (err) {
                console.error(`Error extracting ${file}:`, err);
            }
        } else {
            console.warn(`File not found: ${file}`);
        }
    }
}

extract();
