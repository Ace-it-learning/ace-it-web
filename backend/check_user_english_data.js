const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkUserData(email) {
    try {
        console.log(`Checking data for email: ${email}`);
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        
        if (userSnapshot.empty) {
            console.log('User not found in users collection. Checking Auth...');
            try {
                const userRecord = await admin.auth().getUserByEmail(email);
                console.log(`User found in Auth: ${userRecord.uid}`);
                await checkProgress(userRecord.uid);
            } catch (authErr) {
                console.log('User not found in Auth either.');
            }
            return;
        }

        userSnapshot.forEach(async (doc) => {
            const userData = doc.data();
            const uid = doc.id;
            console.log(`User found: ${uid}`);
            console.log('User Data:', JSON.stringify(userData, null, 2));
            await checkProgress(uid);
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

async function checkProgress(uid) {
    console.log(`--- Progress for ${uid} ---`);
    const progressRef = db.collection('users').doc(uid).collection('progress');
    const progressSnapshot = await progressRef.get();
    
    if (progressSnapshot.empty) {
        console.log('No progress documents found.');
    } else {
        progressSnapshot.forEach(doc => {
            console.log(`Subject: ${doc.id}`);
            const data = doc.data();
            console.log('MicroSkills count:', Object.keys(data.microSkills || {}).length);
            console.log('MicroSkills:', JSON.stringify(data.microSkills, null, 2));
            console.log('PracticedSkills:', JSON.stringify(data.practicedSkills, null, 2));
        });
    }

    console.log(`--- Stats for ${uid} ---`);
    const statsRef = db.collection('users').doc(uid).collection('stats').doc('main');
    const statsDoc = await statsRef.get();
    if (statsDoc.exists) {
        console.log('Stats:', JSON.stringify(statsDoc.data(), null, 2));
    } else {
        console.log('No stats found.');
    }
}

checkUserData('fungtam@gmail.com');
