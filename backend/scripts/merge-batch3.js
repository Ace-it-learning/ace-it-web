const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'generated-programmes');
const outFile = path.join(outDir, 'batch3-hku-16-25-premium.json');

const result = {
  _meta: {
    batch: 3,
    version: "premium",
    sections: 8,
    programmes: 10,
    generated: "2026-05-13"
  }
};

for (let i = 1; i <= 10; i++) {
  const files = fs.readdirSync(outDir).filter(f => f.startsWith(`_batch3_prog${i}_`));
  if (files.length === 0) {
    console.log(`  ⚠️ Skipping slot ${i} — no file found`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(path.join(outDir, files[0]), 'utf8'));
  result[data.code] = data;
  console.log(`  ✅ Merged ${data.code} — ${data.nameEn}`);
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8');
console.log(`\n🎉 Final JSON written to ${outFile}`);

// Verify
const verify = JSON.parse(fs.readFileSync(outFile, 'utf8'));
const codes = Object.keys(verify).filter(k => k.startsWith('JS'));
console.log(`\nVerification: ${codes.length} programmes merged`);
codes.forEach(c => {
  const p = verify[c];
  const sectionCount = Object.keys(p.en.sections).length;
  console.log(`  ${c}: ${p.nameEn} / ${p.nameZh} — ${sectionCount} sections`);
});
