const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const UID = "OvPgsL9viLhB6170mTtZbvz7jj33";

async function run() {
    console.log(`🗑️ Clearing Cached Roadmap for ${UID}...`);

    const roadmapRef = db.collection('users').doc(UID).collection('roadmap').doc('current');

    try {
        await roadmapRef.delete();
        console.log("✅ Roadmap deleted. Next fetch will trigger regeneration.");

        // Optional: Trigger generation now (simulate fetch)
        const RoadmapService = require('./services/RoadmapService');
        console.log("🔄 Triggering regeneration now...");
        const newPlan = await RoadmapService.getCurrentPlan(UID);

        console.log("\n✨ NEW PLAN GENERATED:");
        console.log(`Tasks: ${newPlan.tasks.length}`);
        newPlan.tasks.forEach((t, i) => console.log(` [${i + 1}] ${t.title} (${t.type})`));

    } catch (e) {
        console.error("❌ Error:", e);
    }

    process.exit(0);
}

run();
