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

async function cleanupReadingBank() {
    console.log('--- 🧹 STARTING READING BANK CLEANUP ---');

    const snapshot = await db.collection('question_bank').get();
    
    let totalFound = 0;
    let totalDeleted = 0;

    const snapshotDocs = snapshot.docs;
    console.log(`Scanning ${snapshotDocs.length} documents in question_bank...`);

    const batchSize = 100;
    
    for (let i = 0; i < snapshotDocs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = snapshotDocs.slice(i, i + batchSize);
        let itemsInBatch = 0;

        chunk.forEach(doc => {
            const data = doc.data();
            const topic = (data.topic || '').toLowerCase();
            const paper = (data.paper || '').toLowerCase();
            
            const isReading = topic.startsWith('reading_') || 
                              paper.includes('reading') || 
                              paper === 'paper 1' ||
                              topic.includes('literal') ||
                              topic.includes('inference') ||
                              topic.includes('main idea') ||
                              topic.includes('detail recognition') ||
                              topic.includes('sequencing') ||
                              topic.includes('synthesis') ||
                              topic.includes('fact vs opinion') ||
                              topic.includes('author\'s purpose') ||
                              topic.includes('tone & attitude') ||
                              topic.includes('register & style') ||
                              topic.includes('metaphorical language') ||
                              topic.includes('text organisation') ||
                              topic.includes('skimming & scanning') ||
                              topic.includes('paraphrasing') ||
                              topic.includes('cohesion & reference');

            const isPremium = data.is_premium === true;
            const taskCount = data.interactive_tasks?.length || 0;

            // Target for deletion: 
            // 1. Must be identified as a Reading mission
            // 2. Must NOT be the new Premium ones we just generated
            // 3. OR it has fewer than 8 questions (which is below our new minimum)
            if (isReading && (!isPremium || taskCount < 8)) {
                batch.delete(doc.ref);
                itemsInBatch++;
                totalDeleted++;
            }
            totalFound++;
        });

        if (itemsInBatch > 0) {
            await batch.commit();
            console.log(`Deleted ${itemsInBatch} legacy Reading missions in this batch. (Total: ${totalDeleted})`);
        }
    }

    console.log(`\n--- 🏁 CLEANUP COMPLETE ---`);
    console.log(`Legacy Reading Missions Deleted: ${totalDeleted}`);
}

cleanupReadingBank()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Cleanup failed:', err);
        process.exit(1);
    });
