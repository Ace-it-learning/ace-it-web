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

const fs = require('fs');

async function listWritingQuests() {
    console.log("🔍 LISTING ALL WRITING GENRE RECORDS (FULL SCAN)...");

    const snapshot = await db.collection('question_bank').get();

    if (snapshot.empty) {
        console.log("No records found in question_bank.");
    } else {
        const groups = new Map();
        const allFiltered = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const topic = data.topic || "";
            const title = data.title || data.listing_title || "";
            const passage = data.passage || data.reading_passage || "No Passage";
            const prompt = data.listing_prompt || data.question || "";

            const isRelated = topic.toLowerCase().includes("debate") ||
                topic.toLowerCase().includes("writing") ||
                title.toLowerCase().includes("debate") ||
                prompt.toLowerCase().includes("debate") ||
                passage.toLowerCase().includes("debate");

            if (isRelated) {
                const item = { id: doc.id, ...data };
                allFiltered.push(item);
                const groupKey = passage.trim();
                if (!groups.has(groupKey)) groups.set(groupKey, []);
                groups.get(groupKey).push(item);
            }
        });

        // Save to JSON for deep review
        const audit = {
            timestamp: new Date().toISOString(),
            totalRecords: snapshot.size,
            filteredCount: allFiltered.length,
            uniqueGroups: groups.size,
            groups: Array.from(groups.entries()).map(([passage, items]) => ({
                situation: passage,
                topic: items[0].topic,
                approved: items[0].is_approved,
                items: items.map(i => ({ id: i.id, level: i.level, prompt: i.listing_prompt || i.question }))
            }))
        };

        fs.writeFileSync('writing_quests_audit.json', JSON.stringify(audit, null, 2));
        console.log(`\nAudit saved to writing_quests_audit.json`);
        console.log(`Unique Writing/Debate Quests found: ${groups.size}`);
    }
}

listWritingQuests().catch(console.error);
