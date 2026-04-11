const sanitizeMath = (t) => {
    if (!t) return t;
    let formatted = String(t);
    
    // --- REPRODUCING FUNCTIONAL STEP 898 ---
    if (formatted.includes('begin{') && !formatted.includes('$')) {
        formatted = `$$ ${formatted} $$`;
    }
    if (formatted.includes('array')) {
        formatted = formatted.replace(/\\{2,}/g, () => '\\\\'); 
        formatted = formatted.replace(/(?<!\\)\\(?=\s*[0-9a-zA-Z|\\\/])/g, () => '\\\\');
        formatted = formatted.replace(/(?:\\\\)?\s*\\?hline/g, () => ' \\\\ \\hline');
        formatted = formatted.replace(/\\\\ \\\\/g, () => '\\\\');
    }
    return formatted;
};

const testStr1 = "\\begin{array}{r|l} \\text{Stem (10)} & \\text{Leaf (1)} \\ \\hline 4 & 2, 5, 8 \\end{array}";
const result1 = sanitizeMath(testStr1);
console.log("Q1 Test Result (Functional):", result1);

if (result1.includes('\\\\ \\hline')) {
    console.log("✅ SUCCESS: Q1 diagram row break is now exactly \\\\ \\hline (functional pass-thru)");
}