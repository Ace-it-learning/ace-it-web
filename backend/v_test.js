const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const WritingQuestService = require('./services/writing/WritingQuestService');

async function run() {
    console.log("=== WRITING TOPIC LISTING VERIFICATION ===");
    const results = await WritingQuestService.getFactoryTopics("Debate Speech");
    console.log(`Found ${results.length} topics for Debate Speech.`);
    results.forEach(r => console.log(`- ${r.title} (Source: ${r.static ? 'Static' : 'Firestore'})`));

    const results2 = await WritingQuestService.getFactoryTopics("Letter to the Editor");
    console.log(`\nFound ${results2.length} topics for Letter to the Editor.`);
    results2.forEach(r => console.log(`- ${r.title} (Source: ${r.static ? 'Static' : 'Firestore'})`));
}

run().catch(console.error);
