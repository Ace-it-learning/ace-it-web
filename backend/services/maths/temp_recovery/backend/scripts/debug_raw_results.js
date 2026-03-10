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

async function inspectRawResults(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`\n--- Inspecting Raw Results for ${email} (UID: ${uid}) ---`);

        const progressDoc = await db.collection('users').doc(uid).collection('progress').doc('english').get();
        if (!progressDoc.exists) {
            console.log("No english progress doc found.");
            return;
        }

        const data = progressDoc.data();
        console.log("Keys in Doc:", Object.keys(data).sort());

        if (data.raw_results) {
            console.log("\nRaw Results Found:");
            Object.keys(data.raw_results).forEach(k => {
                console.log(` - ${k}: Present`);
            });

            if (data.raw_results.listening) {
                console.log("\nListening Raw Result Sample:", JSON.stringify(data.raw_results.listening).substring(0, 500));
            } else {
                console.log("\nLISTENING RAW RESULT IS MISSING!");
            }
        } else {
            console.log("\nRAW_RESULTS FIELD IS MISSING!");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

inspectRawResults('fungtam@gmail.com').then(() => process.exit());
