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

async function syncMensuration() {
    console.log('[Sync] 🚀 Starting Mensuration Question Bank Sync...');
    
    const dataPath = path.join(__dirname, '..', 'math_engine', 'mensuration_validation.json');
    if (!fs.existsSync(dataPath)) {
        console.error(`[Sync] ❌ Data file not found at: ${dataPath}`);
        process.exit(1);
    }

    const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`[Sync] Found ${questions.length} questions to sync.`);
    
    const batchSize = 10;
    for (let i = 0; i < questions.length; i += batchSize) {
        const batch = db.batch();
        const chunk = questions.slice(i, i + batchSize);
        
        chunk.forEach((q) => {
            const docId = q.id;
            const docRef = db.collection('question_bank').doc(docId);
            
            const payload = {
                ...q,
                metadata: {
                    engine: 'mensuration_python_harden',
                    standard: 'HKDSE',
                    version: '1.0.0',
                    source: 'mensuration_validation_json'
                },
                tags: ['mensuration', 'math', 'hardened', 'v1'],
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };
            
            batch.set(docRef, payload, { merge: true });
        });
        
        await batch.commit();
        console.log(`[Sync] ✅ Committed batch showing questions ${i + 1} to ${Math.min(i + batchSize, questions.length)}`);
    }
    
    console.log('[Sync] 🎉 Successfully synced all questions to Firestore.');
    process.exit(0);
}

syncMensuration().catch(err => {
    console.error('[Sync] ❌ Critical failure:', err);
    process.exit(1);
});
