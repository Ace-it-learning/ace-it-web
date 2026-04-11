const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function listContents() {
    console.log('--- Learning Content ---');
    const snapshot = await db.collection('learning_content').get();
    snapshot.forEach(doc => {
        console.log(`- ${doc.id}`);
    });
    console.log('--- End ---');
    process.exit(0);
}

listContents();
