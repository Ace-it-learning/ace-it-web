const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function findUserAndWipe(email) {
    console.log(`Searching for email: ${email}...`);
    try {
        const snapshot = await db.collection('users').where('email', '==', email).get();
        if (snapshot.empty) {
            console.log('No user found with that email.');
        } else {
            for (const userDoc of snapshot.docs) {
                const uid = userDoc.id;
                console.log(`Found UID: ${uid}. Wiping data...`);

                // 1. Delete progress collections (English and Maths)
                const progressRef = db.collection('users').doc(uid).collection('progress');
                const progressSnapshot = await progressRef.get();
                for (const doc of progressSnapshot.docs) {
                    await doc.ref.delete();
                    console.log(`- Deleted progress doc: ${doc.id}`);
                }

                // 2. Clear stats
                const statsRef = db.collection('users').doc(uid).collection('stats').doc('main');
                await statsRef.set({
                    xp: 0,
                    level: 1,
                    lastActivity: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                console.log(`- Reset main stats`);

                // 3. Clear timeline
                const timelineSnapshot = await db.collection('users').doc(uid).collection('timeline').get();
                for (const doc of timelineSnapshot.docs) {
                    await doc.ref.delete();
                }
                console.log(`- Cleared timeline`);

                // 4. Update main profile
                await db.collection('users').doc(uid).update({
                    diagnostic_completed: false,
                    has_maths_diagnostic: false,
                    is_new_student: true,
                    status: 'new'
                });
                console.log(`- Reset user profile flags`);
            }
            console.log('✅ Wipe complete.');
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
    process.exit(0);
}

findUserAndWipe('fungtam@gmail.com');
