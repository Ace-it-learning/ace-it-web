const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const READING_TOPICS = [
    'Literal Comprehension', 'Inference', 'Main Idea Identification', 
    'Detail Recognition', 'Sequencing', 'Synthesis', 'Fact vs Opinion', 
    'Author\'s Purpose', 'Tone & Attitude', 'Register & Style', 
    'Metaphorical Language', 'Text Organisation', 'Skimming & Scanning', 
    'Paraphrasing', 'Cohesion & Reference'
];

const CONFIG = {
    'Level 5': { name: 'HKDSE Level 5 (Strong)', count: 12 },
    'Level 7': { name: 'HKDSE Level 5** (Mastery)', count: 12 }
};

const { MICRO_SKILLS } = require('../constants/microSkills');
const LabService = require('../services/LabService');

async function targetRefill() {
    console.log('🎯 Starting Targeted Refill for L5/L7 gaps...\n');

    for (const skillId of Object.keys(MICRO_SKILLS)) {
        if (!skillId.startsWith('reading_')) continue;
        const skillName = MICRO_SKILLS[skillId].name;
        
        for (const [levelId, cfg] of Object.entries(CONFIG)) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', skillName)
                .where('level', '==', cfg.name)
                .get();

            if (snapshot.size < 12) {
                console.log(`🚀 [${skillName}] [${levelId}] has only ${snapshot.size} q. Generating premium set...`);
                try {
                    const result = await LabService.generateLesson({
                        uid: 'FACTORY_ADMIN',
                        level: levelId.replace('Level ', ''),
                        category: 'reading',
                        topic: skillId,
                        targetCount: 12,
                        isFactory: true,
                        forceHighQuality: true
                    });

                    const batch = db.batch();
                    const passage = result.reading_passage || result.passage || result.text || result.reading_text;
                    
                    if (!passage) {
                        console.warn(`  ⚠️  No passage found in result for ${skillName}. Skipping.`);
                        continue;
                    }

                    result.interactive_tasks.slice(0, 12).forEach(task => {
                        const docRef = db.collection('question_bank').doc();
                        batch.set(docRef, {
                            ...task,
                            topic: skillName,
                            level: cfg.name,
                            passage: passage,
                            is_approved: true,
                            created_at: admin.firestore.FieldValue.serverTimestamp()
                        });
                    });

                    await batch.commit();
                    console.log(`  ✅ Successfully refilled ${skillName} ${levelId}.`);
                } catch (err) {
                    console.error(`  ❌ Failed to refill ${skillName} ${levelId}:`, err.message);
                }
            } else {
                // console.log(`  ✅ [${skillName}] [${levelId}] is already good (${snapshot.size} q).`);
            }
        }
    }

    console.log('\n🏁 Targeted Refill Complete.');
    process.exit(0);
}

targetRefill().catch(console.error);
