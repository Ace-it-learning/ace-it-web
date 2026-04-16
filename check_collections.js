const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const serviceAccount = require('./backend/serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkCollections() {
    try {
        const collections = await db.listCollections();
        console.log("Found Collections:");
        collections.forEach(c => console.log("- ", c.id));
    } catch (e) {
        console.error("Error listing collections:", e);
    }
}

checkCollections();
