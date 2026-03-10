const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function cleanupPracticedSkills(email) {
    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) {
            console.log(`No user found with email: ${email}`);
            return;
        }

        const userDoc = userSnapshot.docs[0];
        const uid = userDoc.id;
        console.log(`User ID: ${uid}`);

        const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
        const progressDoc = await progressRef.get();

        if (!progressDoc.exists) {
            console.log("No math progress document found.");
        } else {
            console.log("Clearing practicedSkills array...");
            await progressRef.update({
                practicedSkills: [], // Reset to empty. They will be repopulated when they actually do a lab.
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log("Successfully cleared practicedSkills for user.");
        }

    } catch (error) {
        console.error("Error cleaning up practiced skills:", error);
    } finally {
        process.exit();
    }
}

const email = process.argv[2] || 'fungtam@gmail.com';
cleanupPracticedSkills(email);
