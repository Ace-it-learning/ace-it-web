/**
 * Migrate speaking_drills.json to Cosmos DB question_bank container.
 * Reads from: backend/data/speaking_drills.json
 * Writes to:  Cosmos DB "question_bank" container (type: "speaking_drill")
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { getContainer } = require('../db/cosmos');

const DRILLS_PATH = path.join(__dirname, '..', 'data', 'speaking_drills.json');
const BATCH_SIZE = 50;

function normalizeDrill(id, raw, criterion) {
  const doc = { ...raw };
  doc.id = id;
  doc.pk = 'question_bank';
  doc.type = 'speaking_drill';
  doc.criterion = criterion;
  doc.is_approved = true;
  doc.topic = raw.title || raw.scenario || id;
  doc.paper = 'speaking';
  doc.subject = 'English';
  
  // Map level to HKDSE format if needed
  const lvl = String(raw.level || '3').trim();
  if (lvl === '3') doc.level = 'HKDSE Level 3 (Adequate)';
  else if (lvl === '4') doc.level = 'HKDSE Level 4 (Good)';
  else if (lvl === '5') doc.level = 'HKDSE Level 5 (Strong)';
  else if (lvl === '5*') doc.level = 'HKDSE Level 5* (Exemplary)';
  else if (lvl === '5**') doc.level = 'HKDSE Level 5** (Mastery)';
  else if (lvl === '6') doc.level = 'HKDSE Level 5* (Exemplary)';
  else if (lvl === '7') doc.level = 'HKDSE Level 5** (Mastery)';
  else doc.level = `HKDSE Level ${lvl}`;
  
  // Ensure created_at exists
  if (!doc.created_at) doc.created_at = new Date().toISOString();
  
  return doc;
}

async function migrate() {
  if (!fs.existsSync(DRILLS_PATH)) {
    console.error('Drills file not found:', DRILLS_PATH);
    process.exit(1);
  }
  
  console.log('Reading drills from:', DRILLS_PATH);
  const raw = JSON.parse(fs.readFileSync(DRILLS_PATH, 'utf8'));
  
  // Flatten all drills from all criteria
  const entries = [];
  for (const [criterion, drills] of Object.entries(raw)) {
    if (Array.isArray(drills)) {
      drills.forEach((drill, idx) => {
        const id = drill.id || `${criterion}_${idx + 1}`;
        entries.push({ id, drill, criterion });
      });
    }
  }
  
  console.log(`Total drills to migrate: ${entries.length}`);
  
  const container = await getContainer('question_bank', '/pk');
  
  // Check current count of speaking drills
  const { resources: countRes } = await container.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE c.pk = 'question_bank' AND c.type = 'speaking_drill'"
  }).fetchAll();
  console.log(`Current speaking drills in Cosmos DB: ${countRes[0]}`);
  
  let inserted = 0;
  let errors = 0;
  let skipped = 0;
  
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(entries.length / BATCH_SIZE);
    
    console.log(`\nBatch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, entries.length)})`);
    
    for (const { id, drill, criterion } of batch) {
      try {
        // Check if already exists
        const { resources: existing } = await container.items.query({
          query: 'SELECT VALUE COUNT(1) FROM c WHERE c.pk = "question_bank" AND c.id = @id',
          parameters: [{ name: '@id', value: id }]
        }).fetchAll();
        
        if (existing[0] > 0) {
          skipped++;
          continue;
        }
        
        const doc = normalizeDrill(id, drill, criterion);
        await container.items.upsert(doc);
        inserted++;
      } catch (err) {
        errors++;
        console.error(`  Error inserting ${id}:`, err.message);
      }
    }
    
    console.log(`  Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
  }
  
  console.log('\n=== Migration Complete ===');
  console.log(`Total inserted: ${inserted}`);
  console.log(`Total skipped (already exists): ${skipped}`);
  console.log(`Total errors: ${errors}`);
  
  // Verify
  const { resources: finalCount } = await container.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE c.pk = 'question_bank' AND c.type = 'speaking_drill'"
  }).fetchAll();
  console.log(`Final speaking drills in Cosmos DB: ${finalCount[0]}`);
  
  // Verify by criterion
  const { resources: byCriterion } = await container.items.query({
    query: "SELECT c.criterion, COUNT(1) as count FROM c WHERE c.pk = 'question_bank' AND c.type = 'speaking_drill' GROUP BY c.criterion"
  }).fetchAll();
  console.log('\nBy criterion:');
  byCriterion.forEach(c => console.log(`  ${c.criterion}: ${c.count}`));
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
