const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Correctly initialize Firebase Admin as in seed_inequalities.js
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function wipeInequalities() {
    const topicId = 'math_num_inequalities';
    console.log(`🧹 Wiping all questions for topic: ${topicId} from question_bank...`);
    
    // Batch deletion to handle up to 500 docs (we only have 31, but good practice)
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', topicId)
        .get();

    if (snapshot.empty) {
        console.log('No questions found to wipe.');
        return;
    }

    console.log(`Found ${snapshot.size} questions. Deleting...`);
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Successfully wiped ${snapshot.size} questions.`);
}

wipeInequalities()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Wipe failed:', err);
        process.exit(1);
    });
