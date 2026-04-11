
const sanitizeMath = (t) => {
    if (!t) return t;
    let formatted = String(t);
    
    // [V1.8.8 FIX] Removed automatic $$ wrapping.
    
    // 1. Global Slash Normalization: Reduce all 3+ backslash clusters to 2 backslashes
    formatted = formatted.replace(/\\{3,}/g, '\\\\');
    
    // 2. Command Normalization: Ensure common commands have exactly one slash
    formatted = formatted.replace(/\\+(begin|end|text|sigma|mu|implies|frac|sqrt|mathrm|times|div|sum|prod)/g, '\\$1');
    
    // 3. Diagram Standardizer: Repair "starved" row breaks in arrays
    if (formatted.includes('array')) {
        // Step A: Force row breaks to have exactly two backslashes (KaTeX row-break)
        formatted = formatted.replace(/\\{2,}/g, () => '\\\\'); 
        
        // Step B: Ensure \hline has exactly one valid row break (\\ \hline)
        formatted = formatted.replace(/(?:\\\\)?\s*\\?hline/g, () => ' \\\\ \\hline');
        // Step C: Normalizing the start/end to avoid over-injection
        formatted = formatted.replace(/\\\\ \\\\/g, () => '\\\\');
    }
    return formatted;
};

// Test with our "Delimited Standard" (JS string representation)
const testInput = "\\[ \\begin{array}{r|l} \\text{Stem} & \\text{Leaf} \\\\ \\hline \\end{array} \\]";
console.log("Input:", testInput);

// Simulation of MathsLabPage.jsx splitContentByDelimiters & slice
const mathMatch = testInput.match(/^(\$\$?|\\\(|\\\[)([\s\S]+?)(\$\$?|\\\)|\\\])$/);
if (mathMatch) {
    const math = mathMatch[2]; // Strip delimiters
    console.log("Extracted Math:", math);
    const output = sanitizeMath(math);
    console.log("Final Output for KaTeX:", output);
    
    if (output.includes('$$')) {
        console.log("❌ FAILURE: Double wrapping detected!");
    } else {
        console.log("✅ SUCCESS: Pure LaTeX ready for KaTeX.");
    }
} else {
    console.log("❌ FAILURE: Delimiter detection failed!");
}
