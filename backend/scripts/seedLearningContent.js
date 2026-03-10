const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function seedLearningContent() {
    console.log("⚠️ STARTING DATABASE SEED: Learning Content");

    const contentDir = path.join(__dirname, '..', 'data', 'math_content');
    if (!fs.existsSync(contentDir)) {
        console.error(`Directory not found: ${contentDir}`);
        return;
    }

    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} JSON files to process.`);

    let written = 0;
    let skipped = 0;

    for (const file of files) {
        const topicId = file.replace('.json', '');
        const filePath = path.join(contentDir, file);

        try {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(rawData);

            const docRef = db.collection('learning_content').doc(topicId);
            const docSnap = await docRef.get();

            await docRef.set({
                ...data,
                topic_id: topicId,
                last_updated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`✅ UPDATED [${topicId}]: Successfully updated content.`);
            written++;
        } catch (e) {
            console.error(`❌ ERROR processing ${file}: ${e.message}`);
        }
    }

    console.log(`\n🎉 SEED COMPLETE: ${written} written, ${skipped} skipped.`);
}

seedLearningContent().catch(console.error);
