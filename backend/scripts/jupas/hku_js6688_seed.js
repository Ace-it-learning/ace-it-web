/**
 * HKU programme seeds — JS6688 depth (Deepseek + official fact pack).
 *
 * Usage:
 *   node backend/scripts/jupas/hku_js6688_seed.js JS6822
 *   node backend/scripts/jupas/hku_js6688_seed.js --batch business
 *   node backend/scripts/jupas/hku_js6688_seed.js --all
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { buildFactPack } = require('./buildFactPack');
const GenerativeAIService = require('../../services/GenerativeAIService');

/** User-confirmed completed — do not rewrite */
const SKIP = new Set([
  'JS6456',
  'JS6468',
  'JS6482',
  'JS6494',
  'JS6602',
  'JS6626',
  'JS6688',
  'JS6705',
  'JS6717',
  'JS6810',
  'JS6731', // hand golden (JS6717 bar), keep unless user asks to upgrade
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
  admission: 12,
  curriculum: 10,
  career: 8,
  campus: 6,
  competitiveness: 8,
  alumni: 6,
  scholarships: 5,
  tips: 18,
};

const BLOCKLIST = [/af_2025_JUPAS\.pdf/i, /before_label/i, /OpenAI/i, /DeepMind/i];

function depthCheck(details) {
  const errs = [];
  for (const lang of ['en', 'zh']) {
    const sections = details?.[lang]?.sections || {};
    for (const [key, min] of Object.entries(MIN_BULLETS)) {
      const n = sections[key]?.content?.length || 0;
      if (n < min) errs.push(`${lang}.${key}: ${n} lines (need ${min})`);
    }
    const tips = sections.tips?.content || [];
    const numbered = tips.filter((s) => /^\*\*\d+\./.test(String(s).trim())).length;
    if (numbered < 7) errs.push(`${lang}.tips: only ${numbered} numbered tips (need 7+)`);
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
      t = t.replace(/an\s+class="before_label">\s*Short Description\s*/gi, '');
      return t.trim();
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

  return `You are writing Dream Subjects programme copy for HKU JUPAS ${factPack.code}.

QUALITY BAR: Match depth and structure of JS6688 Science Master Class (hand-verified gold standard):
- Many strings per section in content[]; use "" for blank lines between blocks
- admission: line-by-line DSE (cores, electives, weighting, formula, interview, 2025 stats, Median | LQ | UQ)
- curriculum: programme overview, year/structure breakdown, unique features
- career: grouped pathways with sub-bullets
- competitiveness: competition level, Band A stats, factors (numbered where helpful)
- alumni: faculty excellence, rankings, labs — name alumni ONLY if in FACT PACK
- tips: "**Ace Sir's … Strategy — 9 Actionable Tips:**" then tips "**1. Title**", blank "", detail lines, "- " sub-bullets (like JS6688 SMC tips)

STRICT RULES:
1. Use ONLY facts in FACT PACK. No invented alumni, employers, salaries, or rankings.
2. Never mention af_2025_JUPAS.pdf or internal paths. Say "2025 admission scores".
3. Scores: formula="${s.formula}", median=${s.median}, LQ=${s.lq}, UQ=${s.uq}. Text order: Median | LQ | UQ. programme.median=${s.median}, band_a=${s.lq}, uq=${s.uq}.
4. nameZh MUST be factPack.programme.nameZh (from JUPAS TC).
5. ZH admission: separate **首年學額**, **修讀年期**, **首年學費** bullets.
6. EN admission: separate **First Year Intake**, **Duration**, **First Year Tuition** bullets.
7. Minimum content[] lines: admission 12, curriculum 10, career 8, campus 6, competitiveness 8, alumni 6, scholarships 5, tips 18 (both EN and ZH).
8. tips: exactly 9 numbered tips with sub-bullets; programme-specific (odds, subjects, interview, OEA, backups with reasons).
9. competitiveness Band A${bandPct ? ` (~${bandPct}% Band A offer rate from 2025 stats)` : ''}.
10. Clean text — no HTML fragments in 課程概覽.

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
    'Output ONLY valid JSON. No markdown fences. No chain-of-thought. Match JS6688 depth — especially tips with 9 numbered sections and sub-bullets.';

  let data;
  try {
    ({ data } = await GenerativeAIService.generateJson(prompt, {
      model: 'ace-it-flash',
      systemInstruction,
      generationConfig: { temperature: 0.2, maxOutputTokens: 16384 },
    }));
  } catch (e) {
    if (attempt < 2) {
      console.warn(`[${factPack.code}] JSON failed, retry…`, e.message);
      await new Promise((r) => setTimeout(r, 2000));
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

  const errs = depthCheck(payload.details);
  if (errs.length && attempt < 2) {
    console.warn(`[${factPack.code}] Depth check failed, retry…`, errs.join('; '));
    await new Promise((r) => setTimeout(r, 2000));
    return generateDetails(factPack, attempt + 1);
  }
  if (errs.length) console.warn(`[${factPack.code}] Warning: ${errs.join('; ')}`);
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
    console.log(`[skip] ${code} — completed / hand golden`);
    return true;
  }
  console.log(`\n=== ${code} JS6688-depth (Deepseek ace-it-flash) ===`);
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
    console.error('Usage: node hku_js6688_seed.js JS6822 | --batch socsci | --all');
    process.exit(1);
  }

  const toRun = codes.filter((c) => !SKIP.has(c));
  console.log(`JS6688-depth run: ${toRun.length} programmes (${codes.length - toRun.length} skipped)`);

  let ok = 0;
  let fail = 0;
  for (const code of codes) {
    try {
      if (await processCode(code)) ok += 1;
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      console.error(`[fail] ${code}:`, e.message);
      fail += 1;
    }
  }
  console.log(`\nJS6688-depth seed done: ok=${ok}, fail=${fail}`);
  if (fail) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
