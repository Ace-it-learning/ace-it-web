const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../data/math_content');
const ROOT_FILE = path.join(__dirname, '../../functions_graphs.json');

async function patchFinalAnswers() {
    try {
        console.log('🚀 Starting Universal "Final Answer" Patching...');

        // 1. Get all question files in backend/data/math_content
        const files = fs.readdirSync(CONTENT_DIR)
            .filter(f => f.endsWith('_questions.json') || f.includes('questions'));
        
        // 2. Add the root file if it exists
        if (fs.existsSync(ROOT_FILE)) {
            files.push('../../functions_graphs.json');
        }

        let totalPatched = 0;

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

            data.forEach((q, idx) => {
                const ans = q.correct_answer || q.answer;
                if (!ans) return;

                // Standardize fields: steps/solution_steps
                const enKeys = ['solution_steps', 'steps'];
                const zhKeys = ['solution_steps_zh', 'steps_zh'];

                // Patch English
                for (const key of enKeys) {
                    if (q[key] && Array.isArray(q[key])) {
                        const steps = q[key];
                        if (steps.length > 0 && !steps[steps.length - 1].includes('Final Answer')) {
                            const newStep = `${steps.length + 1}. Final Answer: $${ans}$`;
                            steps.push(newStep);
                            fileModified = true;
                        }
                        break; // Only patch first found key
                    }
                }

                // Patch Chinese
                for (const key of zhKeys) {
                    if (q[key] && Array.isArray(q[key])) {
                        const steps = q[key];
                        if (steps.length > 0 && !steps[steps.length - 1].includes('最後答案')) {
                            const newStep = `${steps.length + 1}. 最後答案：$${ans}$`;
                            steps.push(newStep);
                            fileModified = true;
                        }
                        break;
                    }
                }
            });

            if (fileModified) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                console.log(`✅ Patched ${path.basename(filePath)}`);
                totalPatched++;
            }
        }

        console.log(`🎉 Patching completed! ${totalPatched} files updated.`);
    } catch (error) {
        console.error('❌ Patching failed:', error);
    }
}

patchFinalAnswers();
