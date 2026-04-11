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

async function cleanup() {
    await db.collection('learning_content').doc('math_alg_complex').delete();
    console.log('✅ Deleted duplicate math_alg_complex');
    process.exit(0);
}

cleanup();
