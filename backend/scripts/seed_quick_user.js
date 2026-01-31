const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const uid = 'OvPgsL9viLhB6170mTtZbvz7jj33'; // The UID found in logs

async function seedUser() {
    console.log(`Seeding user ${uid}...`);

    // 1. Set Profile (Bypasses Onboarding)
    await db.collection('users').doc(uid).set({
        email: 'fungtam@gmail.com',
        displayName: 'Fung Tam',
        onboardingCompleted: true, // Key flag
        level: 3,
        target_level: 5,
        created_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Set Diagnostic Result
    await db.collection('users').doc(uid).collection('diagnostic').doc('english').set({
        overall_level: 3,
        archetype: "Rapid Tester",
        strengths: ["Speed", "Confidence"],
        weaknesses: ["Grammar", "Depth"],
        one_month_plan: [
            "Complete 5 practice reading passages",
            "Master Past Tense",
            "Complete 5 practice listening drills",
            "Learn 20 new vocab words"
        ],
        completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Force Roadmap Logic
    // We can just delete the current roadmap to force auto-generation on next fetch,
    // OR we can generate it right here if we import the service. 
    // For simplicity, let's just let the backend generate it on next page load/API call, 
    // BUT we must ensure the 'current' doc is deleted so it regenerates.
    await db.collection('users').doc(uid).collection('roadmap').doc('current').delete();

    console.log("Seeding complete. User should be able to skip onboarding.");
    process.exit(0);
}

seedUser();
