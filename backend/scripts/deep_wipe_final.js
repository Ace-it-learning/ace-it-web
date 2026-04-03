const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();
const uid = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12'; // fungtam@gmail.com

async function finalDeepWipe() {
    console.log(`[FINAL WIPE] Starting comprehensive reset for ${uid}...`);

    try {
        const userRef = db.collection('users').doc(uid);
        const progressRef = userRef.collection('progress').doc('maths');
        const statsRef = userRef.collection('stats').doc('main');

        // 1. Reset Main User Document (FORCE NEW)
        await userRef.set({
            has_maths_diagnostic: false,
            is_new_student: true,
            status: 'new',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(" - Main user document merged.");

        // 2. Reset Stats (FORCE BASELINE)
        await statsRef.set({
            xp: 50,
            level: 1,
            total_xp: 50,
            streakDays: 0,
            lastActivity: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(" - Stats reset to baseline (50 XP).");

        // 3. Reset Progress (Maths)
        const progressSnap = await progressRef.get();
        if (progressSnap.exists) {
            const data = progressSnap.data();
            const filteredPracticed = (data.practicedSkills || []).filter(s => s !== 'math_geo_mensuration');
            const filteredMicro = { ...data.microSkills };
            delete filteredMicro['math_geo_mensuration'];

            await progressRef.set({
                practicedSkills: filteredPracticed,
                microSkills: filteredMicro,
                last_updated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(" - Progress subcollection (Maths) cleaned.");
        }

        // 4. Clear Mensuration History
        const historyRef = userRef.collection('practice_history');
        const historySnap = await historyRef.where('topic', '==', 'math_geo_mensuration').get();
        
        if (!historySnap.empty) {
            const batch = db.batch();
            historySnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(` - Deleted ${historySnap.size} practice records.`);
        }

        console.log(`[SUCCESS] Account ${uid} is now in a "New Student" state.`);
    } catch (error) {
        console.error("[ERROR] Final wipe failed:", error);
    } finally {
        process.exit(0);
    }
}

finalDeepWipe();
