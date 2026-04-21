const admin = require('firebase-admin');
const path = require('path');
const LabService = require('../services/LabService');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const READING_TOPICS = [
    'reading_literalComprehension',
    'reading_inference',
    'reading_mainIdea',
    'reading_detailRecognition',
    'reading_sequencing',
    'reading_synthesis',
    'reading_factVsOpinion',
    'reading_authorPurpose',
    'reading_toneAttitude',
    'reading_registerStyle',
    'reading_metaphoricalLanguage',
    'reading_textOrganization',
    'reading_skimmingScanning',
    'reading_paraphrasing',
    'reading_cohesionReference'
];

// Target Level Mapping: Semantic ID -> { name, targetCount }
const CONFIG = {
    '3': { name: 'HKDSE Level 3 (Adequate)', count: 8 },
    '4': { name: 'HKDSE Level 4 (Good)', count: 10 },
    '5': { name: 'HKDSE Level 5 (Strong)', count: 12 },
    '7': { name: 'HKDSE Level 5** (Mastery)', count: 12 }
};

async function refill() {
    const { MICRO_SKILLS } = require('../constants/microSkills');

    for (const skillId of READING_TOPICS) {
        const skillName = MICRO_SKILLS[skillId]?.name || skillId;
        console.log(`\n📂 Processing: ${skillName}`);

        for (const [levelId, cfg] of Object.entries(CONFIG)) {
            // Check if we already have a cluster
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', skillName)
                .where('level', '==', cfg.name)
                .where('is_approved', '==', true)
                .get();

            if (snapshot.size >= cfg.count) {
                console.log(`  ✅ Level ${levelId} [${cfg.name}]: Already has ${snapshot.size} questions. Skipping.`);
                continue;
            }

            console.log(`  🚀 Level ${levelId} [${cfg.name}]: Needs refill. Generating ${cfg.count} questions...`);

            try {
                const result = await LabService.generateLesson({
                    uid: 'FACTORY_ADMIN',
                    level: levelId,
                    category: 'reading',
                    topic: skillId,
                    targetCount: cfg.count,
                    isFactory: true,
                    forceHighQuality: true
                });

                if (!result || !result.interactive_tasks || result.interactive_tasks.length === 0) {
                    throw new Error("Generation failed: No tasks returned.");
                }

                const batch = db.batch();
                const passage = result.reading_passage || result.passage || result.text || result.reading_text;
                
                if (!passage) {
                    console.warn(`  ⚠️  No passage found in result for ${skillName} L${levelId}. Result keys: ${Object.keys(result)}`);
                    continue;
                }

                result.interactive_tasks.slice(0, cfg.count).forEach(task => {
                    const docRef = db.collection('question_bank').doc();
                    batch.set(docRef, {
                        ...task,
                        passage: passage,
                        topic: skillName,
                        level: cfg.name,
                        is_approved: true,
                        created_at: admin.firestore.FieldValue.serverTimestamp(),
                        generated_by: 'antigravity_refill_script',
                        subject: 'english',
                        paper: 'Reading',
                        type: 'reading_mission'
                    });
                });

                await batch.commit();
                console.log(`  ✨ Level ${levelId} refill successful.`);

            } catch (err) {
                console.error(`  ❌ Level ${levelId} refill FAILED:`, err.message);
            }
        }
    }
    console.log('\n🏁 Refill Completed.');
    process.exit(0);
}

refill().catch(console.error);
