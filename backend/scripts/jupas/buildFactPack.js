/**
 * Build official fact pack for HKU JUPAS programmes (JUPAS page + scores JSON).
 * Used by hku_premium_rewrite.js — no Kimi / template seeds.
 */

const fs = require('fs');
const path = require('path');

const SCORES_PATH = path.join(__dirname, 'jupas_scores_2025.json');
const FACTS_DIR = path.join(__dirname, 'facts');

const FACULTY_ZH_RULES = [
  [/social work|social science|psychology|journalism|government and laws/i, '社會科學學院'],
  [/chinese medicine/i, '醫學院'],
  [/medicine|nursing|pharmacy|biomedical/i, '李嘉誠醫學院'],
  [/law/i, '法律學院'],
  [/engineering|computer science|civil|mechanical|electrical/i, '工程學院'],
  [/business|economics|finance|accounting/i, '經管學院'],
  [/education/i, '教育學院'],
  [/dental/i, '牙醫學院'],
  [/architect|surveying|landscape|urban studies|design\+/i, '建築學院'],
  [/bachelor of science|quantitative finance|actuarial/i, '理學院'],
  [/bachelor of arts/i, '文學院'],
];

function inferFacultyZh(nameEn) {
  for (const [re, zh] of FACULTY_ZH_RULES) {
    if (re.test(nameEn)) return zh;
  }
  return '香港大學';
}

function guessCategory(nameEn) {
  const n = nameEn.toLowerCase();
  if (/medicine|nursing|pharmacy|dental|chinese medicine/.test(n)) return 'medicine';
  if (/law/.test(n)) return 'law';
  if (/engineering|computer/.test(n)) return 'engineering';
  if (/business|economics|finance|accounting/.test(n)) return 'business';
  if (/social work|social science|psychology|journalism/.test(n)) return 'social_science';
  if (/education/.test(n)) return 'education';
  if (/architect|surveying|landscape|urban|design/.test(n)) return 'design';
  if (/science/.test(n) && !/social/.test(n)) return 'science';
  if (/arts/.test(n)) return 'arts';
  return 'general';
}

function cleanNameEn(name) {
  if (!name) return '';
  return name
    .replace(/\s+\d+(?:\.\d+)?\s*x\s+.*$/i, '')
    .replace(/\s+Eng\s*\+.*$/i, '')
    .replace(/\s+Math\s*\+.*$/i, '')
    .replace(/\s+\/\s+.*$/, '')
    .replace(/["',]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseJupasHtml(html, code) {
  const data = {
    code,
    jupasUrl: `https://www.jupas.edu.hk/en/programme/hku/${code}`,
    nameEn: '',
    nameZh: '',
    shortDescription: '',
    programmeWebsite: '',
    tuition: 'HK$47,000',
    intake: null,
    duration: '4 years',
    interview: null,
    requirementsNote: '',
    stats2025: {},
    offers2025: {},
  };

  const titleM = html.match(
    new RegExp(`${code}[\\s\\S]{0,800}?(Bachelor[^<]{5,120}?)\\s+([\\u4e00-\\u9fff（）·\\s]{4,40})`, 'i')
  );
  if (titleM) {
    data.nameEn = cleanNameEn(titleM[1].replace(/<[^>]+>/g, ' '));
    data.nameZh = titleM[2].replace(/\s+/g, ' ').trim();
  }
  if (!data.nameEn || /JUPAS|Programmes Offered/i.test(data.nameEn)) {
    const t = html.match(/<title>([^<]+)<\/title>/i);
    if (t) data.nameEn = cleanNameEn(t[1].split(' - ')[0]);
  }

  const descM = html.match(
    /Short Description[\s\S]{0,400}?((?:This|The|Students|A |An )[\s\S]{80,1500}?)(?=Remarks|Programme Website|Requirements)/i
  );
  if (descM) {
    data.shortDescription = descM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500);
  }

  const site = html.match(/Programme Website[\s\S]*?href="(https?:\/\/[^"]+)"/i);
  if (site) data.programmeWebsite = site[1];

  const reqBlock = html.match(/Programme Entrance Requirements[\s\S]{0,8000}?General Entrance Requirements/i);
  if (reqBlock) {
    data.requirementsNote = reqBlock[0]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000);
  }

  const intake = html.match(/First Year Intake[\s\S]{0,60}?(\d+)/i);
  if (intake) data.intake = Number(intake[1]);
  const dur = html.match(/Duration of Study[\s\S]{0,40}?(\d+)\s*years?/i);
  if (dur) data.duration = `${dur[1]} years`;
  const iv = html.match(/Interview Arrangements[\s\S]{0,80}?(No|Yes)/i);
  if (iv) data.interview = /^yes/i.test(iv[1].trim());

  const rows2025 = [
    ...html.matchAll(
      /<tr>\s*<td>2025<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<\/tr>/gi
    ),
  ];
  if (rows2025[0]) {
    const a = rows2025[0];
    data.stats2025 = {
      bandA: Number(a[1]),
      bandB: Number(a[2]),
      bandC: Number(a[3]),
      bandD: Number(a[4]),
      bandE: Number(a[5]),
      total: Number(a[6]),
    };
  }
  if (rows2025[1]) {
    const o = rows2025[1];
    data.offers2025 = {
      bandA: Number(o[1]),
      bandB: Number(o[2]),
      bandC: Number(o[3]),
      bandD: Number(o[4]),
      bandE: Number(o[5]),
      total: Number(o[6]),
    };
  }

  const tuition = html.match(/First Year Tuition Fee\s*HK\$\s*([\d,]+)/i);
  if (tuition) data.tuition = `HK$${tuition[1].replace(/,/g, '')}`;

  const contacts = html.match(/Contacts[\s\S]{0,1200}?(\+852\s*[\d\s]+)/i);
  if (contacts) data.facultyPhone = contacts[1].replace(/\s+/g, ' ').trim();

  return data;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AceIt-JUPAS-Premium/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseJupasTcName(html, code) {
  if (!html) return '';
  const cnSpan = html.match(/class="program_title_cn"[^>]*>([^<]+)</i);
  if (cnSpan) {
    const t = cnSpan[1].replace(/\s+/g, ' ').trim();
    if (/[\u4e00-\u9fff]/.test(t)) return t;
  }
  const legacy = html.match(
    new RegExp(`${code}[\\s\\S]{0,900}?Bachelor[^<]{5,160}?\\s+([\\u4e00-\\u9fff（）·\\s()&＋+]+)`, 'i')
  );
  if (legacy) return legacy[1].replace(/\s+/g, ' ').trim();
  const og = html.match(/property="og:title"\s+content="([^"]+)"/i);
  if (og && /[\u4e00-\u9fff]/.test(og[1])) {
    const part = og[1].split(/[-|–]/).map((s) => s.trim()).find((s) => /[\u4e00-\u9fff]/.test(s));
    if (part) return part;
  }
  return '';
}

