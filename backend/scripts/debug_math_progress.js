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

async function checkMathProgress(email) {
    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) {
            console.log(`No user found with email: ${email}`);
            return;
        }

        const userDoc = userSnapshot.docs[0];
        const uid = userDoc.id;
        console.log(`User ID: ${uid}`);

        const progressDoc = await db.collection('users').doc(uid).collection('progress').doc('maths').get();
        if (!progressDoc.exists) {
            console.log("No math progress document found.");
        } else {
            const data = progressDoc.data();
            console.log("--- Math Progress ---");
            console.log("Practiced Skills:", JSON.stringify(data.practicedSkills || [], null, 2));
            console.log("Micro Skills Count:", Object.keys(data.microSkills || {}).length);
        }

        const roadmapDoc = await db.collection('users').doc(uid).collection('roadmap').doc('current_maths').get();
        if (!roadmapDoc.exists) {
            console.log("No math roadmap document found.");
        } else {
            const data = roadmapDoc.data();
            console.log("--- Math Roadmap ---");
            console.log("Roadmap Tasks:", JSON.stringify(data.tasks.map(t => ({ title: t.title, status: t.status })), null, 2));
        }

    } catch (error) {
        console.error("Error checking math progress:", error);
    } finally {
        process.exit();
    }
}

const email = process.argv[2] || 'fungtam@gmail.com';
checkMathProgress(email);
