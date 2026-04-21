const admin = require('firebase-admin');
const path = require('path');
const crypto = require('crypto');
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function fullAudit() {
    const topicName = 'Literal Comprehension';
    console.log(`Full Audit for Topic: ${topicName}`);
    
    const snapshot = await db.collection('question_bank')
        .where('topic', '==', topicName)
        .where('is_approved', '==', true)
        .get();
    
    console.log(`Total approved questions found: ${snapshot.size}`);
    
    const clusters = {}; // PassageHash -> { passage, level, count }
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const passage = data.passage || data.reading_passage || "NO_PASSAGE";
        const level = data.level || "NO_LEVEL";
        const pHash = crypto.createHash('md5').update(passage.trim()).digest('hex');
        
        const key = `${pHash}_${level}`;
        if (!clusters[key]) {
            clusters[key] = { 
                passageSnippet: passage.substring(0, 100).replace(/\n/g, ' '), 
                level, 
                count: 0 
            };
        }
        clusters[key].count++;
    });

    console.log('--- CLUSTERS DISCOVERED ---');
    Object.values(clusters).forEach(c => {
        console.log(`[${c.level}] Count: ${c.count} | Passage: ${c.passageSnippet}...`);
    });
    
    process.exit(0);
}

fullAudit().catch(console.error);
