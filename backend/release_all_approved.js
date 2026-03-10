const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { MICRO_SKILLS } = require('./constants/microSkills');
const { MATH_MICRO_SKILLS } = require('./constants/mathMicroSkills');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Build Name -> ID Mapping
const NAME_TO_ID = {};

// English (MICRO_SKILLS contains reading, writing, listening, speaking)
Object.entries(MICRO_SKILLS).forEach(([id, data]) => {
    if (data.name) {
        NAME_TO_ID[data.name.toLowerCase()] = id;
    }
    if (data.en && data.en.name) {
        NAME_TO_ID[data.en.name.toLowerCase()] = id;
    }
});

// Math
Object.entries(MATH_MICRO_SKILLS).forEach(([id, data]) => {
    if (data.en && data.en.name) {
        NAME_TO_ID[data.en.name.toLowerCase()] = id;
    }
});

// Special Mappings/Aliases
const ALIASES = {
    'inference': 'reading_inference',
    'literal comprehension': 'reading_literalComprehension',
    'main idea identification': 'reading_mainIdea',
    'detail recognition': 'reading_detailRecognition',
    'sequencing': 'reading_sequencing',
    'synthesis': 'reading_synthesis',
    'fact vs opinion': 'reading_factVsOpinion',
    "author's purpose": 'reading_authorPurpose',
    'tone & attitude': 'reading_toneAttitude',
    'register & style': 'reading_registerStyle',
    'metaphorical language': 'reading_metaphoricalLanguage',
    'text organisation': 'reading_textOrganization',
    'skimming & scanning': 'reading_skimmingScanning',
    'paraphrasing': 'reading_paraphrasing',
    'cohesion & reference': 'reading_cohesionReference'
};

async function fixApprovedQuests() {
    console.log("--- Starting Bulk Release (Backfill topic_id) ---");

    try {
        const snapshot = await db.collection('question_bank')
            .where('is_approved', '==', true)
            .get();

        console.log(`Found ${snapshot.size} approved quests total.`);

        let updateCount = 0;
        let skipCount = 0;
        let failCount = 0;

        let batch = db.batch();
        let batchSize = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const docRef = doc.ref;

            // If it already has topic_id, skip unless it's null/empty
            if (data.topic_id) {
                skipCount++;
                continue;
            }

            const topicLabel = data.topic;
            if (!topicLabel) {
                skipCount++;
                continue;
            }

            let topicId = null;
            const normalizedLabel = topicLabel.toLowerCase().trim();

            if (ALIASES[normalizedLabel]) {
                topicId = ALIASES[normalizedLabel];
            } else if (NAME_TO_ID[normalizedLabel]) {
                topicId = NAME_TO_ID[normalizedLabel];
            } else if (MICRO_SKILLS[topicLabel] || MATH_MICRO_SKILLS[topicLabel]) {
                topicId = topicLabel;
            }

            if (topicId) {
                batch.update(docRef, { topic_id: topicId });
                updateCount++;
                batchSize++;
                console.log(`[UPDATE] ${topicLabel} -> ${topicId} (${doc.id})`);
            } else {
                console.log(`[WARN] Could not map topic: "${topicLabel}" for doc ${doc.id}`);
                failCount++;
            }

            if (batchSize >= 450) {
                console.log("Committing batch...");
                await batch.commit();
                batch = db.batch();
                batchSize = 0;
            }
        }

        if (batchSize > 0) {
            console.log(`Committing final ${batchSize} updates...`);
            await batch.commit();
        }

        console.log("\n--- Summary ---");
        console.log(`Successfully Backfilled: ${updateCount}`);
        console.log(`Skipped (Already OK): ${skipCount}`);
        console.log(`Failed (No Mapping): ${failCount}`);
        console.log("----------------\n");

    } catch (e) {
        console.error("Execution failed:", e);
    } finally {
        process.exit(0);
    }
}

fixApprovedQuests();
