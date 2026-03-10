const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const BACKEND_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

const FILES_TO_DELETE = [
    // Root
    path.join(ROOT_DIR, 'admin-mock-generator.html'),
    path.join(ROOT_DIR, 'api_diagnostic.html'),
    path.join(ROOT_DIR, 'audit_quests.js'),
    path.join(ROOT_DIR, 'check_translations.js'),
    path.join(ROOT_DIR, 'check_user_progress.js'),
    path.join(ROOT_DIR, 'debug_case.js'),
    path.join(ROOT_DIR, 'debug_data.json'),
    path.join(ROOT_DIR, 'debug_math_gen.js'),
    path.join(ROOT_DIR, 'debug_output.txt'),
    path.join(ROOT_DIR, 'deploy_log.txt'),
    path.join(ROOT_DIR, 'deploy_rules_log.txt'),
    path.join(ROOT_DIR, 'dump_user.json'),
    path.join(ROOT_DIR, 'math_test_output.txt'),
    path.join(ROOT_DIR, 'server_debug.log'),
    path.join(ROOT_DIR, 'server_log.txt'),
    path.join(ROOT_DIR, 'test_out.txt'),
    path.join(ROOT_DIR, 'test_output.txt'),
    path.join(ROOT_DIR, 'test_gen_output.json'),
    path.join(ROOT_DIR, 'raw_results.json'),

    // Backend (Logs)
    path.join(BACKEND_DIR, 'chat_error.log'),
    path.join(BACKEND_DIR, 'debug.log'),
    path.join(BACKEND_DIR, 'error.log'),
    path.join(BACKEND_DIR, 'error_log.txt'),
    path.join(BACKEND_DIR, 'lab_debug.log'),
    path.join(BACKEND_DIR, 'server.log'),
    path.join(BACKEND_DIR, 'server_crash.log'),
    path.join(BACKEND_DIR, 'server_log.txt'),
    path.join(BACKEND_DIR, 'diag_log.txt'),
    path.join(BACKEND_DIR, 'last_logs.txt'),
    path.join(BACKEND_DIR, 'seed_log.txt'),
    path.join(BACKEND_DIR, 'audit_report.txt'),
    path.join(BACKEND_DIR, 'audit_report_final.txt'),
    path.join(BACKEND_DIR, 'audit_report_utf8.txt'),
    path.join(BACKEND_DIR, 'audit_results.txt'),
    path.join(BACKEND_DIR, 'audit_results_utf8.txt'),
    path.join(BACKEND_DIR, 'factory_report.txt'),
    path.join(BACKEND_DIR, 'load_output.txt'),
    path.join(BACKEND_DIR, 'list_models_output.txt'),

    // Backend (Dumps/Tests)
    path.join(BACKEND_DIR, 'audit_complex_numbers_dump.json'),
    path.join(BACKEND_DIR, 'audit_stats.json'),
    path.join(BACKEND_DIR, 'full_q_dump.json'),
    path.join(BACKEND_DIR, 'math_bank_dump.json'),
    path.join(BACKEND_DIR, 'maths_quest_dump.json'),
    path.join(BACKEND_DIR, 'pending_dump.json'),
    path.join(BACKEND_DIR, 'temp_quest_verify.json'),
    path.join(BACKEND_DIR, 'temp_quest_verify_v2.json'),
    path.join(BACKEND_DIR, 'writing_quests_audit.json'),

    // Frontend
    path.join(FRONTEND_DIR, 'build_error.log'),
    path.join(FRONTEND_DIR, 'build_error_2.log'),
    path.join(FRONTEND_DIR, 'vite_debug.log'),
    path.join(FRONTEND_DIR, 'vite_debug_fresh.log'),
    path.join(FRONTEND_DIR, 'lint_output.txt'),
    path.join(FRONTEND_DIR, 'test_debug.txt'),
    path.join(FRONTEND_DIR, 'test_output.txt'),
    path.join(FRONTEND_DIR, 'test_result_clean.txt'),
];

// Patterns for test_*.js, verify_*.js, check_*.js, debug_*.js in Root and Backend
const directoriesToScan = [ROOT_DIR, BACKEND_DIR];
const testPatterns = [/test_.*\.js$/, /verify_.*\.js$/, /check_.*\.js$/, /debug_.*\.js$/, /repro_.*\.js$/, /reproduce_.*\.js$/];

console.log('--- CLEANUP START ---');

FILES_TO_DELETE.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`Deleted: ${path.basename(file)}`);
        } catch (e) {
            console.error(`Failed to delete ${file}: ${e.message}`);
        }
    }
});

directoriesToScan.forEach(dir => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (testPatterns.some(pattern => pattern.test(file))) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isFile()) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log(`Deleted pattern match: ${file}`);
                } catch (e) {
                    console.error(`Failed to delete ${file}: ${e.message}`);
                }
            }
        }
    });
});

console.log('--- CLEANUP COMPLETE ---');
