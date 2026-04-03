const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const UID = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12'; // User: fungtam@gmail.com

async function clearMensurationProgress() {
    console.log(`🚀 Starting Record Clearing for ${UID} (math_mensuration)...`);

    const userRef = db.collection('users').doc(UID);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        console.error("❌ User not found.");
        return;
    }

    const userData = userSnap.data();
    const updates = {};

    // 1. Clear from practicedSkills
    if (userData.practicedSkills) {
        const filtered = userData.practicedSkills.filter(s => s !== 'math_mensuration');
        if (filtered.length !== userData.practicedSkills.length) {
            updates.practicedSkills = filtered;
            console.log("✅ Removed from practicedSkills.");
        }
    }

    // 2. Clear from microSkills
    if (userData.microSkills && userData.microSkills.math_mensuration) {
        const updatedMicroSkills = { ...userData.microSkills };
        delete updatedMicroSkills.math_mensuration;
        updates.microSkills = updatedMicroSkills;
        console.log("✅ Removed from microSkills.");
    }

    if (Object.keys(updates).length > 0) {
        await userRef.update(updates);
    }

    // 3. Clear from skillmap (if exists)
    const skillmapRef = db.collection('skillmap').doc(UID);
    const skillmapSnap = await skillmapRef.get();
    if (skillmapSnap.exists) {
        const smData = skillmapSnap.data();
        if (smData.math_mensuration) {
            await skillmapRef.update({
                math_mensuration: admin.firestore.FieldValue.delete()
            });
            console.log("✅ Removed from skillmap root.");
        }
    }

    // 4. Clear from practice_history subcollection
    const historyRef = userRef.collection('practice_history');
    const historySnap = await historyRef.get();
    let historyCount = 0;
    
    // We need to identify which docs belong to mensuration. 
    // Usually these are identified by question ID or topic field.
    for (const doc of historySnap.docs) {
        const d = doc.data();
        // Check if question ID starts with v1_mensuration_ or topic is math_mensuration
        if (d.topic === 'math_mensuration' || doc.id.includes('mensuration') || (d.questionId && d.questionId.includes('mensuration'))) {
            await doc.ref.delete();
            historyCount++;
        }
    }
    console.log(`✅ Deleted ${historyCount} practice_history records.`);

    // 5. Clear from notebook (mistakes)
    const notebookRef = userRef.collection('notebook');
    const notebookSnap = await notebookRef.get();
    let notebookCount = 0;
    for (const doc of notebookSnap.docs) {
        const d = doc.data();
        if (d.topic === 'math_mensuration' || (d.questionId && d.questionId.includes('mensuration'))) {
            await doc.ref.delete();
            notebookCount++;
        }
    }
    console.log(`✅ Deleted ${notebookCount} notebook records.`);

    console.log("🎊 Progress reset complete. You can now retry the Mensuration Quest.");
}

clearMensurationProgress().then(() => process.exit(0)).catch(err => {
    console.error("❌ Clearing failed:", err);
    process.exit(1);
});
