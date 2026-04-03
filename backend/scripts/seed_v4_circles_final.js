const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seedV4Circles() {
    const questionsPath = path.join(__dirname, '../data/v4_circle_properties_questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    console.log(`[Seeder] Found ${questions.length} questions. Seeding one by one...`);

    const collectionRef = db.collection('math_question_bank');

    for (let index = 0; index < questions.length; index++) {
        const q = questions[index];
        const cleanedQ = JSON.parse(JSON.stringify(q));
        const docId = `v4_circle_prop_${Date.now()}_${index}`;
        try {
            await collectionRef.doc(docId).set({
                ...cleanedQ,
                topic_id: 'math_geo_circles',
                level: index < 5 ? 3 : (index < 15 ? 4 : 5),
                is_approved: true,
                is_realtime: false,
                created_at: new Date().toISOString(),
                version: '4.0'
            });
            console.log(`[Seeder] Seeded: ${docId}`);
        } catch (err) {
            console.error(`[Seeder] Error on index ${index}:`, err);
            // Don't exit yet to see if others work
        }
    }
    console.log(`[Seeder] Done.`);
    process.exit(0);
}

seedV4Circles().catch(err => {
    console.error('Seeding critical fault:', err);
    process.exit(1);
});
