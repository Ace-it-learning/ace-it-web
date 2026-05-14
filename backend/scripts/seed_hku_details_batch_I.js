const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  {
    code: "JS6884",
    nameZh: "理學士(計量金融)",
    nameEn: "BSc(QFin)",
    university: "香港大學",
    faculty: "商學院",
    en: {
      sections: {
        admission: {
          title: "Admission Requirements",
          content: [
            "**HKDSE Performance:** Minimum Level 5 in English and Mathematics (Compulsory Part), with strong preference for Level 5** in both subjects.",
            "**Core Subjects:** Level 4 or above in Chinese and Liberal Studies/Citizenship and Social Development is typically expected.",
            "**Elective Preference:** Mathematics Extended Part (M1/M2) at Level 5 is **highly recommended** and significantly strengthens your application.",
            "**Weighting:** Mathematics and M1/M2 carry **double weighting** in the admission score calculation.",
            "**Median Score:** Recent admission scores typically range around **35-38 points** (best 5 subjects with weighting)."
          ]
        },
        curriculum: {
          title: "Curriculum Highlights",
          content: [
            "**Quantitative Foundation:** Rigorous training in **stochastic calculus, numerical methods, and statistical modelling** forms the programme core.",
            "**Finance Integration:** Courses cover **derivatives pricing, risk management, portfolio theory, and fixed income securities**.",
            "**Programming Skills:** Students develop proficiency in **Python, R, C++, and MATLAB** for financial modelling and data analysis.",
            "**Capstone Project:** A **year-long quantitative research project** allows students to apply techniques to real-world financial problems.",
            "**Internship Component:** A **mandatory 6-week summer internship** at financial institutions provides practical industry exposure."
          ]
        },
        career: {
          title: "Career Prospects",
          content: [
            "**Investment Banking:** Graduates frequently join **bulge-bracket banks** in sales & trading, structuring, and quantitative research roles.",
            "**Quantitative Finance:** Many pursue careers as **quantitative analysts (quants)** at hedge funds and proprietary trading firms.",
            "**Risk Management:** Strong demand for graduates in **market risk, credit risk, and model validation** positions.",
            "**Further Studies:** Approximately **30% of graduates** pursue Master's or PhD programmes at top institutions like MIT, Stanford, or LSE.",
            "**Average Starting Salary:** Recent graduates command starting salaries of **HKD 35,000–50,000 per month**."
          ]
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "**Main Campus:** Classes are held at the **HKU Main Campus** in Pok Fu Lam with stunning harbour views.",
            "**Finance Lab:** Dedicated **Bloomberg terminals and trading simulation software** available in the Cyberport facility.",
            "**Library Resources:** The **Main Library** provides extensive access to financial databases including Bloomberg, Reuters, and Wind.",
            "**Student Accommodation:** Guaranteed **on-campus housing** for first-year students; limited spaces for senior years.",
            "**Transport:** Well-connected by **MTR (HKU Station)** and numerous bus routes serving the Western District."
          ]
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "**Admission Rate:** Highly competitive with an estimated **acceptance rate of 5–8%** among JUPAS applicants.",
            "**Applicant Pool:** Attracts over **1,500 JUPAS applicants** annually for approximately **60–70 places**.",
            "**Non-JUPAS:** Approximately **30% of intake** comes from non-JUPAS streams including international qualifications.",
            "**Interview:** Shortlisted candidates may be invited for a **panel interview** assessing mathematical reasoning and communication skills.",
            "**Benchmark:** Applicants typically rank within the **top 2% of HKDSE candidates** in Mathematics and English."
          ]
        },
        alumni: {
          title: "Notable Alumni & Network",
          content: [
            "**Industry Leaders:** Alumni hold senior positions at **Goldman Sachs, Morgan Stanley, and JP Morgan** in Hong Kong and globally.",
            "**Entrepreneurship:** Several graduates have founded **successful fintech startups** in Hong Kong and mainland China.",
            "**Academia:** Programme alumni are faculty members at **HKUST, CUHK, and overseas business schools**.",
            "**Mentorship Programme:** Active **alumni mentoring scheme** pairing current students with industry professionals.",
            "**Global Network:** Graduates benefit from HKU's **extensive alumni network** spanning over **150 countries**."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Entrance Scholarships:** Automatic consideration for **HKU Foundation Entrance Scholarships** based on HKDSE results.",
            "**Merit Awards:** Dean's Honours List recipients receive **tuition fee waivers** and academic prizes.",
            "**Need-Based Aid:** **Student Financial Assistance Agency (SFAA)** grants and loans available for eligible local students.",
            "**External Funding:** Students may apply for **HSBC Overseas Scholarship** and **C.Y. Tung Foundation grants**.",
            "**Research Stipends:** Opportunities for **undergraduate research assistantships** with faculty members."
          ]
        },
        tips: {
          title: "Application Tips",
          content: [
            "**Mathematics M1/M2:** Taking **Mathematics Extended Part is strongly advised**; it is effectively a prerequisite for competitive applicants.",
            "**Personal Statement:** Emphasise your **passion for quantitative problem-solving** and any relevant competitions or projects.",
            "**Interview Preparation:** Be ready to explain **basic calculus or probability concepts** clearly and confidently.",
            "**Band A Strategy:** Place this programme in **Band A Choice 1 or 2** to maximise your admission probability.",
            "**Alternative Pathways:** Consider applying to **BBA(Finance) or BSc(Mathematics)** as backup options within the same faculty."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "**文憑試成績：** 英國語文及數學（必修部分）最低達第5級，兩科達5**級者獲優先考慮。",
            "**核心科目：** 中國語文及通識教育／公民與社會發展通常須達第4級或以上。",
            "**選修科建議：** 數學延伸部分（M1/M2）達第5級**強烈建議修讀**，能顯著提升競爭力。",
            "**科目比重：** 數學及M1/M2在入學計分中佔**雙倍比重**。",
            "**中位分數：** 近年取錄分數通常約為**35–38分**（最佳五科計比重後）。"
          ]
        },
        curriculum: {
          title: "課程特色",
          content: [
            "**量化基礎：** 課程核心包括**隨機微積分、數值方法及統計建模**的嚴格訓練。",
            "**金融整合：** 涵蓋**衍生工具定價、風險管理、投資組合理論及固定收益證券**等課程。",
            "**編程技能：** 學生將熟練掌握**Python、R、C++及MATLAB**，以進行金融建模與數據分析。",
            "**畢業專題：** **為期一年的量化研究專題**讓學生將所學技術應用於實際金融問題。",
            "**實習安排：** 必須完成**為期六週的暑期實習**，於金融機構獲取實務經驗。"
          ]
        },
        career: {
          title: "就業前景",
          content: [
            "**投資銀行：** 畢業生多加入**大型國際投資銀行**，從事銷售與交易、結構產品及量化研究。",
            "**量化金融：** 不少畢業生於對沖基金及自營交易公司擔任**量化分析師（Quant）**。",
            "**風險管理：** **市場風險、信貸風險及模型驗證**等職位對畢業生需求甚殷。",
            "**升學進修：** 約**30%畢業生**選擇於麻省理工、史丹福或倫敦政經等頂尖學府修讀碩士或博士課程。",
            "**平均起薪：** 近年畢業生起薪約為**每月35,000–50,000港元**。"
          ]
        },
        campus: {
          title: "校園及設施",
          content: [
            "**主校園：** 課堂於**薄扶林香港大學主校園**進行，享有維港美景。",
            "**金融實驗室：** 數碼港設施配備**彭博終端機及交易模擬軟件**。",
            "**圖書館資源：** **主圖書館**提供彭博、路透及萬得等金融數據庫的廣泛存取。",
            "**學生宿舍：** 一年級學生**保證入住校內宿舍**；高年級宿位有限。",
            "**交通：** **港鐵香港大學站**及多條巴士路線連接西區，交通便利。"
          ]
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "**取錄率：** 競爭非常激烈，聯招申請者估計**取錄率僅5–8%**。",
            "**申請人數：** 每年吸引超過**1,500名聯招申請者**競逐約**60–70個學額**。",
            "**非聯招：** 約**30%學額**來自非聯招途徑，包括國際學歷。",
            "**面試：** 入圍者或獲邀參加**小組面試**，評估數學推理及溝通能力。",
            "**基準：** 申請者通常於數學及英國語文科位列**文憑試考生首2%**。"
          ]
        },
        alumni: {
          title: "傑出校友及網絡",
          content: [
            "**業界領袖：** 校友於**高盛、摩根士丹利及摩根大通**等擔任高層職位。",
            "**創業精神：** 部分畢業生於香港及內地創辦**成功的金融科技初創企業**。",
            "**學術界：** 課程校友現為**科大、中大及海外商學院**的教職員。",
            "**師友計劃：** 活躍的**校友師友計劃**，為在學學生配對業界專業人士。",
            "**全球網絡：** 畢業生受惠於港大遍佈**超過150個國家**的龐大校友網絡。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**入學獎學金：** 根據文憑試成績自動獲考慮**香港大學基金入學獎學金**。",
            "**優異獎項：** 院長榮譽榜學生可獲**學費減免**及學術獎項。",
            "**經濟援助：** 合資格本地學生可申請**學生資助處（學資處）**的助學金及貸款。",
            "**外部資助：** 學生可申請**滙豐海外獎學金**及**董氏基金會資助**。",
            "**研究津貼：** 有機會擔任**本科生研究助理**，獲得教職員指導及津貼。"
          ]
        },
        tips: {
          title: "申請貼士",
          content: [
            "**數學M1/M2：** **強烈建議修讀數學延伸部分**；對具競爭力的申請者而言近乎必須。",
            "**個人陳述：** 強調你對**量化問題解決的熱誠**，以及相關比賽或項目經驗。",
            "**面試準備：** 須能清晰自信地解釋**基本微積分或概率概念**。",
            "**Band A策略：** 將此課程放於**Band A第1或第2志願**，以最大化取錄機會。",
            "**後備選擇：** 可考慮同時申請**工商管理學學士（金融）或理學士（數學）**作為後備。"
          ]
        }
      }
    }
  },
  {
    code: "JS6896",
    nameZh: "工商管理學學士(國際商業及環球管理)",
    nameEn: "BBA(IBGM)",
    university: "香港大學",
    faculty: "商學院",
    en: {
      sections: {
        admission: {
          title: "Admission Requirements",
          content: [
            "**HKDSE Performance:** Minimum Level 5 in English and Mathematics (Compulsory Part); Level 5** in English is **strongly preferred**.",
            "**Core Subjects:** Level 4 or above in Chinese and Liberal Studies/Citizenship and Social Development is expected.",
            "**Elective Flexibility:** No specific elective requirement, but **Economics or Business, Accounting and Financial Studies (BAFS)** is advantageous.",
            "**Weighting:** English carries **double weighting**; Mathematics carries **1.5x weighting** in admission scoring.",
            "**Median Score:** Competitive applicants typically score **33–36 points** (best 5 subjects with weighting)."
          ]
        },
        curriculum: {
          title: "Curriculum Highlights",
          content: [
            "**Global Focus:** The programme emphasises **cross-cultural management, international trade, and global strategy** from year one.",
            "**Language Requirement:** Students must achieve **intermediate proficiency in a second foreign language** (e.g., French, Spanish, Japanese, or Mandarin).",
            "**Overseas Exchange:** Guaranteed **one-semester exchange** at partner universities including LSE, Wharton, or INSEAD.",
            "**Case Method:** Heavy use of **Harvard-style case studies** to develop analytical and decision-making skills.",
            "**Leadership Training:** Dedicated **leadership workshops and team-based consulting projects** with multinational corporations."
          ]
        },
        career: {
          title: "Career Prospects",
          content: [
            "**Management Consulting:** Graduates are highly sought after by **McKinsey, BCG, and Bain** for their global mindset.",
            "**Multinational Corporations:** Many join **Fortune 500 companies** in management trainee programmes across Asia-Pacific.",
            "**Entrepreneurship:** The programme nurtures **startup founders** with strong international business acumen.",
            "**Further Studies:** Popular destinations for Master's include **LBS, INSEAD, and Columbia Business School**.",
            "**Average Starting Salary:** Management trainee roles offer starting salaries of **HKD 30,000–45,000 per month**."
          ]
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "**Main Campus:** Primarily based at the **HKU Main Campus** with modern teaching facilities.",
            "**Cyberport Annex:** Some seminars and corporate events are held at the **Cyberport academic hub**.",
            "**Collaborative Spaces:** **24-hour group study rooms** and innovation labs equipped with video conferencing for global team projects.",
            "**Language Centre:** Access to the **HKU Language Centre** for intensive foreign language courses and certification.",
            "**Student Life:** Over **100 student societies** including the International Business Association and consulting clubs."
          ]
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "**Admission Rate:** Highly selective with an estimated **acceptance rate of 6–9%** via JUPAS.",
            "**Intake Size:** Approximately **50–60 JUPAS places** available each year from over **1,200 applicants**.",
            "**Non-JUPAS:** Around **35–40% of the cohort** is admitted through international qualifications and other non-JUPAS schemes.",
            "**Holistic Review:** Admissions consider **leadership experience, extracurricular achievements, and interview performance** alongside grades.",
            "**Benchmark:** Successful applicants usually demonstrate **top 3% English proficiency** among HKDSE candidates."
          ]
        },
        alumni: {
          title: "Notable Alumni & Network",
          content: [
            "**Consulting Partners:** Alumni have progressed to **partner level** at major global consulting firms.",
            "**Corporate Executives:** Graduates hold **C-suite positions** at multinational corporations in Asia, Europe, and North America.",
            "**Social Impact:** Several alumni lead **non-profit organisations and social enterprises** with international reach.",
            "**Peer Network:** The programme's **small cohort size** fosters exceptionally strong lifelong peer relationships.",
            "**Alumni Events:** Regular **networking events in Hong Kong, London, New York, and Singapore** facilitate global connections."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Entrance Scholarships:** High-achieving HKDSE students automatically considered for **full and half tuition scholarships**.",
            "**Exchange Grants:** **Dedicated funding** available to support living expenses during the mandatory overseas semester.",
            "**Leadership Awards:** Scholarships for students demonstrating **exceptional leadership** in school or community activities.",
            "**Need-Based Support:** **SFAA grants and loans** plus HKU's own bursary schemes for eligible local students.",
            "**Corporate Sponsorships:** Selected students may receive **sponsorships from partner companies** during their studies."
          ]
        },
        tips: {
          title: "Application Tips",
          content: [
            "**English Proficiency:** A strong English result is **critical**; consider taking **IELTS** if aiming for exchange programmes early.",
            "**Leadership Evidence:** Highlight **positions of responsibility** such as prefect, club chairperson, or team captain in your application.",
            "**Global Awareness:** Demonstrate **interest in international affairs** through Model UN, debate, or global volunteer work.",
            "**Band A Strategy:** Place IBGM in **Band A Choice 1 or 2**; it is unlikely to admit from lower bands.",
            "**Backup Planning:** Consider **BBA(Law) or BBA(Information Systems)** as related alternatives within the Business School."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "**文憑試成績：** 英國語文及數學（必修部分）最低達第5級；英國語文達5**級者**強烈優先考慮**。",
            "**核心科目：** 中國語文及通識教育／公民與社會發展須達第4級或以上。",
            "**選修科彈性：** 無特定選修科要求，但修讀**經濟或企業、會計與財務概論（BAFS）**較為有利。",
            "**科目比重：** 英國語文佔**雙倍比重**；數學佔**1.5倍比重**。",
            "**中位分數：** 具競爭力的申請者通常達**33–36分**（最佳五科計比重後）。"
          ]
        },
        curriculum: {
          title: "課程特色",
          content: [
            "**全球視野：** 課程從第一年起即強調**跨文化管理、國際貿易及全球策略**。",
            "**語言要求：** 學生須達至**第二外語的中級水平**（如法文、西班牙文、日文或普通話）。",
            "**海外交流：** 保證**一個學期的海外交流**，夥伴院校包括倫敦政經、華頓商學院或歐洲工商管理學院。",
            "**個案教學法：** 大量採用**哈佛式個案研究**，培養分析及決策能力。",
            "**領導培訓：** 設有專門的**領導力工作坊及跨國企業團隊顧問項目**。"
          ]
        },
        career: {
          title: "就業前景",
          content: [
            "**管理顧問：** 畢業生深受**麥肯錫、波士頓顧問公司及貝恩**青睞，因其具備全球視野。",
            "**跨國企業：** 不少畢業生加入**財富500強企業**的亞太區管理培訓生計劃。",
            "**創業精神：** 課程培養具備**國際商業觸覺的初創企業創辦人**。",
            "**升學進修：** 熱門碩士目的地包括**倫敦商學院、歐洲工商管理學院及哥倫比亞商學院**。",
            "**平均起薪：** 管理培訓生職位起薪約為**每月30,000–45,000港元**。"
          ]
        },
        campus: {
          title: "校園及設施",
          content: [
            "**主校園：** 主要於**香港大學主校園**上課，教學設施現代化。",
            "**數碼港分部：** 部分研討會及企業活動於**數碼港學術中心**舉行。",
            "**協作空間：** 配備視像會議設備的**24小時小組研習室及創新實驗室**，方便全球團隊項目。",
            "**語言中心：** 可使用**香港大學語言中心**的密集外語課程及認證。",
            "**學生活動：** 超過**100個學生團體**，包括國際商業學會及顧問學會。"
          ]
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "**取錄率：** 篩選嚴格，聯招估計**取錄率僅6–9%**。",
            "**學額規模：** 每年約**50–60個聯招學額**，競爭者超過**1,200人**。",
            "**非聯招：** 約**35–40%學生**透過國際學歷及其他非聯招計劃入學。",
            "**全面評審：** 取錄除學業成績外，亦考慮**領導經驗、課外活動成就及面試表現**。",
            "**基準：** 成功申請者通常於英國語文科位列**文憑試考生首3%**。"
          ]
        },
        alumni: {
          title: "傑出校友及網絡",
          content: [
            "**顧問合夥人：** 校友已晉升至**環球大型顧問公司的合夥人級別**。",
            "**企業高管：** 畢業生於亞洲、歐洲及北美**跨國企業擔任行政總裁等高層職位**。",
            "**社會影響：** 部分校友領導**具國際影響力的非牟利機構及社會企業**。",
            "**同儕網絡：** 課程**小班規模**促成異常緊密的終身同儕關係。",
            "**校友活動：** 定期於**香港、倫敦、紐約及新加坡**舉辦聯誼活動，促進全球聯繫。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**入學獎學金：** 文憑試成績優異者自動獲考慮**全額或半額學費獎學金**。",
            "**交流資助：** 設有**專項資助**，支援強制海外學期的生活開支。",
            "**領導獎項：** 為於學校或社區活動展現**卓越領導力**的學生設立獎學金。",
            "**經濟支援：** 合資格本地學生可申請**學資處助學金及貸款**，以及港大本身的助學計劃。",
            "**企業贊助：** 獲選學生於就學期間可獲**夥伴公司贊助**。"
          ]
        },
        tips: {
          title: "申請貼士",
          content: [
            "**英語能力：** 優異的英語成績**至關重要**；如計劃早期參與交流，可考慮報考**雅思**。",
            "**領導證明：** 於申請中突顯**擔任責任職位**的經驗，如領袖生、學會主席或隊長。",
            "**全球意識：** 透過**模擬聯合國、辯論或國際義工服務**展示對國際事務的興趣。",
            "**Band A策略：** 將IBGM放於**Band A第1或第2志願**；較低志願獲取錄機會甚微。",
            "**後備計劃：** 可考慮**工商管理學學士（法學）或工商管理學學士（資訊系統）**作為相關替代選擇。"
          ]
        }
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch I...");
  for (const prog of PROGRAMME_DETAILS) {
    await JupasProgrammeService.upsertProgrammeDetails(prog);
    console.log(`[Seed] ✓ Success: ${prog.code}`);
  }
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
