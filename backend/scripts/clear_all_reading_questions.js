/**
 * Clear ALL Reading Questions from Firestore
 * This will force complete regeneration with new 400-600 word passages
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearAllReadingQuestions() {
    console.log('🗑️  Clearing ALL reading questions from Firestore...\n');

    try {
        // Get ALL questions with a passage field (reading questions)
        const snapshot = await db.collection('question_bank')
            .where('passage', '!=', null)
            .get();

        if (snapshot.empty) {
            console.log('ℹ️  No reading questions found in database');
            process.exit(0);
        }

        console.log(`📊 Found ${snapshot.size} reading questions to delete\n`);

        // Delete in batches of 500 (Firestore limit)
        const batchSize = 500;
        const batches = [];
        let currentBatch = db.batch();
        let batchCount = 0;

        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`   🗑️  Deleting: ${data.topic} (Level ${data.level}) - ${data.question?.substring(0, 50)}...`);

            currentBatch.delete(doc.ref);
            batchCount++;

            if (batchCount === batchSize || index === snapshot.docs.length - 1) {
                batches.push(currentBatch);
                currentBatch = db.batch();
                batchCount = 0;
            }
        });

        // Commit all batches
        console.log(`\n📦 Committing ${batches.length} batch(es)...`);
        for (let i = 0; i < batches.length; i++) {
            await batches[i].commit();
            console.log(`   ✅ Batch ${i + 1}/${batches.length} committed`);
        }

        console.log(`\n✅ Successfully deleted ${snapshot.size} reading questions!`);
        console.log('📝 Next reading quest will generate fresh 400-600 word passages.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

clearAllReadingQuestions();
