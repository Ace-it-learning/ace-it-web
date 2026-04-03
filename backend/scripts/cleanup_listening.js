const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function cleanup() {
    console.log("Cleaning up duplicate listening missions...");
    const snapshot = await db.collection('question_bank')
        .where('type', '==', 'listening_mission')
        .get();

    const seen = new Set();
    let deletedCount = 0;

    // Sort by created_at descending so we keep the newest ones (if they have data)
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    docs.sort((a, b) => {
         const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at || 0);
         const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at || 0);
         return dateB - dateA;
    });

    for (const doc of docs) {
        const title = (doc.title || "").toLowerCase().trim();
        if (seen.has(title)) {
            console.log(`Deleting duplicate: ${doc.title} (${doc.id})`);
            await db.collection('question_bank').doc(doc.id).delete();
            deletedCount++;
        } else {
            seen.add(title);
        }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} duplicates.`);
    process.exit(0);
}

cleanup();
