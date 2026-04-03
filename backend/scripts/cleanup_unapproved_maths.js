/**
 * Cleanup Unapproved Math Questions
 * 
 * Logic: Finds any questions that are 'is_approved: false' AND 'is_realtime: true'
 * and were created more than 24 hours ago.
 * 
 * Frequency: Proposed to run daily.
 */

const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function cleanupStaleQuestions() {
    console.log('[Cleanup] Starting stale unapproved question cleanup...');
    
    // Calculate timestamp for 24 hours ago
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const yesterdayIso = yesterday.toISOString();

    const snapshot = await db.collection('question_bank')
        .where('is_approved', '==', false)
        .where('is_realtime', '==', true)
        .get();

    console.log(`[Cleanup] Found ${snapshot.size} pending real-time questions total.`);

    let deletedCount = 0;
    const batchSize = 500;
    let batch = db.batch();
    let countInBatch = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        // Check if created_at exists and is older than 24h
        if (data.created_at && data.created_at < yesterdayIso) {
            batch.delete(doc.ref);
            deletedCount++;
            countInBatch++;

            if (countInBatch >= batchSize) {
                await batch.commit();
                batch = db.batch();
                countInBatch = 0;
                console.log(`[Cleanup] Deleted batch of ${batchSize}...`);
            }
        }
    }

    if (countInBatch > 0) {
        await batch.commit();
    }

    console.log(`[Cleanup] SUCCESS: Removed ${deletedCount} stale unapproved questions.`);
    process.exit(0);
}

cleanupStaleQuestions().catch(err => {
    console.error('[Cleanup] FAILED:', err);
    process.exit(1);
});
