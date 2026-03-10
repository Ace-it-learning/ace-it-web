const admin = require('firebase-admin');
const serviceAccount = require('c:\\Users\\user\\Documents\\ace-it-web\\backend\\serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function countApproved() {
    const snapshot = await db.collection('question_bank').get();
    const stats = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        const topic = data.topic_id || 'unknown';
        const level = data.level || 'unknown';
        const approved = data.is_approved || false;

        if (!stats[topic]) stats[topic] = {};
        if (!stats[topic][level]) stats[topic][level] = { approved: 0, total: 0 };

        stats[topic][level].total++;
        if (approved) stats[topic][level].approved++;
    });

    console.log(JSON.stringify(stats, null, 2));
}

countApproved().then(() => process.exit(0));
