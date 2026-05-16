/**
 * Build JS code -> official CUHK admission programme URL map.
 * Source: https://admission.cuhk.edu.hk/programmes/list/ (and programme pages)
 *
 * Usage: node backend/scripts/jupas/buildCuhkAdmissionMap.js
 */

const fs = require('fs');
const path = require('path');

const LIST_URL = 'https://admission.cuhk.edu.hk/programmes/list/';
const OUT = path.join(__dirname, 'cuhk_admission_urls.json');

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AceIt-JUPAS-CUHK/1.0 (official sources only)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseMapFromListHtml(html) {
  const map = {};
  const re = /programme\/([a-z0-9%-]+)\/[\s\S]{0,4000}?<span class="label">JS(\d{4})<\/span>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    map[`JS${m[2]}`] = `https://admission.cuhk.edu.hk/programme/${m[1]}/`;
  }
  return map;
}

async function build() {
  const { spawnSync } = require('child_process');
  const py = path.join(__dirname, 'build_cuhk_admission_map.py');
  const r = spawnSync('python', [py], { encoding: 'utf8', cwd: path.join(__dirname, '../..') });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status === 0 && fs.existsSync(OUT)) {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'));
  }

  console.log('[cuhk-map] Python failed, trying Node fetch…', r.stderr?.slice(0, 200));
  const html = await fetchHtml(LIST_URL);
  const map = parseMapFromListHtml(html);
  const payload = {
    updatedAt: new Date().toISOString(),
    source: LIST_URL,
    count: Object.keys(map).length,
    programmes: map,
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`[cuhk-map] ${payload.count} programmes -> ${OUT}`);
  return payload;
}

if (require.main === module) {
  build().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { build, OUT, parseMapFromListHtml };
