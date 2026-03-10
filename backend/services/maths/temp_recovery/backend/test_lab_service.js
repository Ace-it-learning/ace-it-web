const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase for local test
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (fs.existsSync(serviceAccountPath)) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
    }
} else {
    console.error("No service account found");
    process.exit(1);
}

const LabService = require('./services/LabService');

async function test() {
    try {
        console.log("Starting test...");
        const result = await LabService.generateLesson({
            topic: 'writing_vocabularyRange',
            level: '5',
            uid: 'test-user',
            focus: []
        });
        console.log("SUCCESS:", JSON.stringify(result, null, 2).substring(0, 500));
    } catch (e) {
        console.error("FAILED:", e);
    }
}

test();
