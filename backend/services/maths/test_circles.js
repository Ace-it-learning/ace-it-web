const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');
const MathsLabService = require('./MathsLabService');

async function testCircleProperties() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    console.log("Starting test for Circle Properties...");
    try {
        const result = await MathsLabService.generateLesson('math_geo_circles', 3, { uid: 'test-user', isSimulation: false });
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testCircleProperties();
