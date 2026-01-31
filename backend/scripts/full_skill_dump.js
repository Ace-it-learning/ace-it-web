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

async function fullSkillDump(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`\n--- Full Skill Dump for ${email} (UID: ${uid}) ---`);

        const progressDoc = await db.collection('users').doc(uid).collection('progress').doc('english').get();
        if (!progressDoc.exists) {
            console.log("No english progress doc found.");
            return;
        }

        const data = progressDoc.data();
        const microSkills = data.microSkills || {};

        console.log(`Total Keys: ${Object.keys(microSkills).length}`);
        console.log("--- KEYS ---");
        Object.keys(microSkills).sort().forEach(k => {
            console.log(k);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

fullSkillDump('fungtam@gmail.com').then(() => process.exit());
