const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const TARGET_TOPICS = [
    'math_num_percentages',
    'math_alg_formulas',
    'math_alg_polynomials',
    'math_alg_quadratics',
    'math_alg_functions',
    'math_alg_variations',
    'math_alg_apgp'
];

async function releaseFactoryQuests() {
    console.log("--- Releasing Factory Quests ---");

    const batch = db.batch();
    let count = 0;

    const snapshot = await db.collection('question_bank')
        .where('is_factory', '==', true)
        .where('is_approved', '==', false)
        .get();

    console.log(`Found ${snapshot.size} unapproved factory quests.`);

    snapshot.forEach(doc => {
        const data = doc.data();
        // Check if it belongs to one of our target math topics
        if (data.topic_id && TARGET_TOPICS.includes(data.topic_id)) {
            batch.update(doc.ref, {
                is_approved: true,
                approved_at: admin.firestore.FieldValue.serverTimestamp(),
                released_by: 'optimization_script'
            });
            count++;
        } else if (data.subject === 'Maths' && data.topic_id) {
            // Also release other math quests if they have a topic_id
            batch.update(doc.ref, {
                is_approved: true,
                approved_at: admin.firestore.FieldValue.serverTimestamp(),
                released_by: 'optimization_script'
            });
            count++;
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Successfully released ${count} factory quests.`);
    } else {
        console.log("No factory quests met the criteria for release.");
    }

    process.exit(0);
}

releaseFactoryQuests().catch(err => {
    console.error(err);
    process.exit(1);
});
