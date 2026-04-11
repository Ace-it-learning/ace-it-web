const fs = require('fs');
const path = 'c:/Users/user/Documents/ace-it-web/backend/data/maths/integrated_batch_12.json';
let content = fs.readFileSync(path, 'utf8');

// Global replacement mapping for LaTeX commands that were under-escaped
const corrections = [
  { from: /\\frac/g, to: '\\\\frac' },
  { from: /\\times/g, to: '\\\\times' },
  { from: /\\approx/g, to: '\\\\approx' },
  { from: /\\circ/g, to: '\\\\circ' },
  { from: /\\le/g, to: '\\\\le' },
  { from: /\\ge/g, to: '\\\\ge' },
  { from: /\\pi/g, to: '\\\\pi' },
  { from: /\\cos/g, to: '\\\\cos' },
  { from: /\\sin/g, to: '\\\\sin' },
  { from: /\\tan/g, to: '\\\\tan' },
  { from: /\\Rightarrow/g, to: '\\\\Rightarrow' },
  { from: /\\angle/g, to: '\\\\angle' },
  { from: /\\to/g, to: '\\\\to' },
  { from: /\\triangle/g, to: '\\\\triangle' }
];

// First, handle any over-escaped quadruple backslashes (reset to double)
content = content.replace(/\\\\\\\\/g, '\\\\');

// Then apply the corrections for single-backslash cases
corrections.forEach(c => {
  content = content.replace(c.from, c.to);
});

// Final check: Remove any triple backslashes or other weirdness that might have resulted
content = content.replace(/\\\\\\\\/g, '\\\\');

fs.writeFileSync(path, content);
console.log('Final sanitization complete.');
