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
db.settings({ ignoreUndefinedProperties: true }); // Prevent crashes on undefined fields

async function syncCoordGeo() {
    console.log('[Sync] 🚀 Starting Coordinate Geometry Final Sync (Hardened)...');
    
    // 1. Load JSON
    const questionsPath = path.join(__dirname, '..', '..', 'coord_geo_questions.json');
    if (!fs.existsSync(questionsPath)) {
        console.error(`[Sync] ❌ Questions file not found at: ${questionsPath}`);
        return;
    }

    const rawData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(rawData);
    console.log(`[Sync] Parsed ${questions.length} questions from JSON.`);

    // 2. Wipe existing math_geo_coord to ensure clean state
    console.log('[Sync] 🗑️ Wiping existing Coordinate Geometry questions...');
    const existingDocs = await db.collection('question_bank')
        .where('topic_id', '==', 'math_geo_coord')
        .get();
    
    if (!existingDocs.empty) {
        const batch = db.batch();
        existingDocs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`[Sync] Deleted ${existingDocs.size} documents.`);
    }

    // 3. Fresh Upload in small batches to avoid timeouts
    console.log('[Sync] 📤 Uploading fresh questions...');
    const uploadBatch = db.batch();
    
    questions.forEach((q, index) => {
        // Construct a unique ID if missing
        const docId = q.id || `v1_coord_geo_${index + 1}`;
        const docRef = db.collection('question_bank').doc(docId);
        
        // Map fields to match BOTH Coordinate Geo specifics AND standard platform fields
        const payload = {
            ...q,
            topic_id: 'math_geo_coord',  // REQUIRED for backend filter
            topic: 'math_geo_coord',     // Alias
            is_approved: true,           // REQUIRED for backend filter
            is_released: true,           // REQUIRED for backend filter
            
            // Interaction normalization
            type: q.type || 'mcq',
            correct_answer: q.correct_answer || q.answer, // Support both
            answer: q.answer || q.correct_answer,         // Support both
            grading_rubric: q.explanation || q.grading_rubric, 
            
            metadata: {
                engine: 'coord_geo_hardened_sync',
                standard: 'HKDSE',
                version: '1.4.0',
                synced_at: new Date().toISOString()
            },
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Remove any double fields if they exist
        delete payload.id; 

        uploadBatch.set(docRef, payload);
    });

    await uploadBatch.commit();
    console.log('[Sync] ✅ 30 Questions committed to question_bank.');

    // 4. Update Learning Content (Briefing)
    const briefingPath = path.join(__dirname, '..', 'data', 'math_content', 'math_geo_coord.json');
    if (fs.existsSync(briefingPath)) {
        const briefingData = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
        await db.collection('learning_content').doc('math_geo_coord').set(briefingData, { merge: true });
        console.log('[Sync] ✅ Briefing content updated in learning_content/math_geo_coord');
    }
    
    console.log('[Sync] 🎉 Coordinate Geometry Sync COMPLETED successfully.');
    process.exit(0);
}

syncCoordGeo().catch(err => {
    console.error('[Sync] ❌ CRITICAL FAILURE:', err);
    process.exit(1);
});
