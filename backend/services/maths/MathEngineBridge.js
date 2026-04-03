const { spawn } = require('child_process');
const path = require('path');

class MathEngineBridge {
    constructor() {
        // Updated to top-level math_engine directory
        this.scriptsDir = path.join(__dirname, '..', '..', 'math_engine');
    }

    /**
     * Calls a Python seed generator script.
     * @param {string} scriptName - e.g., 'number_systems_gen.py'
     * @param {number} count - Number of seeds to generate
     * @returns {Promise<string[]>} - Array of seed strings
     */
    async generateSeeds(scriptName, count = 5) {
        return this.generateQuest(scriptName, { count });
    }

    /**
     * Calls a Python generator script with input data.
     * @param {string} scriptName - e.g., 'circle_gen.py'
     * @param {object} input - Input data for the generator (difficulty, seed, etc.)
     * @returns {Promise<any>} - Resulting data (seeds or quest bundle)
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
