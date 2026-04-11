const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function refreshAPGP() {
    const topicId = 'math_alg_apgp';
    
    // 1. Wipe old questions
    console.log(`Wiping old questions for topic: ${topicId}...`);
    const oldQs = await db.collection('question_bank')
        .where('topic_id', '==', topicId)
        .get();
    
    const deleteBatch = db.batch();
    oldQs.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`Deleted ${oldQs.size} old questions.`);

    // 2. Load new questions
    const questionsPath = path.join(__dirname, '../data/math_content/math_alg_apgp_questions_utf8.json');
    let questionsRaw = fs.readFileSync(questionsPath, 'utf8');
    questionsRaw = questionsRaw.replace(/^\uFEFF/, '');
    const questions = JSON.parse(questionsRaw);

    // 3. Seed new questions + Add Level 1 & 2 support
    const seedBatch = db.batch();
    const collectionRef = db.collection('question_bank');

    console.log(`Seeding ${questions.length} questions...`);
    
    for (const q of questions) {
        const docRef = collectionRef.doc(q.id);
        const data = {
            ...q,
            topic: 'AP & GP (Sequences & Series)',
            is_approved: true,
            is_factory: true,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };
        seedBatch.set(docRef, data, { merge: true });
    }

    await seedBatch.commit();
    console.log(`--- Success: AP & GP Questions Refreshed (with Level 1/2 support) ---`);
}

refreshAPGP().then(() => process.exit(0));
