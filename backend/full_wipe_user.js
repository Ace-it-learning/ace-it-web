const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ serviceAccountKey.json not found.");
    process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function deleteCollection(collectionRef) {
    const snapshot = await collectionRef.get();
    if (snapshot.size === 0) return;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

async function bulkDeleteByQuery(collectionName, field, value) {
    console.log(`🔍 Checking collection: ${collectionName} for ${field} == ${value}...`);
    const snapshot = await db.collection(collectionName).where(field, '==', value).get();

    if (snapshot.empty) {
        console.log(`   - No records found in ${collectionName}.`);
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`   - Deleted ${snapshot.size} records from ${collectionName}.`);
}

async function deleteCollectionRecursive(collectionRef) {
    const snapshot = await collectionRef.get();
    if (snapshot.size === 0) return;

    for (const doc of snapshot.docs) {
        // Recursively delete subcollections of each document
        const subcollections = await doc.ref.listCollections();
        for (const sub of subcollections) {
            await deleteCollectionRecursive(sub);
        }
        await doc.ref.delete();
    }
}

async function fullWipe(email) {
    if (!email) {
        console.error("❌ No email provided.");
        process.exit(1);
    }

    try {
        console.log(`🔥 FULL WIPE START: ${email}`);

        let user;
        try {
            user = await admin.auth().getUserByEmail(email);
        } catch (authErr) {
            if (authErr.code === 'auth/user-not-found') {
                console.warn(`⚠️ User ${email} not found in Firebase Auth. Searching Firestore only...`);
                // Find by email field in 'users' collection as fallback
                const snap = await db.collection('users').where('email', '==', email).get();
                if (snap.empty) {
                    console.error(`❌ User ${email} not found in Firestore either.`);
                    process.exit(1);
                }
                user = { uid: snap.docs[0].id };
            } else {
                throw authErr;
            }
        }

        const uid = user.uid;
        console.log(`🆔 User Identity: ${uid}`);

        // 1. Delete Firestore User Document & ALL Subcollections (Recursive)
        const userRef = db.collection('users').doc(uid);
        const subcollections = await userRef.listCollections();
        for (const sub of subcollections) {
            console.log(`🗑️ Recursively deleting subcollection: users/${uid}/${sub.id}`);
            await deleteCollectionRecursive(sub);
        }
        await userRef.delete();
        console.log("✅ Main user document and all subcollections deleted.");

        // 2. Delete Global Records referencing UID
        const collectionsToClean = [
            { name: 'progress', field: 'uid' },
            { name: 'submissions', field: 'uid' },
            { name: 'exam_submissions', field: 'uid' },
            { name: 'exam_attempts', field: 'uid' },
            { name: 'writings', field: 'userId' },
            { name: 'token_usage', field: 'uid' }, // Just in case
            { name: 'skillmap', field: 'uid' },
            { name: 'writing_mocks', field: 'uid' },
            { name: 'mock_exams', field: 'uid' }
        ];

        for (const col of collectionsToClean) {
            await bulkDeleteByQuery(col.name, col.field, uid);
        }

        // 3. Delete from Firebase Auth
        try {
            await admin.auth().deleteUser(uid);
            console.log("✅ User deleted from Firebase Authentication.");
        } catch (authDelErr) {
            console.warn("⚠️ Auth deletion skipped or failed (User might only exist in Firestore).");
        }

        console.log(`\n🎉 SUCCESS: User ${email} has been completely removed from Ace It!.`);
        process.exit(0);
    } catch (e) {
        console.error("❌ Wipe failed:", e.message);
        process.exit(1);
    }
}

const email = process.argv[2] || 'fungtam@gmail.com';
fullWipe(email);
