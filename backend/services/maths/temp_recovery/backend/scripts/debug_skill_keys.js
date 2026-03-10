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

async function inspectUserSkills(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`\n--- Inspecting ${email} (UID: ${uid}) ---`);

        const progressDoc = await db.collection('users').doc(uid).collection('progress').doc('english').get();
        if (!progressDoc.exists) {
            console.log("No english progress doc found.");
            return;
        }

        const data = progressDoc.data();
        const microSkills = data.microSkills || {};
        const weaknessPriority = data.weaknessPriority || [];

        console.log(`Total MicroSkills: ${Object.keys(microSkills).length}`);
        console.log("Skill Keys:", Object.keys(microSkills).sort());

        console.log(`\nWeaknessPriority Count: ${weaknessPriority.length}`);
        if (weaknessPriority.length > 0) {
            console.log("Sample Weakness:", JSON.stringify(weaknessPriority[0], null, 2));
        }

        // Check for listening skills specifically
        const listeningSkills = Object.keys(microSkills).filter(k => k.startsWith('listening'));
        console.log(`\nListening Skills Found: ${listeningSkills.length}`);
        if (listeningSkills.length > 0) {
            listeningSkills.forEach(k => console.log(` - ${k}: ${JSON.stringify(microSkills[k])}`));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

inspectUserSkills('fungtam@gmail.com').then(() => process.exit());
