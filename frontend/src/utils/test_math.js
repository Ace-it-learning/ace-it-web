import { sanitizeMath, looksLikeMath } from './mathFormattingUtils.js';
const txt = 'Location C is on a bearing of N50°E from location A.';
const sanitized = sanitizeMath(txt);
console.log('Sanitized:', sanitized);
console.log('Looks like math:', looksLikeMath(sanitized));
