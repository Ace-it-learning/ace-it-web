const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

/**
 * Patches SVG diagram strings by replacing LaTeX symbols with HTML entities
 */
function patchSvg(svg) {
    if (!svg || typeof svg !== 'string') return svg;
    return svg
        .replace(/\^\circ/g, '&#176;')
        .replace(/\\theta/g, '&#952;')
        .replace(/\\rightarrow/g, '&#8594;')
        .replace(/\$/g, ''); // Strip $ delimiters
}

async function rescueSessions() {
    console.log("🚀 Starting Session Rescue for Mensuration...");

    const sessionsRef = db.collection('maths_sessions');
    const snapshot = await sessionsRef.where('topic_id', '==', 'math_mensuration').get();

    if (snapshot.empty) {
        console.log("ℹ️ No Mensuration sessions found to patch.");
        return;
    }

    console.log(`🔍 Found ${snapshot.size} sessions. Processing...`);

    const batch = db.batch();
    let patchedCount = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        let changed = false;

        if (data.interactive_tasks && Array.isArray(data.interactive_tasks)) {
            const updatedTasks = data.interactive_tasks.map(task => {
                if (task.diagram_svg) {
                    const original = task.diagram_svg;
                    const patched = patchSvg(original);
                    if (original !== patched) {
                        changed = true;
                        return { ...task, diagram_svg: patched };
                    }
                }
                return task;
            });

            if (changed) {
                batch.update(doc.ref, { interactive_tasks: updatedTasks });
                patchedCount++;
            }
        }
    });

    if (patchedCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully patched ${patchedCount} sessions.`);
    } else {
        console.log("ℹ️ No changes needed in existing sessions.");
    }
}

rescueSessions().then(() => process.exit(0)).catch(err => {
    console.error("❌ Rescue failed:", err);
    process.exit(1);
});
