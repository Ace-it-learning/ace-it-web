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

async function syncPolynomialsBriefing() {
    console.log("🚀 Syncing Polynomials Briefing to Firestore...");
    
    const briefingPath = path.join(__dirname, '..', 'data', 'math_content', 'math_alg_polynomials.json');
    
    if (!fs.existsSync(briefingPath)) {
        console.error("❌ Error: math_alg_polynomials.json not found at", briefingPath);
        process.exit(1);
    }

    try {
        const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
        
        // Ensure ID is set correctly for Firestore
        const topicId = 'math_alg_polynomials';
        
        await db.collection('learning_content').doc(topicId).set(briefingData, { merge: true });
        
        console.log(`✅ Successfully synced ${topicId} to learning_content collection.`);
        
        // Final verification check of the data on Firestore
        const doc = await db.collection('learning_content').doc(topicId).get();
        const data = doc.data();
        
        console.log("\n--- Verification on Firestore ---");
        data.learning_modules.forEach(m => {
            m.concepts.forEach(c => {
                console.log(`Concept: ${c.name} | Visual Aid: ${c.visual_aid}`);
            });
        });

    } catch (error) {
        console.error("❌ Error sinking briefing:", error);
    }
}

syncPolynomialsBriefing().then(() => {
    console.log("--- Sync Complete ---");
    process.exit(0);
});
