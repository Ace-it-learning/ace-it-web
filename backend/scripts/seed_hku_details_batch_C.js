const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  {
    code: "JS6987",
    nameZh: "工學學士（計算機工程／電機工程／電子工程）",
    nameEn: "BEng in Computer Engineering / Electrical Engineering / Electronic Engineering",
    university: "HKU",
    faculty: "工程學院",
    en: {
      sections: {
        admission: [
          "**JUPAS requirement:** Minimum Level 3 in English and Chinese, plus Level 2 in Mathematics and two electives.",
          "**Preferred subjects:** Mathematics (Extended Module 1 or 2) and Physics are highly recommended.",
          "**Admission score:** Median admission score typically ranges from 28–32 points in best 5 subjects.",
          "**Interview:** Selected applicants may be invited for a short admissions interview.",
          "**Non-JUPAS:** Strong performance in relevant GCE A-Level or IB science subjects is expected."
        ],
        curriculum: [
          "**3-in-1 structure:** Students share a common first year before choosing Computer, Electrical, or Electronic Engineering.",
          "**Core coverage:** Circuit theory, digital systems, programming, signals and systems, and electromagnetics.",
          "**Final-year project:** All students complete a capstone project, often with industry or research lab collaboration.",
          "**Accreditation:** Programme is accredited by the Hong Kong Institution of Engineers (HKIE).",
          "**Minor options:** Students may pursue minors in Business, Computer Science, or Mathematics."
        ],
        career: [
          "**Engineering firms:** Graduates join MTRCL, CLP, HK Electric, and major contractors.",
          "**Tech sector:** Roles in hardware design, embedded systems, and semiconductor companies.",
          "**Consulting:** Engineering consultancies such as Arup and AECOM recruit HKU graduates regularly.",
          "**Further study:** Many proceed to MPhil or PhD programmes at HKU or overseas.",
          "**Professional qualification:** HKIE accreditation supports progression to Chartered Engineer status."
        ],
        campus: [
          "**Main campus:** Classes are held at the HKU Main Campus in Pok Fu Lam.",
          "**Facilities:** Access to the Chow Yei Ching Building and new Tam Wing Fan Innovation Wing.",
          "**Labs:** Dedicated circuit labs, robotics workshops, and cleanroom facilities.",
          "**Library:** The Main Library and Cheng Yu Tung Tower provide extensive engineering collections.",
          "**Student life:** Active Engineering Society (HKUES) organises mentorship and outreach events."
        ],
        competitiveness: [
          "**Band A popularity:** Consistently one of the most applied-to engineering programmes at HKU.",
          "**Admission ratio:** Approximately 6–8 applicants per place in recent years.",
          "**Score threshold:** A best-5 score of 30+ is generally considered competitive for admission.",
          "**Alternative pathway:** Applicants may also consider JS6937 or JS6963 for related engineering options.",
          "**Scholarship linkage:** High scorers are automatically considered for entrance scholarships."
        ],
        alumni: [
          "**Industry leaders:** Alumni hold senior roles at Siemens, Huawei, and the HKSAR Electrical and Mechanical Services Department.",
          "**Entrepreneurs:** Several graduates have founded hardware startups in Shenzhen and Hong Kong.",
          "**Academia:** Notable alumni are faculty members at MIT, Stanford, and Imperial College London.",
          "**Professional bodies:** Many serve on HKIE committees and IEEE Hong Kong Section boards.",
          "**Mentorship network:** The Faculty runs a structured alumni mentorship programme for undergraduates."
        ],
        scholarships: [
          "**Entrance scholarships:** Automatic consideration for JUPAS applicants with 5** or above in best 5.",
          "**Faculty scholarships:** Dean’s Scholarships awarded to top-performing engineering admits.",
          "**Reaching Out Award:** Supports students with outstanding non-academic achievements.",
          "**Exchange grants:** Funding available for semester-abroad programmes via the University.",
          "**External awards:** Eligible for HSBC, CICF, and other donor-funded scholarships."
        ],
        tips: [
          "**Subject choice:** Taking Physics and M1/M2 significantly strengthens your application profile.",
          "**Interview prep:** Be ready to discuss why you prefer one engineering stream over the others.",
          "**First-year strategy:** Use the common year to explore all three streams before declaring your major.",
          "**Summer research:** Apply for URFP or faculty summer programmes to gain lab experience early.",
          "**Networking:** Attend HKU Engineering career fairs and alumni talks from Year 1 onwards."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS 入學要求：** 英國語文及中國語文達第 3 級，數學及兩科選修科達第 2 級。",
          "**建議選修科目：** 強烈建議修讀數學（延伸部分單元一或二）及物理。",
          "**收生成績：** 最佳五科中位數通常為 28–32 分。",
          "**面試安排：** 部分申請人或獲邀參加入學面試。",
          "**非聯招入學：** 相關 GCE A-Level 或 IB 理科成績優異者較具優勢。"
        ],
        curriculum: [
          "**三合一課程結構：** 首年共同課程，之後選修計算機工程、電機工程或電子工程。",
          "**核心涵蓋範圍：** 電路理論、數碼系統、編程、訊號與系統及電磁學。",
          "**畢業專題研究：** 所有學生須完成畢業專題項目，常與業界或研究實驗室合作。",
          "**專業認證：** 課程獲香港工程師學會（HKIE）認可。",
          "**副修選擇：** 學生可選修工商管理、計算機科學或數學副修。"
        ],
        career: [
          "**工程機構：** 畢業生加入港鐵、中電、港燈及大型承建商。",
          "**科技界：** 從事硬件設計、嵌入式系統及半導體公司相關職位。",
          "**顧問行業：** 奧雅納及艾奕康等工程顧問公司定期聘用港大畢業生。",
          "**深造途徑：** 不少畢業生繼續於港大或海外攻讀哲學碩士或博士課程。",
          "**專業資格：** HKIE 認可有助晉升為特許工程師。"
        ],
        campus: [
          "**主校園：** 課堂於薄扶林港大主校園進行。",
          "**設施：** 可使用周亦卿樓及新建譚榮芬創科翼。",
          "**實驗室：** 專用電路實驗室、機械人工作坊及無塵室設施。",
          "**圖書館：** 主圖書館及鄭裕彤教學樓提供豐富工程學藏書。",
          "**學生生活：** 活躍的港大工程學會（HKUES）舉辦師友計劃及外展活動。"
        ],
        competitiveness: [
          "**Band A 熱門程度：** 一直是港大最受歡迎的工程課程之一。",
          "**入學比例：** 近年每個學額約有 6–8 名申請人。",
          "**分數門檻：** 最佳五科達 30 分或以上一般被視為具競爭力。",
          "**替代途徑：** 申請人亦可考慮 JS6937 或 JS6963 等相關工程選項。",
          "**獎學金掛鉤：** 高分申請人將自動獲考慮入學獎學金。"
        ],
        alumni: [
          "**業界領袖：** 校友於西門子、華為及香港特區機電工程署擔任高層職位。",
          "**創業家：** 多名畢業生於深圳及香港創辦硬件初創企業。",
          "**學術界：** 知名校友於麻省理工、史丹福及帝國理工學院擔任教職。",
          "**專業團體：** 不少校友於 HKIE 委員會及 IEEE 香港分會董事會服務。",
          "**師友網絡：** 學院設有結構化校友師友計劃，支援本科生發展。"
        ],
        scholarships: [
          "**入學獎學金：** 聯招申請人最佳五科達 5** 或以上將自動獲考慮。",
          "**學院獎學金：** 頂尖工程學入學生可獲頒院長獎學金。",
          "**多元卓越獎學金：** 支援非學術成就傑出的學生。",
          "**交流資助：** 大學提供海外學期交流計劃資助。",
          "**校外獎項：** 符合資格申請滙豐、蔣震等捐贈獎學金。"
        ],
        tips: [
          "**選科策略：** 修讀物理及 M1／M2 能顯著提升申請優勢。",
          "**面試準備：** 須準備解釋為何偏好某一工程範疇。",
          "**首年規劃：** 利用共同課程年探索三個範疇，再決定主修。",
          "**暑期研究：** 盡早申請本科生研究獎學金計劃或學院暑期項目，累積實驗室經驗。",
          "**建立人脈：** 從第一年開始參加港大工程職業博覽及校友分享會。"
        ]
      }
    }
  },
  {
    code: "JS6937",
    nameZh: "環球工程與商業課程",
    nameEn: "Global Engineering and Business Programme",
    university: "HKU",
    faculty: "工程學院／商學院",
    en: {
      sections: {
        admission: [
          "**JUPAS requirement:** Level 3 in English and Chinese, Level 2 in Mathematics and two electives.",
          "**Subject preference:** Mathematics (Extended Module) and a science subject are strongly preferred.",
          "**Admission score:** Competitive applicants typically score 32–36 in best 5 subjects.",
          "**Interview:** Shortlisted candidates are assessed via a panel interview focusing on motivation and aptitude.",
          "**Dual admission:** Applicants must meet entry standards of both the Faculty of Engineering and the Business School."
        ],
        curriculum: [
          "**Dual-degree structure:** Students earn a BEng or BSc(Eng) alongside a BBA over five years.",
          "**Cross-faculty courses:** Core engineering modules are combined with finance, marketing, and management training.",
          "**International exchange:** A mandatory semester abroad at a partner business or engineering school.",
          "**Capstone integration:** Final-year project must bridge engineering and business disciplines.",
          "**Language requirement:** Additional language courses may be required to support global placement."
        ],
        career: [
          "**Tech consulting:** Graduates are recruited by McKinsey, BCG, and Accenture for technology strategy roles.",
          "**Product management:** Dual training suits PM roles at Google, Meta, and regional tech giants.",
          "**Investment banking:** Engineering-quant backgrounds are valued in front-office and risk teams.",
          "**Startups:** Alumni have launched ventures in fintech, greentech, and supply-chain technology.",
          "**Corporate leadership:** Fast-track management programmes at Swire, Jardines, and Hutchison."
        ],
        campus: [
          "**Dual-faculty access:** Students use facilities in both the Engineering Faculty and the K.K. Leung Building.",
          "**Innovation Wing:** Priority access to the Tam Wing Fan Innovation Wing for prototyping and testing.",
          "**Business labs:** Bloomberg terminals and case-study rooms support finance and analytics training.",
          "**Global lounge:** Dedicated space for exchange-return students and international cohort networking.",
          "**Student societies:** Active participation in both HKU Business Society and Engineering Society is encouraged."
        ],
        competitiveness: [
          "**Elite intake:** One of the most competitive cross-faculty programmes at HKU.",
          "**Admission ratio:** Roughly 10–12 applicants per available place.",
          "**Score benchmark:** A best-5 score of 34+ is typically required for a realistic offer.",
          "**Holistic review:** Strong extracurriculars and leadership evidence can offset marginal score differences.",
          "**Alternative pathways:** Consider JS6963 or JS6787 if scores fall slightly below the threshold."
        ],
        alumni: [
          "**C-suite leaders:** Alumni serve as executives at multinational engineering and technology conglomerates.",
          "**Venture capital:** Graduates have joined top-tier VC funds focusing on deep-tech investments.",
          "**Policy advisors:** Some alumni work in HKSAR innovation and technology policy units.",
          "**Academic paths:** A subset pursue MBAs at INSEAD, LBS, or Wharton after graduation.",
          "**Mentorship circles:** Structured alumni mentoring links each cohort with senior industry professionals."
        ],
        scholarships: [
          "**Full-tuition scholarships:** Top JUPAS scorers may receive full tuition plus living stipends.",
          "**Dean’s awards:** Separate Dean’s Scholarships from both Engineering and Business faculties.",
          "**Exchange bursaries:** Dedicated funding for the mandatory semester-abroad component.",
          "**Innovation grants:** Seed funding for student-led engineering-business startup ideas.",
          "**Corporate sponsorships:** Partner firms offer internship-linked scholarships from Year 2."
        ],
        tips: [
          "**Time management:** The five-year dual workload demands disciplined scheduling from Year 1.",
          "**Language skills:** Start preparing early for exchange destinations that require foreign-language proficiency.",
          "**Intern early:** Secure engineering and business internships across different summers to test career fit.",
          "**Leverage both faculties:** Build relationships with professors in Engineering and Business for joint references.",
          "**Stay flexible:** Keep an open mind about which engineering stream and business major to declare."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS 入學要求：** 英國語文及中國語文達第 3 級，數學及兩科選修科達第 2 級。",
          "**科目偏好：** 強烈偏好修讀數學（延伸部分）及理科科目。",
          "**收生成績：** 具競爭力的申請人最佳五科通常達 32–36 分。",
          "**面試安排：** 入圍考生須參加小組面試，評估動機及潛質。",
          "**雙學院入學：** 申請人須同時達到工程學院及商學院的入學標準。"
        ],
        curriculum: [
          "**雙學位結構：** 學生於五年內同時取得工學學士或工程科學學士及工商管理學士學位。",
          "**跨學院課程：** 核心工程科目結合金融、市場學及管理培訓。",
          "**國際交流：** 必須於夥伴商學院或工程學院進行一個學期海外交流。",
          "**畢業專題整合：** 畢業專題項目須橫跨工程及商業兩個範疇。",
          "**語言要求：** 或須修讀額外語言課程以支援海外實習安排。"
        ],
        career: [
          "**科技顧問：** 畢業生獲麥肯錫、波士頓諮詢及埃森哲聘用，從事科技策略職位。",
          "**產品管理：** 雙重訓練適合於 Google、Meta 及區域科技龍頭擔任產品經理。",
          "**投資銀行：** 工程量化背景於前線及風險團隊備受重視。",
          "**初創企業：** 校友於金融科技、綠色科技及供應鏈科技領域創業。",
          "**企業領導：** 太古、怡和及和記黃埔等企業的管理培訓生計劃。"
        ],
        campus: [
          "**雙學院設施：** 學生可使用工程學院及梁銶琚樓設施。",
          "**創科翼：** 優先使用譚榮芬創科翼進行原型製作及測試。",
          "**商學實驗室：** Bloomberg 終端機及個案研討室支援金融及分析培訓。",
          "**環球交誼廳：** 專為交流回港學生及國際學生網絡而設的空間。",
          "**學生會社：** 鼓勵同時積極參與港大商學會及工程學會活動。"
        ],
        competitiveness: [
          "**精英收生：** 港大最具競爭力的跨學院課程之一。",
          "**入學比例：** 每個學額約有 10–12 名申請人。",
          "**分數基準：** 最佳五科達 34 分或以上通常為實際取錄門檻。",
          "**全面評審：** 課外活動及領導才能證明可彌補分數上的輕微差距。",
          "**替代途徑：** 若分數稍低，可考慮 JS6963 或 JS6787。"
        ],
        alumni: [
          "**行政總裁級領袖：** 校友於跨國工程及科技集團擔任高層。",
          "**創投界：** 畢業生加入頂尖創投基金，專注深度科技投資。",
          "**政策顧問：** 部分校友於香港特區創新及科技政策單位工作。",
          "**學術路徑：** 部分畢業生於歐洲工商管理學院、倫敦商學院或沃頓商學院修讀 MBA。",
          "**師友圈子：** 結構化校友師友計劃將每屆學生與資深業界專業人士聯繫。"
        ],
        scholarships: [
          "**全額學費獎學金：** 頂尖聯招成績者或獲全額學費連生活津貼。",
          "**院長獎項：** 工程學院及商學院分別頒發院長獎學金。",
          "**交流助學金：** 專為必修海外交流學期提供資助。",
          "**創新資助：** 為學生主導的工程商業初創構思提供種子資金。",
          "**企業贊助：** 合作企業由第二年開始提供實習掛鉤獎學金。"
        ],
        tips: [
          "**時間管理：** 五年雙學位課程負擔繁重，須由第一年開始嚴謹規劃時間。",
          "**語言能力：** 盡早為需要外語能力的交流目的地作好準備。",
          "**盡早實習：** 於不同暑假爭取工程及商業實習，測試職業適配度。",
          "**善用雙學院資源：** 與工程及商學院教授建立關係，爭取聯合推薦信。",
          "**保持彈性：** 以開放態度選擇工程範疇及商業主修。"
        ]
      }
    }
  },
  {
    code: "JS6406",
    nameZh: "法學士",
    nameEn: "Bachelor of Laws (LLB)",
    university: "HKU",
    faculty: "法律學院",
    en: {
      sections: {
        admission: [
          "**JUPAS requirement:** Level 5** in English is typically expected; Level 3 in Chinese and Level 2 in Mathematics and electives.",
          "**Subject preference:** No mandatory electives, but strong essay-based subjects such as History or Economics are advantageous.",
          "**Admission score:** Median best-5 score usually exceeds 36 points; 40+ is common for direct entry.",
          "**LNAT:** Non-JUPAS applicants must sit the Law National Aptitude Test; JUPAS applicants are not required.",
          "**Interview:** Selected candidates may be invited to discuss their interest in law and analytical thinking."
        ],
        curriculum: [
          "**PCLL pathway:** The LLB is the primary qualifying degree for the Postgraduate Certificate in Laws (PCLL) in Hong Kong.",
          "**Core subjects:** Constitutional law, contract law, criminal law, equity, land law, and tort law form the mandatory foundation.",
          "**Mooting:** Extensive mooting programme with internal and international competitions, including Vis Moot.",
          "**Legal clinics:** Pro bono clinics offer real client work in housing, immigration, and family law.",
          "**Overseas exposure:** Elective exchange semesters with top law schools in the UK, US, and Australia."
        ],
        career: [
          "**Solicitors and barristers:** Graduates proceed to PCLL and then training contracts or pupillage.",
          "**International firms:** Magic Circle and US firms such as Clifford Chance and Skadden recruit HKU LLB graduates.",
          "**Government legal service:** Department of Justice and Legal Aid Department are common employers.",
          "**In-house counsel:** Corporations like HSBC, CK Hutchison, and MTRCL hire HKU law alumni.",
          "**Alternative careers:** Compliance, policy research, journalism, and NGO advocacy are popular options."
        ],
        campus: [
          "**Main campus:** Law classes are held at the HKU Main Campus, primarily in the K.K. Leung Building.",
          "**Law library:** The Law Library holds one of the most comprehensive common-law collections in Asia.",
          "**Moot court:** A dedicated moot courtroom simulates real trial and appellate settings.",
          "**Research centres:** Home to the Centre for Chinese Law, Centre for Comparative and Public Law, and more.",
          "**Student organisations:** HKU Law Society, Mooting Society, and Pro Bono Society are highly active."
        ],
        competitiveness: [
          "**Most competitive HKU programme:** Consistently receives the highest number of Band A choices.",
          "**Admission ratio:** Often exceeds 20 applicants per place.",
          "**English threshold:** A high English grade is critical; weak English substantially reduces admission chances.",
          "**Score inflation:** With grade inflation, a best-5 score below 35 is rarely competitive.",
          "**Backup planning:** Many applicants also place JS6406 alongside JS6405 or overseas law options."
        ],
        alumni: [
          "**Senior counsel:** Numerous HKU LLB alumni have been appointed Senior Counsel and judges.",
          "**Political leaders:** Alumni include legislators, ministers, and senior civil servants in Hong Kong and abroad.",
          "**International arbitration:** Graduates are leading arbitrators and counsel in Hong Kong and Singapore.",
          "**Legal academia:** Faculty members at Oxford, Cambridge, Yale Law School, and NUS are HKU law graduates.",
          "**Pro bono champions:** Many alumni lead legal-aid NGOs and human-rights organisations."
        ],
        scholarships: [
          "**Full scholarships:** Top JUPAS achievers may receive full tuition and living-expense awards.",
          "**Law-specific funds:** Prizes and scholarships from the Hong Kong Bar Association and Law Society.",
          "**Overseas study grants:** Funding for summer schools at Oxford, Cambridge, and other partner institutions.",
          "**Mooting subsidies:** Travel and registration grants for international moot competitions.",
          "**Needs-based aid:** Bursaries available for students from lower-income backgrounds."
        ],
        tips: [
          "**English mastery:** Read widely—quality newspapers, legal blogs, and judgments—to sharpen language and reasoning.",
          "**Moot early:** Join mooting or debate clubs in secondary school to build courtroom confidence.",
          "**Stay informed:** Follow current legal and constitutional developments in Hong Kong and the UK.",
          "**Work experience:** Shadow solicitors or barristers during holidays to understand practice realities.",
          "**Broad reading:** Law rewards interdisciplinary thinking; explore politics, philosophy, and economics."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS 入學要求：** 英國語文通常預期達 5**；中國語文達第 3 級，數學及選修科達第 2 級。",
          "**科目偏好：** 無必修選修科，但歷史或經濟等強調論述的科目較有優勢。",
          "**收生成績：** 最佳五科中位數通常超過 36 分；直接入學常達 40 分以上。",
          "**LNAT：** 非聯招申請人須應考法律國際性向測試；聯招申請人無需應考。",
          "**面試安排：** 部分入圍考生或獲邀面試，探討對法律的興趣及分析思維。"
        ],
        curriculum: [
          "**PCLL 途徑：** 法學士是香港法律專業證書課程（PCLL）的主要認可學位。",
          "**核心科目：** 憲法、合約法、刑事法、衡平法、土地法及侵權法構成必修基礎。",
          "**模擬法庭：** 設有廣泛模擬法庭計劃，包括內部及國際比賽，如 Vis Moot。",
          "**法律診所：** 義務法律診所提供房屋、入境及家庭法方面的真實客戶工作經驗。",
          "**海外 exposure：** 可選修與英國、美國及澳洲頂尖法學院的交流學期。"
        ],
        career: [
          "**律師及大律師：** 畢業生繼續修讀 PCLL，然後進行實習律師培訓或大律師實習。",
          "**國際律師行：** 魔圈所及美國律師行如高偉紳及世達聘用港大法學士畢業生。",
          "**政府法律部門：** 律政司及法律援助署為常見僱主。",
          "**企業法律顧問：** 滙豐、長江和記及港鐵等公司聘用港大法律校友。",
          "**另類事業：** 合規、政策研究、新聞工作及非政府組織倡議均為熱門選擇。"
        ],
        campus: [
          "**主校園：** 法律課堂於港大主校園進行，主要在梁銶琚樓。",
          "**法律圖書館：** 法律圖書館擁有亞洲最全面的普通法藏書之一。",
          "**模擬法庭：** 專用模擬法庭模擬真實審訊及上訴環境。",
          "**研究中心：** 設有中國法研究中心、比較法與公法研究中心等。",
          "**學生組織：** 港大法律學會、模擬法庭學會及義務法律學會非常活躍。"
        ],
        competitiveness: [
          "**港大最競爭課程：** 一直是 Band A 選擇人數最多的課程。",
          "**入學比例：** 每個學額常超過 20 名申請人。",
          "**英文門檻：** 英文科成績至關重要；英文成績較弱會大幅降低入學機會。",
          "**分數通脹：** 隨著成績通脹，最佳五科低於 35 分很少具競爭力。",
          "**後備規劃：** 不少申請人同時將 JS6406 與 JS6405 或海外法律課程並列選擇。"
        ],
        alumni: [
          "**資深大律師：** 多名港大法學士校友獲委任為資深大律師及法官。",
          "**政界領袖：** 校友包括香港及海外立法會議員、司局長及高級公務員。",
          "**國際仲裁：** 畢業生為香港及新加坡的頂尖仲裁員及代表律師。",
          "**法律學術界：** 牛津、劍橋、耶魯法學院及新加坡國立大學的教職人員均為港大法律畢業生。",
          "**義務法律先鋒：** 不少校友領導法律援助非政府組織及人權機構。"
        ],
        scholarships: [
          "**全額獎學金：** 頂尖聯招成績者或獲全額學費及生活費資助。",
          "**法律專項基金：** 香港大律師公會及律師會頒發獎學金及獎項。",
          "**海外研習資助：** 資助於牛津、劍橋及其他夥伴院校參加暑期學校。",
          "**模擬法庭補貼：** 提供國際模擬法庭比賽的旅費及報名費資助。",
          "**按需要援助：** 為低收入家庭學生提供助學金。"
        ],
        tips: [
          "**精通英文：** 廣泛閱讀優質報章、法律網誌及判詞，提升語言及推理能力。",
          "**盡早模擬法庭：** 中學時加入模擬法庭或辯論學會，建立法庭自信。",
          "**緊貼時事：** 關注香港及英國最新的法律及憲制發展。",
          "**工作體驗：** 假期跟隨律師或大律師工作，了解實務現實。",
          "**廣泛閱讀：** 法律重視跨學科思維；探索政治、哲學及經濟學。"
        ]
      }
    }
  },
  {
    code: "JS6602",
    nameZh: "理學士（創新與科技）",
    nameEn: "BSc in Innovation and Technology",
    university: "HKU",
    faculty: "理學院",
    en: {
      sections: {
        admission: [
          "**JUPAS requirement:** Level 3 in English and Chinese, Level 2 in Mathematics and two electives.",
          "**Subject preference:** Mathematics (Extended Module) and at least one science subject are strongly recommended.",
          "**Admission score:** Competitive applicants typically score 28–33 in best 5 subjects.",
          "**Portfolio:** Evidence of innovation projects, coding, or science competitions can strengthen the application.",
          "**Interview:** Selected applicants may be invited to discuss their innovation interests and problem-solving approach."
        ],
        curriculum: [
          "**Interdisciplinary core:** Combines physics, chemistry, biology, and computer science with innovation management.",
          "**Maker culture:** Hands-on training in prototyping, 3D printing, and IoT device development.",
          "**Design thinking:** Structured courses in user-centred design, empathy mapping, and iterative testing.",
          "**Industry projects:** Capstone involves solving real problems for HKU partner companies and labs.",
          "**Entrepreneurship modules:** Business-model canvas, pitching, and startup law courses are embedded."
        ],
        career: [
          "**Tech startups:** Graduates join or found startups in AI, biotech, and green-technology sectors.",
          "**R&D labs:** Research roles at ASTRI, HKSTP incubators, and university research centres.",
          "**Product innovation:** Corporations like Sony, Panasonic, and local electronics firms hire programme graduates.",
          "**Consulting:** Innovation-strategy roles at Deloitte Digital and similar transformation practices.",
          "**Further study:** MSc and PhD pathways in applied sciences, engineering, or technology management."
        ],
        campus: [
          "**Science campus:** Primarily based in the Kadoorie Biological Sciences Building and the Swire Building.",
          "**Maker spaces:** Access to the Tam Wing Fan Innovation Wing and faculty prototyping labs.",
          "**Science library:** The Stephen Kai Cheung Yao Science Library supports interdisciplinary research.",
          "**Collaboration zones:** Open-plan workspaces designed for cross-disciplinary team projects.",
          "**Student groups:** Active Innovation and Technology Society organises hackathons and startup weekends."
        ],
        competitiveness: [
          "**Growing popularity:** Increasing interest as STEM and innovation careers gain traction in Hong Kong.",
          "**Admission ratio:** Approximately 5–7 applicants per place in recent JUPAS cycles.",
          "**Score flexibility:** Slightly lower score threshold than pure science programmes due to broader intake.",
          "**Portfolio weight:** Strong innovation evidence can offset a marginally lower DSE score.",
          "**Related options:** Applicants also consider JS6901 (BSc) or JS6963 for alternative science pathways."
        ],
        alumni: [
          "**Founders:** Alumni have launched hardware and software startups funded by HKSTP and Cyberport.",
          "**Patent holders:** Several graduates hold patents in medical devices and sustainable materials.",
          "**Educators:** Some alumni teach STEM and innovation programmes at top Hong Kong schools.",
          "**Corporate innovators:** Graduates lead innovation units at major Hong Kong conglomerates.",
          "**Global researchers:** PhD alumni are postdoctoral researchers at ETH Zurich, Caltech, and Tsinghua."
        ],
        scholarships: [
          "**Entrance scholarships:** Automatic consideration for high JUPAS scorers in best 5 subjects.",
          "**Innovation awards:** Special prizes for applicants with notable science-fair or hackathon achievements.",
          "**Research internships:** Paid summer research placements through the Faculty of Science.",
          "**Exchange funding:** Support for semester-abroad programmes at innovation-focused universities.",
          "**Corporate scholarships:** Partner technology firms offer tuition support from Year 2 onwards."
        ],
        tips: [
          "**Build a portfolio:** Document any coding, robotics, or maker projects to support your application.",
          "**Join competitions:** Science fairs, hackathons, and innovation challenges strengthen your profile.",
          "**Stay curious:** Read widely about emerging tech trends and their societal implications.",
          "**Network early:** Attend HKU Science Faculty open days and innovation talks while in secondary school.",
          "**Be hands-on:** The programme values doers—start making things rather than just reading about them."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS 入學要求：** 英國語文及中國語文達第 3 級，數學及兩科選修科達第 2 級。",
          "**科目偏好：** 強烈建議修讀數學（延伸部分）及至少一科理科。",
          "**收生成績：** 具競爭力的申請人最佳五科通常達 28–33 分。",
          "**作品集：** 創新項目、編程或科學比賽的證明可加強申請。",
          "**面試安排：** 部分申請人或獲邀面試，探討其創新興趣及解難方法。"
        ],
        curriculum: [
          "**跨學科核心：** 結合物理、化學、生物及計算機科學，並融入創新管理。",
          "**創客文化：** 親身培訓原型製作、3D 打印及物聯網裝置開發。",
          "**設計思維：** 設有用戶為本設計、同理心地圖及反覆測試的結構化課程。",
          "**業界項目：** 畢業專題須為港大夥伴公司及實驗室解決真實問題。",
          "**創業模組：** 課程內嵌商業模式圖、路演及初創法律課程。"
        ],
        career: [
          "**科技初創：** 畢業生加入或創辦人工智能、生物科技及綠色科技領域的初創企業。",
          "**研發實驗室：** 於應科院、香港科技園孵化器及大學研究中心擔任研究職位。",
          "**產品創新：** 索尼、松下及本地電子公司聘用課程畢業生。",
          "**顧問行業：** 於德勤數碼等轉型顧問公司擔任創新策略職位。",
          "**深造途徑：** 可繼續修讀應用科學、工程或科技管理碩士及博士課程。"
        ],
        campus: [
          "**理科校園：** 主要於嘉道理生物科學大樓及太古樓上課。",
          "**創客空間：** 可使用譚榮芬創科翼及學院原型製作實驗室。",
          "**科學圖書館：** 姚企克科學圖書館支援跨學科研究。",
          "**協作區域：** 開放式工作空間專為跨學科團隊項目而設。",
          "**學生團體：** 活躍的創新與科技學會舉辦黑客松及創業周末活動。"
        ],
        competitiveness: [
          "**人氣上升：** 隨著 STEM 及創新事業在香港興起，課程越來越受歡迎。",
          "**入學比例：** 近年聯招每個學額約有 5–7 名申請人。",
          "**分數彈性：** 由於收生範圍較廣，分數門檻略低於純理科課程。",
          "**作品集比重：** 強大的創新證明可彌補文憑試分數的輕微不足。",
          "**相關選項：** 申請人亦可考慮 JS6901（理學士）或 JS6963 作為替代理科途徑。"
        ],
        alumni: [
          "**創辦人：** 校友創辦硬件及軟件初創企業，獲科技園及數碼港資助。",
          "**專利持有人：** 多名畢業生持有醫療設備及可持續材料專利。",
          "**教育工作者：** 部分校友於香港頂尖學校教授 STEM 及創新課程。",
          "**企業創新者：** 畢業生於香港大型企業領導創新部門。",
          "**環球研究員：** 博士畢業生於蘇黎世聯邦理工學院、加州理工及清華大學擔任博士後研究員。"
        ],
        scholarships: [
          "**入學獎學金：** 最佳五科成績優異的聯招申請人將自動獲考慮。",
          "**創新獎項：** 於科學展覽或黑客松有傑出成就的申請人可獲特別獎項。",
          "**研究實習：** 透過理學院提供有薪暑期研究實習。",
          "**交流資助：** 支援於專注創新的大學進行海外學期交流。",
          "**企業獎學金：** 夥伴科技公司由第二年開始提供學費資助。"
        ],
        tips: [
          "**建立作品集：** 記錄任何編程、機械人或創客項目，以支援申請。",
          "**參加比賽：** 科學展覽、黑客松及創新挑戰可強化個人履歷。",
          "**保持好奇：** 廣泛閱讀新興科技趨勢及其社會影響。",
          "**盡早建立人脈：** 中學時期參加港大理學院開放日及創新講座。",
          "**親身實踐：** 課程重視實幹者——開始動手製作，而非只停留於閱讀。"
        ]
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch C...");
  for (const prog of PROGRAMME_DETAILS) {
    await JupasProgrammeService.upsertProgrammeDetails(prog);
    console.log(`[Seed] ✓ Success: ${prog.code}`);
  }
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
