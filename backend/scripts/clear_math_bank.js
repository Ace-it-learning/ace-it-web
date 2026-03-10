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

async function clearMathBank() {
    console.log("🧹  Cleaning up math questions in 'question_bank'...");

    // We distinguish math topics by prefix or by checking constants
    // For now, let's delete anything that matches a typical math topic name or has specific fields
    const collectionRef = db.collection('question_bank');

    // Fetch all for filtering (or we could query by topic if we had the list)
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log("No questions found in bank.");
        return;
    }

    let deletedCount = 0;
    const batchSize = 100;
    let batch = db.batch();

    for (const doc of snapshot.docs) {
        const data = doc.data();

        // Heuristic: If it has diagram_svg or its topic starts with MATH_
        const isMath = data.diagram_svg !== undefined || (data.topic && data.topic.toUpperCase().includes('MATH'));

        if (isMath) {
            batch.delete(doc.ref);
            deletedCount++;

            if (deletedCount % batchSize === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
    }

    if (deletedCount % batchSize !== 0) {
        await batch.commit();
    }

    console.log(`✅  CLEANUP COMPLETE. Deleted ${deletedCount} math questions.`);
}

clearMathBank().catch(console.error);
