/**
 * GENERATION SCRIPT: English Writing Elite Exemplars
 * Populates the 'writing_exemplars' collection with 5** content.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
    } else {
        admin.initializeApp();
    }
}

const WritingLabService = require('../services/WritingLabService');

const db = admin.firestore();

const GENRES_TO_GENERATE = [
    { id: 'arg_essay', theme: 'The impact of AI (ChatGPT) on secondary school learning autonomy.' },
    { id: 'proposal', theme: 'A proposal to the Principal for an Inter-School Esports Tournament to promote teamwork.' },
    { id: 'speech', theme: 'A graduation speech addressed to classmates about resilience and the "Lying Flat" culture.' },
    { id: 'letter_editor', theme: 'A critical letter regarding the lack of mental health support for students in Hong Kong.' }
];

async function run() {
    console.log("🚀 Starting Elite Exemplar Generation Batch...");

    for (const task of GENRES_TO_GENERATE) {
        try {
            console.log(`\n📄 Generating Exemplar for Genre: ${task.id}...`);
            const exemplar = await WritingLabService.generateEliteExemplar(task.id, task.theme);

            if (exemplar && exemplar.title) {
                const id = `exemplar_${task.id}_${Date.now()}`;
                
                const finalData = {
                    ...exemplar,
                    id: id,
                    is_approved: true,
                    created_at: new Date().toISOString(),
                    difficulty: "ELITE",
                    language: "en"
                };

                await db.collection('writing_exemplars').doc(id).set(finalData);
                console.log(`✅ SUCCESS: Generated "${exemplar.title}" (ID: ${id})`);
            }
        } catch (err) {
            console.error(`❌ FAILED for ${task.id}:`, err.message);
        }

        // Avoid rate limits
        console.log("Waiting 10s for next generation...");
        await new Promise(r => setTimeout(r, 10000));
    }

    console.log("\n🏁 Batch Generation Complete!");
    process.exit(0);
}

run();
