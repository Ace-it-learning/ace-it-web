
const looksLikeMath = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (trimmed.length < 1) return false;
    
    // v1.8.8 Hardened: Only treat as math if NO plain English words
    const words = (trimmed.match(/\b[a-zA-Z]{3,}\b/gi) || []);
    const hasPlainEnglish = words.length > 0;
    
    // v1.8.10: Variable Protection - Ignore if it is likely prose (e.g. Q_1)
    if (hasPlainEnglish && words.length >= 2) {
        // Must have a "Hard" math marker to wrap a whole sentence
        const hasHardMath = /[\\[\]{}=><+\-]/.test(trimmed) || /\b(theta|pi|phi|sigma|mu|alpha|beta|delta|frac|sqrt|sum)\b/i.test(trimmed);
        if (!hasHardMath) return false;
    }

    return (
        trimmed.includes('\\') ||  // Wait, if it includes \sigma, it's math?
        trimmed.includes('^') ||
        trimmed.includes('_')
    );
};

const test1 = "If 10 is added to every data point in a set where Q_1=30, Q_3=60, find new IQR.";
const test2 = "Find the value of x.";
const test3 = "\\begin{array}{|c|c|} \\hline \\text{Height (cm)} & \\text{Frequency} \\hline \\end{array}";

console.log("Test 1 (Sentence with Q_1):", looksLikeMath(test1)); // Expected: false
console.log("Test 2 (Sentence with x):", looksLikeMath(test2));     // Expected: false
console.log("Test 3 (Pure Array):", looksLikeMath(test3));           // Expected: true
