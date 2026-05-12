const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function wipeEnglishData(email) {
    try {
        console.log(`[WIPE] Looking for user: ${email}`);
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        
        if (userSnapshot.empty) {
            console.log('[WIPE] User not found by email.');
            return;
        }

        const uid = userSnapshot.docs[0].id;
        console.log(`[WIPE] Found UID: ${uid}. Wiping English progress...`);

        const progressRef = db.collection('users').doc(uid).collection('progress').doc('english');
        const historyRef = db.collection('users').doc(uid).collection('progress').doc('english_history');

        // Delete main progress doc
        await progressRef.delete();
        console.log('[WIPE] Deleted progress/english');

        // Delete history snapshots if they exist
        const snapshots = await historyRef.collection('snapshots').get();
        if (!snapshots.empty) {
            const batch = db.batch();
            snapshots.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`[WIPE] Deleted ${snapshots.size} history snapshots`);
        }
        await historyRef.delete();

        // Optional: Wipe practice history for English to allow re-triggering of quests
        console.log('[WIPE] SUCCESS. English data reset for the new taxonomy.');
        process.exit(0);
    } catch (err) {
        console.error('[WIPE] ERROR:', err);
        process.exit(1);
    }
}

const email = process.argv[2] || 'fungtam@gmail.com';
wipeEnglishData(email);
