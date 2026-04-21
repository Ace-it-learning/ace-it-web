const admin = require('firebase-admin');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Adjusted path for backend/scripts
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const TOPICS = [
    'Literal Comprehension',
    'Inference',
    'Main Idea Identification',
    'Detail Recognition',
    'Sequencing',
    'Synthesis',
    'Fact vs Opinion',
    "Author's Purpose",
    'Tone & Attitude',
    'Register & Style',
    'Metaphorical Language',
    'Text Organisation',
    'Skimming & Scanning',
    'Paraphrasing',
    'Cohesion & Reference'
];

const LEVELS = [
    'HKDSE Level 3 (Adequate)',
    'HKDSE Level 4 (Good)',
    'HKDSE Level 5 (Strong)',
    'HKDSE Level 5** (Mastery)'
];

async function runAudit() {
    console.log('--- English Reading Quest Audit ---');
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Topics to check: ${TOPICS.length}`);
    console.log(`Levels to check: ${LEVELS.length}`);
    console.log('------------------------------------\n');

    const report = [];
    let totalPassages = 0;

    for (const topic of TOPICS) {
        const topicStats = { topic, levels: {} };
        
        for (const level of LEVELS) {
            const snapshot = await db.collection('question_bank')
                .where('topic', '==', topic)
                .where('level', '==', level)
                .where('is_approved', '==', true)
                .get();

            const passages = {}; // hash -> { count, snippet }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const passageText = data.passage || data.reading_passage || "";
                if (!passageText) return;
                
                const pHash = crypto.createHash('md5').update(passageText.trim()).digest('hex');
                if (!passages[pHash]) {
                    passages[pHash] = {
                        count: 0,
                        snippet: passageText.substring(0, 50).replace(/\n/g, ' ')
                    };
                }
                passages[pHash].count++;
            });

            const uniquePassageCount = Object.keys(passages).length;
            const questionCounts = Object.values(passages).map(p => p.count);
            
            topicStats.levels[level] = {
                passageCount: uniquePassageCount,
                questionCounts: questionCounts
            };
            
            totalPassages += uniquePassageCount;
        }
        report.push(topicStats);
    }

    // Print Report Table
    console.log(`${'Topic'.padEnd(30)} | ${'Lvl 3'.padEnd(10)} | ${'Lvl 4'.padEnd(10)} | ${'Lvl 5'.padEnd(10)} | ${'Lvl 5**'.padEnd(10)}`);
    console.log('-'.repeat(80));

    report.forEach(rs => {
        const l3 = rs.levels['HKDSE Level 3 (Adequate)'].passageCount;
        const l4 = rs.levels['HKDSE Level 4 (Good)'].passageCount;
        const l5 = rs.levels['HKDSE Level 5 (Strong)'].passageCount;
        const l7 = rs.levels['HKDSE Level 5** (Mastery)'].passageCount;
        
        console.log(`${rs.topic.padEnd(30)} | ${String(l3).padEnd(10)} | ${String(l4).padEnd(10)} | ${String(l5).padEnd(10)} | ${String(l7).padEnd(10)}`);
    });

    console.log('-'.repeat(80));
    console.log(`TOTAL UNIQUE PASSAGES: ${totalPassages}`);
    
    // Check for question count consistency
    console.log('\n--- Question Count Consistency Check ---');
    report.forEach(rs => {
        Object.entries(rs.levels).forEach(([level, stats]) => {
            if (stats.passageCount > 0) {
                const inconsistent = stats.questionCounts.filter(c => {
                    if (level.includes('Level 3')) return c !== 8;
                    if (level.includes('Level 4')) return c !== 10;
                    if (level.includes('Level 5 (Strong)')) return c !== 12;
                    if (level.includes('Level 5**')) return c !== 12;
                    return false;
                });
                
                if (inconsistent.length > 0) {
                    console.log(`[!] Inconsistency in ${rs.topic} [${level}]: Found counts ${stats.questionCounts.join(', ')}`);
                }
            } else {
                console.log(`[X] MISSING: ${rs.topic} [${level}] has 0 passages.`);
            }
        });
    });

    process.exit(0);
}

runAudit().catch(err => {
    console.error(err);
    process.exit(1);
});
