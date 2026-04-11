const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json'); // I hope this exists

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkUser() {
    try {
        const userSnapshot = await db.collection('users').where('email', '==', 'fungtam@gmail.com').get();
        if (userSnapshot.empty) {
            console.log('No user found');
            return;
        }
        const user = userSnapshot.docs[0];
        console.log('UID:', user.id);
        console.log('Profile:', user.data().profile);
        
        const progress = await db.collection('users').doc(user.id).collection('progress').doc('maths').get();
        if (progress.exists) {
            console.log('Math Progress:', JSON.stringify(progress.data(), null, 2));
        } else {
            console.log('No math progress found');
        }
    } catch (e) {
        console.error(e);
    }
}

checkUser();
