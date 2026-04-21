const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkRecent() {
    console.log('--- 🛡️ INSPECTING RECENT PREMIUM ENTRIES ---');

    const snapshot = await db.collection('question_bank')
        .limit(20)
        .get();
    
    if (snapshot.empty) {
        console.log('No premium missions found.');
        return;
    }

    snapshot.docs.forEach(doc => {
        const d = doc.data();
        console.log(`[${doc.id}] JSON: ${JSON.stringify(d, null, 2)}`);
    });
}

checkRecent()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
