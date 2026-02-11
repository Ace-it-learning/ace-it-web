const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function repairUser(uid) {
    console.log(`\nRepairing user: ${uid}`);

    // Repair English
    const engRef = db.collection('users').doc(uid).collection('progress').doc('english');
    const engDoc = await engRef.get();
    if (engDoc.exists) {
        const data = engDoc.data();
        const microSkills = data.microSkills || {};
        const practicedSkills = data.practicedSkills || [];

        const newPracticed = new Set(practicedSkills);
        Object.keys(microSkills).forEach(id => newPracticed.add(id));

        if (newPracticed.size > practicedSkills.length) {
            await engRef.update({
                practicedSkills: Array.from(newPracticed)
            });
            console.log(`- English practicedSkills updated: ${practicedSkills.length} -> ${newPracticed.size}`);
        } else {
            console.log("- English practicedSkills already up to date.");
        }
    }

    // Repair Maths
    const mathRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const mathDoc = await mathRef.get();
    if (mathDoc.exists) {
        const data = mathDoc.data();
        const microSkills = data.microSkills || {};
        const practicedSkills = data.practicedSkills || [];

        const newPracticed = new Set(practicedSkills);
        Object.keys(microSkills).forEach(id => newPracticed.add(id));

        if (newPracticed.size > practicedSkills.length || !data.practicedSkills) {
            await mathRef.update({
                practicedSkills: Array.from(newPracticed)
            });
            console.log(`- Maths practicedSkills updated: ${practicedSkills.length} -> ${newPracticed.size}`);
        } else {
            console.log("- Maths practicedSkills already up to date.");
        }
    }
}

async function repairAll() {
    const usersSnapshot = await db.collection('users').get();
    console.log(`Total users found: ${usersSnapshot.size}`);

    for (const doc of usersSnapshot.docs) {
        try {
            await repairUser(doc.id);
        } catch (e) {
            console.error(`Failed to repair user ${doc.id}:`, e.message);
        }
    }

    console.log('\nRepair complete!');
    process.exit(0);
}

repairAll();
