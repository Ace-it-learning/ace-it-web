const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { CosmosClient } = require('@azure/cosmos');
const programmes = require('./batch4_hku_programmes.json');

async function seed() {
  const client = new CosmosClient({
    endpoint: process.env.AZURE_COSMOS_ENDPOINT,
    key: process.env.AZURE_COSMOS_KEY
  });
  const container = client.database(process.env.AZURE_COSMOS_DATABASE).container('jupas_programmes');

  console.log(`[Batch 4] Seeding ${programmes.length} HKU programmes...`);
  let success = 0;
  let skipped = 0;

  for (const prog of programmes) {
    try {
      // Check if already exists
      const { resources } = await container.items.query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: prog.id }]
      }).fetchAll();

      if (resources.length > 0) {
        console.log(`  SKIP: ${prog.code} (${prog.id}) already exists`);
        skipped++;
        continue;
      }

      await container.items.create(prog);
      console.log(`  OK: ${prog.code} - ${prog.nameEn}`);
      success++;
    } catch (err) {
      console.error(`  FAIL: ${prog.code} - ${err.message}`);
    }
  }

  console.log(`\n[Batch 4] Done: ${success} seeded, ${skipped} skipped`);
}

seed().catch(err => {
  console.error('[Batch 4] Fatal error:', err);
  process.exit(1);
});
