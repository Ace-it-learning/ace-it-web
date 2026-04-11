const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'math_content', 'math_num_inequalities_questions.json');
const content = fs.readFileSync(filePath, 'utf8');

// The goal is to ensure all LaTeX commands starting with \ are escaped as \\ in the JSON file.
// If the file literally has \frac, JSON will interpret \f as a formfeed.
// We want it to be \\frac.

const commands = [
    'frac', 'text', 'le', 'ge', 'quad', 'log', 'sqrt', 'begin', 'end', 'pm', 'mp', 
    'neq', 'approx', 'sim', 'cong', 'parallel', 'triangle', 'angle', 'deg', 'circ', 
    'propto', 'implies', 'qquad', 'left', 'right'
];

let fixed = content;

commands.forEach(cmd => {
    // Matches \cmd that is NOT preceded by another \
    // We use a replacement that adds an extra backslash.
    // Note: Since this is a raw string replace on the file, we look for the literal character '\'
    
    // Replace \cmd with \\cmd
    // First, handle cases where it's at the start of a value or preceded by a character
    const regex = new RegExp(`([^\\\\])\\\\${cmd}`, 'g');
    fixed = fixed.replace(regex, `$1\\\\\\\\${cmd}`);
    
    const startValueRegex = new RegExp(`"\\\\${cmd}`, 'g');
    fixed = fixed.replace(startValueRegex, `"\\\\\\\\${cmd}`);
});

fs.writeFileSync(filePath, fixed);
console.log("Harden Escaping Complete.");
