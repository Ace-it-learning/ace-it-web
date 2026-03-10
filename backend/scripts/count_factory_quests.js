const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Use the same initialization logic as server.js
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
        console.log("Firebase Admin initialized with service account.");
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
} else {
    console.warn("Service account key not found, attempting default initialization...");
    admin.initializeApp();
}

const db = admin.firestore();

async function countFactoryQuests() {
    console.log("Querying Firestore for ALL Factory Math Quests (is_factory == true)...");

    try {
        const snapshot = await db.collection('question_bank')
            .where('is_factory', '==', true)
            .get();

        if (snapshot.empty) {
            console.log("No factory quests found in collection 'question_bank'.");
            return;
        }

        const counts = {}; // { topic: { level: count } }
        const topicNames = {}; // { topic_id: topic_name }

        snapshot.forEach(doc => {
            const data = doc.data();
            const topicId = data.topic_id || data.topic || 'unknown';
            const topicName = data.topic || data.topic_id || 'Unknown Topic';
            const level = data.level || 'unrated';

            if (!counts[topicId]) {
                counts[topicId] = {};
                topicNames[topicId] = topicName;
            }

            counts[topicId][level] = (counts[topicId][level] || 0) + 1;
        });

        console.log("\n--- FACTORY QUESTS BREAKDOWN ---\n");

        const sortedTopics = Object.keys(counts).sort();

        let totalCount = 0;

        sortedTopics.forEach(topicId => {
            console.log(`Topic: ${topicNames[topicId]} (${topicId})`);
            const levels = Object.keys(counts[topicId]).sort((a, b) => {
                // Numeric sort for levels, string sort for 'unrated'
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (isNaN(aNum) || isNaN(bNum)) return a.toString().localeCompare(b.toString());
                return aNum - bNum;
            });

            levels.forEach(level => {
                const count = counts[topicId][level];
                console.log(`  Level ${level}: ${count} questions`);
                totalCount += count;
            });
            console.log("");
        });

        console.log(`TOTAL FACTORY QUESTS: ${totalCount}`);

    } catch (err) {
        console.error("Error querying database:", err);
    }
}

countFactoryQuests();
