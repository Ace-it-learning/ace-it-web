const admin = require('firebase-admin');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(keyPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function resetMastery() {
    console.log('Deep Resetting Math Mastery for all users...');
    const usersSnapshot = await db.collection('users').get();

    console.log(`Checking ${usersSnapshot.size} users for subcollections...`);
    let count = 0;

    for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const progressRef = db.collection('users').doc(uid).collection('progress');

        // 1. Delete the 'maths' progress document
        const mathsDoc = await progressRef.doc('maths').get();
        if (mathsDoc.exists) {
            await progressRef.doc('maths').delete();
            console.log(`- Deleted maths progress for ${uid}`);
            count++;
        }

        // 2. Delete the 'maths_history' snapshots subcollection
        const historyRef = progressRef.doc('maths_history').collection('snapshots');
        const snapshots = await historyRef.get();
        if (!snapshots.empty) {
            const batch = db.batch();
            snapshots.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`- Cleared maths_history snapshots for ${uid}`);
            count++;
        }

        // 3. Clear has_maths_diagnostic flag on main user doc
        if (userDoc.data().has_maths_diagnostic) {
            await userDoc.ref.update({ has_maths_diagnostic: false });
            console.log(`- Reset diagnostic flag for ${uid}`);
        }
    }

    console.log(`Deep reset complete. Modified ${count} records.`);
    process.exit(0);
}
resetMastery();
