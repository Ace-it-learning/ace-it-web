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

async function deepDive() {
    const snapshot = await db.collection('question_bank')
        .where('is_approved', '==', true)
        .get();

    const stats = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        const passage = data.passage || data.reading_passage || "";
        if (!passage) return;

        stats.push({
            id: doc.id,
            topic: data.topic,
            level: data.level,
            created_at: data.created_at,
            is_factory: data.is_factory || false,
            passageSnippet: passage.substring(0, 50).replace(/\n/g, ' ')
        });
    });

    // Group by topic and level
    const grouped = {};
    stats.forEach(s => {
        const key = `${s.topic} | ${s.level}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(s);
    });

    console.log(`${'Topic | Level'.padEnd(50)} | ${'Count'.padEnd(6)} | ${'Date Range'}`);
    console.log('-'.repeat(100));

    Object.entries(grouped).sort().forEach(([key, items]) => {
        const dates = items.map(i => {
            if (i.created_at && i.created_at._seconds) return new Date(i.created_at._seconds * 1000);
            if (i.created_at instanceof Date) return i.created_at;
            if (typeof i.created_at === 'string') return new Date(i.created_at);
            return null;
        }).filter(d => d !== null);

        let dateRange = "Unknown";
        if (dates.length > 0) {
            const min = new Date(Math.min(...dates));
            const max = new Date(Math.max(...dates));
            dateRange = `${min.toISOString().split('T')[0]} to ${max.toISOString().split('T')[0]}`;
        }

        console.log(`${key.padEnd(50)} | ${String(items.length).padEnd(6)} | ${dateRange}`);
    });

    process.exit(0);
}

deepDive().catch(console.error);
