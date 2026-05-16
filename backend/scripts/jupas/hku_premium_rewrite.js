/**
 * Second-pass HKU programme details — JS6717 quality.
 * Official fact pack only → Deepseek JSON → validate → seed + Cosmos.
 *
 * Usage:
 *   node backend/scripts/jupas/hku_premium_rewrite.js JS6731
 *   node backend/scripts/jupas/hku_premium_rewrite.js --batch socsci
 *   node backend/scripts/jupas/hku_premium_rewrite.js --all
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { buildFactPack } = require('./buildFactPack');
const GenerativeAIService = require('../../services/GenerativeAIService');

const SKIP = new Set([
  'JS6468', 'JS6482', 'JS6494', 'JS6602', 'JS6626', 'JS6688', 'JS6705', 'JS6717',
]);

const BATCHES = {
  socsci: ['JS6731', 'JS6810', 'JS6822'],
  medicine: ['JS6250', 'JS6418', 'JS6949'],
  law: ['JS6078', 'JS6406'],
  business: ['JS6755', 'JS6767', 'JS6781', 'JS6793', 'JS6808', 'JS6846', 'JS6860', 'JS6884', 'JS6896'],
  engineering: ['JS6119', 'JS6157', 'JS6303', 'JS6315', 'JS6339', 'JS6353', 'JS6377', 'JS6937', 'JS6987'],
  science: ['JS6729', 'JS6779', 'JS6858', 'JS6901', 'JS6999'],
  arts_arch: ['JS6004', 'JS6016', 'JS6028', 'JS6042', 'JS6236', 'JS6054', 'JS6274', 'JS6286', 'JS6298'],
  misc: ['JS6066', 'JS6080', 'JS6092', 'JS6107', 'JS6925', 'JS6224', 'JS6248'],
};

const MIN_BULLETS = {
  admission: 8,
  curriculum: 6,
  career: 5,
  campus: 4,
  competitiveness: 6,
  alumni: 4,
  scholarships: 4,
  tips: 6,
};

const BLOCKLIST = [/af_2025_JUPAS\.pdf/i, /OpenAI/i, /DeepMind/i];

function premiumBulletCheck(details) {
  const errs = [];
  for (const lang of ['en', 'zh']) {
    const sections = details?.[lang]?.sections || {};
    for (const [key, min] of Object.entries(MIN_BULLETS)) {
      const n = sections[key]?.content?.length || 0;
      if (n < min) errs.push(`${lang}.${key}: ${n} bullets (need ${min})`);
    }
  }
  return errs;
}

function sanitizePayload(payload) {
  const { factPack } = payload;
  const s = factPack.scores;
  payload.programme = {
    code: factPack.code,
    nameEn: factPack.programme.nameEn,
    nameZh: factPack.programme.nameZh,
    name: factPack.programme.nameEn,
    university: '香港大學',
    faculty: factPack.programme.facultyZh,
    median: s.median,
    band_a: s.lq,
    uq: s.uq,
    category: factPack.programme.category,
  };
  payload.scores = { median: s.median, uq: s.uq, lq: s.lq };
  payload.details.code = factPack.code;
  payload.details.university = '香港大學';

  const walk = (obj) => {
    if (typeof obj === 'string') {
      let t = obj;
      for (const re of BLOCKLIST) t = t.replace(re, 'JUPAS 2025 admission scores');
      return t;
    }
    if (Array.isArray(obj)) return obj.map(walk);
    if (obj && typeof obj === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(obj)) out[k] = walk(v);
      return out;
    }
    return obj;
  };
  payload.details = walk(payload.details);
  return payload;
}

function buildPrompt(factPack) {
  const j = factPack.jupas;
  const s = factPack.scores;
  const bandPct =
    j.stats2025?.bandA && j.offers2025?.bandA
      ? ((j.offers2025.bandA / j.stats2025.bandA) * 100).toFixed(1)
      : null;

  return `You are writing Dream Subjects programme copy for HKU JUPAS code ${factPack.code}.
QUALITY BAR: Match depth and structure of JS6717 (Bachelor of Social Sciences) — rich bullets with **Bold lead-in**: text.

STRICT RULES:
1. Use ONLY facts in the FACT PACK below. Do NOT invent alumni names, employers, salaries, rankings, or statistics.
2. If no verified alumni names in fact pack, alumni section: faculty network + "see official Alumni Spotlight" — NO fake names.
3. Never mention "af_2025_JUPAS.pdf" or internal file paths in user-facing text. Say "2025 admission scores" instead.
4. Scores MUST be exactly: formula="${s.formula}", median=${s.median}, lower quartile (LQ)=${s.lq}, upper quartile (UQ)=${s.uq}. In competitiveness use order: Median | LQ | UQ.
5. Chinese admission section MUST have separate bullets: **首年學額**, **修讀年期**, **首年學費** (not combined).
6. English admission: separate **First Year Intake**, **Duration**, **First Year Tuition** bullets.
7. Each bullet is one string in content[] starting with **Bold label**:
8. Minimum bullets: admission 8, curriculum 6, career 5, campus 4, competitiveness 6, alumni 4, scholarships 4, tips 6 (both EN and ZH).
9. competitiveness: Band A stats from 2025 if available${bandPct ? ` (~${bandPct}% Band A offer rate)` : ''}, star rating, no interview if fact pack says no.
10. tips: "Ace Sir" style — score targets from median/LQ/UQ, Band A essential if offers all Band A, backup HKU codes only if logically related.

FACT PACK:
${JSON.stringify(factPack, null, 2)}

Return JSON only:
{
  "details": {
    "en": { "sections": { "admission": { "title": "...", "content": ["..."] }, ... all 8 keys } },
    "zh": { "sections": { ... same 8 keys ... } }
  }
}
Section keys: admission, curriculum, career, campus, competitiveness, alumni, scholarships, tips.`;
}

async function generateDetails(factPack, attempt = 1) {
  const prompt = buildPrompt(factPack);
  const systemInstruction =
    'You output ONLY valid JSON. No markdown fences, no explanation, no chain-of-thought. Start with { and end with }.';

  let data;
  try {
    ({ data } = await GenerativeAIService.generateJson(prompt, {
      model: 'ace-it-flash',
      systemInstruction,
      generationConfig: { temperature: 0.15, maxOutputTokens: 8192 },
    }));
  } catch (e) {
    if (attempt < 2) {
      console.warn(`[${factPack.code}] JSON generation failed, retrying…`, e.message);
      return generateDetails(factPack, attempt + 1);
    }
    throw e;
  }

  if (!data?.details?.en?.sections || !data?.details?.zh?.sections) {
    if (attempt < 2) return generateDetails(factPack, attempt + 1);
    throw new Error('AI response missing details.en/zh.sections');
  }

  const payload = sanitizePayload({
    factPack,
    programme: {},
    details: data.details,
    scores: factPack.scores,
  });

  const bulletErrs = premiumBulletCheck(payload.details);
  if (bulletErrs.length && attempt < 2) {
    console.warn(`[${factPack.code}] Premium bullet check failed, retrying…`, bulletErrs);
    return generateDetails(factPack, attempt + 1);
  }
  if (bulletErrs.length) {
    console.warn(`[${factPack.code}] Warning: ${bulletErrs.join('; ')}`);
  }
  return payload;
}

function writePayloadAndSeed(payload) {
  const code = payload.factPack.code;
  const payloadPath = path.join(__dirname, `payload_${code}.json`);
  fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), 'utf8');

  const py = path.join(__dirname, 'write_premium_seed.py');
  const r = spawnSync('python', [py, payloadPath], {
    cwd: path.join(__dirname, '../..'),
    encoding: 'utf8',
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`write_premium_seed failed for ${code}`);
}

async function processCode(code) {
  if (SKIP.has(code)) {
    console.log(`[skip] ${code} — manually verified`);
    return true;
  }
  console.log(`\n=== ${code} premium rewrite ===`);
  const { factPack } = await buildFactPack(code);
  const payload = await generateDetails(factPack);
  writePayloadAndSeed(payload);
  console.log(`[ok] ${code}`);
  return true;
}

function resolveCodes(argv) {
  if (argv.includes('--all')) {
    return Object.values(BATCHES).flat();
  }
  const bi = argv.indexOf('--batch');
  if (bi >= 0) {
    const name = argv[bi + 1] || 'socsci';
    return BATCHES[name] || [];
  }
  return argv.filter((a) => /^JS\d{4}$/i.test(a)).map((a) => a.toUpperCase());
}

async function main() {
  const codes = resolveCodes(process.argv.slice(2));
  if (!codes.length) {
    console.error('Usage: node hku_premium_rewrite.js JS6731 | --batch socsci | --all');
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  for (const code of codes) {
    try {
      if (await processCode(code)) ok += 1;
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(`[fail] ${code}:`, e.message);
      fail += 1;
    }
  }
  console.log(`\nPremium rewrite done: ok=${ok}, fail=${fail}`);
  if (fail) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
