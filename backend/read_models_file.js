const fs = require('fs');
try {
    const buffer = fs.readFileSync('models_list_output.txt');
    process.stdout.write(buffer);
} catch (e) {
    console.error('Failed to read file:', e.message);
}
