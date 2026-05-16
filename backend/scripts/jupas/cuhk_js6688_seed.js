/**
 * CUHK programme seeds — JS6688 depth (Deepseek + official fact pack).
 *
 * Sources (mandatory):
 * - JUPAS CUHK: https://www.jupas.edu.hk/en|tc/programme/cuhk/{code}
 * - CUHK Admissions: https://admission.cuhk.edu.hk/programme/{slug}/
 * - CUHK fees/scholarships: https://admission.cuhk.edu.hk/fees-financing-your-studies/
 *
 * Usage:
 *   node backend/scripts/jupas/cuhk_js6688_seed.js JS4006
 *   node backend/scripts/jupas/cuhk_js6688_seed.js --all
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { buildCuhkFactPack } = require('./buildCuhkFactPack');
const { build: buildCatalog } = require('./buildCuhkCatalog');
const { build: buildAdmissionMap } = require('./buildCuhkAdmissionMap');
const GenerativeAIService = require('../../services/GenerativeAIService');

const CATALOG_PATH = path.join(__dirname, 'cuhk_programmes_catalog.json');

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

const BLOCKLIST = [/af_2025_JUPAS\.pdf/i, /before_label/i, /hku\.hk/i, /admissions\.hku\.hk/i];

function loadAllCodes() {
  if (!fs.existsSync(CATALOG_PATH)) buildCatalog();
  const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  return Object.keys(cat.programmes).sort();
}

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
    university: '香港中文大學',
    faculty: factPack.programme.facultyZh,
    median: s.median,
    band_a: s.lq,
    uq: s.uq,
    category: factPack.programme.category,
  };
  payload.scores = {
    median: s.median,
    uq: s.uq,
    lq: s.lq,
    formula: s.formula,
    percentiles: s.percentiles,
  };
  payload.details.code = factPack.code;
  payload.details.university = '香港中文大學';

  const walk = (obj) => {
    if (typeof obj === 'string') {
      let t = obj;
      for (const re of BLOCKLIST) t = t.replace(re, '');
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

function buildAlumniResearchPrompt(factPack) {
  return `You are researching notable alumni for CUHK JUPAS programme ${factPack.code}.

PROGRAMME: ${factPack.programme.nameEn} (${factPack.programme.nameZh})
FACULTY: ${factPack.programme.facultyZh}

RESEARCH METHOD (mandatory — simulate careful Google Search):
1. Search: "CUHK ${factPack.programme.nameEn} notable alumni"
2. Search: "香港中文大學 ${factPack.programme.nameZh} 著名校友"
3. Search: "CUHK ${factPack.programme.nameEn} graduates" + Hong Kong careers
4. Check CUHK department pages and Wikipedia only if clearly tied to THIS programme/department.

RULES:
- Return 5-6 alumni ONLY if you are highly confident they studied this programme or department at CUHK.
- Each entry: nameEn, nameZh (if known), brief achievement, sourceHint (e.g. "CUHK dept page", "public bio").
- If you cannot find 5 verified names, return fewer and add "facultyExcellence" bullets instead — do NOT invent names.
- No fictional people. No generic "successful graduates" without names.

Return JSON only:
{
  "alumniResearch": [
    { "nameEn": "...", "nameZh": "...", "achievement": "...", "sourceHint": "..." }
  ],
  "facultyExcellence": ["optional bullets if few alumni found"],
  "searchQueriesUsed": ["query1", "query2"]
}`;
}

async function researchAlumni(factPack) {
  try {
    const { data } = await GenerativeAIService.generateJson(buildAlumniResearchPrompt(factPack), {
      model: 'ace-it-flash',
      systemInstruction: 'Output ONLY valid JSON. Use Google-search-style verification; no invented alumni.',
      generationConfig: { temperature: 0.15, maxOutputTokens: 4096 },
    });
    return data || {};
  } catch (e) {
    console.warn(`[${factPack.code}] alumni research failed:`, e.message);
    return { alumniResearch: [], facultyExcellence: [] };
  }
}

function buildPrompt(factPack, alumniResearch) {
  const j = factPack.jupas;
  const c = factPack.cuhkAdmission || {};
  const s = factPack.scores;
  const bandPct =
    j.stats2025?.bandA && j.offers2025?.bandA
      ? ((j.offers2025.bandA / j.stats2025.bandA) * 100).toFixed(1)
      : null;
  const bandARatio =
    j.stats2025?.bandA && j.offers2025?.bandA
      ? (j.stats2025.bandA / j.offers2025.bandA).toFixed(1)
      : null;

  return `You are writing Dream Subjects programme copy for CUHK JUPAS ${factPack.code}.

QUALITY BAR: Match depth and structure of HKU JS6688 (many content[] strings, "" blank lines, 9 Ace Sir tips with sub-bullets).

OFFICIAL SOURCES ONLY — use FACT PACK (JUPAS CUHK + admission.cuhk.edu.hk). NEVER use HKU websites or HKU JUPAS paths.

SECTION RULES:
1. admission (§1): From JUPAS ONLY — DSE cores/electives exactly as stated, First Year Intake ${j.intake ?? 'see JUPAS'}, Duration ${j.duration}, Tuition ${j.tuition}, Interview: ${j.interview === false ? 'No (JUPAS states No)' : j.interview === true ? 'Yes' : 'see JUPAS'}, 2025 application stats (Band A apps ${j.stats2025?.bandA}, offers ${j.offers2025?.bandA}, total apps ${j.stats2025?.total}). **2025 JUPAS scores (PDF, exact)**: Median ${s.median} | LQ ${s.lq} | UQ ${s.uq} (${s.formula || 'Best 5'}). EN lines: "Median: ${s.median}", "Lower quartile (LQ): ${s.lq}", "Upper quartile (UQ): ${s.uq}". ZH lines: "中位數：${s.median}", "下四分位數：${s.lq}", "上四分位數：${s.uq}". **Median admit subject profile (M row, copy verbatim from factPack.scores.percentiles.M)**: Chinese/中國語文, English/英國語文, Mathematics/數學, CSD/公民科, 1st–3rd electives/選修 — use grades in percentiles.M only. Separate 首年學額/修讀年期/首年學費 in ZH.
2. curriculum (§2): From cuhkAdmission.introduction + JUPAS shortDescription — NO invented year streams (e.g. do not invent "Museum Studies stream" unless in fact pack).
3. career (§3): From cuhkAdmission.careerProspects + JUPAS shortDescription career hints.
4. campus (§4): CUHK campus life — colleges, Shatin campus; only name exchanges/internships if in fact pack.
5. competitiveness (§5): Use REAL 2025 stats; Band A offer rate ~${bandPct ?? '?'}%; Band A apps per offer ~${bandARatio ?? 'calculate from stats'}. Do NOT claim interview if JUPAS says No.
6. alumni (§6): Use ALUMNI RESEARCH below for named alumni (5-6 if provided). Otherwise faculty excellence + department strengths from cuhkAdmission. Do NOT copy HKU-style generic alumni only.
7. scholarships (§7): From feesSnippet + CUHK admissions (entrance scholarships, TSFS, NLSPS). Link conceptually to admission.cuhk.edu.hk/fees-financing-your-studies/
8. tips (§8): "**Ace Sir's … Strategy — 9 Actionable Tips:**" then exactly 9 tips as "**1. Title**", blank "", detail lines, "- " sub-bullets (JS6688 format). Band A strategy, score targets from median/LQ ${s.median}/${s.lq}, interview prep ONLY if interview required.
${factPack.scores?.scoresFallback ? '\nNOTE: scoresFallback=true — programme NOT in af_2025_JUPAS.pdf; use median/LQ/UQ from fact pack only; do NOT invent median subject-grade rows.' : ''}

ALUMNI RESEARCH (Google-search guided):
${JSON.stringify(alumniResearch, null, 2)}

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
  const alumniResearch = await researchAlumni(factPack);
  const prompt = buildPrompt(factPack, alumniResearch);

  let data;
  try {
    ({ data } = await GenerativeAIService.generateJson(prompt, {
      model: 'ace-it-flash',
      systemInstruction:
        'Output ONLY valid JSON. CUHK sources only (jupas.edu.hk/cuhk, admission.cuhk.edu.hk). JS6688 depth — especially tips: 9 numbered **N. Title** with sub-bullets. No HKU content.',
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
    throw new Error('Missing details.en/zh.sections');
  }

  const payload = sanitizePayload({
    factPack,
    programme: {},
    details: data.details,
    scores: factPack.scores,
    alumniResearch,
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

  const py = path.join(__dirname, 'write_cuhk_premium_seed.py');
  const r = spawnSync('python', [py, payloadPath], {
    cwd: path.join(__dirname, '../..'),
    encoding: 'utf8',
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`write_cuhk_premium_seed failed for ${code}`);
}

async function processCode(code) {
  console.log(`\n=== ${code} CUHK JS6688-depth (JUPAS + admission.cuhk.edu.hk) ===`);
  if (!fs.existsSync(path.join(__dirname, 'cuhk_admission_urls.json'))) {
    await buildAdmissionMap();
  }
  const { factPack } = await buildCuhkFactPack(code);
  const payload = await generateDetails(factPack);
  writePayloadAndSeed(payload);
  console.log(`[ok] ${code}`);
  return true;
}

async function main() {
  const argv = process.argv.slice(2);
  const codes = argv.includes('--all') ? loadAllCodes() : argv.filter((a) => /^JS4\d{3}$/i.test(a)).map((a) => a.toUpperCase());

  if (!codes.length) {
    console.error('Usage: node cuhk_js6688_seed.js JS4006 | --all');
    process.exit(1);
  }

  buildCatalog();
  console.log(`CUHK JS6688-depth: ${codes.length} programme(s)`);

  let ok = 0;
  let fail = 0;
  for (const code of codes) {
    try {
      await processCode(code);
      ok += 1;
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      console.error(`[fail] ${code}:`, e.message);
      fail += 1;
    }
  }

  const CacheService = require('../../services/CacheService');
  if (ok) CacheService.setDbCache('jupas_programmes_all', null, 0);

  console.log(`\nCUHK JS6688-depth done: ok=${ok}, fail=${fail}`);
  if (fail) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
