const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Adjust path if needed
require('dotenv').config();

// Initialize Firebase Admin if not already
if (!admin.apps.length) {
    // Try to auto-discover credentials or use default
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    } catch (e) {
        console.log("Failed default init, trying loose init...");
        admin.initializeApp();
    }
}

const db = admin.firestore();

async function resetUser(email) {
    console.log(`Searching for user: ${email}...`);
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`Found UID: ${uid}`);

        const userRef = db.collection('users').doc(uid);

        // Reset diagnostic fields
        await userRef.update({
            diagnostic_results: admin.firestore.FieldValue.delete(),
            profile: admin.firestore.FieldValue.delete(),
            onboarding_completed: false, // Reset onboarding if needed
            diagnostic_completed: false  // Reset flag
        });

        console.log(`✅ Successfully reset data for ${email} (UID: ${uid})`);

        // delete usage logs mostly to save space if needed, but keeping them is fine.
        // Optional: Delete usage history if "cleaning everything"
        // const usageSnapshot = await userRef.collection('usage_stats').get();
        // const batch = db.batch();
        // usageSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        // await batch.commit();
        // console.log("Cleared usage stats.");

    } catch (error) {
        console.error('Error resetting user:', error);
    }
    process.exit(0);
}

resetUser('fungtam@gmail.com');
