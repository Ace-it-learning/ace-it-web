/**
 * Extract official JUPAS facts for a programme code.
 * Usage: node backend/scripts/jupas/extractFacts.js JS6717
 *
 * Output: backend/scripts/jupas/facts/{code}.json
 * Sources: live JUPAS page + jupas_scores_2025.json (from af_2025_JUPAS.pdf).
 * Does NOT read legacy batch/Kimi seed files.
 */

const fs = require('fs');
const path = require('path');

const SCORES_PATH = path.join(__dirname, 'jupas_scores_2025.json');
const OUT_DIR = path.join(__dirname, 'facts');

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseJupasText(text) {
  const stats2025 = {};
  const appMatch = text.match(/2025\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (appMatch) {
    stats2025.applications = {
      bandA: Number(appMatch[1]),
      total: Number(appMatch[6]),
    };
  }
  const offerRows = [...text.matchAll(/\|\s*2025\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/g)];
  const offerMatch = offerRows.length ? offerRows[offerRows.length - 1] : null;
  if (offerMatch) {
    stats2025.offers = {
      bandA: Number(offerMatch[1]),
      bandB: Number(offerMatch[2]),
      bandC: Number(offerMatch[3]),
      bandD: Number(offerMatch[4]),
      bandE: Number(offerMatch[5]),
      total: Number(offerMatch[6]),
    };
  }

  const intakeMatch = text.match(/First Year Intake\s+(\d+)/i);
  const durationMatch = text.match(/Duration of Study\s+(\d+)\s*years?/i);
  const interviewMatch = text.match(/Interview Arrangements\s+(No|Yes)/i);

  return {
    statistics2025: Object.keys(stats2025).length ? stats2025 : undefined,
    programmeMeta: {
      intake: intakeMatch ? Number(intakeMatch[1]) : undefined,
      duration: durationMatch ? `${durationMatch[1]} years` : undefined,
      interview: interviewMatch ? interviewMatch[1].toLowerCase() === 'yes' : undefined,
    },
  };
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AceIt-JUPAS-FactExtractor/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function uniSlug(code) {
  if (code.startsWith('JS4')) return 'cuhk';
  if (code.startsWith('JS5')) return 'hkust';
  if (code.startsWith('JS1')) return 'cityu';
  return 'hku';
}

async function main() {
  const code = (process.argv[2] || '').toUpperCase();
  if (!/^JS\d{4}$/.test(code)) {
    console.error('Usage: node extractFacts.js JS6717');
    process.exit(1);
  }

  const scoresDb = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'));
  const scores = scoresDb.programmes[code];
  if (!scores) {
    console.warn(`[Warn] No PDF scores for ${code} — add to jupas_scores_2025.json from af_2025_JUPAS.pdf`);
  }

  const uni = uniSlug(code);
  const jupasUrl = `https://www.jupas.edu.hk/en/programme/${uni}/${code}`;
  const jupasHtml = await fetchText(jupasUrl);
  const parsed = parseJupasText(stripHtml(jupasHtml));

  const factPack = {
    code,
    extractedAt: new Date().toISOString().slice(0, 10),
    sources: [
      { id: 'jupas_pdf', label: 'JUPAS 2025 Admissions Scores PDF', url: 'backend/data/JUPAS/af_2025_JUPAS.pdf' },
      { id: 'jupas_en', label: 'JUPAS programme page', url: jupasUrl },
    ],
    programme: {
      code,
      university:
        uni === 'hku'
          ? '香港大學'
          : uni === 'cuhk'
            ? '香港中文大學'
            : uni === 'hkust'
              ? '香港科技大學'
              : uni === 'cityu'
                ? '香港城市大學'
                : '',
    },
    scores: scores
      ? { formula: scores.formula, median: scores.median, uq: scores.uq, lq: scores.lq }
      : null,
    ...parsed,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${code}.json`);
  fs.writeFileSync(outPath, JSON.stringify(factPack, null, 2), 'utf8');
  console.log(`[extractFacts] Wrote ${outPath}`);
}

main().catch((err) => {
  console.error('[extractFacts] Failed:', err.message);
  process.exit(1);
});
