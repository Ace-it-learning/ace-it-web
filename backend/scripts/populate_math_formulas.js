require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const admin = require('firebase-admin');
const MathsLabService = require('../services/maths/MathsLabService');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const TOPIC = 'math_alg_formulas';

async function populateDB() {
    console.log(`[Populate] Starting question generation for ${TOPIC}`);
    const difficulties = [1, 2, 3, 4, 5];
    const clusters = ['ALG_01_SUBSTITUTION', 'ALG_02_CHANGE_SUBJECT'];

    for (const cluster of clusters) {
        for (const level of difficulties) {
            console.log(`\n\n=== Generating full quest for Cluster ${cluster}, Level ${level} ===`);
            try {
                const questData = await MathsLabService.generateLesson({
                    uid: 'TEST_ADMIN_UID', // Optional: attach to a specific user if needed
                    topic: TOPIC,
                    clusterId: cluster,
                    level: level,
                    language: 'en',
                    isFactory: true
                });
                console.log(`✅ Success for ${cluster} Level ${level}! Items generated: ${questData?.interactive_tasks?.length || 0}`);

                // Print a sample to verify it's valid
                if (questData?.interactive_tasks?.length > 0) {
                    const sample = questData.interactive_tasks[0];
                    console.log(`Sample Question (${sample.id}): ${sample.text}`);
                    console.log(`Options: ${sample.options}`);
                    console.log(`Answer: ${sample.answer}`);
                }

            } catch (error) {
                console.error(`❌ Failed generating ${cluster} Level ${level}:`, error);
            }
        }
    }

    console.log('\n[Populate] Finished all generation tasks.');
    process.exit(0);
}

populateDB();
