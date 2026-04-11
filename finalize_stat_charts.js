const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_questions.json');

if (!fs.existsSync(questionsPath)) {
    console.error("File not found:", questionsPath);
    process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const cleanedQuestions = questions.map(q => {
    // 1. Fix missing $ in solution steps (e.g. \sigma_y = ... $)
    const fixSteps = (steps) => {
        if (!steps || !Array.isArray(steps)) return steps;
        return steps.map(step => {
            // If it has a LaTeX command but no $, or only ending $, wrap it.
            // Also handled double slashes.
            let s = step;
            // Case: "The result is \sigma_y = 12$." -> Missing opening $
            // Regex to find math-like parts starting with \ and ending with $ but no opening $
            s = s.replace(/([^\$])(\\+[a-zA-Z]+[^\$]*\$)/g, '$1\$$2');
            // Case: "$ \sigma_y = 12" -> Missing closing $
            s = s.replace(/(\$\s*\\+[a-zA-Z]+[^\$]*)([^\$])$/g, '$1\$$2');
            return s;
        });
    };

    q.solution_steps_en = fixSteps(q.solution_steps_en);
    q.solution_steps_zh = fixSteps(q.solution_steps_zh);

    // 2. Standardize all array environments to be compact
    let qStr = JSON.stringify(q);
    qStr = qStr.replace(/\\\\begin\{array\}([\s\S]*?)\\\\end\{array\}/g, (match, body) => {
        let cleanedBody = body.replace(/\\\\n/g, ' ').replace(/\s+/g, ' ');
        
        // Ensure \hline has a row break before it
        cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)*\\\\hline/g, ' \\\\\\\\ \\\\hline');
        
        // Remove excessive row breaks at start/end
        cleanedBody = cleanedBody.replace(/^(\\+(\s|\\\\)*)+/, ' ');
        cleanedBody = cleanedBody.replace(/(\\+(\s|\\\\)*)+$/, ' ');

        // Protect \text{...} by adding backslash if missing
        cleanedBody = cleanedBody.replace(/(?<!\\)text\{/g, '\\\\text{');

        return `\\\\begin{array}${cleanedBody}\\\\end{array}`;
    });

    return JSON.parse(qStr);
});

fs.writeFileSync(questionsPath, JSON.stringify(cleanedQuestions, null, 2));
console.log("✅ Final polishing of Statistical Charts 30 questions complete.");
