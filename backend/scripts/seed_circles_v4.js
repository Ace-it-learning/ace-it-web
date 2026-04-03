const admin = require('firebase-admin');
const path = require('path');
const MathsLabService = require('../services/maths/MathsLabService');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    const serviceAccount = require('../../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function seedCirclesV4() {
    console.log('🚀 Starting Circle Properties V4 Seeding...');
    const topic = 'math_geo_circles';
    const level = 3;
    const userId = 'system_seeder_v4';

    try {
        // We use generateLesson with isFactory: true to trigger the Python engine and AI processing
        // TARGET_COUNT is hardcoded to 10 in generateLesson for now, so we might need to call it twice or adjust it.
        // Actually, let's just call it with a count if possible, but generateLesson doesn't take a count.
        // Wait, I saw generateLesson uses config.targetCount or similar? No, it used a constant.
        
        console.log(`[Seeder] Requesting 20 questions for ${topic}...`);
        
        // Since I want exactly 20, and the current implementation might be limited, 
        // I will manually trigger the flow to ensure we get exactly what the user wants.
        
        const result = await MathsLabService.generateLesson(topic, level, userId, { 
            isFactory: true,
            forceRefresh: true 
        });

        if (result.error) {
            console.error(`[Seeder] ❌ Error: ${result.error} - ${result.message}`);
        } else {
            console.log(`[Seeder] ✅ Successfully processed ${result.interactive_tasks.length} questions.`);
            
            // If it returned 10, we run it again to get the next 10 (since they are randomized/round-robin)
            if (result.interactive_tasks.length < 20) {
                console.log('[Seeder] Running second batch...');
                const result2 = await MathsLabService.generateLesson(topic, level, userId, { 
                    isFactory: true,
                    forceRefresh: true 
                });
                console.log(`[Seeder] ✅ Second batch: ${result2.interactive_tasks.length} questions.`);
            }
        }

        console.log('✨ Seeding sequence complete.');
        process.exit(0);
    } catch (error) {
        console.error('[Seeder] 💥 Fatal Error:', error);
        process.exit(1);
    }
}

seedCirclesV4();
