const admin = require('firebase-admin');
const path = require('path');
const crypto = require('crypto');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function legacyVsNew() {
    const snapshot = await db.collection('question_bank')
        .where('is_approved', '==', true)
        .get();

    const passages = {}; // hash -> { topic, level, date, count }

    snapshot.forEach(doc => {
        const data = doc.data();
        const passage = data.passage || data.reading_passage || "";
        if (!passage) return;

        const dateObj = data.created_at?.toMillis ? data.created_at.toDate() : (data.created_at ? new Date(data.created_at) : new Date(0));
        const dateStr = dateObj.toISOString().split('T')[0];
        const isLegacy = dateStr.startsWith('2026-02');
        const isNew = dateStr.startsWith('2026-04-18');

        const pHash = crypto.createHash('md5').update(passage.trim()).digest('hex');
        if (!passages[pHash]) {
            passages[pHash] = {
                topic: data.topic,
                level: data.level,
                date: dateStr,
                category: isLegacy ? 'Legacy' : (isNew ? 'New (Today)' : 'Other'),
                qCount: 0
            };
        }
        passages[pHash].qCount++;
    });

    const categories = { 'Legacy': 0, 'New (Today)': 0, 'Other': 0 };
    const topicLevelBreakdown = {};

    Object.values(passages).forEach(p => {
        categories[p.category]++;
        const key = `${p.topic} [${p.level}]`;
        if (!topicLevelBreakdown[key]) topicLevelBreakdown[key] = { Legacy: 0, New: 0 };
        if (p.category === 'Legacy') topicLevelBreakdown[key].Legacy++;
        if (p.category === 'New (Today)') topicLevelBreakdown[key].New++;
    });

    console.log('--- Reading Passage Audit (Legacy vs New) ---');
    console.log(`Total Unique Passages: ${Object.keys(passages).length}`);
    console.log(JSON.stringify(categories, null, 2));
    console.log('\n--- Breakdown by Topic & Level ---');
    console.log(`${'Topic [Level]'.padEnd(55)} | ${'Legacy'.padEnd(10)} | ${'New'}`);
    console.log('-'.repeat(80));

    Object.entries(topicLevelBreakdown).sort().forEach(([key, counts]) => {
        if (counts.Legacy > 0 || counts.New > 0) {
            console.log(`${key.padEnd(55)} | ${String(counts.Legacy).padEnd(10)} | ${counts.New}`);
        }
    });

    process.exit(0);
}

legacyVsNew().catch(console.error);
