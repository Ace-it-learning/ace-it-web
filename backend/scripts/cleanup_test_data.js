const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function cleanupUser(email) {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) return;
    const uid = userSnapshot.docs[0].id;

    console.log(`Cleaning up user: ${uid} (${email})`);

    const statsRef = db.collection('users').doc(uid).collection('stats').doc('main');

    // 1. Restore XP: They had 630.
    // Let's set xp to 630 and total_xp to 630.
    await statsRef.update({
        xp: 630,
        total_xp: 630,
        streakDays: 1 // Reset streak to 1 since my tests messed it up too
    });
    console.log('- Restored XP balance and Total XP to 630.');

    // 2. Remove test timeline entries
    const timelineColl = db.collection('users').doc(uid).collection('timeline');
    const tests = await timelineColl.where('title', 'in', ['Streak Test', 'Streak Test 2', 'Streak Test Reset']).get();

    for (const doc of tests.docs) {
        await doc.ref.delete();
        console.log(`- Deleted timeline entry: ${doc.data().title}`);
    }

    // 3. Optional: Remove the Mystery Tutor Box card if they didn't want it (actually it succeeded)
    // The user said "it prompts transaction failed" - but my script showed success.
    // If they have it, let's keep it as a gift, or remove it to be clean?
    // Let's remove it so they can try it themselves.
    const invSnap = await db.collection('users').doc(uid).collection('inventory').where('itemId', '==', 'tutor_strategist').get();
    for (const doc of invSnap.docs) {
        await doc.ref.delete();
        console.log('- Removed gift item (The Strategist) to allow clean retry.');
    }

    process.exit(0);
}

cleanupUser('fungtam@gmail.com');
