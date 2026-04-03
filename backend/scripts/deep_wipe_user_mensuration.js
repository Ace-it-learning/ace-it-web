const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const UID = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12'; // User: fungtam@gmail.com

async function deepWipeMensuration() {
    console.log(`🧹 Starting DEEP WIPE of Mensuration progress for ${UID}...`);

    const userRef = db.collection('users').doc(UID);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        console.error("❌ User not found.");
        return;
    }

    const userData = userSnap.data();
    const updates = {};

    // 1. Root User Doc: practicedSkills
    if (userData.practicedSkills) {
        const filtered = userData.practicedSkills.filter(s => s !== 'math_mensuration' && s !== 'mensuration');
        if (filtered.length !== userData.practicedSkills.length) {
            updates.practicedSkills = filtered;
            console.log("✅ Cleared from practicedSkills.");
        }
    }

    // 2. Root User Doc: microSkills
    if (userData.microSkills && (userData.microSkills.math_mensuration || userData.microSkills.mensuration)) {
        const updatedMicroSkills = { ...userData.microSkills };
        delete updatedMicroSkills.math_mensuration;
        delete updatedMicroSkills.mensuration;
        updates.microSkills = updatedMicroSkills;
        console.log("✅ Cleared from microSkills.");
    }

    if (Object.keys(updates).length > 0) {
        await userRef.update(updates);
    }

    // 3. Subcollections Scan
    const subcollections = ['practice_history', 'notebook', 'timeline', 'stats'];
    for (const sub of subcollections) {
        const subRef = userRef.collection(sub);
        const subSnap = await subRef.get();
        let count = 0;
        for (const doc of subSnap.docs) {
            const data = doc.data();
            const id = doc.id;
            const matches = 
                id.includes('mensuration') || 
                data.topic === 'math_mensuration' || 
                data.topicId === 'math_mensuration' ||
                (data.questionId && data.questionId.includes('mensuration'));
            
            if (matches) {
                await doc.ref.delete();
                count++;
            }
        }
        console.log(`✅ Deleted ${count} records from subcollection: ${sub}`);
    }

    // 4. Root Skillmap
    const skillmapRef = db.collection('skillmap').doc(UID);
    const smSnap = await skillmapRef.get();
    if (smSnap.exists) {
        const smData = smSnap.data();
        if (smData.math_mensuration || smData.mensuration) {
            await skillmapRef.update({
                math_mensuration: admin.firestore.FieldValue.delete(),
                mensuration: admin.firestore.FieldValue.delete()
            });
            console.log("✅ Cleared from skillmap root.");
        }
    }

    // 5. Active Sessions
    const sessionsSnap = await db.collection('maths_sessions')
        .where('uid', '==', UID)
        .where('topic', '==', 'math_mensuration')
        .get();
    
    for (const doc of sessionsSnap.docs) {
        await doc.ref.delete();
        console.log(`✅ Deleted active session: ${doc.id}`);
    }

    console.log("🎊 DEEP WIPE complete. The account is now fresh for Mensuration.");
}

deepWipeMensuration().then(() => process.exit(0)).catch(err => {
    console.error("❌ Deep wipe failed:", err);
    process.exit(1);
});
