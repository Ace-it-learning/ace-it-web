const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
} else {
    admin.initializeApp();
}

const db = admin.firestore();

async function aggregateQuests() {
    console.log("Starting Optimized Aggregation (Chunked)...");

    const counts = {}; // { topic: { level: count } }
    const topicNames = {};
    let totalProcessed = 0;
    let lastDoc = null;
    const CHUNK_SIZE = 500;

    while (true) {
        let query = db.collection('question_bank')
            .where('is_factory', '==', true)
            .limit(CHUNK_SIZE);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();

        if (snapshot.empty) break;

        snapshot.forEach(doc => {
            const data = doc.data();
            const topicId = data.topic_id || data.topic || 'unknown';
            const topicName = data.topic || data.topic_id || 'Unknown Topic';
            let level = data.level;

            // Normalize level to string for key mapping
            if (level === undefined || level === null) level = 'unrated';

            if (!counts[topicId]) {
                counts[topicId] = {};
                topicNames[topicId] = topicName;
            }

            counts[topicId][level] = (counts[topicId][level] || 0) + 1;
            totalProcessed++;
        });

        console.log(`Processed ${totalProcessed} questions...`);
        lastDoc = snapshot.docs[snapshot.docs.length - 1];

        if (snapshot.size < CHUNK_SIZE) break;
    }

    console.log("\n--- COMPLETE FACTORY QUESTS BREAKDOWN ---\n");

    const sortedTopics = Object.keys(counts).sort((a, b) => {
        return topicNames[a].localeCompare(topicNames[b]);
    });

    sortedTopics.forEach(topicId => {
        console.log(`${topicNames[topicId]} (${topicId}):`);
        const levels = Object.keys(counts[topicId]).sort((a, b) => {
            const aNum = parseInt(a);
            const bNum = parseInt(b);
            if (isNaN(aNum) || isNaN(bNum)) return a.toString().localeCompare(b.toString());
            return aNum - bNum;
        });

        levels.forEach(level => {
            console.log(`  Level ${level}: ${counts[topicId][level]}`);
        });
        console.log("");
    });

    console.log(`TOTAL FACTORY QUESTS: ${totalProcessed}`);
}

aggregateQuests().catch(err => {
    if (err.message.includes('requires an index')) {
        console.error("\n❌ ERROR: This query requires an index. Please create one with the URL below:");
        console.error(err.message.split('at: ')[1]);
    } else {
        console.error("Error:", err);
    }
});
