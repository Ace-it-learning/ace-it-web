const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'backend', 'data', 'math_content');
const segments = [
    'math_stat_charts_q1_10.json',
    'math_stat_charts_q11_20.json',
    'math_stat_charts_q21_30.json'
];

let allQuestions = [];
segments.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        allQuestions = allQuestions.concat(data);
    }
});

const hardenedQuestions = allQuestions.map(q => {
    // Helper to fix LaTeX in a string
    const fixLatex = (str) => {
        if (!str || typeof str !== 'string') return str;
        let s = str;
        
        // 1. Fix missing backslashes for common commands (recovery from previous bad scrubs)
        // If we see "hline" without a slash in an array context
        s = s.replace(/([^\\a-zA-Z])hline(?![a-zA-Z])/g, '$1\\\\hline');
        s = s.replace(/([^\\a-zA-Z])sigma(?![a-zA-Z])/g, '$1\\\\sigma');
        s = s.replace(/([^\\a-zA-Z])mu(?![a-zA-Z])/g, '$1\\\\mu');
        s = s.replace(/([^\\a-zA-Z])implies(?![a-zA-Z])/g, '$1\\\\implies');
        s = s.replace(/([^\\a-zA-Z])text\{/g, '$1\\\\text{');

        // 2. Ensure array environment is compact but has mandatory breaks
        s = s.replace(/\\\\begin\{array\}([\s\S]*?)\\\\end\{array\}/g, (match, body) => {
            let cleanedBody = body.replace(/\\\\n/g, ' ').replace(/\s+/g, ' ');
            // Ensure exactly ONE \\ before \hline
            cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)*\\\\hline/g, ' \\\\\\\\ \\\\hline');
            // Remove leading/trailing markers
            cleanedBody = cleanedBody.replace(/^(\\+(\s|\\\\)*)+/, ' ');
            cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)+$/, ' ');
            return `\\\\begin{array}${cleanedBody}\\\\end{array}`;
        });

        return s;
    };

    const fixSolutionDelimiters = (steps) => {
        if (!steps || !Array.isArray(steps)) return steps;
        return steps.map(step => {
            let s = fixLatex(step);
            
            // 3. Balance delimiters
            const dollarCount = (s.match(/\$/g) || []).length;
            if (dollarCount % 2 !== 0) {
                // If it ends with a period, put $ before it
                if (s.trim().endsWith('.') || s.trim().endsWith('。')) {
                    s = s.replace(/([\.\。])$/, '$$$1');
                } else {
                    s = s + '$';
                }
            }

            // If it has math commands but NO delimiters at all, wrap the whole line
            if ((s.includes('\\\\') || s.includes('\\')) && !s.includes('$')) {
                // Heuristic: wrap if it contains implies, sigma, mu, or math operators
                if (/(\\implies|\\sigma|\\mu|\\mathrm|\\sum|\\frac|[=><+\-])/.test(s)) {
                    s = `$${s.trim()}$`;
                }
            }

            return s;
        });
    };

    q.question_en = fixLatex(q.question_en);
    q.question_zh = fixLatex(q.question_zh);
    q.solution_steps_en = fixSolutionDelimiters(q.solution_steps_en);
    q.solution_steps_zh = fixSolutionDelimiters(q.solution_steps_zh);

    return q;
});

const outputPath = path.join(baseDir, 'math_stat_charts_questions.json');
fs.writeFileSync(outputPath, JSON.stringify(hardenedQuestions, null, 2));
console.log("✅ Final Hardened Restoration Complete.");
