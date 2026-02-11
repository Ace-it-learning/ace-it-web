const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function restoreUser(email) {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) return;
    const uid = userSnapshot.docs[0].id;

    console.log(`Restoring user: ${uid} (fungtam@gmail.com)`);

    // Reset English practicedSkills
    // We know they did 'Literal Comprehension'.
    const engRef = db.collection('users').doc(uid).collection('progress').doc('english');
    await engRef.update({
        practicedSkills: ["reading_literalComprehension"]
    });
    console.log("- English practicedSkills restored to [\"reading_literalComprehension\"]");

    process.exit(0);
}

restoreUser('fungtam@gmail.com');
