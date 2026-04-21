const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkL3() {
    const topicName = 'Literal Comprehension';
    const levelName = 'HKDSE Level 3 (Adequate)';
    console.log(`Checking questions for ${topicName} @ ${levelName}...`);
    
    const snapshot = await db.collection('question_bank')
        .where('topic', '==', topicName)
        .where('level', '==', levelName)
        .get();
    
    console.log(`Found ${snapshot.size} documents.`);
    
    const passages = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        const p = data.passage || data.reading_passage || "NO_PASSAGE";
        const pSnippet = p.substring(0, 50);
        if (!passages[pSnippet]) passages[pSnippet] = 0;
        passages[pSnippet]++;
    });

    console.log('--- CLUSTERS BY PASSAGE ---');
    console.log(JSON.stringify(passages, null, 2));
    
    process.exit(0);
}

checkL3().catch(console.error);
