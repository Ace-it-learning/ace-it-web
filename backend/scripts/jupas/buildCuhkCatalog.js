/**
 * Merge CUHK programme catalogue (72 codes) from batch JSON + seed metadata.
 */
const fs = require('fs');
const path = require('path');

const CUHK_DIR = path.join(__dirname, '../cuhk');
const OUT = path.join(__dirname, 'cuhk_programmes_catalog.json');
const SCORES_PATH = path.join(__dirname, 'cuhk_jupas_scores_2025.json');

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(CUHK_DIR, file), 'utf8'));
}

function loadPdfScores() {
  if (!fs.existsSync(SCORES_PATH)) return {};
  return JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8')).programmes || {};
}

function parseSeedProgramme(seedPath) {
  const text = fs.readFileSync(seedPath, 'utf8');
  if (!/programme\s*=\s*\{/.test(text)) return null;
  const pick = (key) => {
    const m = text.match(new RegExp(`"${key}":\\s*("([^"]*)"|(\\d+))`));
    if (!m) return undefined;
    return m[2] !== undefined ? m[2] : Number(m[3]);
  };
  const code = pick('code');
  if (!code) return null;
  const row = {
    code,
    university: pick('university') || '香港中文大學',
    nameEn: pick('nameEn'),
    nameZh: pick('nameZh'),
    name: pick('name') || pick('nameZh'),
    faculty: pick('faculty'),
    median: pick('median'),
    band_a: pick('band_a'),
    category: pick('category'),
  };
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
}

function build() {
  const byCode = {};
  for (const file of [
    'cuhk-batch1-programmes.json',
    'cuhk-batch2-programmes.json',
    'cuhk-batch3-programmes.json',
  ]) {
    const data = loadJson(file);
    const list = Array.isArray(data) ? data : Object.values(data);
    for (const p of list) {
      if (p?.code) byCode[p.code] = { ...byCode[p.code], ...p };
    }
  }

  const seeds = fs.readdirSync(CUHK_DIR).filter((f) => /^seed_JS\d+\.py$/i.test(f));
  for (const f of seeds) {
    const code = f.match(/JS\d+/i)[0].toUpperCase();
    const fromSeed = parseSeedProgramme(path.join(CUHK_DIR, f));
    if (fromSeed) {
      byCode[code] = { ...byCode[code], ...fromSeed };
    } else if (!byCode[code]) {
      byCode[code] = { code, university: '香港中文大學' };
    }
  }

  const pdfScores = loadPdfScores();
  for (const [code, row] of Object.entries(pdfScores)) {
    byCode[code] = {
      ...byCode[code],
      code,
      nameEn: row.nameEn || byCode[code]?.nameEn,
      median: row.median,
      lq: row.lq,
      uq: row.uq,
      band_a: row.lq,
      formula: row.formula,
    };
  }

  const programmes = Object.fromEntries(
    Object.entries(byCode).sort(([a], [b]) => a.localeCompare(b))
  );

  fs.writeFileSync(
    OUT,
    JSON.stringify(
      { updatedAt: new Date().toISOString(), count: Object.keys(programmes).length, programmes },
      null,
      2
    ),
    'utf8'
  );
  console.log(`[catalog] ${Object.keys(programmes).length} CUHK programmes -> ${OUT}`);
  return programmes;
}

if (require.main === module) build();

module.exports = { build, OUT };
