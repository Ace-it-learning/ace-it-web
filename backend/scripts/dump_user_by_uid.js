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
const uid = 'MqNr6Kd7TeSsIvm50fIUJ91jeDf2';

async function dumpUserInfo() {
    try {
        const userRecord = await admin.auth().getUser(uid);
        console.log(`Email: ${userRecord.email}`);

        const subjects = ['english', 'maths'];
        for (const subject of subjects) {
            console.log(`--- ${subject} ---`);
            const progressDoc = await db.collection('users').doc(uid).collection('progress').doc(subject).get();
            if (progressDoc.exists) {
                console.log(JSON.stringify(progressDoc.data(), null, 2));
            } else {
                console.log(`No progress found for ${subject}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

dumpUserInfo().then(() => process.exit());
