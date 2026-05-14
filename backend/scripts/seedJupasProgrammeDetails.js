/**
 * Seed comprehensive programme details for JS6456 (HKU Medicine) into Cosmos DB
 * Run: node backend/scripts/seedJupasProgrammeDetails.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const JS6456_DETAILS = {
    code: "JS6456",
    en: {
        sections: {
            admission: {
                title: "Eligibility & Admission Criteria (DSE)",
                content: [
                    "**Academic Threshold**: HKU Medicine is the most competitive programme in Hong Kong. The median admission score is typically Best 6 = 42-44 (standard scale, 5** = 7 pts).",
                    "**Core Subjects**: English (Level 5+ mandatory), Mathematics (Compulsory Part, Level 4+), and a strong performance in Liberal Studies / Citizenship and Social Development.",
                    "**Science Subjects - Critical**: Biology and Chemistry are not strictly mandatory but carry heavy weighting (x1.3 to x1.5). Candidates with both subjects have a dramatically higher admission probability.",
                    "**Interview - MMI Format**: 6-8 stations (8-10 min each) assessing ethical reasoning, communication, critical thinking, teamwork, motivation for medicine, and problem-solving under pressure.",
                    "**Non-Academic Factors**: HKU values sustained volunteering (especially healthcare-related), leadership roles, and evidence of genuine compassion."
                ]
            },
            curriculum: {
                title: "Programme Structure & Curriculum",
                content: [
                    "**Year 1 - Foundations of Medicine**: Human anatomy, physiology, biochemistry, and basic clinical skills. Early hospital exposure begins in Semester 2.",
                    "**Year 2 - Systems-Based Learning**: Cardiovascular, respiratory, gastrointestinal, renal, and endocrine systems taught in integrated blocks.",
                    "**Year 3 - Clinical Transition**: Transition from classroom to ward. Rotations in medicine, surgery, and community health.",
                    "**Year 4 - Core Clinical Rotations**: 12-week blocks in internal medicine, general surgery, paediatrics, and obstetrics & gynaecology at Queen Mary Hospital.",
                    "**Year 5 - Specialised Rotations**: Orthopaedics, ENT, ophthalmology, psychiatry, emergency medicine, and anaesthesiology.",
                    "**Year 6 - Internship Preparation & Electives**: Final MBBS examinations, elective placements (often overseas at Oxford, Cambridge, or Melbourne), and pre-internship shadowing.",
                    "**Enrichment Programmes**: Medical Humanities Programme, Global Health Electives (4-8 week placements in developing countries), and Research Electives with world-class teams."
                ]
            },
            career: {
                title: "Career Pathways & Prospects",
                content: [
                    "**Year 1 Internship (Housemanship)**: All graduates complete a 12-month internship at a Hospital Authority hospital.",
                    "**Residency Training**: After internship, doctors enter residency (typically 6 years). HKU graduates are highly sought after at Queen Mary Hospital, Prince of Wales Hospital, and Pamela Youde Nethersole Eastern Hospital.",
                    "**Specialisation Pathways**: Medicine (Cardiology, Gastroenterology, Nephrology), Surgery (General Surgery, Orthopaedics, Neurosurgery), Paediatrics, O&G, Psychiatry, Radiology, Anaesthesiology, Emergency Medicine, Family Medicine, Pathology.",
                    "**Private Practice**: After completing specialist training and obtaining Fellowship (FHKAM), many doctors establish private clinics.",
                    "**Academic Medicine**: HKU's Li Ka Shing Faculty of Medicine is ranked among Asia's top 3. Strong funding in emerging infectious diseases, cancer immunotherapy, and regenerative medicine.",
                    "**Global Opportunities**: HK medical degrees are recognised by the GMC (UK), AMC (Australia), and ECFMG (USA). Exchange partnerships with Oxford, Cambridge, Imperial, Melbourne, Toronto, and Johns Hopkins."
                ]
            },
            campus: {
                title: "Campus Life & Student Experience",
                content: [
                    "**Main Campus (Pok Fu Lam)**: Years 1-2 at the main HKU campus with historic Main Building, modern Centennial Campus, and 7 on-campus halls.",
                    "**Medical Campus (Sassoon Road)**: Years 3-6 at the Medical Faculty complex adjacent to Queen Mary Hospital. State-of-the-art simulation centre with high-fidelity manikins and VR surgical trainers.",
                    "**Hall Life**: 17 halls of residence. Medical students often choose St. John's College, Lady Ho Tung Hall, or Lee Hysan Hall.",
                    "**Student Societies**: HKU Medical Society (MedSoc) - one of the oldest student societies, organising Medic Night, charity fundraisers, and mentorship programmes.",
                    "**Mentorship**: Clinical mentor from Year 3 and academic advisor from Year 1. Alumni network includes many of Hong Kong's leading physicians and surgeons."
                ]
            },
            competitiveness: {
                title: "Admission Competitiveness Analysis",
                content: [
                    "**Overall Difficulty**: Extreme (5/5 stars). Approximately 2,500-3,000 applicants compete for ~260 places annually (~10% admission rate).",
                    "**Score Distribution**: Top quartile: Best 6 = 45-47; Median: Best 6 = 42-44; Bottom quartile: Best 6 = 39-41.",
                    "**Subject Weighting Strategy**: Biology (x1.5) + Chemistry (x1.5) + English (x1.0) + Maths (x1.0) + LS/CSD (x1.0) + Best Elective (x1.0). A student with 5** in Bio/Chem/English and 5* in others achieves ~44 points.",
                    "**Interview Weighting**: The MMI carries approximately 30-40% of the final admission decision. Exceptional interview performance can compensate for borderline scores.",
                    "**Band A Advantage**: Band A Choice 1 receives priority consideration. Choice 2 or lower bands have significantly reduced chances.",
                    "**Non-JUPAS Pathway**: IB (42+/45), GCE A-Levels (AAA* including Chemistry/Biology). Approximately 20-30 places reserved for non-JUPAS entrants."
                ]
            },
            alumni: {
                title: "Notable Alumni & Faculty",
                content: [
                    "**Professor Gabriel Leung**: Former Dean of Medicine, renowned epidemiologist who led Hong Kong's COVID-19 response. Now HKU Vice-President.",
                    "**Professor Yuen Kwok-yung**: World-famous microbiologist, discoverer of SARS coronavirus. Recipient of the Lasker Award.",
                    "**Dr. Margaret Chan**: Former Director-General of the World Health Organization (WHO). Led global health policy for a decade.",
                    "**Professor Joseph Sung**: Former Vice-Chancellor of CUHK and gastroenterologist. Pioneer in endoscopic research.",
                    "**Professor Nancy Ip**: President of HKUST, neuroscientist specialising in Alzheimer's disease research."
                ]
            },
            scholarships: {
                title: "Scholarships & Financial Aid",
                content: [
                    "**Li Ka Shing Faculty of Medicine Scholarships**: Merit-based scholarships for top-performing students, covering full tuition plus living allowance (HKD 50,000-100,000/year).",
                    "**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in 4+ subjects). Full or half tuition coverage.",
                    "**Medical Society Bursaries**: Need-based financial support for students from disadvantaged backgrounds. Applications assessed annually.",
                    "**Overseas Elective Funding**: Special grants for students undertaking electives at partner institutions abroad (up to HKD 30,000 per elective).",
                    "**Government Grants & Loans**: Non-means-tested subsidy scheme (NMTSS) provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans."
                ]
            },
            tips: {
                title: "Ace Sir's HKU Medicine Strategy",
                content: [
                    "**Score Targeting**: Aim for Best 6 of 42+ with strong Biology and Chemistry. HKU Medicine is unapologetically meritocratic.",
                    "**MMI Preparation**: Practice ethical scenarios (resource allocation, patient autonomy, end-of-life decisions). Show compassion alongside clinical reasoning.",
                    "**Shadowing Experience**: Spend time in hospitals or clinics. Genuine exposure demonstrates commitment beyond academic interest.",
                    "**Build a Narrative**: Your personal statement and interview should tell a coherent story - why medicine, why HKU, and what you have done to prepare.",
                    "**Start Early**: Begin volunteering in Year 10-11. One-off experiences are less valuable than sustained, long-term commitment to a cause."
                ]
            }
        }
    },
    zh: {
        sections: {
            admission: {
                title: "入學要求與計分詳情 (DSE)",
                content: [
                    "**學術門檻**：港大醫學院是香港競爭最激烈的課程。中位數收生分數通常為 Best 6 = 42-44 分 (標準計分，5** = 7分)。",
                    "**核心科目**：英文 (必須達 Level 5 或以上)、數學 (必修部分，Level 4 或以上)，以及通識教育/公民與社會發展科的優異表現。",
                    "**理科科目 - 關鍵**：生物和化學雖非嚴格必修，但有較高加權 (x1.3 至 x1.5)。同時修讀兩科的申請者入學機會大幅提升。",
                    "**面試 - MMI 形式**：6-8個站 (每站8-10分鐘)，考核倫理推理、溝通技巧、批判思維、團隊合作、從醫動機及壓力下的解難能力。",
                    "**非學術因素**：港大重視持續的義工服務 (尤其醫療相關)、領導角色及真誠的同理心證明。"
                ]
            },
            curriculum: {
                title: "課程結構與內容",
                content: [
                    "**第一年 - 醫學基礎**：人體解剖學、生理學、生物化學及基本臨床技能。第二學期開始早期醫院接觸。",
                    "**第二年 - 系統導向學習**：心血管、呼吸、腸胃、腎臟及內分泌系統，以整合式單元教授解剖、生理、病理及藥理。",
                    "**第三年 - 臨床過渡**：從課室過渡到病房。內科、外科及社區健康輪轉。引入臨床推理及診斷技能。",
                    "**第四年 - 核心臨床輪轉**：於瑪麗醫院進行內科、外科、兒科及婦產科的12週輪轉。",
                    "**第五年 - 專科輪轉**：骨科、耳鼻喉、眼科、精神科、急症醫學及麻醉科。開始準備終期 MBBS 考試。",
                    "**第六年 - 實習準備及選修**：終期 MBBS 考試、海外選修實習 (常於牛津、劍橋或墨爾本等伙伴院校)，及實習前跟班。",
                    "**專修計劃**：醫學人文計劃、環球健康選修 (發展中國家4-8週實習)，以及與世界級研究團隊的研究選修。"
                ]
            },
            career: {
                title: "職業前景與出路",
                content: [
                    "**第一年實習 (Housemanship)**：所有畢業生須於醫管局醫院完成12個月實習，包括內科、外科及兩個其他專科。",
                    "**專科培訓**：實習後進入專科培訓 (通常6年)。港大畢業生於瑪麗醫院、威爾斯親王醫院及東區尤德夫人那打素醫院極受歡迎。",
                    "**專科發展路徑**：內科 (心臟科、腸胃科、腎科)、外科 (普通外科、骨科、腦外科)、兒科、婦產科、精神科、放射科、麻醉科、急症科、家庭醫學、病理科。",
                    "**私人執業**：完成專科培訓並取得院士資格 (FHKAM) 後，不少醫生開設私人診所。",
                    "**學術醫學**：港大李嘉誠醫學院位列亞洲三甲。新發傳染病、癌症免疫治療及再生醫學研究資金充裕。",
                    "**環球機會**：香港醫學學位獲英國 GMC、澳洲 AMC 及美國 ECFMG 認可。與牛津、劍橋、帝國理工、墨爾本、多倫多及約翰霍普金斯設有交流計劃。"
                ]
            },
            campus: {
                title: "校園生活與學生體驗",
                content: [
                    "**主校園 (薄扶林)**：第一至二年於港大主校園，擁有歷史悠久的主樓、現代化的百周年校園及7間舍堂。",
                    "**醫學院校園 (沙宣道)**：第三至六年於瑪麗醫院旁的醫學院大樓。設有先進的模擬醫學中心，配備高仿真模擬病人及虛擬實境外科訓練系統。",
                    "**舍堂生活**：港大共有17間舍堂。醫科學生常選擇聖約翰學院、何東夫人紀念堂或利希慎堂，因其強大的社群及學術支援網絡。",
                    "**學生組織**：港大醫學會 (MedSoc) 是歷史最悠久的學生組織之一，舉辦年度 Medic Night、慈善籌款及師友計劃。",
                    "**師友指導**：每位學生從第一年獲配學術導師，第三年獲配臨床導師。校友網絡包括香港多位頂尖醫生及外科醫生。"
                ]
            },
            competitiveness: {
                title: "入學競爭力分析",
                content: [
                    "**整體難度**：極高 (5/5星)。每年約2,500-3,000人競爭~260個學額 (入學率約10%)。",
                    "**分數分佈**：最高四分位數：Best 6 = 45-47分；中位數：Best 6 = 42-44分；最低四分位數：Best 6 = 39-41分。",
                    "**科目加權策略**：生物 (x1.5) + 化學 (x1.5) + 英文 (x1.0) + 數學 (x1.0) + 通識/公社 (x1.0) + 最佳選修科 (x1.0)。生物化學英文達5**、其他達5*的學生約有44分。",
                    "**面試比重**：MMI 佔最終入學決定約30-40%。面試表現卓越可彌補分數上的不足。",
                    "**Band A 優勢**：Band A 第一志願獲優先考慮。第二志願或較低 band 的機會大幅降低。",
                    "**非聯招途徑**：國際文憑 (IB 42+/45)、GCE A-Level (AAA* 包括化學/生物)。約20-30個學額預留予非聯招申請者。"
                ]
            },
            alumni: {
                title: "知名校友及教職員",
                content: [
                    "**梁卓偉教授**：前醫學院院長，著名流行病學家，領導香港 COVID-19 抗疫工作。現任港大副校長。",
                    "**袁國勇教授**：世界知名微生物學家，SARS 冠狀病毒發現者。拉斯克獎得主。",
                    "**陳馮富珍博士**：前世界衛生組織總幹事。領導全球衛生政策長達十年。",
                    "**沈祖堯教授**：前中文大學校長，腸胃科醫生。內窺鏡研究先驅。",
                    "**葉玉如教授**：香港科技大學校長，神經科學家，專注於阿茲海默症研究。"
                ]
            },
            scholarships: {
                title: "獎學金及經濟援助",
                content: [
                    "**李嘉誠醫學院獎學金**：頒予成績優異學生的 merit-based 獎學金，涵蓋全額學費及生活津貼 (每年港幣50,000-100,000元)。",
                    "**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常4科5**或以上)。全額或半額學費資助。",
                    "**醫學會助學金**：為弱勢背景學生提供 need-based 經濟支援。每年接受申請。",
                    "**海外選修資助**：為於伙伴院校進行海外選修的學生提供特別資助 (每次最多港幣30,000元)。",
                    "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。"
                ]
            },
            tips: {
                title: "Ace Sir 港大醫科攻略",
                content: [
                    "**分數目標**：Best 6 目標42分以上，生物及化學成績要優異。港大醫科毫不妥協地以成績為先。",
                    "**MMI 準備**：練習倫理情境 (資源分配、病人自主權、臨終決定)。展現同情心，同時展示臨床推理能力。",
                    "**影子實習經驗**：到醫院或診所實習。真正的醫學接觸能展示超越學術興趣的承諾。",
                    "**建立故事**：個人陳述及面試應講述一個連貫的故事 - 為何從醫、為何選擇港大、以及你如何準備。",
                    "**及早開始**：中四至中五開始義工服務。一次性經驗不如對某項事業的長期持續投入。"
                ]
            }
        }
    }
};

async function seed() {
    try {
        console.log("[Seed] Seeding JS6456 programme details...");
        const result = await JupasProgrammeService.upsertProgrammeDetails(JS6456_DETAILS);
        console.log("[Seed] Success:", result.id);
        process.exit(0);
    } catch (error) {
        console.error("[Seed] Failed:", error);
        process.exit(1);
    }
}

seed();
