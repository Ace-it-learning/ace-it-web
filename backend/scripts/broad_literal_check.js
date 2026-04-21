const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function findLiteralComprehension() {
    console.log('--- Finding all Literal Comprehension related docs ---');
    const snapshot = await db.collection('question_bank').get();
    
    const matches = [];
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const topic = (data.topic || "").toLowerCase();
        const topicId = (data.topic_id || "").toLowerCase();
        
        if (topic.includes('literal') || topicId.includes('literal')) {
            matches.push({
                id: doc.id,
                topic: data.topic,
                topic_id: data.topic_id,
                level: data.level,
                is_approved: data.is_approved,
                created_at: data.created_at,
                passage: (data.passage || data.reading_passage || "").substring(0, 30)
            });
        }
    });

    console.log(`Found ${matches.length} matches.`);
    
    // Group by (topic, level)
    const grouped = {};
    matches.forEach(m => {
        const key = `${m.topic} | ${m.topic_id} | ${m.level} | Approved: ${m.is_approved}`;
        if (!grouped[key]) grouped[key] = { count: 0, sample: m };
        grouped[key].count++;
    });

    Object.entries(grouped).forEach(([key, info]) => {
        console.log(`${key.padEnd(80)} | Count: ${info.count}`);
    });

    process.exit(0);
}

findLiteralComprehension().catch(console.error);
