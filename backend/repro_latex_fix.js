const content = '[DIAGRAM REQUIRED: A graph of a quadratic function opening downwards, with vertex at (2, 5) and intersecting the x-axis at two points.] 圖中顯示二次函數 $y = f(x)$ 的圖像。求 $f(x) = 0$ 的根。';

const sub = content
    .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
    .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
    .trim();

console.log('--- Display Text (Tags Stripped) ---');
console.log(sub);

const clean = sub.replace(/\\\\\$/g, '$');
const parts = clean.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)?|\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

console.log('\n--- Split Parts for Rendering ---');
const filtered = parts.filter(p => p !== undefined && p !== '');
console.log(JSON.stringify(filtered, null, 2));

console.log('\n--- Rendering Simulation ---');
filtered.forEach((part, i) => {
    if (part.startsWith('$') && part.endsWith('$')) {
        console.log(`[MATH] ${part}`);
    } else {
        console.log(`[TEXT] ${part}`);
    }
});
