const { spawn } = require('child_process');
const path = require('path');

class MathEngineBridge {
    constructor() {
        this.scriptsDir = path.join(__dirname, 'math_engine');
    }

    /**
     * Calls a Python generator script with input data.
     * @param {string} scriptName - e.g., 'circle_gen.py'
     * @param {object} input - Input data for the generator (difficulty, seed, etc.)
     * @returns {Promise<object>} - Resulting quest bundle
     */
    async generateQuest(scriptName, input = {}) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(this.scriptsDir, scriptName);
            // Use system python instead of hardcoded path
            const pythonPath = 'python';
            const pythonProcess = spawn(pythonPath, [scriptPath]);

            let output = '';
            let error = '';

            pythonProcess.stdin.write(JSON.stringify(input));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}. Error: ${error}`));
                    return;
                }
                try {
                    resolve(JSON.parse(output));
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${output}`));
                }
            });
        });
    }
}

module.exports = new MathEngineBridge();
