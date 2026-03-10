const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!admin.apps.length) {
    if (require('fs').existsSync(serviceAccountPath)) {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
    } else {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
}

const db = admin.firestore();

async function checkBank() {
    const snapshot = await db.collection('question_bank').get();
    console.log(`CURRENT BANK SIZE: ${snapshot.size}`);
}

checkBank()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
