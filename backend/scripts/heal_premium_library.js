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

async function healPremiumLibrary() {
    console.log('--- 🛡️  HEALING PREMIUM LIBRARY ---');

    // Fetch all premium or factory documents
    const snapshot = await db.collection('question_bank')
        .where('is_factory', '==', true)
        .get();
    
    console.log(`Analyzing ${snapshot.size} premium documents...`);

    let updatedCount = 0;
    const batchSize = 400;
    let batch = db.batch();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const updates = {};
        const rawLevel = String(data.level);

        console.log(`Checking [${doc.id}] Topic: [${data.topic}] Level: [${data.level}]`);

        // 1. Force Premium & Approval
        if (data.is_premium !== true) updates.is_premium = true;
        if (data.is_approved !== true) updates.is_approved = true;

        // 2. Fix Levels (Universal Harmony)
        if (rawLevel === '3' || data.level === 'HKDSE Level 3 (Basic)' || data.level === 'Easy') {
            updates.level = 'HKDSE Level 3 (Adequate)';
        } else if (rawLevel === '4' || data.level === 'HKDSE Level 4 (Developing)' || data.level === 'Medium') {
            updates.level = 'HKDSE Level 4 (Good)';
        } else if (rawLevel === '5' || data.level === 'DSE Standard' || data.level === 'HKDSE Level 5 (Standard)') {
            updates.level = 'HKDSE Level 5 (Strong)';
        } else if (rawLevel === '7' || data.level === 'Elite' || data.level === 'HKDSE Level 7') {
            updates.level = 'HKDSE Level 5** (Mastery)';
        }

        if (Object.keys(updates).length > 0) {
            batch.update(doc.ref, updates);
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

    console.log(`=== 🏁 HEALING COMPLETE: Optimized ${updatedCount} documents. ===`);
}

healPremiumLibrary()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
