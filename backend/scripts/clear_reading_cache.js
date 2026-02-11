/**
 * Clear Reading Quest Cache
 * Deletes all cached reading lab questions from Firestore
 * so new DSE-aligned multi-paragraph passages will be generated
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearReadingQuestCache() {
    console.log('🗑️  Clearing reading quest cache from Firestore...\n');

    try {
        // Get all reading topics
        const readingTopics = [
            'reading_literalComprehension',
            'reading_inferentialComprehension',
            'reading_criticalAnalysis',
            'reading_vocabularyInContext',
            'reading_textStructure'
        ];

        let totalDeleted = 0;

        for (const topic of readingTopics) {
            console.log(`📖 Processing topic: ${topic}`);

            // Query all questions for this topic
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .get();

            if (snapshot.empty) {
                console.log(`   ℹ️  No cached questions found`);
                continue;
            }

            // Delete in batches of 500 (Firestore limit)
            const batchSize = 500;
            const batches = [];
            let currentBatch = db.batch();
            let batchCount = 0;

            snapshot.docs.forEach((doc, index) => {
                currentBatch.delete(doc.ref);
                batchCount++;

                if (batchCount === batchSize || index === snapshot.docs.length - 1) {
                    batches.push(currentBatch);
                    currentBatch = db.batch();
                    batchCount = 0;
                }
            });

            // Commit all batches
            for (let i = 0; i < batches.length; i++) {
                await batches[i].commit();
                console.log(`   ✅ Deleted batch ${i + 1}/${batches.length}`);
            }

            totalDeleted += snapshot.size;
            console.log(`   🗑️  Deleted ${snapshot.size} questions\n`);
        }

        console.log(`\n✅ Successfully deleted ${totalDeleted} reading quest questions!`);
        console.log('📝 New quests will now generate 400-600 word multi-paragraph passages.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        process.exit(1);
    }
}

clearReadingQuestCache();
