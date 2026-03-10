const katex = require('katex');
const html1 = katex.renderToString('\\text{y}= \\log_b (x-a)', { throwOnError: false });
const html2 = katex.renderToString('\\log_4 x + 6 \\log_x 4 = 5', { throwOnError: false });

console.log('HTML1:', html1);
console.log('HTML2:', html2);
