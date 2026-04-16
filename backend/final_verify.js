const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./config/ace-it-production-sa.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function verifyFinal() {
    try {
        const uid = 'ObV30T3zmlYJ2FuKaJ473PXLDsv2'; 
        const docRef = db.collection('users').doc(uid);
        
        // Check Stats
        const stats = await docRef.collection('stats').doc('main').get();
        console.log(`FINAL VERIFICATION - UID: ${uid}`);
        console.log(`XP: ${stats.data().xp} | Level: ${stats.data().level}`);
        
        // Check Roadmap
        const roadmap = await docRef.collection('roadmap').get();
        console.log(`Roadmap items count: ${roadmap.size}`);
        roadmap.forEach(r => console.log(`- Roadmap doc: ${r.id}`));

        // Check Question Bank
        const qb = await db.collection('question_bank').count().get();
        console.log(`Question Bank Total: ${qb.data().count}`);

    } catch (e) {
        console.error(e);
    }
}

verifyFinal();
