const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const ROOT = path.join(__dirname, '..', '..');
const PRIMARY_BACKUP_DIR = path.join(ROOT, 'backups', 'firestore', '2026-05-02_14-01');
const SECONDARY_BACKUP_DIR = path.join(__dirname, '..', 'backups', 'firestore');

function toCollectionName(filePath) {
    const base = path.basename(filePath, '.json');
    if (base === 'question_bank_repaired') return 'question_bank';
    // Canonical General Listening Quest seed -> same collection as labs
    if (base === 'listening_missions') return 'question_bank';
    return base;
}

function getJsonFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath)
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(dirPath, f));
}

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function isTimestampObject(value) {
    return value &&
        typeof value === 'object' &&
        Number.isInteger(value._seconds) &&
        Number.isInteger(value._nanoseconds) &&
        Object.keys(value).length === 2;
}

function isGeoPointObject(value) {
    return value &&
        typeof value === 'object' &&
        typeof value._latitude === 'number' &&
        typeof value._longitude === 'number' &&
        Object.keys(value).length === 2;
}

function normalizeValue(value) {
    if (Array.isArray(value)) return value.map(normalizeValue);
    if (value && typeof value === 'object') {
        if (isTimestampObject(value)) {
            return new admin.firestore.Timestamp(value._seconds, value._nanoseconds);
        }
        if (isGeoPointObject(value)) {
            return new admin.firestore.GeoPoint(value._latitude, value._longitude);
        }
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (k === '_subcollections') continue;
            out[k] = normalizeValue(v);
        }
        return out;
    }
    return value;
}

function resolveDocEntries(raw) {
    if (Array.isArray(raw)) {
        return raw.map((doc, idx) => [doc?.id || `idx_${idx + 1}`, doc]);
    }
    if (raw && typeof raw === 'object') {
        return Object.entries(raw);
    }
    return [];
}

async function upsertDocRecursive(writer, docRef, docRaw, stats) {
    const normalizedDoc = normalizeValue(docRaw);
    writer.set(docRef, normalizedDoc, { merge: true });
    stats.writtenDocs += 1;

    const subcollections = docRaw?._subcollections;
    if (!subcollections || typeof subcollections !== 'object') return;

    for (const [subName, subDocsRaw] of Object.entries(subcollections)) {
        const subEntries = resolveDocEntries(subDocsRaw);
        for (const [subDocId, subDocData] of subEntries) {
            const subRef = docRef.collection(subName).doc(String(subDocId));
            await upsertDocRecursive(writer, subRef, subDocData, stats);
        }
    }
}

function buildImportPlan() {
    const primaryFiles = getJsonFiles(PRIMARY_BACKUP_DIR);
    const secondaryFiles = getJsonFiles(SECONDARY_BACKUP_DIR);
    const listeningSeedPath = path.join(__dirname, '..', 'data', 'question_bank', 'listening_missions.json');

    // Priority rules:
    // 0) data/question_bank/listening_missions.json (20 General Listening Quests — version-controlled seed)
    // 1) question_bank_repaired.json (if exists)
    // 2) question_bank.json
    // 3) everything else
    const prioritized = [];
    if (fs.existsSync(listeningSeedPath)) {
        prioritized.push(listeningSeedPath);
    }
    const pushIfExists = (arr, fileName) => {
        const f = arr.find((p) => path.basename(p) === fileName);
        if (f) prioritized.push(f);
    };

    pushIfExists(secondaryFiles, 'question_bank_repaired.json');
    if (!prioritized.find((p) => path.basename(p) === 'question_bank_repaired.json')) {
        pushIfExists(primaryFiles, 'question_bank_repaired.json');
    }

    pushIfExists(secondaryFiles, 'question_bank.json');
    if (!prioritized.find((p) => path.basename(p) === 'question_bank.json')) {
        pushIfExists(primaryFiles, 'question_bank.json');
    }

    const seen = new Set(prioritized.map((f) => path.basename(f)));
    for (const f of [...secondaryFiles, ...primaryFiles]) {
        const bn = path.basename(f);
        if (!seen.has(bn)) {
            prioritized.push(f);
            seen.add(bn);
        }
    }

    return prioritized;
}

async function run() {
    const execute = process.argv.includes('--execute');
    const projectHint = process.env.GOOGLE_CLOUD_PROJECT || '(auto)';
    const emu = process.env.FIRESTORE_EMULATOR_HOST || null;

    const serviceAccountPath = path.join(__dirname, '..', 'config', 'antigravity-tutor-dev-key.json');
    if (!admin.apps.length) {
        if (fs.existsSync(serviceAccountPath)) {
            admin.initializeApp({
                credential: admin.credential.cert(require(serviceAccountPath))
            });
        } else {
            admin.initializeApp();
        }
    }

    const db = admin.firestore();
    const files = buildImportPlan();

    console.log('--- Firestore Backup Import ---');
    console.log(`Target project hint: ${projectHint}`);
    console.log(`Using emulator: ${emu ? `YES (${emu})` : 'NO'}`);
    console.log(`Files discovered: ${files.length}`);
    for (const f of files) console.log(` - ${f}`);

    if (!execute) {
        console.log('\nDry-run complete. Re-run with --execute to perform import.');
        process.exit(0);
    }

    const writer = db.bulkWriter();
    writer.onWriteError((error) => {
        console.error(`[BulkWriter] Error on ${error.documentRef.path}: ${error.message}`);
        if (error.failedAttempts < 3) return true;
        return false;
    });

    const summary = {};

    for (const filePath of files) {
        const collectionName = toCollectionName(filePath);
        const raw = loadJson(filePath);
        const entries = resolveDocEntries(raw);

        if (!summary[collectionName]) summary[collectionName] = { sourceFiles: [], docs: 0 };
        summary[collectionName].sourceFiles.push(path.basename(filePath));

        const stats = { writtenDocs: 0 };
        for (const [docId, docRaw] of entries) {
            const ref = db.collection(collectionName).doc(String(docId));
            await upsertDocRecursive(writer, ref, docRaw, stats);
        }
        summary[collectionName].docs += stats.writtenDocs;
        console.log(`Imported ${stats.writtenDocs} docs from ${path.basename(filePath)} -> ${collectionName}`);
    }

    await writer.close();
    console.log('\n--- Import Summary ---');
    for (const [collection, info] of Object.entries(summary)) {
        console.log(`${collection}: ${info.docs} docs (sources: ${info.sourceFiles.join(', ')})`);
    }
    console.log('\nImport complete.');
}

run().catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
});

