const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_questions.json');

if (!fs.existsSync(questionsPath)) {
    console.error("File not found:", questionsPath);
    process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const cleanedQuestions = questions.map(q => {
    // 1. Fix corrupted $2 / $1 from previous bad regex
    const repair = (steps) => {
        if (!steps || !Array.isArray(steps)) return steps;
        return steps.map(step => {
            let s = step;
            // Restore implies if it was mangled to $2 or similar
            // Look for patterns like "34 $2" or "34 $implies"
            s = s.replace(/\$2/g, '\\\\implies x = 4'); // Specific fix for the Q11 case
            s = s.replace(/\\+sigma/g, '\\\\sigma');
            s = s.replace(/\\+mu/g, '\\\\mu');
            s = s.replace(/\\+implies/g, '\\\\implies');
            
            // Ensure math parts are wrapped in $
            // If line contains \ commands but no $, wrap the whole thing or the math part.
            if ((s.includes('\\\\') || s.includes('\\')) && !s.includes('$')) {
                // Heuristic: if it's mostly a formula, wrap it.
                // For safety, let's just ensure known commands have $ around them if missing.
                s = s.replace(/([0-9a-zA-Z\s=+\-]+(\\\\implies|\\\\sigma|\\\\mu|\\\\bar|\\\\sum|\\\\frac)[^\$]*)/g, '$$$1$$');
            }
            
            // Fix double dollars or nested dollars
            s = s.replace(/\${2,}/g, '$');
            return s;
        });
    };

    q.solution_steps_en = repair(q.solution_steps_en);
    q.solution_steps_zh = repair(q.solution_steps_zh);

    // 2. Fix Table Headers (textSiblings -> \text{Siblings})
    let qStr = JSON.stringify(q);
    qStr = qStr.replace(/\\\\begin\{array\}([\s\S]*?)\\\\end\{array\}/g, (match, body) => {
        let cleanedBody = body;
        // Fix the "textName" issue
        cleanedBody = cleanedBody.replace(/(?<!\\)text([A-Z][a-z]+)/g, '\\\\text{$1}');
        // Ensure \text{...} has a backslash
        cleanedBody = cleanedBody.replace(/(?<!\\)text\{/g, '\\\\text{');
        return `\\\\begin{array}${cleanedBody}\\\\end{array}`;
    });

    return JSON.parse(qStr);
});

fs.writeFileSync(questionsPath, JSON.stringify(cleanedQuestions, null, 2));
console.log("✅ Statistical Charts Question Bank REPAIRED and finalized.");
