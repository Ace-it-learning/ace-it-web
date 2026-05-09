const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const QuestionBankStore = require('../services/QuestionBankStore');

const SEED_PATH = path.join(__dirname, '..', 'data', 'question_bank', 'listening_missions.json');

async function seed() {
    if (!fs.existsSync(SEED_PATH)) {
        console.error(`Seed file not found: ${SEED_PATH}`);
        process.exit(1);
    }

    const raw = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
    const entries = Object.entries(raw);
    console.log(`Seeding ${entries.length} HKDSE Listening missions from JSON -> Cosmos question_bank...`);
    for (const [docId, data] of entries) {
        await QuestionBankStore.upsertById(docId, {
            ...data,
            created_at: new Date().toISOString()
        }, { merge: true });
    }
    console.log(`Successfully wrote ${entries.length} documents to Cosmos (source: data/question_bank/listening_missions.json).`);
    process.exit(0);
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
