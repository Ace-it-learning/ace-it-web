const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const GenerativeAIService = require('../services/GenerativeAIService');
const LabService = require('../services/LabService');
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

// 15 Standard Reading Topics (Keys from microSkills.js)
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

const TARGET_LEVELS = ['3', '4', '5', '7'];

async function runBatch(startIdx, endIdx) {
    console.log(`🚀 Starting Reading Content Generation: Topics ${startIdx+1} to ${endIdx+1}`);
    
    // Import MICRO_SKILLS for names
    // We'll require it here to avoid global module naming issues in script
    const { MICRO_SKILLS } = require('../constants/microSkills');

    for (let i = startIdx; i <= endIdx; i++) {
        const skillId = READING_TOPICS[i];
        if (!skillId) continue;
        
        const skillName = MICRO_SKILLS[skillId]?.en?.name || skillId;
        console.log(`\n📂 TOPIC: ${skillName} (${skillId})`);

        for (const level of TARGET_LEVELS) {
            console.log(`  Targeting Level: ${level}`);
            
            // 1. Audit check: Does this cluster already exist with 8+ approved questions?
            const levelNameForQuery = LabService.formatLevelName(level);
            const existingSnapshot = await db.collection('question_bank')
                .where('topic', '==', skillName)
                .where('level', '==', levelNameForQuery)
                .where('is_approved', '==', true)
                .get();

            if (existingSnapshot.size >= 8) {
                console.log(`  ✅ Skipping Level ${level}: Already has ${existingSnapshot.size} approved questions.`);
                continue;
            }

            console.log(`  ⚠️ Cluster insufficient (${existingSnapshot.size} docs). Generating new premium cluster...`);

            try {
                // Determine target count (Standard: 8 for L3, 10 for L4, 12 for L5/7)
                let targetCount = 12;
                if (level === '3') targetCount = 8;
                else if (level === '4') targetCount = 10;

                const result = await LabService.generateLesson({
                    topic: skillId, // Pass the ID so it loads from MICRO_SKILLS
                    level: level,
                    targetCount: targetCount,
                    isFactory: true, // Bypass block
                    forceHighQuality: true, // Use Pro model
                    uid: 'FACTORY_ADMIN'
                });

                if (!result || !result.interactive_tasks || result.interactive_tasks.length === 0) {
                    throw new Error("Empty tasks generated");
                }

                console.log(`  ✨ Generated ${result.interactive_tasks.length} tasks for L${level}. Saving to Firestore...`);

                // 2. Save items individually to question_bank
                const batch = db.batch();
                const passage = result.reading_passage;
                
                result.interactive_tasks.forEach(task => {
                    const docRef = db.collection('question_bank').doc();
                    batch.set(docRef, {
                        ...task,
                        passage: passage,
                        topic: skillName, // Use the human name for easy filtering
                        level: levelNameForQuery,
                        is_approved: true, // Auto-approve
                        created_at: admin.firestore.FieldValue.serverTimestamp(),
                        generated_by: 'antigravity_batch_v2',
                        type: 'reading_mission',
                        subject: 'english',
                        paper: 'Reading'
                    });
                });

                await batch.commit();
                console.log(`  ✅ Level ${level} saved and approved.`);

            } catch (err) {
                console.error(`  ❌ Failed to generate Level ${level}:`, err.message);
                // Continue to next level
            }
        }
    }
    
    console.log(`\n🏁 Batch ${startIdx+1}-${endIdx+1} Completed.`);
}

// Get range from command line
const args = process.argv.slice(2);
const start = parseInt(args[0]) || 0;
const end = parseInt(args[1]) || 3;

runBatch(start, end).then(() => process.exit(0)).catch(err => {
    console.error("Batch Run Fatal Error:", err);
    process.exit(1);
});
