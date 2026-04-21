const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function auditReadingContent() {
    const { MICRO_SKILLS } = require('../constants/microSkills');
    const readingSkillIds = Object.keys(MICRO_SKILLS).filter(id => id.startsWith('reading_'));
    const readingSkillNames = readingSkillIds.map(id => MICRO_SKILLS[id].en?.name || id);
    
    console.log('--- READING CONTENT AUDIT ---');
    console.log(`Target Topics: ${readingSkillNames.length}`);
    console.log(`Target Levels: 3, 4, 5, 7 (Easy, Medium, Standard, Elite)`);
    
    const snapshot = await db.collection('question_bank')
        .where('is_approved', '==', true)
        .get();
    
    // Normalization mapping for names used in Firestore to IDs
    const nameToId = {
        'Literal Comprehension': 'reading_literalComprehension',
        'Inference': 'reading_inference',
        'Main Idea Identification': 'reading_mainIdea',
        'Detail Recognition': 'reading_detailRecognition',
        'Sequencing': 'reading_sequencing',
        'Synthesis': 'reading_synthesis',
        'Fact vs Opinion': 'reading_factVsOpinion',
        'Author\'s Purpose': 'reading_authorPurpose',
        'Tone & Attitude': 'reading_toneAttitude',
        'Register & Style': 'reading_registerStyle',
        'Metaphorical Language': 'reading_metaphoricalLanguage',
        'Text Organisation': 'reading_textOrganization',
        'Skimming & Scanning': 'reading_skimmingScanning',
        'Paraphrasing': 'reading_paraphrasing',
        'Cohesion & Reference': 'reading_cohesionReference'
    };

    const clusters = {}; // "topic_level_hash" -> count
    
    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.topic || !data.level || !data.passage) return;
        
        // Normalize topic ID
        const skillId = nameToId[data.topic] || data.topic;
        if (!skillId.startsWith('reading_')) return;

        // Normalize level
        let lvl = "Unknown";
        if (data.level.includes('Level 3')) lvl = "3";
        else if (data.level.includes('Level 4')) lvl = "4";
        else if (data.level.includes('Level 5*') || data.level.includes('Level 5**')) lvl = "Elite"; // 6/7
        else if (data.level.includes('Level 5')) lvl = "5";
        
        const crypto = require('crypto');
        const pHash = crypto.createHash('md5').update(data.passage.trim()).digest('hex');
        const key = `${skillId} | L${lvl} | ${pHash}`;
        
        if (!clusters[key]) {
            clusters[key] = {
                topic: skillId,
                level: lvl,
                passageSnippet: data.passage.substring(0, 50).replace(/\n/g, ' '),
                count: 0
            };
        }
        clusters[key].count++;
    });

    const results = Object.values(clusters);
    console.log(`\nTotal Approved Clusters (Missions) Found: ${results.length}`);
    
    // Check gaps for each Reading topic
    const summary = {};
    readingSkillIds.forEach(id => {
        summary[id] = { "3": 0, "4": 0, "5": 0, "Elite": 0 };
    });
    
    results.forEach(c => {
        if (summary[c.topic]) {
            summary[c.topic][c.level]++;
        }
    });

    console.table(summary);
    
    // Check specific Zero-Waste status
    console.log('\n--- Zero-Waste Search ---');
    results.filter(c => c.passageSnippet.toLowerCase().includes('zero-waste'))
           .forEach(c => console.log(`[${c.topic}] Level ${c.level}: ${c.count} questions`));

    process.exit(0);
}

auditReadingContent().catch(console.error);
