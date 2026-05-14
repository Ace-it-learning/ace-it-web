const fs = require('fs');
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const JupasProgrammeService = require("../services/JupasProgrammeService");
const batchData = require('./generated-programmes/batch3-hku-16-25-premium.json');

async function seed() {
  console.log("🌱 Seeding Batch 3 Premium (10 HKU programmes)...\n");

  const codes = Object.keys(batchData).filter(k => k.startsWith('JS'));
  
  // Step 1: Seed metadata
  console.log("--- Step 1: Seeding programme metadata ---");
  for (const code of codes) {
    const p = batchData[code];
    const meta = {
      id: `prog_${code}`,
      pk: "programmes",
      type: "programme",
      code: p.code,
      nameEn: p.nameEn,
      nameZh: p.nameZh,
      university: p.university,
      faculty: p.faculty,
      median: p.median,
      category: p.category
    };
    await JupasProgrammeService.upsertProgramme(meta);
    console.log(`  ✅ Metadata: ${code} - ${p.nameEn}`);
  }

  // Step 2: Seed details
  console.log("\n--- Step 2: Seeding programme details ---");
  for (const code of codes) {
    const p = batchData[code];
    const details = {
      id: `detail_${code}`,
      pk: "details",
      type: "programme_detail",
      code: p.code,
      en: p.en,
      zh: p.zh
    };
    await JupasProgrammeService.upsertProgrammeDetails(details);
    const sectionCount = Object.keys(p.en.sections).length;
    console.log(`  ✅ Details: ${code} - ${sectionCount} sections`);
  }

  console.log("\n🎉 Batch 3 seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
