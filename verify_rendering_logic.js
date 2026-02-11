
const testStrings = [
    "[DIAGRAM REQUIRED: Triangle ABC] In the diagram, $AB = 5$ and $BC = 12$.",
    "[TABLE REQUIRED: Distribution of scores] The table shows: \\[ \\bar{x} = 50 \\]",
    "Standard equation: \( x^2 + y^2 = r^2 \)",
    "Raw LaTeX without delimiters: \\frac{x+1}{x-1} = 2",
    "Mixed content: Find $x$ such that \\frac{x}{2} = 5.",
    "Escaped delimiters: \\\\$ This should be a dollar sign."
];

function stripTags(text) {
    return text
        .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
        .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
        .trim();
}

function processText(text) {
    const displaySubtext = stripTags(text);
    const cleanText = displaySubtext.replace(/\\\\\$/g, '$').replace(/\\\\\\\[/g, '\\[').replace(/\\\\\\\]/g, '\\]');

    const parts = cleanText.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(\$\$[\s\S]*?\$\$)|(\$[^$]+?\$))/g).filter(Boolean);

    return parts.map(part => {
        // Block
        if ((part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'))) {
            return { type: 'block', content: part.slice(2, -2) };
        }
        // Inline
        if ((part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'))) {
            const math = part.startsWith('\\(') ? part.slice(2, -2) : part.slice(1, -1);
            return { type: 'inline', content: math };
        }
        // Safety Net
        const isRawMath = (/[\\^=]/.test(part) || part.includes('_')) && !/^[A-Z][a-z]+ /.test(part);
        if (isRawMath && parts.length === 1) {
            return { type: 'safety_net', content: part };
        }
        return { type: 'text', content: part };
    });
}

testStrings.forEach((str, i) => {
    console.log(`\n--- Test ${i + 1} ---`);
    console.log(`Original: ${str}`);
    const results = processText(str);
    results.forEach(res => {
        console.log(`[${res.type.toUpperCase()}]: ${res.content}`);
    });
});
