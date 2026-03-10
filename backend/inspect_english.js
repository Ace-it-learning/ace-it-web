const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspectEnglishQuests() {
    console.log("Inspecting English questions for topic mapping...");

    const snap = await db.collection('question_bank')
        .where('subject', '==', 'English')
        .limit(10)
        .get();

    snap.forEach(doc => {
        const d = doc.data();
        console.log(`Quest ID: ${doc.id}`);
        console.log(`- topic: ${d.topic}`);
        console.log(`- topic_id: ${d.topic_id}`);
        console.log(`- paper: ${d.paper}`);
        console.log(`- is_approved: ${d.is_approved}`);
        console.log('---');
    });

    process.exit(0);
}

inspectEnglishQuests();
