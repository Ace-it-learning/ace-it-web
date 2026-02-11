const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, 'backend', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const uid = 'MqNr6Kd7TeSsIvm50fIUJ91jeDf2';

async function checkUserProgress() {
    console.log(`Checking progress for user: ${uid}`);
    const docRef = db.collection('users').doc(uid).collection('progress').doc('english');
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
        console.log('Progress data found:');
        console.log(JSON.stringify(docSnap.data(), null, 2));
    } else {
        console.log('No progress data found for this user.');
    }
}

checkUserProgress().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
