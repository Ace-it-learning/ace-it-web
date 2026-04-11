const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'functions_graphs.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// SVG templates
const svgTemplates = {
    func_04: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<text x='350' y='70' fill='blue'>y=2x²-5x+3</text>
</svg>`,
    func_06: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M150,220 Q250,50 350,220' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='250' cy='50' r='5' fill='red'/>
<text x='260' y='60' fill='red'>(3,1)</text>
</svg>`,
    func_07: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,180 Q250,180 400,180' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='250' cy='180' r='5' fill='red'/>
<text x='260' y='190' fill='red'>touches x‑axis</text>
</svg>`,
    func_08: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,100 400,220' fill='none' stroke='blue' stroke-width='2'/>
<path d='M100,170 Q250,50 400,170' fill='none' stroke='green' stroke-width='2' stroke-dasharray='5,5'/>
<text x='350' y='120' fill='blue'>y=2x²</text>
<text x='350' y='70' fill='green'>y=2x²+5</text>
</svg>`,
    func_09: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='300' cy='100' r='5' fill='red'/>
<text x='310' y='110' fill='red'>(2,10)</text>
</svg>`,
    func_11: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<line x1='50' y1='230' x2='450' y2='30' stroke='green' stroke-width='2'/>
<circle cx='200' cy='150' r='5' fill='red'/>
<circle cx='300' cy='200' r='5' fill='red'/>
<text x='200' y='140' fill='red'>(-1,1)</text>
<text x='300' y='190' fill='red'>(2,4)</text>
</svg>`,
    func_13: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<path d='M150,220 Q300,50 450,220' fill='none' stroke='purple' stroke-width='2' stroke-dasharray='5,5'/>
<text x='350' y='70' fill='blue'>y=x²+4</text>
<text x='400' y='70' fill='purple'>y=(x‑3)²+4</text>
</svg>`,
    func_14: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,50 Q250,220 400,50' fill='none' stroke='blue' stroke-width='2'/>
<line x1='50' y1='230' x2='450' y2='30' stroke='green' stroke-width='2' stroke-dasharray='5,5'/>
<text x='350' y='70' fill='blue'>y=x²+2x+5</text>
<text x='350' y='40' fill='green'>y=mx+1</text>
</svg>`,
    func_15: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<circle cx='300' cy='100' r='5' fill='blue'/>
<circle cx='200' cy='30' r='5' fill='red'/>
<text x='310' y='110' fill='blue'>(3,-2)</text>
<text x='210' y='40' fill='red'>(-1,-9)</text>
<path d='M100,220 Q300,100 400,220' fill='none' stroke='gray' stroke-width='1'/>
<path d='M50,150 Q200,30 350,150' fill='none' stroke='gray' stroke-width='1' stroke-dasharray='5,5'/>
</svg>`,
    func_16: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q300,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='300' cy='50' r='5' fill='red'/>
<text x='310' y='60' fill='red'>vertex (+,+)</text>
</svg>`,
    func_17: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,50 Q250,100 400,50' fill='none' stroke='blue' stroke-width='2'/>
<text x='350' y='70' fill='blue'>above x‑axis</text>
</svg>`,
    func_18: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M150,180 Q250,50 350,180' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='200' cy='180' r='5' fill='red'/>
<circle cx='300' cy='180' r='5' fill='red'/>
<circle cx='250' cy='180' r='5' fill='green'/>
<text x='190' y='200'>1</text>
<text x='290' y='200'>5</text>
<text x='240' y='200'>y=10</text>
</svg>`,
    func_19: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,50 Q250,100 400,50' fill='none' stroke='blue' stroke-width='2'/>
<path d='M100,310 Q250,260 400,310' fill='none' stroke='red' stroke-width='2' stroke-dasharray='5,5'/>
<circle cx='250' cy='100' r='5' fill='blue'/>
<circle cx='250' cy='260' r='5' fill='red'/>
<text x='260' y='110' fill='blue'>(2,3)</text>
<text x='260' y='270' fill='red'>(2,-3)</text>
</svg>`,
    func_20: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<line x1='50' y1='230' x2='450' y2='70' stroke='green' stroke-width='2'/>
<circle cx='250' cy='140' r='5' fill='red'/>
<text x='260' y='150' fill='red'>tangent</text>
</svg>`,
    func_21: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<rect x='100' y='100' width='300' height='100' fill='none' stroke='black' stroke-width='2'/>
<line x1='100' y1='100' x2='100' y2='200' stroke='brown' stroke-width='4'/>
<text x='150' y='150' fill='black'>x</text>
<text x='250' y='150' fill='black'>L=100‑2x</text>
<text x='50' y='150' fill='brown'>wall</text>
</svg>`,
    func_22: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='250' cy='50' r='5' fill='red'/>
<circle cx='350' cy='150' r='5' fill='green'/>
<text x='260' y='60' fill='red'>(1,-4)</text>
<text x='360' y='160' fill='green'>(3,8)</text>
</svg>`,
    func_23: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<path d='M100,140 Q250,-30 400,140' fill='none' stroke='red' stroke-width='2' stroke-dasharray='5,5'/>
<text x='350' y='70' fill='blue'>y=x²</text>
<text x='350' y='40' fill='red'>y=-(x‑2)²+4</text>
</svg>`,
    func_24: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,100 400,220' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='250' cy='100' r='5' fill='red'/>
<text x='260' y='110' fill='red'>min at x=10</text>
<text x='350' y='70' fill='blue'>S=2x²‑40x+400</text>
</svg>`,
    func_25: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,50 Q250,220 400,50' fill='none' stroke='blue' stroke-width='2'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='green' stroke-width='2'/>
<circle cx='200' cy='150' r='5' fill='red'/>
<circle cx='300' cy='150' r='5' fill='red'/>
<text x='200' y='140'>(-1,?)</text>
<text x='300' y='140'>(4,?)</text>
</svg>`,
    func_26: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='250' cy='180' r='5' fill='red'/>
<circle cx='300' cy='150' r='5' fill='red'/>
<circle cx='350' cy='100' r='5' fill='red'/>
<text x='250' y='200'>(0,2)</text>
<text x='300' y='160'>(1,3)</text>
<text x='350' y='110'>(2,6)</text>
</svg>`,
    func_27: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<line x1='300' y1='0' x2='300' y2='250' stroke='red' stroke-dasharray='5,5'/>
<text x='310' y='30' fill='red'>x=h</text>
</svg>`,
    func_28: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,50 Q250,100 400,50' fill='none' stroke='blue' stroke-width='2'/>
<text x='350' y='70' fill='blue'>no real roots</text>
</svg>`,
    func_29: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,220 Q250,50 400,220' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='250' cy='50' r='5' fill='red'/>
<text x='260' y='60' fill='red'>max height</text>
</svg>`,
    func_30: `<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='180' x2='500' y2='180' stroke='black' stroke-width='1'/>
<line x1='250' y1='0' x2='250' y2='250' stroke='black' stroke-width='1'/>
<path d='M100,180 Q250,180 400,180' fill='none' stroke='blue' stroke-width='2'/>
<circle cx='250' cy='180' r='5' fill='red'/>
<text x='260' y='190' fill='red'>tangent at x‑axis</text>
</svg>`
};

// Update each item
let updated = 0;
data.forEach(item => {
    if (!item.diagram_svg && svgTemplates[item.id]) {
        item.diagram_svg = svgTemplates[item.id];
        updated++;
    }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Added ${updated} SVG diagrams.`);