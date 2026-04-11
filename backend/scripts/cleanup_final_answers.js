const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../data/math_content');
const ROOT_FILE = path.join(__dirname, '../../functions_graphs.json');

async function cleanupFinalAnswers() {
    try {
        console.log('🚀 Starting Universal "Final Answer" Cleanup...');

        // 1. Get all question files in backend/data/math_content
        const files = fs.readdirSync(CONTENT_DIR)
            .filter(f => f.endsWith('_questions.json') || f.includes('questions'));
        
        // 2. Add the root file if it exists
        if (fs.existsSync(ROOT_FILE)) {
            files.push('../../functions_graphs.json');
        }

        let totalCleaned = 0;

        for (const file of files) {
            const filePath = file.startsWith('..') ? path.join(__dirname, file) : path.join(CONTENT_DIR, file);
            console.log(`🔍 Processing ${path.basename(filePath)}...`);

            let data;
            try {
                data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                console.warn(`⚠️ Skipped ${file}: Invalid JSON`);
                continue;
            }

            if (!Array.isArray(data)) {
                console.warn(`⚠️ Skipped ${file}: Not an array`);
                continue;
            }

            let fileModified = false;

            data.forEach((q) => {
                // Standardize fields: steps/solution_steps
                const enKeys = ['solution_steps', 'steps'];
                const zhKeys = ['solution_steps_zh', 'steps_zh'];

                // Cleanup English
                for (const key of enKeys) {
                    if (q[key] && Array.isArray(q[key])) {
                        const steps = q[key];
                        if (steps.length > 0) {
                            const lastStep = steps[steps.length - 1];
                            if (lastStep.includes('Final Answer')) {
                                steps.pop();
                                fileModified = true;
                            }
                        }
                        break;
                    }
                }

                // Cleanup Chinese
                for (const key of zhKeys) {
                    if (q[key] && Array.isArray(q[key])) {
                        const steps = q[key];
                        if (steps.length > 0) {
                            const lastStep = steps[steps.length - 1];
                            if (lastStep.includes('最後答案')) {
                                steps.pop();
                                fileModified = true;
                            }
                        }
                        break;
                    }
                }
            });

            if (fileModified) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                console.log(`✅ Cleaned ${path.basename(filePath)}`);
                totalCleaned++;
            }
        }

        console.log(`🎉 Cleanup completed! ${totalCleaned} files updated.`);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

cleanupFinalAnswers();
