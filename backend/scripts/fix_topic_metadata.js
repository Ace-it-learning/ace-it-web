const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function migrate() {
    console.log("🚀 Starting Topic Metadata Migration...");
    const snapshot = await db.collection('question_bank').get();
    const batch = db.batch();
    let count = 0;

    const MAPPING = {
        'math_num_inequalities': 'Inequalities',
        'math_alg_sequences': 'AP & GP',
        'math_geo_properties_circle': 'Circle Properties',
        'math_alg_apgp': 'AP & GP'
    };

    const ID_MAPPING = {
        'math_alg_inequalities': 'math_num_inequalities'
    };

    snapshot.forEach(doc => {
        const data = doc.data();
        let updated = false;
        const updates = {};

        // 1. Fix Legacy IDs
        if (ID_MAPPING[data.topic_id]) {
            updates.topic_id = ID_MAPPING[data.topic_id];
            updated = true;
        }

        // 2. Standardize labels
        const currentTopicId = updates.topic_id || data.topic_id;
        if (MAPPING[currentTopicId] && data.topic !== MAPPING[currentTopicId]) {
            updates.topic = MAPPING[currentTopicId];
            updated = true;
        }

        if (updated) {
            batch.update(doc.ref, updates);
            count++;
            console.log(`[Update] Doc ${doc.id}: ${data.topic} -> ${updates.topic || data.topic} (${updates.topic_id || data.topic_id})`);
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`✅ Successfully updated ${count} documents.`);
    } else {
        console.log("No documents required updates.");
    }
    process.exit();
}

migrate();

