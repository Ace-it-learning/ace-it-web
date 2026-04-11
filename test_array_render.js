const { sanitizeMath, prepareMathText, splitContentByDelimiters } = require('./frontend/src/utils/mathFormattingUtils.js');

const rawLaTeX = `\\begin{array}{r|l} \\text{Stem (10)} & \\text{Leaf (1)} \\\\ \\hline 4 & 2, 5, 8 \\\\ 5 & 0, 3, 3, 6, 9 \\\\ 6 & 1, 4, 4, 7, 8 \\\\ 7 & 2, 5 \\end{array}`;

console.log('Raw LaTeX array:');
console.log(rawLaTeX);
console.log('\n--- sanitizeMath output ---');
const sanitized = sanitizeMath(rawLaTeX);
console.log(sanitized);
console.log('\n--- prepareMathText output ---');
const prepared = prepareMathText(sanitized);
console.log(prepared);
console.log('\n--- splitContentByDelimiters ---');
const parts = splitContentByDelimiters(prepared);
parts.forEach((part, i) => {
    console.log(`Part ${i}:`, part.substring(0, 100));
});

// Simulate renderMath detection
console.log('\n--- Simulating renderMath detection ---');
const mathMatch = prepared.trim().match(/^(\$\$?|\\\(|\\\[)([\s\S]+?)(\$\$?|\\\)|\\\])$/);
console.log('Math match:', mathMatch ? 'Yes' : 'No');
if (mathMatch) {
    console.log('Opener:', mathMatch[1]);
    console.log('Math content:', mathMatch[2].substring(0, 100));
}