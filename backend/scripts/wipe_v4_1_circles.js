const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function wipeCircles() {
    console.log('[Wipe] 🧹 Wiping legacy Circle Properties questions...');
    
    // Target all potential topic ID variants to ensure a truly fresh slate
    const topics = ['math_geo_circles', 'math_geo_properties_circle', 'circle_properties', 'circle'];
    
    const query = await db.collection('question_bank')
        .where('topic_id', 'in', topics)
        .get();
        
    if (query.size === 0) {
        console.log('[Wipe] ℹ️ No legacy questions found.');
        process.exit(0);
    }
    
    console.log(`[Wipe] Found ${query.size} questions to delete.`);
    
    const batch = db.batch();
    query.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('[Wipe] ✅ Successfully wiped legacy questions.');
    process.exit(0);
}

wipeCircles().catch(err => {
    console.error('[Wipe] ❌ Critical failure:', err);
    process.exit(1);
});
