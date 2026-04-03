import { prepareMathText, sanitizeMath, splitContentByDelimiters, looksLikeMath } from './mathFormattingUtils.js';

const txt = 'Location C is on a bearing of N50°E from location A. Location B is 6 cm due East of location A. The distance between location B and C is 5 cm. Given that the distance between A and C is 4 cm, find the area of △ABC in cm^2 . Give your answer correct to 3 significant figures.';
const prepared = prepareMathText(txt);
console.log(JSON.stringify({
    prepared: prepared,
    parts: splitContentByDelimiters(prepared).map(p => ({ text: p, math: looksLikeMath(p) }))
}, null, 2));
