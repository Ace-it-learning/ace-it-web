const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkUserSkills(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`UID for ${email}: ${uid}`);

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            console.log("User doc not found.");
            return;
        }

        const userData = userDoc.data();
        console.log("User Level:", userData.level);
        console.log("Has Diagnostic:", userData.hasDiagnostic);

        // Check legacy skillMap
        console.log("Legacy SkillMap Keys:", userData.skillMap ? Object.keys(userData.skillMap) : "None");

        // Check progress/English
        const progressDoc = await db.collection('users').doc(uid).collection('progress').doc('English').get();
        if (progressDoc.exists) {
            const progressData = progressDoc.data();
            console.log("Progress MicroSkills Keys:", progressData.microSkills ? Object.keys(progressData.microSkills) : "None");
            console.log("WeaknessPriority Count:", progressData.weaknessPriority ? progressData.weaknessPriority.length : "None");
        } else {
            console.log("Progress 'English' doc not found.");
        }

        // Check if there's a recent diagnostic profile stored
        // In DiagnosticService, we return the profile which the frontend presumably saves.
        // Let's see if it's saved in the user doc itself under a different name.

    } catch (error) {
        console.error("Error:", error);
    }
}

checkUserSkills('fungtam@gmail.com').then(() => process.exit());
