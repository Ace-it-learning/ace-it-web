const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function syncV4_1() {
    console.log('[Sync] 🚀 Starting V4.1 Circle Properties Sync...');
    
    const dataPath = path.join(__dirname, '..', 'data', 'v4_1_circles_data.json');
    const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`[Sync] Found ${questions.size || questions.length} questions to sync.`);
    
    const batch = db.batch();
    
    questions.forEach((q, index) => {
        const docId = q.id || `v4.1.2_circle_${index + 1}`;
        const docRef = db.collection('question_bank').doc(docId);
        
        // Ensure strictly formatted content
        const payload = {
            ...q,
            id: docId,
            type: q.type || 'short_answer',
            marks: q.marks || 3,
            is_factory: q.is_factory ?? true,
            is_released: q.is_released ?? true,
            standard_version: q.standard_version || "3.0",
            metadata: {
                engine: 'v4.1.2_python_harden',
                standard: 'HKDSE',
                version: '4.1.2',
                source: 'v4_1_seeds_hardened'
            },
            tags: ['circle', 'geometry', 'v4.1.2', 'hardened'],
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        batch.set(docRef, payload);
    });
    
    await batch.commit();
    console.log('[Sync] ✅ Successfully synced all 20 questions to Firestore.');
    process.exit(0);
}

syncV4_1().catch(err => {
    console.error('[Sync] ❌ Critical failure:', err);
    process.exit(1);
});
