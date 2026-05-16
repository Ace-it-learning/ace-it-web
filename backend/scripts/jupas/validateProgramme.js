/**
 * Validate programme + detail docs before Cosmos upsert.
 * Usage: node backend/scripts/jupas/validateProgramme.js path/to/payload.json
 */

const fs = require('fs');
const path = require('path');

const SECTION_KEYS = [
  'admission',
  'curriculum',
  'career',
  'campus',
  'competitiveness',
  'alumni',
  'scholarships',
  'tips',
];

const BLOCKLIST = [/OpenAI/i, /DeepMind/i, /Meta AI/i];

function validate(payload) {
  const errors = [];
  const { programme, details, scores } = payload;

  if (!programme?.code) errors.push('Missing programme.code');
  if (programme?.median == null) errors.push('Missing programme.median');
  if (programme?.band_a == null) errors.push('Missing programme.band_a (LQ)');

  if (scores) {
    if (programme.median !== scores.median) {
      errors.push(`median mismatch: programme ${programme.median} vs facts ${scores.median}`);
    }
    if (programme.band_a !== scores.lq) {
      errors.push(`LQ/band_a mismatch: programme ${programme.band_a} vs facts LQ ${scores.lq}`);
    }
    if (programme.uq != null && programme.uq !== scores.uq) {
      errors.push(`UQ mismatch: programme ${programme.uq} vs facts ${scores.uq}`);
    }
  }

  for (const lang of ['en', 'zh']) {
    const sections = details?.[lang]?.sections;
    if (!sections) {
      errors.push(`Missing details.${lang}.sections`);
      continue;
    }
    for (const key of SECTION_KEYS) {
      const sec = sections[key];
      if (!sec) errors.push(`Missing section ${lang}.${key}`);
      else if (!Array.isArray(sec.content) || sec.content.length < 3) {
        errors.push(`${lang}.${key} needs content[] with at least 3 bullets`);
      } else if (sec.bullets) {
        errors.push(`${lang}.${key} uses invalid "bullets" — use "content"`);
      }
    }
  }

  const allText = JSON.stringify(details);
  for (const re of BLOCKLIST) {
    if (re.test(allText)) errors.push(`Blocklisted pattern (likely hallucinated): ${re}`);
  }

  return errors;
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node validateProgramme.js <payload.json>');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const errors = validate(payload);

if (errors.length) {
  console.error('[validate] FAILED:');
  errors.forEach((e) => console.error(' -', e));
  process.exit(1);
}

console.log('[validate] OK —', payload.programme?.code);
