const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function listUsers() {
    console.log(`Listing users...`);
    try {
        const snapshot = await db.collection('users').limit(100).get();
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`UID: ${doc.id}, Email: ${data.email}, Nickname: ${data.nickname}`);
        });
    } catch (error) {
        console.error(`Error listing users: ${error.message}`);
    }
    process.exit(0);
}

listUsers();
