/**
 * Seed remaining 34 HKU programmes missing from the Dream Subjects database
 * Source: JUPAS official website (https://www.jupas.edu.hk/en/programme/hku/)
 * Run: node backend/scripts/seed_hku_remaining_programmes.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const MISSING_PROGRAMMES = [
  // 文學院 (1)
  {
    code: "JS6286",
    nameZh: "文學士(人文及數碼科技)",
    nameEn: "Bachelor of Arts in Humanities and Digital Technologies",
    university: "香港大學",
    faculty: "文學院",
  },
  // 工程學院 (8)
  {
    code: "JS6298",
    nameZh: "文學士及工學學士(人工智能及數據科學)",
    nameEn: "Bachelor of Arts and Bachelor of Engineering in Artificial Intelligence and Data Science",
    university: "香港大學",
    faculty: "工程學院",
  },
  {
    code: "JS6303",
    nameZh: "工學學士精英課程",
    nameEn: "Bachelor of Engineering Elite Programme",
    university: "香港大學",
    faculty: "工程學院",
  },
  {
    code: "JS6315",
    nameZh: "工學學士(數據與系統工程)",
    nameEn: "Bachelor of Engineering in Data and Systems Engineering",
    university: "香港大學",
    faculty: "工程學院",
  },
  {
    code: "JS6339",
    nameZh: "工學學士(機械工程)",
    nameEn: "Bachelor of Engineering in Mechanical Engineering",
    university: "香港大學",
    faculty: "工程學院",
  },
  {
    code: "JS6353",
    nameZh: "工學學士(土木工程)",
    nameEn: "Bachelor of Engineering in Civil Engineering",
    university: "香港大學",
    faculty: "工程學院",
  },
  {
    code: "JS6377",
    nameZh: "工學學士與人工智能理學碩士聯合課程",
    nameEn: "Bachelor of Engineering and Master of Science in Engineering in Artificial Intelligence in Engineering",
    university: "香港大學",
    faculty: "工程學院",
  },
  {
    code: "JS6925",
    nameZh: "工學學士(生物醫學工程)",
    nameEn: "Bachelor of Engineering in Biomedical Engineering",
    university: "香港大學",
    faculty: "工程學院",
  },
  {
    code: "JS6987",
    nameZh: "工學學士(計算機工程/電機工程/電子工程)",
    nameEn: "Bachelor of Engineering in Computer Engineering / Electrical Engineering / Electronic Engineering",
    university: "香港大學",
    faculty: "工程學院",
  },
  // 工程學院/商學院 (1)
  {
    code: "JS6937",
    nameZh: "環球工程與商業課程",
    nameEn: "Global Engineering and Business Programme",
    university: "香港大學",
    faculty: "工程學院/商學院",
  },
  // 法律學院 (1)
  {
    code: "JS6406",
    nameZh: "法學士",
    nameEn: "Bachelor of Laws",
    university: "香港大學",
    faculty: "法律學院",
  },
  // 理學院 (5)
  {
    code: "JS6602",
    nameZh: "理學士(創新與科技)",
    nameEn: "Bachelor of Science in Innovation and Technology",
    university: "香港大學",
    faculty: "理學院",
  },
  {
    code: "JS6688",
    nameZh: "科研專才啟導課程",
    nameEn: "Science Master Class",
    university: "香港大學",
    faculty: "理學院",
  },
  {
    code: "JS6729",
    nameZh: "理學士(精算學)",
    nameEn: "Bachelor of Science in Actuarial Science",
    university: "香港大學",
    faculty: "理學院",
  },
  {
    code: "JS6779",
    nameZh: "統計決策科學",
    nameEn: "Statistical Decision Sciences",
    university: "香港大學",
    faculty: "理學院",
  },
  {
    code: "JS6999",
    nameZh: "計算與數據科學",
    nameEn: "Computing and Data Science",
    university: "香港大學",
    faculty: "理學院",
  },
  // 理學院/法律學院 (1)
  {
    code: "JS6858",
    nameZh: "理學士及法學士",
    nameEn: "Bachelor of Science and Bachelor of Laws",
    university: "香港大學",
    faculty: "理學院/法律學院",
  },
  // 社會科學學院 (4)
  {
    code: "JS6705",
    nameZh: "心理學學士",
    nameEn: "Bachelor of Psychology",
    university: "香港大學",
    faculty: "社會科學學院",
  },
  {
    code: "JS6717",
    nameZh: "社會科學學士",
    nameEn: "Bachelor of Social Sciences",
    university: "香港大學",
    faculty: "社會科學學院",
  },
  {
    code: "JS6731",
    nameZh: "社會工作學學士",
    nameEn: "Bachelor of Social Work",
    university: "香港大學",
    faculty: "社會科學學院",
  },
  {
    code: "JS6822",
    nameZh: "新聞媒體及人工智能學士",
    nameEn: "Bachelor of Journalism, Media and Artificial Intelligence",
    university: "香港大學",
    faculty: "社會科學學院",
  },
  // 社會科學學院/法律學院 (1)
  {
    code: "JS6810",
    nameZh: "社會科學學士(政治學與法學)及法學士",
    nameEn: "Bachelor of Social Sciences (Government and Laws) and Bachelor of Laws",
    university: "香港大學",
    faculty: "社會科學學院/法律學院",
  },
  // 醫學院 (6)
  {
    code: "JS6418",
    nameZh: "護理學學士菁英領袖培育專修組別",
    nameEn: "Bachelor of Nursing Advanced Leadership Track",
    university: "香港大學",
    faculty: "醫學院",
  },
  {
    code: "JS6468",
    nameZh: "護理學學士",
    nameEn: "Bachelor of Nursing",
    university: "香港大學",
    faculty: "醫學院",
  },
  {
    code: "JS6482",
    nameZh: "中醫全科學士",
    nameEn: "Bachelor of Chinese Medicine",
    university: "香港大學",
    faculty: "醫學院",
  },
  {
    code: "JS6494",
    nameZh: "藥劑學學士",
    nameEn: "Bachelor of Pharmacy",
    university: "香港大學",
    faculty: "醫學院",
  },
  {
    code: "JS6626",
    nameZh: "內外全科醫學士 - 傑出醫科學人",
    nameEn: "Bachelor of Medicine and Bachelor of Surgery (Distinguished MedScholar)",
    university: "香港大學",
    faculty: "醫學院",
  },
  {
    code: "JS6949",
    nameZh: "生物醫學學士",
    nameEn: "Bachelor of Biomedical Sciences",
    university: "香港大學",
    faculty: "醫學院",
  },
  // 商學院 (6)
  {
    code: "JS6755",
    nameZh: "工商管理學學士",
    nameEn: "Bachelor of Business Administration",
    university: "香港大學",
    faculty: "商學院",
  },
  {
    code: "JS6793",
    nameZh: "工商管理學學士(商業分析)",
    nameEn: "Bachelor of Business Administration (Business Analytics)",
    university: "香港大學",
    faculty: "商學院",
  },
  {
    code: "JS6846",
    nameZh: "理學士(營銷分析及科技)",
    nameEn: "Bachelor of Science in Marketing Analytics and Technology",
    university: "香港大學",
    faculty: "商學院",
  },
  {
    code: "JS6860",
    nameZh: "金融學學士(資產管理及私人銀行)",
    nameEn: "Bachelor of Finance in Asset Management and Private Banking",
    university: "香港大學",
    faculty: "商學院",
  },
  {
    code: "JS6884",
    nameZh: "理學士(計量金融)",
    nameEn: "Bachelor of Science in Quantitative Finance",
    university: "香港大學",
    faculty: "商學院",
  },
  {
    code: "JS6896",
    nameZh: "工商管理學學士(國際商業及環球管理)",
    nameEn: "Bachelor of Business Administration in International Business and Global Management",
    university: "香港大學",
    faculty: "商學院",
  },
];

async function seed() {
  console.log(`[Seed] Starting HKU remaining programmes seeding...`);
  console.log(`[Seed] Total programmes to add: ${MISSING_PROGRAMMES.length}`);
  let success = 0;
  let skipped = 0;

  for (const prog of MISSING_PROGRAMMES) {
    try {
      const result = await JupasProgrammeService.seedProgramme(prog);
      if (result && result.code === prog.code) {
        console.log(`[Seed] ✓ Added: ${prog.code} - ${prog.nameZh}`);
        success++;
      } else {
        console.log(`[Seed] ○ Skipped (already exists): ${prog.code}`);
        skipped++;
      }
    } catch (err) {
      console.error(`[Seed] ✗ Failed: ${prog.code} - ${err.message}`);
    }
  }

  console.log(`\n[Seed] Complete. Added: ${success}, Skipped: ${skipped}, Total: ${MISSING_PROGRAMMES.length}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Fatal error:", err);
  process.exit(1);
});
