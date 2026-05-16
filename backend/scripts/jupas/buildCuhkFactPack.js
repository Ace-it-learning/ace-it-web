/**
 * CUHK fact pack — official sources ONLY:
 * - JUPAS: https://www.jupas.edu.hk/en|tc/programme/cuhk/{code}
 * - CUHK Admissions: https://admission.cuhk.edu.hk/programme/{slug}/
 * - Fees: https://admission.cuhk.edu.hk/fees-financing-your-studies/
 *
 * NOT HKU URLs. NOT generic HKU buildFactPack.
 */

const fs = require('fs');
const path = require('path');
const { OUT: CATALOG_PATH } = require('./buildCuhkCatalog');
const { OUT: ADMISSION_MAP_PATH } = require('./buildCuhkAdmissionMap');

const FACTS_DIR = path.join(__dirname, 'facts');
const SCORES_PATH = path.join(__dirname, 'cuhk_jupas_scores_2025.json');
const JUPAS_UNI = 'cuhk';

let _cuhkScoresDb = null;
function loadCuhkScoresDb() {
  if (_cuhkScoresDb) return _cuhkScoresDb;
  if (!fs.existsSync(SCORES_PATH)) {
    throw new Error(
      `Missing ${SCORES_PATH} — run: python backend/scripts/jupas/extract_cuhk_pdf_scores.py`
    );
  }
  _cuhkScoresDb = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'));
  return _cuhkScoresDb;
}

function scoresFromPdfRow(row) {
  if (!row?.median && row?.median !== 0) {
    throw new Error(`No PDF scores for ${row?.code || '?'}`);
  }
  return {
    formula: row.formula || 'Best 5',
    median: row.median,
    uq: row.uq,
    lq: row.lq,
    percentiles: row.percentiles || {},
    subjectWeighting: row.subjectWeighting || null,
  };
}

const FACULTY_ZH = [
  [/medicine|nursing|pharmacy|chinese medicine|biomedical/i, '醫學院'],
  [/law/i, '法律學院'],
  [/engineering|computer science|information engineering/i, '工程學院'],
  [/business|accountancy|finance|hospitality|actuarial|administration/i, '商學院'],
  [/education/i, '教育學院'],
  [/social science|journalism|communication|economics|psychology|social work|geography|architecture|urban/i, '社會科學院'],
  [/science|mathematics|physics|chemistry|biology/i, '理學院'],
  [/arts|anthropology|history|chinese|english|music|philosophy|theology|translation/i, '文學院'],
];

function inferFacultyZh(nameEn) {
  for (const [re, zh] of FACULTY_ZH) {
    if (re.test(nameEn)) return zh;
  }
  return '香港中文大學';
}

function guessCategory(nameEn) {
  const n = nameEn.toLowerCase();
  if (/medicine|nursing|pharmacy|chinese medicine/.test(n)) return 'medicine';
  if (/law/.test(n)) return 'law';
  if (/engineering|computer|artificial intelligence/.test(n)) return 'engineering';
  if (/business|economics|finance|accounting|actuarial|hospitality/.test(n)) return 'business';
  if (/education/.test(n)) return 'education';
  if (/social|journalism|psychology|geography|architecture|urban/.test(n)) return 'social_science';
  if (/science|mathematics|physics|chemistry/.test(n) && !/social/.test(n)) return 'science';
  if (/arts|anthropology|history|chinese|english|music|philosophy/.test(n)) return 'arts';
  return 'general';
}

