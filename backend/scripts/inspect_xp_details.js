const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspectStats(email) {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
        console.log('User not found');
        return;
    }
    const uid = userSnapshot.docs[0].id;
    console.log(`UID: ${uid}`);

    const statsDoc = await db.collection('users').doc(uid).collection('stats').doc('main').get();
    if (statsDoc.exists) {
        console.log('\n--- Stats ---');
        console.log(JSON.stringify(statsDoc.data(), null, 2));
    } else {
        console.log('\nStats not found');
    }

    const timelineSnap = await db.collection('users').doc(uid).collection('timeline').orderBy('date', 'desc').limit(20).get();
    console.log('\n--- Recent Timeline ---');
    timelineSnap.forEach(doc => {
        const d = doc.data();
        console.log(`- ${d.date?.toDate().toISOString()} | ${d.title} | XP: ${d.xp} | Type: ${d.type}`);
    });

    // Check inventory
    const inventorySnap = await db.collection('users').doc(uid).collection('inventory').get();
    console.log('\n--- Inventory ---');
    inventorySnap.forEach(doc => {
        const d = doc.data();
        console.log(`- ${d.itemId}: ${d.name} (${d.rarity})`);
    });

    process.exit(0);
}

inspectStats('fungtam@gmail.com');
