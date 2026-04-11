const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, 'backend', 'data', 'math_content', 'math_stat_charts_questions.json');

if (!fs.existsSync(questionsPath)) {
    console.error("File not found:", questionsPath);
    process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const cleanedQuestions = questions.map(q => {
    const fixSteps = (steps) => {
        if (!steps || !Array.isArray(steps)) return steps;
        return steps.map(step => {
            let s = step;
            
            // 1. Normalize all backslashes for commands
            s = s.replace(/\\+(\implies|sigma|mu|bar|sum|frac|pm|approx|neq|le|ge)/g, '\\$1');
            
            // 2. Wrap math expressions that are missing delimiters
            // Heuristic: If we see a backslash command or an equation sign and no delimiters, wrap the math part.
            // Simplified: If the line has \implies or \sigma and is missing $, wrap the whole step's math part.
            
            // Fix orphaned opening $ or closing $
            const dollarCount = (s.match(/\$/g) || []).length;
            if (dollarCount % 2 !== 0) {
                if (s.includes('$')) {
                    // Try to balance it. Usually the missing one is at the end.
                    if (s.trim().endsWith('.') || s.trim().endsWith('。')) {
                        s = s.replace(/([^\$])([\.\。])$/, '$1$$$2');
                    } else {
                        s = s + '$';
                    }
                }
            }

            // Ensure logic symbols are in math mode
            if (s.includes('\\implies') && !s.includes('$')) {
                s = s.replace(/([^\$ ]*\\implies[^\$]*)/g, '$$$1$$');
            }
            if (s.includes('\\sigma') && !s.includes('$')) {
                s = s.replace(/([^\$ ]*\\sigma[^\$]*)/g, '$$$1$$');
            }

            // Cleanup double dollars
            s = s.replace(/\${2,}/g, '$');
            
            return s;
        });
    };

    q.solution_steps_en = fixSteps(q.solution_steps_en);
    q.solution_steps_zh = fixSteps(q.solution_steps_zh);
    
    return q;
});

fs.writeFileSync(questionsPath, JSON.stringify(cleanedQuestions, null, 2));
console.log("✅ Statistical Charts Solution Steps DELIMITERS FIXED.");
