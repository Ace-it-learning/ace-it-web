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

async function wipeAllQuests() {
    console.log('--- STARTING TOTAL DATABASE WIPE: question_bank ---');

    const snapshot = await db.collection('question_bank').get();

    if (snapshot.empty) {
        console.log('Question bank is already empty.');
        return;
    }

    console.log(`Found ${snapshot.size} records. Deleting...`);

    const batchSize = 100;
    let count = 0;

    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = snapshot.docs.slice(i, i + batchSize);

        chunk.forEach(doc => {
            batch.delete(doc.ref);
            count++;
        });

        await batch.commit();
        console.log(`Progress: ${count}/${snapshot.size} deleted.`);
    }

    console.log('--- WIPE COMPLETE: question_bank is now empty ---');
}

wipeAllQuests()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Wipe failed:', err);
        process.exit(1);
    });
