const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();
const uid = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12'; // fungtam@gmail.com

async function deepWipeMensuration() {
    console.log(`[DEEP WIPE] Starting comprehensive reset for ${uid}...`);

    try {
        const userRef = db.collection('users').doc(uid);
        const progressRef = userRef.collection('progress').doc('maths');

        // 1. Reset Main User Document Flags
        await userRef.update({
            has_maths_diagnostic: false,
            is_new_student: true, // Force onboarding check
            status: 'new',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(" - Main user flags reset.");

        // 2. Wipe/Reset Progress Subcollection for Maths
        const progressSnap = await progressRef.get();
        if (progressSnap.exists) {
            const data = progressSnap.data();
            
            // Filter out Mensuration from practicedSkills
            const filteredPracticed = (data.practicedSkills || []).filter(s => s !== 'math_geo_mensuration');
            
            // Remove Mensuration from microSkills
            const filteredMicro = { ...data.microSkills };
            delete filteredMicro['math_geo_mensuration'];

            await progressRef.update({
                practicedSkills: filteredPracticed,
                microSkills: filteredMicro,
                last_updated: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(" - Progress subcollection (Maths) hardened/reset.");
        }

        // 3. Clear Practice History for Mensuration
        const historyRef = userRef.collection('practice_history');
        const historySnap = await historyRef.where('topic', '==', 'math_geo_mensuration').get();
        
        if (!historySnap.empty) {
            const batch = db.batch();
            historySnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(` - Deleted ${historySnap.size} practice history records for Mensuration.`);
        }

        console.log(`[SUCCESS] Deep wipe complete for ${uid}.`);
    } catch (error) {
        console.error("[ERROR] Deep wipe failed:", error);
    } finally {
        process.exit(0);
    }
}

deepWipeMensuration();
