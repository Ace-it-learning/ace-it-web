const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspectUser(email) {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) return;
    const uid = userSnapshot.docs[0].id;

    // Check Timeline
    const timelineSnap = await db.collection('users').doc(uid).collection('timeline').orderBy('date', 'desc').get();
    console.log('--- Timeline Entries ---');
    timelineSnap.forEach(doc => {
        const d = doc.data();
        console.log(`- ${d.title} (${d.type}) | XP: ${d.xp} | Date: ${d.date?.toDate()}`);
    });

    // Check English microSkills details
    const engProg = await db.collection('users').doc(uid).collection('progress').doc('english').get();
    if (engProg.exists) {
        const data = engProg.data();
        const microSkills = data.microSkills || {};
        console.log('\n--- MicroSkills with practiceCount > 0 ---');
        Object.entries(microSkills).forEach(([id, meta]) => {
            if (meta.practiceCount > 0 || meta.lastUpdated) {
                console.log(`- ${id}: practiceCount=${meta.practiceCount}, lastUpdated=${meta.lastUpdated?.toDate()}`);
            }
        });
    }

    process.exit(0);
}

inspectUser('fungtam@gmail.com');