async function fetchJupasTcName(code) {
  try {
    const html = await fetchHtml(`https://www.jupas.edu.hk/tc/programme/hku/${code}`);
    return parseJupasTcName(html, code);
  } catch {
    return '';
  }
}

async function fetchAdmissionsSnippet(url) {
  if (!url || !url.includes('hku')) return '';
  try {
    const html = await fetchHtml(url);
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);
  } catch {
    return '';
  }
}

async function buildFactPack(code) {
  const scoresDb = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'));
  const scoresRow = scoresDb.programmes[code];
  if (!scoresRow) throw new Error(`No scores for ${code} in jupas_scores_2025.json`);

  const html = await fetchHtml(`https://www.jupas.edu.hk/en/programme/hku/${code}`);
  const jupas = parseJupasHtml(html, code);

  const nameEn = cleanNameEn(scoresRow.nameEn || jupas.nameEn) || code;
  let nameZh = /[\u4e00-\u9fff]/.test(jupas.nameZh || '') ? jupas.nameZh : '';
  if (!nameZh) nameZh = await fetchJupasTcName(code);
  if (!nameZh) nameZh = nameEn;
  const facultyZh = inferFacultyZh(nameEn);

  let admissionsSnippet = '';
  if (jupas.programmeWebsite) {
    admissionsSnippet = await fetchAdmissionsSnippet(jupas.programmeWebsite);
  }

  const factPack = {
    code,
    extractedAt: new Date().toISOString().slice(0, 10),
    sources: [
      { id: 'jupas_en', label: 'JUPAS programme page', url: jupas.jupasUrl },
      { id: 'jupas_scores', label: 'JUPAS 2025 admission scores', note: 'median/uq/lq from official PDF extract' },
    ],
    programme: {
      code,
      nameEn,
      nameZh,
      university: '香港大學',
      facultyZh,
      category: guessCategory(nameEn),
    },
    scores: {
      formula: scoresRow.formula,
      median: scoresRow.median,
      uq: scoresRow.uq,
      lq: scoresRow.lq,
    },
    jupas,
    admissionsSnippet: admissionsSnippet || undefined,
  };

  if (jupas.programmeWebsite) {
    factPack.sources.push({
      id: 'hku_admissions',
      label: 'HKU programme page',
      url: jupas.programmeWebsite,
    });
  }

  fs.mkdirSync(FACTS_DIR, { recursive: true });
  const outPath = path.join(FACTS_DIR, `${code}.json`);
  fs.writeFileSync(outPath, JSON.stringify(factPack, null, 2), 'utf8');
  return { factPack, outPath };
}

module.exports = {
  buildFactPack,
  inferFacultyZh,
  guessCategory,
  fetchJupasTcName,
  parseJupasTcName,
};
