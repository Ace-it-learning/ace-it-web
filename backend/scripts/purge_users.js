const admin = require('firebase-admin');
const sa = require('../config/antigravity-tutor-dev-key.json');

admin.initializeApp({
    credential: admin.credential.cert(sa)
});

const db = admin.firestore();
const auth = admin.auth();

const KEEP_EMAILS = [
    'fungtam@gmail.com',
    'testuser@example.com'
];

async function deleteCollectionByUid(collectionName, uid) {
    console.log(`Checking ${collectionName} for UID: ${uid}...`);
    const snapshot = await db.collection(collectionName).where('uid', '==', uid).get();
    if (snapshot.empty) return;

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`  Deleted ${snapshot.size} documents from ${collectionName}.`);
}

async function deleteUserRecursive(uid) {
    const userRef = db.collection('users').doc(uid);
    const subCollections = [
        'stats', 'progress', 'timeline', 'notebook',
        'chat_history', 'inventory', 'quest_results'
    ];

    for (const collName of subCollections) {
        const subCollRef = userRef.collection(collName);
        const snapshot = await subCollRef.get();
        if (snapshot.empty) continue;

        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`  Deleted sub-collection: ${collName}`);
    }

    await userRef.delete();
    console.log(`  Deleted main user profile document.`);
}

async function runPurge() {
    console.log("Starting account purge...");
    
    let pageToken;
    let totalDeleted = 0;

    do {
        const listUsersResult = await auth.listUsers(1000, pageToken);
        for (const userRecord of listUsersResult.users) {
            const email = userRecord.email;
            const uid = userRecord.uid;

            if (KEEP_EMAILS.includes(email)) {
                console.log(`KEEPING user: ${email} (${uid})`);
                continue;
            }

            console.log(`PURGING user: ${email || 'No Email'} (${uid})`);

            try {
                // 1. Delete from root collections
                await deleteCollectionByUid('exam_submissions', uid);
                await deleteCollectionByUid('results', uid);

                // 2. Delete Firestore user profile and sub-collections
                await deleteUserRecursive(uid);

                // 3. Delete from Auth
                await auth.deleteUser(uid);
                
                totalDeleted++;
                console.log(`  Successfully purged ${email || uid}`);
            } catch (err) {
                console.error(`  Error purging ${email || uid}:`, err.message);
            }
        }
        pageToken = listUsersResult.pageToken;
    } while (pageToken);

    console.log(`Purge complete. Total deleted: ${totalDeleted} users.`);
}

runPurge().then(() => process.exit(0)).catch(err => {
    console.error("Purge failed:", err);
    process.exit(1);
});
