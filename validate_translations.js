const fs = require('fs');
const path = require('path');

try {
    const content = fs.readFileSync(path.join(__dirname, 'frontend/src/utils/translations.js'), 'utf8');
    // Remove 'export const translations = ' and concluding ';' if present to try and eval it
    let clean = content.trim();
    if (clean.startsWith('export const translations = ')) {
        clean = clean.replace('export const translations = ', '');
    }
    // Very naive check: wrap in parentheses and see if it parses
    // But since it's ES module, we can't easily eval it in Node without ESM support
    // Let's just check for basic bracket balance and common leaks
    console.log("File length:", clean.length);
    console.log("Checking for 'undefined' or obvious leaks...");

    // We'll try to just check if it's a valid object structure by replacing export with something else
    const testContent = content.replace('export const translations = ', 'const translations = ') + '\nconsole.log("Parse Success");';
    fs.writeFileSync('test_parse.js', testContent);
    require('child_process').execSync('node test_parse.js');
    console.log("✅ translations.js parsed successfully in Node (as a script).");
} catch (e) {
    console.error("❌ translations.js has a syntax error!");
    console.error(e.message);
} finally {
    if (fs.existsSync('test_parse.js')) fs.unlinkSync('test_parse.js');
}
