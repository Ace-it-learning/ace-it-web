const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const MathsLabService = require('../services/maths/MathsLabService');

async function testFetch() {
    console.log('[Test] 🧪 Testing MathsLabService.generateLesson for math_geo_circles...');
    
    try {
        const result = await MathsLabService.generateLesson({
            uid: 'test_user_123',
            topic: 'math_geo_circles',
            level: '4',
            targetCount: 5,
            language: 'en'
        });

        console.log('[Test] 📊 Result Summary:');
        console.log(`- Source: ${result.source}`);
        console.log(`- Questions: ${result.interactive_tasks.length}`);
        
        if (result.interactive_tasks.length > 0) {
            const first = result.interactive_tasks[0];
            console.log(`- First Q ID: ${first.id}`);
            console.log(`- Has Diagram: ${!!first.diagram_svg || !!first.diagram_json}`);
            console.log(`- Diagram JSON type: ${typeof first.diagram_json}`);
            if (typeof first.diagram_json === 'object') {
                console.log('  ✅ Diagram JSON correctly parsed.');
            } else {
                console.log('  ❌ Diagram JSON is still a string or missing.');
            }
        }
    } catch (err) {
        console.error('[Test] ❌ Test failed:', err);
    }
    process.exit(0);
}

testFetch();
