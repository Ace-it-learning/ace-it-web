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

async function fixLevels() {
    console.log('--- 🛡️  HARMONIZING PREMIUM LEVEL STRINGS ---');

    const snapshot = await db.collection('question_bank')
        .where('is_premium', '==', true)
        .get();
    
    console.log(`Checking ${snapshot.size} premium documents...`);

    let updatedCount = 0;
    const batchSize = 400;
    let batch = db.batch();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        let newLevel = null;

        if (data.level === 'HKDSE Level 3 (Basic)') {
            newLevel = 'HKDSE Level 3 (Adequate)';
        } else if (data.level === 'HKDSE Level 4 (Developing)') {
            newLevel = 'HKDSE Level 4 (Good)';
        }

        if (newLevel) {
            batch.update(doc.ref, { level: newLevel });
            updatedCount++;

            if (updatedCount % batchSize === 0) {
                await batch.commit();
                batch = db.batch();
                console.log(`Updated ${updatedCount}...`);
            }
        }
    }

    if (updatedCount % batchSize !== 0) {
        await batch.commit();
    }

    console.log(`=== 🏁 HARMONIZATION COMPLETE: Updated ${updatedCount} documents. ===`);
}

fixLevels()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
