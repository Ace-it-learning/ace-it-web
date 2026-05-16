/**
 * Fix HKU programme Chinese titles from JUPAS TC (program_title_cn).
 *
 * Usage:
 *   node backend/scripts/jupas/update_hku_name_zh.js
 *   node backend/scripts/jupas/update_hku_name_zh.js JS6822 JS6755
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { fetchJupasTcName } = require('./buildFactPack');

const JUPAS_DIR = __dirname;
const HKU_BATCHES = [
  'JS6731', 'JS6810', 'JS6822',
  'JS6250', 'JS6418', 'JS6949',
  'JS6078', 'JS6406',
  'JS6755', 'JS6767', 'JS6781', 'JS6793', 'JS6808', 'JS6846', 'JS6860', 'JS6884', 'JS6896',
  'JS6119', 'JS6157', 'JS6303', 'JS6315', 'JS6339', 'JS6353', 'JS6377', 'JS6937', 'JS6987',
  'JS6729', 'JS6779', 'JS6858', 'JS6901', 'JS6999',
  'JS6004', 'JS6016', 'JS6028', 'JS6042', 'JS6236', 'JS6054', 'JS6274', 'JS6286', 'JS6298',
  'JS6066', 'JS6080', 'JS6092', 'JS6107', 'JS6925', 'JS6224', 'JS6248',
  'JS6456', 'JS6468', 'JS6482', 'JS6494', 'JS6602', 'JS6626', 'JS6688', 'JS6705', 'JS6717',
];

function hasChinese(s) {
  return /[\u4e00-\u9fff]/.test(s || '');
}

function needsUpdate(nameZh, nameEn) {
  if (!nameZh || !hasChinese(nameZh)) return true;
  if (nameEn && nameZh.trim() === nameEn.trim()) return true;
  if (/^Bachelor\b/i.test(nameZh) || /^Master\b/i.test(nameZh)) return true;
  return false;
}

function discoverCodes(argv) {
  const fromArgv = argv.filter((a) => /^JS\d{4}$/i.test(a)).map((a) => a.toUpperCase());
  if (fromArgv.length) return fromArgv;
  const fromPayloads = fs
    .readdirSync(JUPAS_DIR)
    .filter((f) => /^payload_JS\d{4}\.json$/i.test(f))
    .map((f) => f.match(/JS\d{4}/i)[0].toUpperCase());
  return [...new Set([...HKU_BATCHES, ...fromPayloads])].sort();
}

function patchPayload(payloadPath, nameZh) {
  if (!fs.existsSync(payloadPath)) return false;
  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  payload.programme = payload.programme || {};
  payload.programme.nameZh = nameZh;
  if (payload.factPack?.programme) payload.factPack.programme.nameZh = nameZh;
  fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), 'utf8');
  return true;
}

function upsertCosmos(code, nameZh) {
  const py = `
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
from azure.cosmos import CosmosClient

code = ${JSON.stringify(code)}
name_zh = ${JSON.stringify(nameZh)}

client = CosmosClient(os.getenv("AZURE_COSMOS_ENDPOINT"), credential=os.getenv("AZURE_COSMOS_KEY"))
container = client.get_database_client(os.getenv("AZURE_COSMOS_DATABASE", "aceit")).get_container_client("jupas_programmes")

doc_id = f"prog_{code}"
try:
    doc = container.read_item(item=doc_id, partition_key="programmes")
except Exception:
    print(f"[skip-cosmos] {code} — no prog document")
    sys.exit(0)

doc["nameZh"] = name_zh
container.upsert_item(doc)
print(f"[cosmos] {code} -> {name_zh}")
`;
  const tmp = path.join(JUPAS_DIR, `_tmp_name_zh_${code}.py`);
  fs.writeFileSync(tmp, py, 'utf8');
  const r = spawnSync('python', [tmp], {
    cwd: path.join(JUPAS_DIR, '..', '..'),
    encoding: 'utf8',
  });
  fs.unlinkSync(tmp);
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status === 0;
}

async function main() {
  const codes = discoverCodes(process.argv.slice(2));
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const code of codes) {
    const payloadPath = path.join(JUPAS_DIR, `payload_${code}.json`);
    let currentZh = '';
    if (fs.existsSync(payloadPath)) {
      currentZh = JSON.parse(fs.readFileSync(payloadPath, 'utf8')).programme?.nameZh || '';
    }

    if (!needsUpdate(currentZh, '')) {
      console.log(`[ok-existing] ${code} — ${currentZh}`);
      skipped += 1;
      continue;
    }

    const nameZh = await fetchJupasTcName(code);
    if (!nameZh || !hasChinese(nameZh)) {
      console.warn(`[fail] ${code} — no Chinese title from JUPAS TC`);
      failed += 1;
      await new Promise((r) => setTimeout(r, 300));
      continue;
    }

    patchPayload(payloadPath, nameZh);
    upsertCosmos(code, nameZh);
    console.log(`[updated] ${code} — ${nameZh}`);
    updated += 1;
    await new Promise((r) => setTimeout(r, 400));
  }

  if (updated > 0) {
    const CacheService = require('../../services/CacheService');
    CacheService.setDbCache('jupas_programmes_all', null, 0);
    console.log('[cache] Cleared jupas_programmes_all');
  }

  console.log(`\nDone: updated=${updated}, skipped=${skipped}, failed=${failed}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
