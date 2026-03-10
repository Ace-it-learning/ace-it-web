const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function findUserByEmailFirestore(email) {
    console.log(`Searching for email: ${email} in Firestore...`);
    try {
        const snapshot = await db.collection('users').where('email', '==', email).get();
        if (snapshot.empty) {
            console.log('No user found with that email in current environment.');

            // Try nickname just in case
            const nickSnapshot = await db.collection('users').where('nickname', '==', email).get();
            if (!nickSnapshot.empty) {
                nickSnapshot.forEach(doc => {
                    console.log(`Found UID via nickname: ${doc.id}`);
                });
            } else {
                console.log('No user found via nickname either.');
            }
        } else {
            snapshot.forEach(doc => {
                console.log(`Found UID for ${email}: ${doc.id}`);
            });
        }
    } catch (error) {
        console.error(`Error searching Firestore: ${error.message}`);
    }
    process.exit(0);
}

findUserByEmailFirestore('fungtam@gmail.com');
