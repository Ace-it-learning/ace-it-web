import { looksLikeMath } from './mathFormattingUtils.js';

const texts = [
    'Location C is on a bearing of ',
    'from location A. Location B is 6 cm due East of location A. The distance between location B and C is 5 cm. Given that the distance between A and C is 4 cm, find the area of ',
    ' in ',
    ' . Give your answer correct to 3 significant figures.'
];

texts.forEach(t => console.log(`[${t}] => ${looksLikeMath(t)}`));
