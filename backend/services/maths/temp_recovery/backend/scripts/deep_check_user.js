const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function deepInspectUser(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`\n--- Inspecting ${email} (UID: ${uid}) ---`);

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            console.log("Main user document DOES NOT EXIST.");
        } else {
            const data = userDoc.data();
            console.log("Main Doc Diagnostic:", data.diagnostic_completed ? "Completed" : "Not Completed");
        }

        // List all subcollections
        const collections = await db.collection('users').doc(uid).listCollections();
        console.log("Subcollections found:", collections.map(c => c.id).join(', '));

        for (const col of collections) {
            console.log(`\n[Collection: ${col.id}]`);
            const docs = await col.limit(5).get();
            docs.forEach(d => {
                console.log(` - Doc: ${d.id}`);
                if (col.id === 'progress') {
                    const progressData = d.data();
                    console.log(`   * Archetype: ${progressData.archetype}`);
                    console.log(`   * MicroSkills Count: ${progressData.microSkills ? Object.keys(progressData.microSkills).length : 0}`);
                    console.log(`   * WeaknessPriority Count: ${progressData.weaknessPriority ? progressData.weaknessPriority.length : 0}`);
                }
            });
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

deepInspectUser('fungtam@gmail.com').then(() => process.exit());
