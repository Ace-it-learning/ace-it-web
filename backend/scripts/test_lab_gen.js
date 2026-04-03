const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const MathsLabService = require('../services/maths/MathsLabService');

async function test() {
    const params = {
        uid: 'diagnostic_test_user',
        topic: 'math_geo_rectilinear',
        level: 3, // DSE Standard
        language: 'en',
        isFactory: false
    };

    console.log('Testing generateLesson with params:', params);
    try {
        const result = await MathsLabService.generateLesson(params);
        console.log('Result Type:', result.type);
        console.log('Question Count:', result.interactive_tasks?.length || 0);
        if (result.error) {
            console.log('Error Code:', result.error);
            console.log('Message:', result.message);
        }
    } catch (err) {
        console.error('Execution Error:', err);
    }
    process.exit(0);
}

test();
