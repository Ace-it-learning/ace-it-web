
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
        // Functional replacement bypassing JS string-escape logic
        formatted = formatted.replace(/\\{2,}/g, () => '\\\\'); 
        
        // [V1.8.7 FIX] Removed aggressive single-backslash doubling that was mangling commands like \text
        
        // Step B: Ensure \hline has exactly one valid row break (\\ \hline)
        formatted = formatted.replace(/(?:\\\\)?\s*\\?hline/g, () => ' \\\\ \\hline');
        // Step C: Normalizing the start/end to avoid over-injection
        formatted = formatted.replace(/\\\\ \\\\/g, () => '\\\\');
    }
    return formatted;
};

// Test with our "Clean Standard" (Single-escaped in JS, so \begin and \\ row-breaks)
const testInput = "\\begin{array}{r|l} \\text{Stem} & \\text{Leaf} \\\\ \\hline \\end{array}";
console.log("Input:", testInput);
const output = sanitizeMath(testInput);
console.log("Output:", output);

// Check if \text was mangled
if (output.includes('\\\\text')) {
    console.log("❌ FAILURE: \\text was mangled to \\\\text");
} else if (output.includes('\\text')) {
    console.log("✅ SUCCESS: \\text preserved correctly");
}

// Check row breaks
if (output.match(/Leaf\s+\\\\\s+\\hline/)) {
    console.log("✅ SUCCESS: Row breaks preserved correctly");
} else {
    console.log("❌ FAILURE: Row break logic failed");
}
