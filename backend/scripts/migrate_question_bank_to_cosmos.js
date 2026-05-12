/**
 * Migrate question_bank data from Firestore backup JSON to Cosmos DB.
 * Reads from: backups/firestore/2026-05-02_14-01/question_bank.json
 * Writes to:  Cosmos DB "question_bank" container
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { getContainer } = require('../db/cosmos');

const BACKUP_PATH = path.join(__dirname, '..', '..', 'backups', 'firestore', '2026-05-02_14-01', 'question_bank.json');
const BATCH_SIZE = 50;

function normalizeDoc(id, raw) {
  const doc = { ...raw };
  
  // Ensure id and partition key
  doc.id = id;
  doc.pk = 'question_bank';
  
  // Convert Firestore timestamps to ISO strings
  function convertTimestamps(obj) {
    if (Array.isArray(obj)) {
      return obj.map(convertTimestamps);
    }
    if (obj && typeof obj === 'object') {
      if (Number.isInteger(obj._seconds) && Number.isInteger(obj._nanoseconds)) {
        return new Date(obj._seconds * 1000).toISOString();
      }
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = convertTimestamps(v);
      }
      return out;
    }
    return obj;
  }
  
  return convertTimestamps(doc);
}

async function migrate() {
  if (!fs.existsSync(BACKUP_PATH)) {
    console.error('Backup file not found:', BACKUP_PATH);
    process.exit(1);
  }
  
  console.log('Reading backup from:', BACKUP_PATH);
  const raw = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
  const entries = Object.entries(raw);
  console.log(`Total entries in backup: ${entries.length}`);
  
  const container = await getContainer('question_bank', '/pk');
  
  // Check current count
  const { resources: countRes } = await container.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE c.pk = 'question_bank'"
  }).fetchAll();
  console.log(`Current docs in Cosmos DB: ${countRes[0]}`);
  
  let inserted = 0;
  let errors = 0;
  
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(entries.length / BATCH_SIZE);
    
    console.log(`\nBatch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, entries.length)})`);
    
    for (const [id, data] of batch) {
      try {
        const doc = normalizeDoc(id, data);
        await container.items.upsert(doc);
        inserted++;
      } catch (err) {
        errors++;
        console.error(`  Error inserting ${id}:`, err.message);
      }
    }
    
    console.log(`  Inserted so far: ${inserted}, Errors: ${errors}`);
  }
  
  console.log('\n=== Migration Complete ===');
  console.log(`Total inserted: ${inserted}`);
  console.log(`Total errors: ${errors}`);
  
  // Verify
  const { resources: finalCount } = await container.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE c.pk = 'question_bank'"
  }).fetchAll();
  console.log(`Final docs in Cosmos DB: ${finalCount[0]}`);
  
  // Verify Literal Comprehension
  const { resources: lcCount } = await container.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE c.pk = 'question_bank' AND c.topic = 'Literal Comprehension' AND c.level = 'HKDSE Level 3 (Adequate)' AND c.is_approved = true"
  }).fetchAll();
  console.log(`Literal Comprehension Level 3 approved: ${lcCount[0]}`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
