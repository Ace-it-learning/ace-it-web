const fs = require('fs');
const path = require('path');

const backupFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json.v2.bak';
const targetFile = 'c:/Users/user/Documents/ace-it-web/backend/data/math_content/math_stat_charts_questions.json';

const filesToRestore = [
    { target: targetFile, backup: backupFile },
    // Repeat for other split files if backups exist, but the main one is the most corrupted
];

filesToRestore.forEach(pair => {
    if (!fs.existsSync(pair.backup)) {
        console.log(`No backup found for ${pair.target}`);
        return;
    }
    
    console.log(`Restoring ${pair.target} from ${pair.backup}...`);
    const raw = fs.readFileSync(pair.backup, 'utf8');
    let questions = JSON.parse(raw);

    const processText = (text) => {
        if (typeof text !== 'string') return text;
        
        let s = text;

        // Ensure array environments use exactly \\ (JS string) for newlines
        // which will be JSON-encoded as \\\\
        s = s.replace(/\\begin\{array\}(.*?)\\end\{array\}/gs, (match, p1) => {
            // Standardize row breaks: replace any broken variants with \\
            let fixedBody = p1.replace(/\\+\s*\\+/g, '\\\\');
            fixedBody = fixedBody.replace(/\\+(?=\s*\\hline)/g, '\\\\');
            fixedBody = fixedBody.replace(/\\+(?=\s*\d)/g, '\\\\');
            
            // Standardize commands like \text or \hline to single slash
            fixedBody = fixedBody.replace(/\\+(text|hline)/g, '\\$1');
            
            return `\\begin{array}${fixedBody}\\end{array}`;
        });

        // Ensure block math $...$ or $$...$$ delimiters have spaces for KaTeX
        if (s.includes('\\begin{array}')) {
             // Wrap the environment in $$ with spaces if it's the main block
             s = s.replace(/\s*\\begin\{array\}/, ' $$ \\begin{array}');
             s = s.replace(/\\end\{array\}\s*/, '\\end{array} $$ ');
             
             // Ensure only ONE set of $$ delimiters
             s = s.replace(/\$\$[\s\n]*\$\$/g, '$$');
        }

        // Standardize other commands to single slash
        const cmds = ['begin', 'end', 'sum', 'implies', 'frac', 'sigma', 'mu', 'alpha', 'beta', 'text', 'hline'];
        cmds.forEach(cmd => {
            const regex = new RegExp(`\\\\+(?=${cmd})`, 'g');
            s = s.replace(regex, '\\');
        });

        return s;
    };

    questions.forEach(q => {
        ['question_en', 'question_zh'].forEach(field => {
            if (q[field]) q[field] = processText(q[field]);
        });
        ['solution_steps_en', 'solution_steps_zh'].forEach(field => {
            if (Array.isArray(q[field])) {
                q[field] = q[field].map(item => processText(item));
            }
        });
    });

    fs.writeFileSync(pair.target, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`✅ Successfully restored and patched ${pair.target}`);
});
