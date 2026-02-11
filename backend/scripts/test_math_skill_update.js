const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin (if not already acting as server)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const uid = 'test_user_math_skills'; // Use a test user

async function testSkillUpdate() {
    console.log(`testing update for user: ${uid}`);

    // Simulate direct DB update like UserProfileService
    // We want to test if saving random strings works (it should save, but frontend won't read it)
    // vs saving correct IDs.

    const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');

    // 1. Simulating AI returning natural language skills
    const aiOutputSkills = {
        "Algebra": { level: 4, practiceCount: 1 },
        "Quadratic Equations": { level: 5, practiceCount: 1 }
    };

    await progressRef.set({
        microSkills: aiOutputSkills,
        subject: 'Mathematics',
        last_updated: new Date()
    });

    console.log("Saved AI-style (natural language) skills.");
    console.log("Check frontend... it likely won't show these because constants/mathMicroSkills.js expects 'math_alg_quadratics' etc.");

    // 2. Simulating Correct IDs
    const correctIdSkills = {
        "math_alg_quadratics": { level: 6, practiceCount: 1 },
        "math_geo_circles": { level: 3, practiceCount: 1 }
    };

    // Wait 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    await progressRef.set({
        microSkills: correctIdSkills,
        subject: 'Mathematics',
        last_updated: new Date()
    }, { merge: true });

    console.log("Saved Correct ID skills.");

    // Read back
    const doc = await progressRef.get();
    console.log("Final DB Data:", JSON.stringify(doc.data(), null, 2));
}

testSkillUpdate().catch(console.error);
