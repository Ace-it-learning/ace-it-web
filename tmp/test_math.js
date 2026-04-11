
const sanitizeMath = (t) => {
    if (!t) return t;
    let formatted = String(t);
    
    // 1. Auto-wrap environments that are missing delimiters ($ or $$)
    if (formatted.includes('begin{') && !formatted.includes('$')) {
        formatted = `$$ ${formatted} $$`;
    }
    // 2. Global Slash Normalization: Reduce all 3+ backslash clusters to 2 backslashes
    formatted = formatted.replace(/\\{3,}/g, '\\\\');
    
    // 3. Command Normalization: Ensure common commands have exactly one slash
    formatted = formatted.replace(/\\+(begin|end|text|sigma|mu|implies|frac|sqrt|mathrm|times|div|sum|prod)/g, '\\$1');
    
    // 4. Diagram Standardizer: Repair "starved" row breaks in arrays
    if (formatted.includes('array')) {
        // Step A: Force row breaks to have exactly two backslashes (KaTeX row-break)
        formatted = formatted.replace(/\\{2,}/g, () => '\\\\'); 
        // Step B: Repair single backslashes that are actually row breaks (space-follow)
        formatted = formatted.replace(/(?<!\\)\\(?=\s*[0-9a-zA-Z|\\\/])/g, () => '\\\\');
        // Step C: Ensure \hline has exactly one valid row break (\\ \hline)
        formatted = formatted.replace(/(?:\\\\)?\s*\\?hline/g, () => ' \\\\ \\hline');
        // Step D: Normalizing the start/end to avoid over-injection
        formatted = formatted.replace(/\\\\ \\\\/g, () => '\\\\');
    }
    return formatted;
};

// Test with our "Hardened" JSON format
const testInput = "\\\\begin{array}{r|l} \\\\text{Stem} & \\\\text{Leaf} \\\\\\\\\\\\ \\\\hline \\\\end{array}";
console.log("Input:", testInput);
const output = sanitizeMath(testInput);
console.log("Output:", output);

// Test with standard 2-slash format
const test2 = "\\begin{array}{r|l} \\text{Stem} & \\text{Leaf} \\\\ \\hline \\end{array}";
console.log("\nInput 2:", test2);
console.log("Output 2:", sanitizeMath(test2));
