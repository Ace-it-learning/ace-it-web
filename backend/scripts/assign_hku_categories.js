/**
 * Assign category fields to HKU programmes based on faculty
 * Run: node backend/scripts/assign_hku_categories.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const facultyToCategory = {
  "醫學院": "medicine",
  "牙醫學院": "medicine",
  "法律學院": "law",
  "商學院": "business",
  "工程學院": "engineering",
  "理學院": "science",
  "文學院": "arts",
  "社會科學學院": "social_science",
  "教育學院": "education",
  "建築學院": "design",
  "護理學院": "medicine",
  "醫療及社會科學院": "medicine",
  "獸醫學院": "medicine",
  "設計學院": "design",
  "創意媒體學院": "arts",
  "傳理學院": "arts",
  "中醫藥學院": "medicine",
  "酒店及旅遊業管理學院": "business",
  "數據科學學院": "engineering",
};

function getCategory(faculty) {
  if (!faculty) return "science";
  // Handle combined faculties
  if (faculty.includes("商學院") && faculty.includes("法律")) return "law";
  if (faculty.includes("理學院") && faculty.includes("法律")) return "law";
  if (faculty.includes("社會科學") && faculty.includes("法律")) return "law";
  if (faculty.includes("工程") && faculty.includes("商")) return "engineering";

  for (const [key, val] of Object.entries(facultyToCategory)) {
    if (faculty.includes(key)) return val;
  }
  return "science";
}

async function assign() {
  console.log("[Assign] Starting category assignment for HKU programmes...");

  const progs = await JupasProgrammeService.getAllProgrammes();
  const hkuNoCat = progs.filter((p) => p.code && p.code.startsWith("JS") && !p.category);

  console.log(`[Assign] Programmes needing category: ${hkuNoCat.length}`);

  let success = 0;
  for (const p of hkuNoCat) {
    try {
      const category = getCategory(p.faculty);
      const updated = {
        ...p,
        category,
        updatedAt: new Date().toISOString(),
      };
      await JupasProgrammeService.upsertProgramme(updated);
      console.log(`[Assign] ✓ ${p.code} → ${category} (${p.faculty})`);
      success++;
    } catch (err) {
      console.error(`[Assign] ✗ ${p.code} - ${err.message}`);
    }
  }

  console.log(`\n[Assign] Complete. Assigned: ${success}/${hkuNoCat.length}`);
  process.exit(0);
}

assign().catch((err) => {
  console.error("[Assign] Fatal error:", err);
  process.exit(1);
});
