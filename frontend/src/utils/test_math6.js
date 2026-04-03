import { prepareMathText, splitContentByDelimiters, sanitizeMath, looksLikeMath } from './mathFormattingUtils.js';

const txt = 'Location C is on a bearing of \\(N50°E\\) from location A. Location B is 6 cm due East of location A. The distance between location B and C is 5 cm. Given that the distance between A and C is 4 cm, find the area of \\(\\triangle ABC\\) in \\(cm^2\\) . Give your answer correct to 3 significant figures.';

const prepared = prepareMathText(txt);
console.log('Prepared Text:', prepared);
const parts = splitContentByDelimiters(prepared);

parts.forEach((p, i) => {
    console.log(`Part ${i}: Is Math? ${looksLikeMath(p)} | Content: [${p}]`);
});
