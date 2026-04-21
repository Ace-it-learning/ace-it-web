const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

const TARGETS = {
    'HKDSE Level 3 (Adequate)': 8,
    'HKDSE Level 4 (Good)': 10,
    'HKDSE Level 5 (Strong)': 12,
    'HKDSE Level 5** (Mastery)': 12
};

async function definitiveClean() {
    console.log('💎 Starting Definitive Clean (Strict Scaling Enforcement)...');
    
    const snapshot = await db.collection('question_bank').get();
    const groups = {};
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const topic = (data.topic || "").trim().toUpperCase();
        const level = data.level;
        const key = `${topic}|${level}`;
        
        if (!groups[key]) groups[key] = [];
        groups[key].push({ id: doc.id, ...data });
    });

    const tasks = [];
    Object.keys(groups).forEach(key => {
        const level = key.split('|')[1];
        const target = TARGETS[level] || 12;
        
        if (groups[key].length > target) {
            console.log(`✂️  Pruning ${key}: ${groups[key].length} -> ${target}`);
            // Keep the first N docs
            const extras = groups[key].slice(target);
            extras.forEach(ent => tasks.push(ent.id));
        }
    });

    if (tasks.length === 0) {
        console.log('✅ All counts are now strictly standardized.');
        process.exit(0);
    }

    const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    const taskChunks = chunkArray(tasks, 400);

    for (const chunk of taskChunks) {
        const batch = db.batch();
        chunk.forEach(id => {
            batch.delete(db.collection('question_bank').doc(id));
        });
        await batch.commit();
    }

    console.log(`✅ Success: Deleted ${tasks.length} excess documents.`);
    process.exit(0);
}

definitiveClean().catch(console.error);
