const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error("serviceAccountKey.json not found.");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

async function resetUser(email) {
    try {
        const user = await admin.auth().getUserByEmail(email);
        const uid = user.uid;
        console.log(`Found user ${email} with UID: ${uid}`);

        const db = admin.firestore();

        const userRef = db.collection('users').doc(uid);

        // 1. Delete all subcollections
        const subcollections = await userRef.listCollections();
        for (const sub of subcollections) {
            console.log(`Deleting subcollection: ${sub.id}`);
            const snapshot = await sub.get();
            if (snapshot.size > 0) {
                const batch = db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        }

        // 2. Clear conversation history records pointing to this UID
        const historySnapshot = await db.collection('history').where('uid', '==', uid).get();
        if (!historySnapshot.empty) {
            const batch = db.batch();
            historySnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log("✅ Cleared top-level history records.");
        }

        // 3. Finally, delete the root user document
        await userRef.delete();
        console.log("✅ Main user document deleted.");

        console.log(`\n🚀 User ${email} has been totally wiped. Fresh start ready!`);
        process.exit(0);
    } catch (error) {
        console.error("Error resetting user:", error);
        process.exit(1);
    }
}

const targetEmail = process.argv[2] || 'fungtam@gmail.com';
resetUser(targetEmail);
