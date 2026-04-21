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
    console.log('--- 🛡️ INSPECTING RECENT BANK ENTRIES ---');

    const snapshot = await db.collection('question_bank')
        .orderBy('created_at', 'desc')
        .limit(20)
        .get();
    
    if (snapshot.empty) {
        console.log('No missions found.');
        return;
    }

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`[${doc.id}]`);
        console.log(`  Topic: ${data.topic}`);
        console.log(`  Level: ${data.level}`);
        console.log(`  Premium: ${data.is_premium}`);
        console.log(`  Factory: ${data.is_factory}`);
        console.log(`  Created: ${data.created_at?.toDate()}`);
    });
}

checkRecent()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
