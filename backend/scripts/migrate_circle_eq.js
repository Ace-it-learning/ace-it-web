const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const TOPIC_ID = 'math_geo_circle_eq';

async function migrateCircleEq() {
    console.log(`[Migrate] 🚀 Starting migration for ${TOPIC_ID}...`);

    // 1. Load Questions
    const questionsPath = path.join(__dirname, '..', '..', 'tmp', 'final_escaped_output_clean.json');
    if (!fs.existsSync(questionsPath)) {
        throw new Error(`Questions file not found at ${questionsPath}`);
    }
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`[Migrate] Found ${questions.length} questions to upload.`);

    // 2. Load Learning Content
    const contentPath = path.join(__dirname, '..', 'data', 'math_content', `${TOPIC_ID}.json`);
    const learningContent = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

    // 3. Cleanup existing questions for this topic
    console.log(`[Migrate] Cleaning up existing questions for ${TOPIC_ID}...`);
    const existingSnap = await db.collection('question_bank')
        .where('topic_id', '==', TOPIC_ID)
        .get();
    
    if (!existingSnap.empty) {
        const deleteBatch = db.batch();
        existingSnap.docs.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();
        console.log(`[Migrate] Deleted ${existingSnap.size} stale questions.`);
    }

    // 4. Upload Questions
    console.log(`[Migrate] Uploading new questions...`);
    const qBatch = db.batch();
    questions.forEach((q) => {
        const docRef = db.collection('question_bank').doc(q.id);
        const payload = {
            ...q,
            topic_id: TOPIC_ID,
            subject: 'maths',
            is_factory: true,
            is_released: true,
            standard_version: "3.0",
            metadata: {
                engine: 'python-seed',
                standard: 'HKDSE',
                version: '1.0.0',
                source: 'curated_circle_eq_bank'
            },
            tags: ['circle', 'coordinate_geometry', 'HKDSE'],
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        qBatch.set(docRef, payload);
    });
    await qBatch.commit();
    console.log(`[Migrate] Success! Uploaded ${questions.length} questions.`);

    // 5. Upload Learning Content
    console.log(`[Migrate] Uploading learning content...`);
    await db.collection('learning_content').doc(TOPIC_ID).set({
        ...learningContent,
        topic_id: TOPIC_ID,
        last_updated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`[Migrate] Success! Updated learning content for ${TOPIC_ID}.`);

    console.log(`\n🎉 MIGRATION COMPLETE!`);
    process.exit(0);
}

migrateCircleEq().catch(err => {
    console.error('[Migrate] ❌ Critical failure:', err);
    process.exit(1);
});