function cleanNameEn(name) {
  if (!name) return '';
  return name
    .replace(/\s+\d+(?:\.\d+)?\s*x\s+.*$/i, '')
    .replace(/\s+Eng\s*\+.*$/i, '')
    .replace(/\s+\/\s+.*$/, '')
    .replace(/["',]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchHtml(url) {
  const https = require('https');
  const { URL } = require('url');
  const u = new URL(url);
  const get = (rejectUnauthorized) =>
    new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          method: 'GET',
          headers: { 'User-Agent': 'AceIt-JUPAS-CUHK/1.0 (official sources only)' },
          rejectUnauthorized,
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            else resolve(data);
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  try {
    return await get(true);
  } catch (e) {
    if (/certificate|UNABLE_TO_VERIFY/i.test(String(e.message))) {
      return await get(false);
    }
    throw e;
  }
}

function parseJupasCuhkHtml(html, code) {
  const data = {
    code,
    jupasEnUrl: `https://www.jupas.edu.hk/en/programme/${JUPAS_UNI}/${code}`,
    jupasTcUrl: `https://www.jupas.edu.hk/tc/programme/${JUPAS_UNI}/${code}`,
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
    facultyPhone: '',
  };

  const cnSpan = html.match(/class="program_title_cn"[^>]*>([^<]+)</i);
  if (cnSpan) data.nameZh = cnSpan[1].replace(/\s+/g, ' ').trim();

  const enLabel = html.match(
    /<h1[^>]*class="program_title"[^>]*>[\s\S]*?class="before_label">([^<]+)</i
  );
  if (enLabel) data.nameEn = cleanNameEn(enLabel[1]);

  const titleM = html.match(
    new RegExp(
      `${code}[\\s\\S]{0,800}?(Bachelor[^<]{5,120}?)\\s+([\\u4e00-\\u9fff（）·\\s]{4,40})`,
      'i'
    )
  );
  if (titleM) {
    data.nameEn = cleanNameEn(titleM[1].replace(/<[^>]+>/g, ' '));
    if (!data.nameZh) data.nameZh = titleM[2].replace(/\s+/g, ' ').trim();
  }

  if (!data.nameEn || /JUPAS|Programmes Offered/i.test(data.nameEn)) {
    const t = html.match(/<title>([^<]+)<\/title>/i);
    if (t) data.nameEn = cleanNameEn(t[1].split(' - ')[0]);
  }

  const descM = html.match(
    /Short Description[\s\S]{0,400}?((?:Anthropology|The |This |Students|A |An |Our )[\s\S]{80,2000}?)(?=Remarks|Programme Website|Requirements)/i
  );
  if (descM) data.shortDescription = htmlToText(descM[1]).slice(0, 2000);

  const site = html.match(/Programme Website[\s\S]*?href="(https?:\/\/[^"]+)"/i);
  if (site) data.programmeWebsite = site[1];

  const admLink = html.match(/href="(https:\/\/admission\.cuhk\.edu\.hk\/programme\/[a-z0-9%-]+)\/?"/i);
  if (admLink) data.cuhkAdmissionUrl = admLink[1].replace(/\/$/, '') + '/';

  const reqBlock = html.match(/Programme Entrance Requirements[\s\S]{0,12000}?Calculation of scores/i);
  if (reqBlock) data.requirementsNote = htmlToText(reqBlock[0]).slice(0, 2500);

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

  const tuition = html.match(/First Year Tuition Fee[\s\S]{0,40}?HK\$\s*([\d,]+)/i);
  if (tuition) data.tuition = `HK$${tuition[1].replace(/,/g, '')}`;

  const contacts = html.match(/Contacts[\s\S]{0,800}?((?:852\s*)?[\d\s/]+)/i);
  if (contacts) data.facultyPhone = contacts[1].replace(/\s+/g, ' ').trim().slice(0, 80);

  return data;
}

function parseJupasTcName(html) {
  const cnSpan = html.match(/class="program_title_cn"[^>]*>([^<]+)</i);
  if (cnSpan) {
    const t = cnSpan[1].replace(/\s+/g, ' ').trim();
    if (/[\u4e00-\u9fff]/.test(t)) return t;
  }
  return '';
}

function parseCuhkAdmissionPage(html) {
  const text = htmlToText(html);
  const sections = {
    introduction: '',
    ranking: '',
    careerProspects: '',
    craftYourPath: '',
    moreInfo: '',
    faqHints: '',
  };

  const introM = html.match(/Programme Introduction[\s\S]{0,200}?([\s\S]{200,4000}?)(?=Ranking|Craft Your Path|Career Prospects|More Information|$)/i);
  if (introM) sections.introduction = htmlToText(introM[1]).slice(0, 3500);

  const rankM = html.match(/Ranking[\s\S]{0,100}?([\s\S]{50,800}?)(?=Craft|Career|More Information|$)/i);
  if (rankM) sections.ranking = htmlToText(rankM[1]).slice(0, 800);

  const careerM = html.match(/Career Prospects[\s\S]{0,100}?([\s\S]{200,5000}?)(?=More Information|Department|TOP|$)/i);
  if (careerM) sections.careerProspects = htmlToText(careerM[1]).slice(0, 4000);

  const craftM = html.match(/Craft Your Path[\s\S]{0,100}?([\s\S]{50,1500}?)(?=Career|More Information|$)/i);
  if (craftM) sections.craftYourPath = htmlToText(craftM[1]).slice(0, 1500);

  if (text.length > 500 && !sections.introduction) {
    sections.introduction = text.slice(0, 3500);
  }

  return sections;
}

function loadPdfScoresRow(code) {
  const row = loadCuhkScoresDb().programmes?.[code];
  if (row) return scoresFromPdfRow({ ...row, code });
  return null;
}

function loadCatalogue() {
  if (!fs.existsSync(CATALOG_PATH)) {
    require('./buildCuhkCatalog').build();
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8')).programmes;
}

function loadAdmissionMap() {
  if (!fs.existsSync(ADMISSION_MAP_PATH)) {
    require('./buildCuhkAdmissionMap').build();
  }
  return JSON.parse(fs.readFileSync(ADMISSION_MAP_PATH, 'utf8')).programmes;
}

async function fetchCuhkFeesSnippet() {
  try {
    const html = await fetchHtmlPy('https://admission.cuhk.edu.hk/fees-financing-your-studies/');
    return htmlToText(html).slice(0, 4000);
  } catch {
    return '';
  }
}

async function fetchHtmlPy(url) {
  const { spawnSync } = require('child_process');
  const py = path.join(__dirname, 'fetch_url.py');
  const r = spawnSync('python', [py, url], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.status === 0 && r.stdout) return r.stdout;
  return fetchHtml(url);
}

async function buildCuhkFactPack(code) {
  const catalogue = loadCatalogue();
  const cat = catalogue[code];
  if (!cat) throw new Error(`No catalogue entry for ${code} in cuhk_programmes_catalog.json`);

  const jupasEn = await fetchHtmlPy(`https://www.jupas.edu.hk/en/programme/${JUPAS_UNI}/${code}`);
  const jupasTc = await fetchHtmlPy(`https://www.jupas.edu.hk/tc/programme/${JUPAS_UNI}/${code}`);
  const jupas = parseJupasCuhkHtml(jupasEn, code);

  let nameZh = parseJupasTcName(jupasTc) || jupas.nameZh;
  let nameEn = cleanNameEn(cat.nameEn || jupas.nameEn) || code;
  if (/Programmes Offered/i.test(nameEn)) nameEn = cleanNameEn(jupas.nameEn) || nameEn;
  if (!nameZh || !/[\u4e00-\u9fff]/.test(nameZh)) nameZh = cat.nameZh || nameEn;

  let admissionMap = {};
  try {
    admissionMap = loadAdmissionMap();
  } catch {
    admissionMap = {};
  }
  const admissionUrl = admissionMap[code] || jupas.cuhkAdmissionUrl;
  let cuhkAdmission = {};
  if (admissionUrl) {
    try {
      const admHtml = await fetchHtmlPy(admissionUrl);
      cuhkAdmission = {
        url: admissionUrl,
        ...parseCuhkAdmissionPage(admHtml),
      };
    } catch (e) {
      cuhkAdmission = { url: admissionUrl, fetchError: e.message };
    }
  }

  let scores = loadPdfScoresRow(code);
  let scoresSource = 'af_2025_JUPAS.pdf';
  if (!scores) {
    const med = Number(cat.median);
    const lq = Number(cat.lq ?? cat.band_a);
    const uq = Number(cat.uq);
    if (!Number.isFinite(med)) {
      throw new Error(
        `No PDF scores for ${code} and no catalogue median — check af_2025_JUPAS.pdf or cuhk_programmes_catalog.json`
      );
    }
    scores = {
      formula: cat.formula || 'Best 5',
      median: med,
      lq: Number.isFinite(lq) ? lq : Math.max(med - 2, 1),
      uq: Number.isFinite(uq) ? uq : med + 2,
      percentiles: {},
      subjectWeighting: null,
      scoresFallback: true,
    };
    scoresSource = 'cuhk_programmes_catalog.json (programme not in af_2025_JUPAS.pdf CUHK tables)';
  }
  const feesSnippet = await fetchCuhkFeesSnippet();

  const factPack = {
    code,
    extractedAt: new Date().toISOString().slice(0, 10),
    sources: [
      { id: 'jupas_en', label: 'JUPAS programme (EN)', url: jupas.jupasEnUrl },
      { id: 'jupas_tc', label: 'JUPAS programme (TC)', url: jupas.jupasTcUrl },
      {
        id: 'jupas_scores',
        label: 'JUPAS 2025 admission scores (CUHK)',
        note: scoresSource,
      },
    ],
    programme: {
      code,
      nameEn,
      nameZh,
      university: '香港中文大學',
      facultyZh: cat.faculty || inferFacultyZh(nameEn),
      category: cat.category || guessCategory(nameEn),
    },
    scores,
    jupas,
    cuhkAdmission,
    cuhkFeesAndScholarshipsUrl: 'https://admission.cuhk.edu.hk/fees-financing-your-studies/',
    feesSnippet: feesSnippet || undefined,
  };

  if (admissionUrl) {
    factPack.sources.push({ id: 'cuhk_admissions', label: 'CUHK Undergraduate Admissions programme page', url: admissionUrl });
  }
  if (jupas.programmeWebsite && jupas.programmeWebsite.includes('cuhk')) {
    factPack.sources.push({ id: 'jupas_programme_website', label: 'Programme website (from JUPAS)', url: jupas.programmeWebsite });
  }

  fs.mkdirSync(FACTS_DIR, { recursive: true });
  const outPath = path.join(FACTS_DIR, `${code}.json`);
  fs.writeFileSync(outPath, JSON.stringify(factPack, null, 2), 'utf8');
  return { factPack, outPath };
}

module.exports = {
  buildCuhkFactPack,
  parseJupasCuhkHtml,
  parseCuhkAdmissionPage,
  inferFacultyZh,
  guessCategory,
};
