import { sanitizeMath } from './mathFormattingUtils.js';

const txt = 'Location C is on a bearing of N50°E from location A. Location B is 6 cm due East of location A. The distance between location B and C is 5 cm. Given that the distance between A and C is 4 cm, find the area of △ABC in cm^2 . Give your answer correct to 3 significant figures.';
console.log('original length:', txt.length);
console.log('original char 33:', txt.charCodeAt(33), txt[33]);
const sanitized = sanitizeMath(txt);
console.log('sanitized:', sanitized);
