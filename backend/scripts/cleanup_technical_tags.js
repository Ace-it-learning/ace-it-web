const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function cleanupTechnicalTags() {
    console.log('🧹 Starting Cleanup of technical topic tags...');
    
    const snapshot = await db.collection('question_bank').get();
    let count = 0;
    const batch = db.batch();

    snapshot.forEach(doc => {
        const data = doc.data();
        const topic = data.topic || "";
        // If topic starts with reading_ or writing_, it's a technical tag that shouldn't be there
        if (topic.startsWith('reading_') || topic.startsWith('writing_')) {
            batch.delete(doc.ref);
            count++;
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`✅ Deleted ${count} documents with technical topic tags.`);
    } else {
        console.log('✅ No technical tags found.');
    }

    process.exit(0);
}

cleanupTechnicalTags().catch(console.error);
