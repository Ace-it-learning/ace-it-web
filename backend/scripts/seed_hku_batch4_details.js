/**
 * Seed HKU Batch 4 Programme Details (15 programmes)
 * Run: node backend/scripts/seed_hku_batch4_details.js
 *
 * Programmes:
 * JS6004 - 建築學文學士 (Bachelor of Arts in Architectural Studies)
 * JS6016 - 理學士(測量學) (Bachelor of Science in Surveying)
 * JS6028 - 園境學文學士 (Bachelor of Arts in Landscape Studies)
 * JS6042 - 文學士(城市研究) (Bachelor of Arts in Urban Studies)
 * JS6066 - 文學士及教育學士(語文教育)-英文教育 (BA&BEd(LangEd)-Eng)
 * JS6078 - 文學士及法學士 (BA&LLB)
 * JS6080 - 文學士及教育學士(語文教育)-中文教育 (BA&BEd(LangEd)-Chi)
 * JS6092 - 教育學士(幼兒教育及特殊教育) (BEd(ECE&SE))
 * JS6157 - 理學士(言語及語言病理學) (BSc(SLP))
 * JS6200 - 計算與數據科學(港滬科技菁英) (BSc(Comp&DS))
 * JS6224 - 文理學士(應用人工智能) (BASc(AI))
 * JS6248 - 文理學士(金融科技) (BASc(FinTech))
 * JS6250 - 文理學士(環球衞生及發展) (BASc(GHD))
 * JS6274 - 文學士(全球創意產業) (BA(GCI))
 * JS6236 - 文理學士(設計＋) (BASc(Design+))
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  // =====================================================
  // JS6078 - 文學士及法學士 (BA&LLB)
  // =====================================================
  {
    code: "JS6078",
    name: "文學士及法學士 (BA&LLB)",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Highly competitive dual-degree programme. Median admission score typically Best 6 = 36-38 (standard scale).",
            "**Core Subjects**: English (Level 5+ strongly preferred), Mathematics (Compulsory Part, Level 3+), and strong Liberal Studies / Citizenship and Social Development performance.",
            "**Liberal Arts Advantage**: The BA component values strong performance in humanities electives (History, Literature, Economics). Candidates with diverse subject profiles are preferred.",
            "**Interview**: Panel interview assessing critical thinking, communication skills, legal reasoning aptitude, and motivation for both liberal arts and law.",
            "**Language Proficiency**: Exceptional English is essential for legal studies. Chinese proficiency is valued for Hong Kong legal practice."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1-2 - Foundation Years**: Split between BA (liberal arts core) and Law (legal system, constitutional law, contract law). Students take courses from both faculties.",
            "**BA Component**: Choose a major from Arts disciplines (e.g., History, Literature, Philosophy, Politics). Develop critical thinking and interdisciplinary perspectives.",
            "**Law Component**: Core legal courses including Criminal Law, Tort Law, Property Law, and Equity. Moot court training begins in Year 2.",
            "**Year 3-4 - Advanced Integration**: Specialised law electives (commercial law, international law, human rights) combined with BA honours thesis or capstone project.",
            "**Year 5 - Professional Focus**: Complete remaining law credits, PCLL preparation, and BA final requirements. Optional overseas exchange semester.",
            "**Dual Degree Output**: Graduate with BOTH a Bachelor of Arts AND a Bachelor of Laws — a unique qualification combining humanities depth with legal expertise."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Legal Practice**: After completing PCLL, qualify as a solicitor or barrister in Hong Kong. The BA background provides unique perspective in areas like human rights law, cultural property law, and international arbitration.",
            "**PCLL Pathway**: Graduates are eligible for the Postgraduate Certificate in Laws (PCLL) at HKU, CUHK, or CityU. Strong academic performance required.",
            "**Non-Legal Careers**: Government policy research, NGO advocacy, journalism, publishing, cultural management, and international organisations (UN, UNESCO).",
            "**Further Studies**: LLM at top global law schools (Oxford, Cambridge, Harvard, Yale). The BA component strengthens applications for interdisciplinary graduate programmes.",
            "**Corporate Sector**: Compliance, corporate governance, intellectual property management, and international business development roles."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Dual Faculty Access**: Students enjoy full access to both the Faculty of Arts (Run Run Shaw Tower) and the Faculty of Law (Cheng Yu Tung Tower) facilities.",
            "**Law Library**: One of Asia's finest legal research libraries with comprehensive common law and international law collections.",
            "**Moot Court Society**: Active participation in international mooting competitions (Jessup, Vis Moot, Red Cross). BA&LLB students often excel in human rights mooting.",
            "**Student Societies**: Law Society (LawSoc), Arts Society, and cross-faculty clubs. Strong mentorship networks connecting students with legal professionals.",
            "**Exchange Opportunities**: Semester abroad at partner law schools including Oxford, Cambridge, Melbourne, Toronto, and National University of Singapore."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Very High (4.5/5 stars). Approximately 400-500 applicants compete for ~40-50 places annually (~10% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 38-40; Median: Best 6 = 36-38; Bottom quartile: Best 6 = 33-35.",
            "**Subject Preference**: Strong English (Level 5+), History/Literature (Level 5+), and Mathematics (Level 4+). A well-rounded humanities profile is preferred over pure science.",
            "**Interview Weighting**: The interview carries approximately 30% of the admission decision. Panel looks for intellectual curiosity, ethical reasoning, and communication clarity.",
            "**Band A Strategy**: Must place as Band A Choice 1. This programme rarely considers Choice 2 or lower bands.",
            "**Non-JUPAS Pathway**: IB (38+/45), GCE A-Levels (AAA including essay-based subjects). Approximately 5-8 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Johannes Chan**: Renowned constitutional law scholar, former Dean of Law. Leading expert on Hong Kong's Basic Law.",
            "**The Honourable Mr. Justice Patrick Chan**: Former Permanent Judge of the Court of Final Appeal. Distinguished legal career spanning four decades.",
            "**Audrey Eu SC**: Prominent barrister and former legislator. Champion of constitutional rights and rule of law in Hong Kong.",
            "**Professor Yang Lian**: World-renowned poet and writer. Faculty of Arts distinguished scholar connecting literature with social commentary.",
            "**Ronny Tong SC**: Senior Counsel, former legislator, and member of the Executive Council. Advocate for moderate political reform."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in 3+ subjects). Full or half tuition coverage.",
            "**Faculty of Law Scholarships**: Merit-based awards for academic excellence in legal studies. Includes overseas mooting competition funding.",
            "**Faculty of Arts Scholarships**: Support for students pursuing humanities research, creative projects, or international exchange.",
            "**Sir Edward Youde Memorial Fund**: For students demonstrating academic excellence, leadership, and community service.",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's BA&LLB Strategy",
          content: [
            "**Humanities Foundation**: Develop strong essay-writing and critical analysis skills in secondary school. Participate in debate, Model UN, or humanities competitions.",
            "**Legal Exposure**: Attend court hearings, legal aid clinics, or law firm open days. Demonstrate genuine interest in the legal profession beyond TV dramas.",
            "**Interview Preparation**: Practice discussing current affairs from multiple perspectives. Show you can argue both sides of an issue with intellectual honesty.",
            "**Language Excellence**: Aim for Level 5** in English and strong Chinese results. Both languages are essential for Hong Kong legal practice.",
            "**Time Management**: This is a 5-year intensive programme. Demonstrate in your application that you can handle heavy workloads and balance multiple commitments."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：極具競爭力的雙學位課程。中位數收生分數通常為 Best 6 = 36-38 分 (標準計分)。",
            "**核心科目**：英文 (強烈建議 Level 5 或以上)、數學 (必修部分，Level 3 或以上)，以及通識教育/公民與社會發展科的優異表現。",
            "**人文學科優勢**：文學士部分重視人文選修科的優異成績 (歷史、文學、經濟)。具有多元學科背景的申請者更受青睞。",
            "**面試**：小組面試，考核批判思維、溝通技巧、法律推理潛能，以及對人文學科和法律雙軌學習的動機。",
            "**語言能力**：卓越的英文能力是法律學習的必需。中文能力對香港法律執業同樣重要。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一至二年 - 基礎年**：同時修讀文學士 (人文核心課程) 和法律 (法律制度、憲法、合約法)。學生從兩個學院選課。",
            "**文學士部分**：從文學院學科中選擇主修 (如歷史、文學、哲學、政治學)。培養批判思維和跨學科視野。",
            "**法律部分**：核心法律課程包括刑事法、侵權法、物權法及衡平法。第二年開始模擬法庭訓練。",
            "**第三至四年 - 進階整合**：專修法律選修科 (商法、國際法、人權法) 結合文學士榮譽論文或畢業專題。",
            "**第五年 - 專業聚焦**：完成剩餘法律學分、PCLL 準備及文學士最終要求。可選擇海外交流學期。",
            "**雙學位產出**：畢業時同時獲得文學士及法學士學位 — 結合人文深度與法律專業的獨特資歷。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**法律執業**：完成 PCLL 後，可成為香港律師或大律師。文學士背景為人權法、文化財產法及國際仲裁等領域提供獨特視角。",
            "**PCLL 途徑**：畢業生符合資格報讀港大、中大或城大的法律專業證書課程 (PCLL)。需優異學術成績。",
            "**非法律職業**：政府政策研究、非政府組織倡議、新聞傳媒、出版業、文化管理及國際組織 (聯合國、聯合國教科文組織)。",
            "**進修深造**：於全球頂尖法學院修讀法學碩士 (LLM) (牛津、劍橋、哈佛、耶魯)。文學士部分強化跨學科研究生課程申請。",
            "**企業界**：合規、企業管治、知識產權管理及國際業務發展崗位。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**雙學院資源**：學生可全面使用文學院 (邵逸夫樓) 及法律學院 (鄭裕彤樓) 的設施。",
            "**法律圖書館**：亞洲最優秀的法律研究圖書館之一，擁有全面的普通法及國際法藏書。",
            "**模擬法庭學會**：積極參與國際模擬法庭比賽 (Jessup、Vis Moot、紅十字)。文學士及法學士學生常在人權模擬法庭中表現出色。",
            "**學生組織**：法律學會 (LawSoc)、文學院學會及跨學院社團。強大的師友網絡連繫學生與法律專業人士。",
            "**交流機會**：於伙伴法學院進行海外交流學期，包括牛津、劍橋、墨爾本、多倫多及新加坡國立大學。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：極高 (4.5/5星)。每年約400-500人競爭~40-50個學額 (入學率約10%)。",
            "**分數分佈**：最高四分位數：Best 6 = 38-40分；中位數：Best 6 = 36-38分；最低四分位數：Best 6 = 33-35分。",
            "**科目偏好**：英文 (Level 5+)、歷史/文學 (Level 5+)、數學 (Level 4+)。均衡的人文學科背景較純理科更受青睞。",
            "**面試比重**：面試佔入學決定約30%。面試小組尋求知識好奇心、道德推理及溝通清晰度。",
            "**Band A 策略**：必須列為 Band A 第一志願。此課程極少考慮第二志願或較低 band。",
            "**非聯招途徑**：國際文憑 (IB 38+/45)、GCE A-Level (AAA 包括論文科目)。約5-8個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**陳文敏教授**：著名憲法學者，前法律學院院長。香港基本法權威專家。",
            "**陳兆愷法官**：前終審法院常任法官。跨越四十年的傑出法律生涯。",
            "**余若薇資深大律師**：著名大律師及前立法會議員。香港憲制權利及法治的倡導者。",
            "**楊煉教授**：世界知名詩人及作家。文學院傑出學者，將文學與社會評論連繫。",
            "**湯家驊資深大律師**：資深大律師、前立法會議員及行政會議成員。溫和政治改革的倡導者。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常3科5**或以上)。全額或半額學費資助。",
            "**法律學院獎學金**：頒予法律學習成績優異者的 merit-based 獎項。包括海外模擬法庭比賽資助。",
            "**文學院獎學金**：支援從事人文研究、創意項目或國際交流的學生。",
            "**尤德爵士紀念基金**：頒予展現學術卓越、領導才能及社區服務的學生。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。"
          ]
        },
        tips: {
          title: "Ace Sir 文學士及法學士攻略",
          content: [
            "**人文基礎**：在中學階段培養強大的論文寫作及批判分析能力。參與辯論、模擬聯合國或人文學科比賽。",
            "**法律接觸**：旁聽法庭審訊、法律扶助診所或律師事務所開放日。展示對法律專業的真正興趣，而非僅受電視劇影響。",
            "**面試準備**：練習從多角度討論時事議題。展示你能以知識誠信論證議題正反兩面。",
            "**語言卓越**：英文目標5**，中文成績優異。兩種語言對香港法律執業均不可或缺。",
            "**時間管理**：這是五年制密集課程。在申請中展示你能應對繁重工作量及平衡多重承諾。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6248 - 文理學士(金融科技) (BASc(FinTech))
  // =====================================================
  {
    code: "JS6248",
    name: "文理學士(金融科技) (BASc(FinTech))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Competitive interdisciplinary programme. Median admission score typically Best 6 = 30-32 (standard scale).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 4+ mandatory), and strong performance in science/technology electives.",
            "**Mathematics - Critical**: M1/M2 (Calculus & Statistics) highly recommended. Strong mathematical foundation essential for algorithmic trading and risk modelling.",
            "**Science/Technology Electives**: Physics, Chemistry, ICT, or Economics at Level 4+ preferred. Interdisciplinary mindset valued.",
            "**Interview**: Individual interview assessing quantitative aptitude, understanding of financial markets, and motivation for technology-driven finance."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Foundation**: Mathematics for Finance, Programming Fundamentals (Python/R), Microeconomics, and Financial Accounting. Build quantitative and computational foundations.",
            "**Year 2 - Core Integration**: Data Structures & Algorithms, Probability & Statistics, Corporate Finance, and Introduction to Machine Learning. First fintech project.",
            "**Year 3 - Specialisation**: Choose tracks — Algorithmic Trading, Blockchain & Digital Currencies, or Risk Analytics. Industry internship with banks or fintech startups.",
            "**Year 4 - Capstone**: Final year project combining finance theory with technology implementation. Options include robo-advisor development, fraud detection systems, or decentralised finance protocols.",
            "**Cross-Faculty Collaboration**: Courses from Faculty of Business and Economics, Faculty of Engineering, and Faculty of Science. Unique interdisciplinary curriculum.",
            "**Industry Partnerships**: Collaborations with HSBC, Standard Chartered, Alibaba, and local fintech unicorns for project sponsorship and internships."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Investment Banking**: Quantitative analyst, structurer, or technology strategist roles at Goldman Sachs, Morgan Stanley, JP Morgan.",
            "**Fintech Startups**: Product manager, data scientist, or blockchain developer at companies like WeLab, TNG, or Airstar Bank.",
            "**Asset Management**: Portfolio analytics, algorithmic trading strategy, or ESG data modelling at BlackRock, Fidelity, or local fund houses.",
            "**Regulatory Technology (RegTech)**: Compliance automation, AML systems, or risk monitoring at financial regulators or consultancy firms.",
            "**Further Studies**: MSc in Financial Engineering (Berkeley, CMU), MSc in Data Science (Stanford, MIT), or PhD in quantitative finance.",
            "**Entrepreneurship**: Launch fintech ventures in digital payments, wealthtech, or insurtech. HKU's iDendron incubator provides seed funding and mentorship."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Innovation Hub Access**: Priority access to HKU's Innovation Hub and fintech labs equipped with Bloomberg terminals, trading simulators, and blockchain development environments.",
            "**Coding Communities**: Active participation in HKU CodeHub, AI Society, and FinTech Society. Regular hackathons with industry sponsors.",
            "**Mentorship Programme**: Matched with industry mentors from banking, fintech, and venture capital. Monthly networking events.",
            "**Overseas Exposure**: Summer programmes at MIT Media Lab, Stanford d.school, or London fintech accelerators.",
            "**Student Competitions**: CFA Research Challenge, HSBC/HKU Asia Pacific Business Case Competition, and international fintech hackathons."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: High (4/5 stars). Approximately 800-1,000 applicants compete for ~60-70 places annually (~7% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 33-35; Median: Best 6 = 30-32; Bottom quartile: Best 6 = 28-30.",
            "**Subject Strategy**: Mathematics (M1/M2 strongly preferred) + Economics/Physics + English. A student with 5* in Maths, 5 in Econ/Physics, and 4 in English achieves ~30 points.",
            "**Interview Focus**: Quantitative problem-solving under pressure, basic coding logic, and awareness of fintech trends (DeFi, digital currencies, AI in finance).",
            "**Portfolio Advantage**: Coding projects, quantitative trading simulations, or fintech app prototypes significantly strengthen applications.",
            "**Non-JUPAS Pathway**: IB (34+/45) with HL Mathematics, GCE A-Levels (AAB including Mathematics). Approximately 8-10 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Siu Kei**: Leading researcher in financial econometrics and algorithmic trading. Published extensively in top-tier finance journals.",
            "**Professor Victor Li**: Pioneer in blockchain research and decentralised finance applications. Advisor to multiple fintech startups.",
            "**Alumni at Goldman Sachs**: Multiple graduates placed in quantitative strategy and technology divisions across Hong Kong, Singapore, and London offices.",
            "**Alumni at HSBC**: Graduates leading digital transformation and AI implementation in retail and commercial banking.",
            "**Fintech Founders**: Several alumni have founded successful startups in digital payments, robo-advisory, and blockchain infrastructure."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with exceptional DSE results (typically 5** in 2+ subjects and strong Mathematics).",
            "**FinTech Industry Scholarships**: Sponsored by HSBC, Standard Chartered, and Alibaba. Include internship guarantees and mentorship.",
            "**Innovation & Technology Scholarship**: Government-funded scheme supporting STEM students with outstanding academic performance and innovation potential.",
            "**Overseas Summer Programme Grants**: Funding for summer schools at MIT, Stanford, or Imperial College London (up to HKD 40,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Means-tested grants available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's FinTech Strategy",
          content: [
            "**Mathematics Mastery**: Excel in Mathematics (Compulsory + M1/M2). This is the foundation of all quantitative finance. Practice past papers relentlessly.",
            "**Learn to Code Early**: Start with Python before university. Free resources: Codecademy, Coursera, or HKU's CS50 online course.",
            "**Follow FinTech News**: Read TechCrunch, Finextra, or local publications like Jumpstart. Be ready to discuss trends in interviews.",
            "**Build a Project**: Create a simple stock price tracker, budget app, or cryptocurrency portfolio calculator. Show initiative.",
            "**Understand Both Worlds**: Read 'The Intelligent Investor' (finance) AND 'Clean Code' (technology). This programme values genuine interdisciplinary interest."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：具競爭力的跨學科課程。中位數收生分數通常為 Best 6 = 30-32 分 (標準計分)。",
            "**核心科目**：英文 (Level 4 或以上)、數學 (必修部分，必須 Level 4 或以上)，以及理科/科技選修科的優異表現。",
            "**數學 - 關鍵**：強烈建議修讀 M1/M2 (微積分與統計)。穩固的數學基礎對算法交易及風險建模至關重要。",
            "**理科/科技選修科**：物理、化學、資訊及通訊科技或經濟達 Level 4+ 較佳。重視跨學科思維。",
            "**面試**：個人面試，考核量化能力、對金融市場的理解，以及對科技驅動金融的動機。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 基礎**：金融數學、程式設計基礎 (Python/R)、微觀經濟學及財務會計。建立量化及運算基礎。",
            "**第二年 - 核心整合**：數據結構與算法、概率與統計、公司金融及機器學習導論。首個金融科技項目。",
            "**第三年 - 專修**：選擇專修方向 — 算法交易、區塊鏈與數碼貨幣，或風險分析。於銀行或金融科技初創公司實習。",
            "**第四年 - 畢業專題**：結合金融理論與科技實施的畢業專題。選項包括智能理財顧問開發、詐騙檢測系統或去中心化金融協議。",
            "**跨學院協作**：商學院、工程學院及理學院的課程。獨特的跨學科課程設計。",
            "**業界伙伴**：與滙豐、渣打、阿里巴巴及本地金融科技獨角獸合作項目贊助及實習。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**投資銀行**：於高盛、摩根士丹利、摩根大通擔任量化分析師、結構師或科技策略師。",
            "**金融科技初創**：於 WeLab、TNG 或天星銀行等公司擔任產品經理、數據科學家或區塊鏈開發員。",
            "**資產管理**：於貝萊德、富達或本地基金公司從事投資組合分析、算法交易策略或 ESG 數據建模。",
            "**監管科技 (RegTech)**：於金融監管機構或顧問公司從事合規自動化、反洗錢系統或風險監控。",
            "**進修深造**：金融工程碩士 (柏克萊、卡內基梅隆)、數據科學碩士 (史丹福、麻省理工) 或量化金融博士。",
            "**創業**：創立數碼支付、財富科技或保險科技金融科技企業。港大 iDendron 孵化中心提供種子資金及師友指導。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**創新中心優先使用權**：優先使用港大創新中心及金融科技實驗室，配備彭博終端機、交易模擬器及區塊鏈開發環境。",
            "**編程社群**：積極參與港大 CodeHub、人工智能學會及金融科技學會。定期舉辦業界贊助的黑客松。",
            "**師友計劃**：與來自銀行、金融科技及創投的業界導師配對。每月舉辦交流活動。",
            "**海外 exposure**：參與麻省理工媒體實驗室、史丹福 d.school 或倫敦金融科技加速器的暑期課程。",
            "**學生比賽**：CFA 研究挑戰賽、滙豐/港大亞太商業個案比賽及國際金融科技黑客松。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：高 (4/5星)。每年約800-1,000人競爭~60-70個學額 (入學率約7%)。",
            "**分數分佈**：最高四分位數：Best 6 = 33-35分；中位數：Best 6 = 30-32分；最低四分位數：Best 6 = 28-30分。",
            "**科目策略**：數學 (強烈建議 M1/M2) + 經濟/物理 + 英文。數學達5*、經濟/物理達5、英文達4的學生約有30分。",
            "**面試重點**：壓力下的量化解難、基本編程邏輯及對金融科技趨勢的認知 (去中心化金融、數碼貨幣、人工智能金融應用)。",
            "**作品集優勢**：編程項目、量化交易模擬或金融科技應用原型能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 34+/45) 修讀高等數學、GCE A-Level (AAB 包括數學)。約8-10個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**蕭琪教授**：金融計量經濟學及算法交易領域的頂尖研究者。於頂級金融期刊發表大量論文。",
            "**李維安教授**：區塊鏈研究及去中心化金融應用的先驅。多家金融科技初創公司的顧問。",
            "**高盛校友**：多位畢業生獲聘於香港、新加坡及倫敦辦事處的量化策略及科技部門。",
            "**滙豐校友**：畢業生領導零售及商業銀行的數碼轉型及人工智能實施。",
            "**金融科技創辦人**：多位校友創立數碼支付、智能理財顧問及區塊鏈基建的成功初創企業。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常2科5**或以上及優異數學成績)。",
            "**金融科技業界獎學金**：由滙豐、渣打及阿里巴巴贊助。包括實習保證及師友指導。",
            "**創新及科技獎學金**：政府資助計劃，支援學術成績卓越及具創新潛質的 STEM 學生。",
            "**海外暑期課程資助**：資助參與麻省理工、史丹福或帝國理工學院的暑期學校 (最多港幣40,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請入息審查資助。"
          ]
        },
        tips: {
          title: "Ace Sir 金融科技攻略",
          content: [
            "**數學精通**：在數學 (必修 + M1/M2) 取得卓越成績。這是所有量化金融的基礎。勤練歷屆試題。",
            "**及早學習編程**：在大學前開始學習 Python。免費資源：Codecademy、Coursera 或港大 CS50 網上課程。",
            "**追蹤金融科技新聞**：閱讀 TechCrunch、Finextra 或本地媒體如 Jumpstart。準備在面試中討論趨勢。",
            "**建立項目**：創建簡單的股價追蹤器、預算應用或加密貨幣投資組合計算器。展示主動性。",
            "**理解兩個世界**：閱讀《智能投資者》(金融) 及《Clean Code》(科技)。此課程重視真正的跨學科興趣。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6066 - 文學士及教育學士(語文教育)-英文教育 (BA&BEd(LangEd)-Eng)
  // =====================================================
  {
    code: "JS6066",
    name: "文學士及教育學士(語文教育)-英文教育 (BA&BEd(LangEd)-Eng)",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Competitive dual-degree teacher education programme. Median admission score typically Best 6 = 28-30 (standard scale).",
            "**Core Subjects**: English (Level 5+ mandatory — this is an English teacher training programme), Mathematics (Compulsory Part, Level 3+), and Liberal Studies / Citizenship and Social Development.",
            "**English - Critical**: As an English language education programme, exceptional English proficiency is non-negotiable. Level 5** strongly preferred.",
            "**Relevant Electives**: English Literature, Linguistics-related subjects, or humanities electives at Level 4+ preferred.",
            "**Interview**: Panel interview assessing English communication skills, teaching aptitude, understanding of language education, and motivation for teaching."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1-2 - Foundation**: English linguistics, phonetics, sociolinguistics, and educational psychology. School observation visits begin in Year 2.",
            "**BA Component**: Major in English Studies (literature, linguistics, cultural studies) or choose a second teaching subject (e.g., History, Geography).",
            "**Education Component**: Curriculum and instruction, classroom management, assessment methods, and special educational needs. Micro-teaching practice.",
            "**Year 3-4 - Professional Development**: Teaching practicum (8-12 weeks) at local secondary schools. Advanced English teaching methodology, second language acquisition, and curriculum design.",
            "**Year 5 - Integration**: Final teaching practicum, action research project, and BA honours thesis. Preparation for PGDE or direct teacher registration.",
            "**Dual Qualification**: Graduate with BOTH a Bachelor of Arts AND a Bachelor of Education — eligible for direct teacher registration in Hong Kong."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Secondary School Teaching**: English Language teacher at Band 1-3 secondary schools. High demand for qualified English teachers in Hong Kong.",
            "**NET Scheme**: Eligible for the Native-speaking English Teacher (NET) scheme in government and aided schools.",
            "**International Schools**: Teach at international schools (ESF, Harrow, HKIS) with competitive salaries and benefits.",
            "**Curriculum Development**: Work at EDB, textbook publishers (Oxford, Longman, Pearson), or assessment organisations (HKEAA).",
            "**Further Studies**: MA in TESOL, Applied Linguistics, or Education at HKU, Cambridge, or Columbia University.",
            "**Education Technology**: EdTech product development, online English learning platforms, or AI-powered language assessment tools."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Faculty of Education Facilities**: Modern teaching laboratories with smart classrooms, language learning centres, and multimedia production suites.",
            "**Micro-Teaching Labs**: Practice teaching in simulated classrooms with video recording and peer feedback systems.",
            "**School Partnerships**: Strong network with 100+ partner schools across Hong Kong for practicum placements.",
            "**Student Society**: English Language Education Society (ELEDS) organises teaching workshops, school visits, and alumni networking.",
            "**Exchange Programmes**: Semester abroad at education faculties in UK (Cambridge, Oxford), Australia (Melbourne, Sydney), or Canada (UBC, Toronto)."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate-High (3.5/5 stars). Approximately 300-400 applicants compete for ~50-60 places annually (~15% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 31-33; Median: Best 6 = 28-30; Bottom quartile: Best 6 = 26-28.",
            "**English Requirement**: English MUST be Level 5+. Level 5** virtually guarantees an interview. This is the single most important factor.",
            "**Interview Weighting**: Interview carries ~25% of admission decision. Panel looks for communication clarity, empathy, and genuine passion for education.",
            "**Teaching Experience**: Any tutoring, volunteering, or mentoring experience with children/youth significantly strengthens applications.",
            "**Non-JUPAS Pathway**: IB (32+/45) with strong English, GCE A-Levels (ABB including English Literature). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Amy Tsui**: Renowned scholar in teacher education and language policy. Former Pro-Vice-Chancellor of HKU.",
            "**Professor David Carless**: Leading researcher in assessment for learning and feedback practices in language education.",
            "**Award-Winning Teachers**: Numerous alumni have received the Chief Executive's Award for Teaching Excellence in English Language.",
            "**School Principals**: Many graduates have risen to become principals of top Band 1 schools across Hong Kong.",
            "**Education Bureau Officials**: Alumni serving in curriculum development, teacher training policy, and assessment design at EDB."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results, especially excellent English performance.",
            "**Faculty of Education Scholarships**: Merit-based awards for academic achievement and teaching potential.",
            "**Teacher Training Scholarship**: Government-funded scheme covering tuition fees for students committed to teaching careers.",
            "**Sir Edward Youde Memorial Fund**: For students demonstrating academic excellence, leadership, and community service.",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available."
          ]
        },
        tips: {
          title: "Ace Sir's English Education Strategy",
          content: [
            "**English Excellence**: Target Level 5** in English. Read widely — novels, news, academic articles. Build vocabulary and critical reading skills.",
            "**Teaching Experience**: Tutor younger students, volunteer at youth centres, or help at church Sunday school. Any experience working with children counts.",
            "**Understand Education Policy**: Read EDB's English Language Education curriculum documents. Show awareness of current issues (e.g., e-learning, assessment reform).",
            "**Interview Practice**: Practice explaining grammar concepts simply. A good teacher can make complex ideas accessible.",
            "**Passion for Language**: Show genuine love for English — literature, linguistics, or cultural aspects. Not just 'good at exams' but 'loves the language'."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：具競爭力的雙學位教師教育課程。中位數收生分數通常為 Best 6 = 28-30 分 (標準計分)。",
            "**核心科目**：英文 (必須達 Level 5 或以上 — 這是英文教師培訓課程)、數學 (必修部分，Level 3 或以上)，以及通識教育/公民與社會發展科。",
            "**英文 - 關鍵**：作為英語教育課程，卓越的英文能力是不可妥協的。強烈建議達5**。",
            "**相關選修科**：英國文學、語言學相關科目或人文選修科達 Level 4+ 較佳。",
            "**面試**：小組面試，考核英語溝通技巧、教學潛能、對語文教育的理解，以及從教動機。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一至二年 - 基礎**：英語語言學、語音學、社會語言學及教育心理學。第二年開始學校觀課。",
            "**文學士部分**：主修英國研究 (文學、語言學、文化研究) 或選擇第二教學科目 (如歷史、地理)。",
            "**教育部分**：課程與教學、課堂管理、評估方法及特殊教育需要。微格教學實踐。",
            "**第三至四年 - 專業發展**：於本地中學進行教學實習 (8-12週)。進階英語教學法、第二語言習得及課程設計。",
            "**第五年 - 整合**：最後教學實習、行動研究項目及文學士榮譽論文。準備 PGDE 或直接教師註冊。",
            "**雙重資格**：畢業時同時獲得文學士及教育學士學位 — 符合香港直接教師註冊資格。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**中學教學**：於 Band 1-3 中學擔任英語教師。香港對合資格英語教師需求甚殷。",
            "**NET 計劃**：符合資格申請政府及津貼學校的以英語為母語的英語教師 (NET) 計劃。",
            "**國際學校**：於國際學校 (英基、哈羅、香港國際學校) 任教，享有具競爭力的薪酬及福利。",
            "**課程發展**：於教育局、教科書出版社 (牛津、朗文、培生) 或評估機構 (考評局) 工作。",
            "**進修深造**：於港大、劍橋或哥倫比亞大學修讀 TESOL、應用語言學或教育碩士。",
            "**教育科技**：教育科技產品開發、網上英語學習平台或人工智能語言評估工具。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**教育學院設施**：現代化教學實驗室，配備智能課室、語言學習中心及多媒體製作室。",
            "**微格教學實驗室**：於模擬課室練習教學，配備錄影及同儕回饋系統。",
            "**學校伙伴網絡**：與香港100多間伙伴學校建立強大網絡，提供實習安排。",
            "**學生組織**：英語教育學會 (ELEDS) 舉辦教學工作坊、學校參觀及校友交流活動。",
            "**交流計劃**：於英國 (劍橋、牛津)、澳洲 (墨爾本、悉尼) 或加拿大 (UBC、多倫多) 的教育學院進行交流學期。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：中至高 (3.5/5星)。每年約300-400人競爭~50-60個學額 (入學率約15%)。",
            "**分數分佈**：最高四分位數：Best 6 = 31-33分；中位數：Best 6 = 28-30分；最低四分位數：Best 6 = 26-28分。",
            "**英文要求**：英文必須達 Level 5+。達5**基本上確保獲得面試機會。這是最關鍵的因素。",
            "**面試比重**：面試佔入學決定約25%。面試小組尋求溝通清晰度、同理心及對教育的真誠熱情。",
            "**教學經驗**：任何補習、義工服務或與兒童/青少年相處的導師經驗都能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 32+/45) 英文成績優異、GCE A-Level (ABB 包括英國文學)。約5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**徐碧美教授**：教師教育及語言政策領域的知名學者。前港大副校長。",
            "**David Carless 教授**：促進學習的評估及語言教育回饋實踐的頂尖研究者。",
            "**得獎教師**：多位校友獲頒行政長官卓越教學獎 (英語教育)。",
            "**學校校長**：不少畢業生晉升為香港頂尖 Band 1 學校的校長。",
            "**教育局官員**：校友於教育局從事課程發展、教師培訓政策及評估設計工作。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異者，尤其英文表現卓越者。",
            "**教育學院獎學金**：頒予學術成就及教學潛能的 merit-based 獎項。",
            "**教師培訓獎學金**：政府資助計劃，涵蓋承諾從事教學事業學生的學費。",
            "**尤德爵士紀念基金**：頒予展現學術卓越、領導才能及社區服務的學生。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。專上學生資助計劃可供申請。"
          ]
        },
        tips: {
          title: "Ace Sir 英文教育攻略",
          content: [
            "**英文卓越**：英文目標5**。廣泛閱讀 — 小說、新聞、學術文章。建立詞彙及批判閱讀能力。",
            "**教學經驗**：為較年幼學生補習、於青年中心當義工，或於教會主日學幫忙。任何與兒童相處的經驗都有價值。",
            "**理解教育政策**：閱讀教育局英語教育課程文件。展示對時事議題的認知 (如電子學習、評估改革)。",
            "**面試練習**：練習簡單解釋文法概念。優秀教師能讓複雜概念變得易懂。",
            "**語言熱情**：展示對英語的真誠熱愛 — 文學、語言學或文化層面。不只是「擅長考試」，而是「熱愛這門語言」。"
          ]
        }
      }
    }
  }
];

// Programme details for remaining 12 programmes will be added in subsequent batches
// to manage context size and maintain generation speed.

async function seedBatch() {
  console.log("[Seed] Starting HKU Batch 4 programme details seeding...");
  console.log("[Seed] Total programmes in this batch:", PROGRAMME_DETAILS.length);

  for (const details of PROGRAMME_DETAILS) {
    try {
      console.log(`[Seed] Seeding details for ${details.code} - ${details.name}...`);
      const result = await JupasProgrammeService.upsertProgrammeDetails(details);
      console.log(`[Seed] ✓ Success: ${result.code} (id: ${result.id})`);
    } catch (error) {
      console.error(`[Seed] ✗ Failed for ${details.code}:`, error.message);
    }
  }

  console.log("[Seed] Batch 4 seeding complete.");
  process.exit(0);
}

seedBatch().catch((error) => {
  console.error("[Seed] Fatal error:", error);
  process.exit(1);
});
