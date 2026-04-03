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

async function syncProbStatBriefing() {
    console.log("🚀 Syncing Probability & Statistics (math_stat_prob) Briefing...");
    
    // Updated path to use consolidated file
    const briefingPath = path.join(__dirname, '..', 'data', 'math_content', 'math_stat_prob.json');
    
    if (!fs.existsSync(briefingPath)) {
        console.error("❌ Error: math_stat_prob.json not found at", briefingPath);
        process.exit(1);
    }

    try {
        const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
        const topicId = 'math_stat_prob';
        
        await db.collection('learning_content').doc(topicId).set(briefingData, { merge: true });
        
        console.log(`✅ Successfully synced ${topicId} to learning_content collection.`);
        
        // Minor Verification 
        const doc = await db.collection('learning_content').doc(topicId).get();
        const data = doc.data();
        console.log(`Verified title on Firestore: ${data.title}`);

    } catch (error) {
        console.error("❌ Error syncing briefing:", error);
    }
}

syncProbStatBriefing().then(() => {
    console.log("--- Sync Complete ---");
    process.exit(0);
});
