/**
 * Seed Batch 3 CUHK programme details into Cosmos DB
 * Run: node backend/scripts/cuhk/seed-cuhk-batch3.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const JupasProgrammeService = require("../../services/JupasProgrammeService");

const programmesMeta = [
  { code: "JS4214", nameEn: "Global Business Studies", nameZh: "環球商業學", name: "環球商業學", university: "香港中文大學", faculty: "商學院", median: 31, band_a: 33, category: "business" },
  { code: "JS4240", nameEn: "Professional Accountancy", nameZh: "專業會計學", name: "專業會計學", university: "香港中文大學", faculty: "商學院", median: 29, band_a: 31, category: "business" },
  { code: "JS4542", nameEn: "Chinese Medicine", nameZh: "中醫學", name: "中醫學", university: "香港中文大學", faculty: "醫學院", median: 30, band_a: 32, category: "health_science" },
  { code: "JS4812", nameEn: "Architectural Studies", nameZh: "建築學", name: "建築學", university: "香港中文大學", faculty: "社會科學院", median: 26, band_a: 28, category: "design" },
  { code: "JS4850", nameEn: "Journalism and Communication", nameZh: "新聞與傳播學", name: "新聞與傳播學", university: "香港中文大學", faculty: "社會科學院", median: 25, band_a: 27, category: "social_science" }
];

// Load details from JSON (only JS4850 is in there, others we'll seed with minimal details)
let batchDetails = {};
try {
  batchDetails = require("./cuhk-batch3-details.json").programmes;
} catch (e) {
  console.log("[Seed] No details JSON found, using inline minimal details");
}

function makeMinimalDetails(code, university, nameEn) {
  return {
    code,
    university,
    en: {
      sections: {
        admission: { title: "Eligibility & Admission Criteria (DSE)", content: ["**Academic Threshold**: Please refer to the official JUPAS website for the most up-to-date admission requirements.", "**Core Subjects**: English and Mathematics are typically required.", "**Interview**: May be required depending on the programme."] },
        curriculum: { title: "Programme Structure & Curriculum", content: ["Please refer to the CUHK official website for detailed curriculum information."] },
        career: { title: "Career Pathways & Prospects", content: ["Graduates pursue diverse career paths in their respective fields. Please refer to the official programme website for details."] },
        campus: { title: "Campus Life & Student Experience", content: ["CUHK offers a vibrant campus life with 9 colleges, extensive facilities, and active student societies."] },
        competitiveness: { title: "Admission Competitiveness Analysis", content: ["**Overall Difficulty**: Please refer to JUPAS admission statistics for the latest competitiveness data.", "**Band A Advantage**: Band A applicants typically receive priority consideration."] },
        alumni: { title: "Notable Alumni & Faculty", content: ["CUHK has produced many distinguished alumni across various industries."] },
        scholarships: { title: "Scholarships & Financial Aid", content: ["**CUHK Entrance Scholarships**: Available for students with exceptional DSE results.", "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year."] },
        tips: { title: `Ace Sir's ${nameEn} Strategy`, content: ["**Research Thoroughly**: Visit the official programme website and attend information sessions.", "**Prepare for Interview**: Practise articulating your motivation and career goals.", "**Stay Informed**: Keep up with developments in your chosen field."] }
      }
    },
    zh: {
      sections: {
        admission: { title: "入學要求與計分詳情 (DSE)", content: ["**學術門檻**：請參閱 JUPAS 官方網站獲取最新入學要求。", "**核心科目**：通常需要英文及數學。", "**面試**：視乎課程可能需要面試。"] },
        curriculum: { title: "課程結構與內容", content: ["請參閱中大官方網站獲取詳細課程資訊。"] },
        career: { title: "職業前景與出路", content: ["畢業生於各自領域追求多元職業路徑。請參閱官方課程網站獲取詳情。"] },
        campus: { title: "校園生活與學生體驗", content: ["中大提供充滿活力的校園生活，擁有9所書院、完善設施及活躍的學生組織。"] },
        competitiveness: { title: "入學競爭力分析", content: ["**整體難度**：請參閱 JUPAS 收生統計獲取最新競爭力數據。", "**Band A 優勢**：Band A 申請者通常獲優先考慮。"] },
        alumni: { title: "知名校友及教職員", content: ["中大培養了眾多各行各業的傑出校友。"] },
        scholarships: { title: "獎學金及經濟援助", content: ["**中大入學獎學金**：DSE 成績卓越者可申請。", "**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。"] },
        tips: { title: "Ace Sir 攻略", content: ["**徹底研究**：瀏覽官方課程網站並出席資訊講座。", "**準備面試**：練習表達你的動機及職業目標。", "**保持知情**：緊貼你選擇領域的最新發展。"] }
      }
    }
  };
}

async function seed() {
  console.log(`[Seed] ========================================`);
  console.log(`[Seed] CUHK Batch 3 Seeding`);
  console.log(`[Seed] ${programmesMeta.length} programmes`);
  console.log(`[Seed] ========================================\n`);

  let metaSuccess = 0, metaFail = 0;
  let detailSuccess = 0, detailFail = 0;

  for (const meta of programmesMeta) {
    try {
      await JupasProgrammeService.upsertProgramme({
        id: `prog_${meta.code}`, pk: "programmes", type: "programme",
        ...meta, updatedAt: new Date().toISOString()
      });
      console.log(`[Seed] ✓ Metadata ${meta.code} -> prog_${meta.code}`);
      metaSuccess++;
    } catch (error) {
      console.error(`[Seed] ✗ Metadata ${meta.code} failed:`, error.message);
      metaFail++;
    }

    try {
      const details = batchDetails[meta.code] || makeMinimalDetails(meta.code, meta.university, meta.nameEn);
      await JupasProgrammeService.upsertProgrammeDetails(details);
      const sectionCount = Object.keys(details.en.sections).length;
      console.log(`[Seed] ✓ Details ${meta.code} -> detail_${meta.code} [${sectionCount} sections]`);
      detailSuccess++;
    } catch (error) {
      console.error(`[Seed] ✗ Details ${meta.code} failed:`, error.message);
      detailFail++;
    }
  }

  console.log(`\n========================================`);
  console.log(`[Seed] COMPLETE`);
  console.log(`  Metadata:  ${metaSuccess} succeeded, ${metaFail} failed`);
  console.log(`  Details:   ${detailSuccess} succeeded, ${detailFail} failed`);
  console.log(`========================================`);

  process.exit(metaFail + detailFail > 0 ? 1 : 0);
}

seed();
