const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function syncIndicesBriefing() {
    console.log("🚀 Syncing Laws of Indices Briefing to Firestore...");
    
    const topicId = 'math_alg_indices';
    const briefingPath = path.join(__dirname, '..', 'data', 'math_content', `${topicId}.json`);
    
    if (!fs.existsSync(briefingPath)) {
        console.error(`❌ Error: ${topicId}.json not found at`, briefingPath);
        process.exit(1);
    }

    try {
        const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
        
        await db.collection('learning_content').doc(topicId).set(briefingData, { merge: true });
        
        console.log(`✅ Successfully synced ${topicId} to learning_content collection.`);
        
        // Final verification check
        const doc = await db.collection('learning_content').doc(topicId).get();
        const data = doc.data();
        
        console.log("\n--- Verification on Firestore ---");
        console.log(`Topic: ${data.name} / ${data.name_zh}`);
        console.log(`Modules: ${data.learning_modules.length}`);
        data.learning_modules.forEach(m => {
            console.log(`  - Module: ${m.title} (${m.concepts.length} concepts)`);
        });

    } catch (error) {
        console.error("❌ Error syncing briefing:", error);
    }
}

syncIndicesBriefing().then(() => {
    console.log("\n--- Sync Complete ---");
    process.exit(0);
});
