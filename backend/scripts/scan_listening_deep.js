const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function scanTopics() {
    const snapshot = await db.collection('question_bank').get();

    const stats = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        const type = data.type || "Unknown Type";
        const topic = data.topic || "Unknown Topic";
        const paper = data.paper || "Unknown Paper";
        
        if (topic.toLowerCase().includes('listening') || type.toLowerCase().includes('listening') || paper.toLowerCase().includes('listening')) {
            const key = `Type: ${type} | Topic: ${topic} | Paper: ${paper}`;
            stats[key] = (stats[key] || 0) + 1;
        }
    });

    console.log("Listening-Related Docs Found:");
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
}

scanTopics();
