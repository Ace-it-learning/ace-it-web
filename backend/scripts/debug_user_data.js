const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function debugUser(email) {
    console.log(`Searching for user: ${email}`);
    const userSnapshot = await db.collection('users').where('email', '==', email).get();

    if (userSnapshot.empty) {
        console.log('User not found');
        return;
    }

    const userDoc = userSnapshot.docs[0];
    const uid = userDoc.id;
    console.log(`Found UID: ${uid}`);

    // Check English Progress
    const englishProgress = await db.collection('users').doc(uid).collection('progress').doc('english').get();
    if (englishProgress.exists) {
        const data = englishProgress.data();
        console.log('\n--- English Progress ---');
        console.log('practicedSkills:', JSON.stringify(data.practicedSkills || [], null, 2));
        console.log('microSkills count:', Object.keys(data.microSkills || {}).length);
    } else {
        console.log('\nEnglish Progress doc not found');
    }

    // Check Maths Progress
    const mathsProgress = await db.collection('users').doc(uid).collection('progress').doc('maths').get();
    if (mathsProgress.exists) {
        const data = mathsProgress.data();
        console.log('\n--- Maths Progress ---');
        console.log('practicedSkills:', JSON.stringify(data.practicedSkills || [], null, 2));
    } else {
        console.log('\nMaths Progress doc not found');
    }

    // Check Roadmap
    const roadmapDoc = await db.collection('users').doc(uid).collection('roadmap').doc('current').get();
    if (roadmapDoc.exists) {
        const data = roadmapDoc.data();
        console.log('\n--- Current Roadmap (English) ---');
        const completedTasks = (data.tasks || []).filter(t => t.status === 'COMPLETED');
        console.log('Completed Tasks:', completedTasks.map(t => t.title));
    }

    process.exit(0);
}

debugUser('fungtam@gmail.com');
