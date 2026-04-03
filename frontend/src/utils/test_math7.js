const trimmed = 'Location C is on a bearing of';
const isRawMathCommand = /(?<![a-z])(frac|sqrt|alpha|beta|gamma|theta|pi|times|div|pm|mp|approx|neq|le|ge|infty|dots|cdots|Delta|Sigma|Phi|Omega|deg|degree|angle|log|sin|cos|tan|ln|text|mathbf|triangle|sim|cong|parallel|circ)(?![a-z])|([lg]e[0-9_\(\)]+)|\\begin\{cases\}|[_^{]/.test(trimmed) || trimmed.includes('\\\\') || /\^([0-9a-z]|\{)/i.test(trimmed) || trimmed.includes('\\text');

console.log('isRawMathCommand:', isRawMathCommand);

const hasComparison = /[=><]/.test(trimmed) && !trimmed.includes('?');
console.log('hasComparison:', hasComparison);

const hasOperators = /[+\-*\/]/.test(trimmed) && !trimmed.includes('?');
console.log('hasOperators:', hasOperators);

console.log('Single var:', /^[a-z]\s*=\s*[\d.a-z]+$/i.test(trimmed));
