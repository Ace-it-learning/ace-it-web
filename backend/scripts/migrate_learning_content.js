/**
 * Migrate learning_content data from Firestore backup JSON to Cosmos DB.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { getContainer } = require('../db/cosmos');

const BACKUP_PATH = path.join(__dirname, '..', '..', 'backups', 'firestore', '2026-05-02_14-01', 'learning_content.json');
const BATCH_SIZE = 20;

function normalizeDoc(id, raw) {
  const doc = { ...raw };
  doc.id = id;
  doc.pk = 'learning_content';
  
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
  
  const container = await getContainer('learning_content', '/pk');
  
  let inserted = 0;
  let errors = 0;
  
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
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
    console.log(`  Progress: ${inserted}/${entries.length}`);
  }
  
  console.log('\n=== Migration Complete ===');
  console.log(`Total inserted: ${inserted}`);
  console.log(`Total errors: ${errors}`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
