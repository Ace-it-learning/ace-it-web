const admin = require('firebase-admin');
const path = require('path');
const RoadmapService = require('../services/RoadmapService');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

async function forceRegenerate() {
    console.log("🔄 Force Regenerating Roadmaps...");

    try {
        const usersSnap = await db.collection('users').get();
        if (usersSnap.empty) {
            console.log("No users found.");
            return;
        }

        for (const doc of usersSnap.docs) {
            const uid = doc.id;
            console.log(`Processing user: ${uid}`);

            // Delete current plan to force generation
            await db.collection('users').doc(uid).collection('roadmap').doc('current').delete();

            // Generate New Plan (will include Eraser Challenge)
            await RoadmapService.generatePlan(uid, 'english');
            console.log(`✅ Roadmap regenerated for ${uid}`);
        }
    } catch (error) {
        console.error("Internal Error:", error);
    }
}

forceRegenerate().then(() => process.exit(0));
