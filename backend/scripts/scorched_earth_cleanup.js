const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function scorchedEarthCleanup() {
    console.log('🔥 Starting Scorched Earth Cleanup...');
    
    const snapshot = await db.collection('question_bank').get();
    let techCount = 0;
    let redundantCount = 0;
    
    // 1. Identify all Technical IDs and Undefineds
    const tasks = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const topic = String(data.topic || "");
        
        if (topic.startsWith('reading_') || topic.startsWith('writing_') || topic === 'undefined' || !data.topic) {
            tasks.push({ id: doc.id, type: 'TECH' });
            techCount++;
        }
    });

    console.log(`Found ${techCount} technical/broken tags to delete.`);

    // 2. Group Valid topics for L5/L7 Pruning
    const groups = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.topic && !String(data.topic).startsWith('reading_')) {
            const level = data.level;
            if (level === 'HKDSE Level 5 (Strong)' || level === 'HKDSE Level 5** (Mastery)') {
                const key = `${data.topic}|${level}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push({ id: doc.id, ...data });
            }
        }
    });

    Object.keys(groups).forEach(key => {
        if (groups[key].length > 12) {
            // Keep the first 12, delete the rest
            const extras = groups[key].slice(12);
            extras.forEach(ent => {
                tasks.push({ id: ent.id, type: 'REDUNDANT' });
                redundantCount++;
            });
        }
    });

    console.log(`Found ${redundantCount} redundant Standard/Elite questions to delete.`);

    // 3. Execute in Batches
    if (tasks.length === 0) {
        console.log('✅ Nothing to clean.');
        process.exit(0);
    }

    const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    const taskChunks = chunkArray(tasks, 400); // Firestore limit is 500

    for (const chunk of taskChunks) {
        const batch = db.batch();
        chunk.forEach(t => {
            batch.delete(db.collection('question_bank').doc(t.id));
        });
        await batch.commit();
        console.log(`... Committed batch of ${chunk.length} deletions.`);
    }

    console.log(`✅ TOTAL DELETED: ${tasks.length} documents.`);
    process.exit(0);
}

scorchedEarthCleanup().catch(console.error);
