const admin = require('firebase-admin');
const path = require('path');
const MathsLabService = require('../services/maths/MathsLabService');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const ALL_MATH_TOPICS = [
    'math_alg_apgp',
    'math_alg_polynomials',
    'math_alg_indices_log',
    'math_alg_variations',
    'math_trig_3d',
    'math_geo_rectilinear',
    'math_geo_circles',
    'math_geo_mensuration',
    'math_trig_ratios',
    'math_trig_applications',
    'math_stat_measures',
    'math_stat_charts',
    'math_prob_basic',
    'math_prob_advanced',
    'math_alg_formulas',
    'math_alg_quadratics',
    'math_alg_functions',
    'math_num_percentages',
    'math_num_ratio',
    'math_num_inequalities',
    'math_alg_complex_numbers',
    'math_alg_log_exp'
];

async function generateEliteBank() {
    process.env.NODE_ENV = 'development';
    
    // Command line arguments for targeting specific topics
    const cliTopics = process.argv.slice(2);
    const targetTopics = cliTopics.length > 0 ? cliTopics : ALL_MATH_TOPICS;
    
    console.log(`💎 Starting ELITE (Standard 3.1) Bank Generation for ${targetTopics.length} topics...`);
    
    const shuffled = [...targetTopics].sort(() => Math.random() - 0.5);

    for (const topicId of shuffled) {
        console.log(`\n--- Topic Focus: ${topicId} ---`);
        
        // Generate for all 4 difficulty levels (3, 4, 5, 7)
        for (const level of [3, 4, 5, 7]) {
            console.log(`🚀 Level ${level}: Generating 10 Elite questions...`);
            try {
                // Version 3.1 (ELITE): Optimized prompting is already in service
                // Use Pro for ALL to ensure absolute premium graphs as requested
                const result = await MathsLabService.generateLesson({
                    topic: topicId,
                    uid: 'placeholder',
                    level: level,
                    targetCount: 10,
                    isFactory: true,
                    model: 'gemini-1.5-pro'
                });

                if (result.interactive_tasks) {
                    console.log(`✅ Level ${level}: Success (${result.interactive_tasks.length} tasks)`);
                } else {
                    console.warn(`❌ Level ${level}: Partial success/No tasks returned.`);
                }
            } catch (err) {
                console.error(`❌ Level ${level}: Critical error:`, err.message);
            }
            // Throttling for Pro model and API stability
            await new Promise(r => setTimeout(r, 12000));
        }
    }
    console.log("\n✨ BANK OVERHAUL COMPLETE!");
    process.exit(0);
}

generateEliteBank();
