/**
 * Remove duplicate HKU programme catalogue rows in Cosmos.
 * Keeps JS6688 seed ids: prog_{code} + detail_{code}
 * Deletes legacy ids (hku-*, wrong-type rows) when prog_{code} exists.
 *
 * Usage:
 *   node backend/scripts/jupas/dedupe_hku_programmes.js
 *   node backend/scripts/jupas/dedupe_hku_programmes.js JS6107 JS6767
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { CosmosClient } = require('@azure/cosmos');
const CacheService = require('../../services/CacheService');

const BACKUP_DIR = path.join(__dirname, '../../backups');

function canonicalProgrammeId(code) {
  return `prog_${code}`;
}

function canonicalDetailId(code) {
  return `detail_${code}`;
}

async function main() {
  const filterCodes = process.argv.slice(2).map((c) => c.toUpperCase());
  const client = new CosmosClient({
    endpoint: process.env.AZURE_COSMOS_ENDPOINT,
    key: process.env.AZURE_COSMOS_KEY,
  });
  const container = client.database(process.env.AZURE_COSMOS_DATABASE).container('jupas_programmes');

  const { resources: all } = await container.items
    .query({
      query:
        "SELECT * FROM c WHERE c.university = '香港大學' OR (c.code != null AND STARTSWITH(c.code, 'JS6'))",
    })
    .fetchAll();

  const byCode = new Map();
  for (const doc of all) {
    if (!doc.code) continue;
    if (filterCodes.length && !filterCodes.includes(doc.code)) continue;
    if (!byCode.has(doc.code)) byCode.set(doc.code, []);
    byCode.get(doc.code).push(doc);
  }

  const toDelete = [];
  const kept = [];

  for (const [code, docs] of byCode) {
    const progCanonical = canonicalProgrammeId(code);
    const detailCanonical = canonicalDetailId(code);

    const programmes = docs.filter((d) => d.type === 'programme');
    const details = docs.filter((d) => d.type === 'programme_detail');

    let keepProg = programmes.find((d) => d.id === progCanonical);
    if (!keepProg && programmes.length) {
      programmes.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
      keepProg = programmes[0];
    }

    let keepDetail = details.find((d) => d.id === detailCanonical);
    if (!keepDetail && details.length) {
      details.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
      keepDetail = details[0];
    }

    for (const d of programmes) {
      if (keepProg && d.id === keepProg.id) {
        kept.push({ code, type: 'programme', id: d.id });
      } else if (keepProg && d.id !== keepProg.id) {
        toDelete.push(d);
      }
    }

    for (const d of details) {
      if (keepDetail && d.id === keepDetail.id) {
        kept.push({ code, type: 'programme_detail', id: d.id });
      } else if (keepDetail && d.id !== keepDetail.id) {
        toDelete.push(d);
      }
    }
  }

  const uniqueDelete = [];
  const seen = new Set();
  for (const d of toDelete) {
    const key = `${d.id}|${d.pk}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueDelete.push(d);
  }

  if (!uniqueDelete.length) {
    console.log('No duplicate HKU programme documents to remove.');
    return;
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(
    BACKUP_DIR,
    `hku_dedupe_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(backupPath, JSON.stringify(uniqueDelete, null, 2), 'utf8');
  console.log(`Backup: ${backupPath} (${uniqueDelete.length} docs)`);

  for (const doc of uniqueDelete) {
    const pk = doc.pk || (doc.type === 'programme_detail' ? 'details' : 'programmes');
    await container.item(doc.id, pk).delete();
    console.log(`[deleted] ${doc.code} ${doc.type} id=${doc.id} pk=${pk}`);
  }

  CacheService.setDbCache('jupas_programmes_all', null, 0);
  console.log(`\nDone. Deleted ${uniqueDelete.length}, kept canonical rows for ${byCode.size} code(s).`);
  console.log('Restart backend or wait for cache expiry, then hard-refresh Dream Subjects.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
