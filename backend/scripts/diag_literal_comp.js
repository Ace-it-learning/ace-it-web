const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function findLiteralComp() {
    console.log('--- DIAGNOSTIC: FINDING LITERAL COMPREHENSION ---');
    const snapshot = await db.collection('question_bank').get();
    
    const passageClusters = {};
    const crypto = require('crypto');

    snapshot.forEach(doc => {
        const d = doc.data();
        const topic = (d.topic || '').toLowerCase();
        const id = d.topic_id || '';
        
        if (topic.includes('literal') || id.includes('literal')) {
            const passage = (d.passage || '').trim();
            const hash = crypto.createHash('md5').update(passage).digest('hex');
            
            if (!passageClusters[hash]) {
                passageClusters[hash] = { 
                    count: 0, 
                    level: d.level, 
                    topic: d.topic, 
                    topic_id: d.topic_id,
                    ids: []
                };
            }
            passageClusters[hash].count++;
            passageClusters[hash].ids.push(doc.id);
        }
    });

    Object.entries(passageClusters).forEach(([hash, info]) => {
        console.log(`Cluster ${hash.substring(0,8)}: Count=${info.count}, Level="${info.level}", Topic="${info.topic}", ID="${info.topic_id}"`);
        if (info.count < 8 && info.count > 0) {
            console.log(`  🚩 SUB-STANDARD CLUSTER: ${info.ids.join(', ')}`);
        }
    });
}

findLiteralComp().then(() => process.exit(0)).catch(console.error);
