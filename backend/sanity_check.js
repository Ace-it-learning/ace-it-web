const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const WritingQuestService = require('./services/writing/WritingQuestService');

async function verifyListing() {
    console.log("🚀 STARTING TOPIC VERIFICATION...");
    const genres = ["Debate Speech", "Letter to the Editor"];

    for (const genre of genres) {
        console.log(`\n🔍 GENRE: "${genre}"`);
        const topics = await WritingQuestService.getFactoryTopics(genre);
        console.log(`Found ${topics.length} topics.`);

        topics.forEach((t, i) => {
            console.log(`[${i + 1}] Title: ${t.title}`);
            console.log(`    ID: ${t.id}`);
            console.log(`    Source: ${t.factory ? 'FIRESTORE' : 'STATIC'}`);
            console.log(`    Prompt Start: ${t.prompt.substring(0, 80)}...`);
        });
    }
}

verifyListing().catch(err => {
    console.error("❌ VERIFICATION FAILED:", err);
    process.exit(1);
});
