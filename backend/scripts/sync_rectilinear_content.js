const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function syncLearningContent(topicId) {
    const jsonPath = path.join(__dirname, '..', 'data', 'math_content', `${topicId}.json`);
    
    if (!fs.existsSync(jsonPath)) {
        console.error(`❌ Local JSON for ${topicId} not found at: ${jsonPath}`);
        return;
    }

    try {
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const content = JSON.parse(rawData);

        console.log(`Syncing ${topicId} to Firestore...`);
        await db.collection('learning_content').doc(topicId).set(content);
        console.log(`✅ Successfully synced ${topicId} to Firestore!`);
    } catch (err) {
        console.error(`❌ Failed to sync ${topicId}:`, err);
    }
}

async function run() {
    await syncLearningContent('math_geo_rectilinear');
    process.exit(0);
}

run();
