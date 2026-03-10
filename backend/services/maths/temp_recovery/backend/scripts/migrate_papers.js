const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const PAST_PAPERS_DIR = path.join(__dirname, '..', 'past_papers');

/**
 * Recursively scans for JSON files to migrate.
 */
const getJsonFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getJsonFiles(filePath));
        } else if (filePath.endsWith('.json') && !fileNameIsSystem(file)) {
            results.push(filePath);
        }
    });
    return results;
};

const fileNameIsSystem = (name) => {
    return ['db.json', 'package.json', 'package-lock.json', 'serviceAccountKey.json'].includes(name);
};

const migratePaper = async (filePath) => {
    console.log(`\n[Migration] Processing: ${path.basename(filePath)}`);
    try {
        const paperData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { paper_metadata, resource_files, questions } = paperData;

        if (!paper_metadata || !paper_metadata.paper_id) {
            console.warn(`- Skipping: Invalid JSON structure (missing metadata/paper_id)`);
            return;
        }

        const paperId = paper_metadata.paper_id;
        console.log(`- Paper ID: ${paperId}`);

        // 1. Metadata
        await db.collection('past_papers').doc(paperId).set({
            metadata: paper_metadata,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`- Metadata updated.`);

        // 2. Resources
        for (const res of resource_files) {
            await db.collection('past_papers').doc(paperId).collection('resources').doc(res.resource_id).set(res);
        }
        console.log(`- ${resource_files.length} resources uploaded.`);

        // 3. Questions (Batched)
        const batch = db.batch();
        questions.forEach(q => {
            const qRef = db.collection('past_papers').doc(paperId).collection('questions').doc(`q${q.id}`);
            batch.set(qRef, q);
        });
        await batch.commit();
        console.log(`- ${questions.length} questions uploaded.`);

        console.log(`[SUCCESS] ${paperId} migrated successfully.`);
    } catch (err) {
        console.error(`[ERROR] Failed to migrate ${path.basename(filePath)}:`, err.message);
    }
};

const runMigration = async () => {
    console.log("=== Ace It! Past Paper Migration Tool ===");
    const files = getJsonFiles(PAST_PAPERS_DIR);
    console.log(`Found ${files.length} JSON files to process.`);

    for (const file of files) {
        await migratePaper(file);
    }

    console.log("\n=== Migration Finished ===");
    process.exit(0);
};

runMigration();
