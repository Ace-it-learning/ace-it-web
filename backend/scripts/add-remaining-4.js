const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'generated-programmes/batch1-hku-1-10-premium.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function makeContent(en, zh) {
  return { en: { sections: en }, zh: { sections: zh } };
}
function sect(title, content) {
  return { title, content };
}

// ============ JS6767 - BBA(Acc&Fin) ============
data.programmes.JS6767 = {
  id: 'hku-bba-acc', code: 'JS6767', name: '工商管理學士(會計及財務) (BBA(Acc&Fin))', university: 'HKU',
  content: makeContent({
    admission: sect('Eligibility & Admission Criteria (DSE)', [
      '**Academic Threshold**: BBA(Acc&Fin) is HKU\'s flagship accounting programme, offering direct exemption from HKICPA QP modules. Admission requires Best 5 scores around 28-30 (standard scale).',
      '**Mathematics**: Strong maths skills are essential for financial analysis, valuation modelling, and accounting calculations. M1 or M2 is helpful but not required.',
      '**English**: Level 4+ in English is expected. The programme involves extensive report writing, case study presentations, and professional communication.',
      '**No Interview**: Purely score-based admission, making every DSE point in your Best 5 critical. Focus on maximising your overall score.',
      '**Non-Academic Factors**: While not formally assessed, leadership experience, participation in business competitions, and accounting-related activities (e.g., Junior Achievement) demonstrate genuine interest.'
    ]),
    curriculum: sect('Programme Structure & Curriculum', [
      '**Year 1 - Business Foundations**: Economics, business statistics, business communication, and introduction to financial accounting. Understanding the language of business.',
      '**Year 2 - Accounting Core**: Financial accounting, management accounting, cost accounting, and taxation principles. Introduction to auditing and business law.',
      '**Year 3 - Finance Integration**: Corporate finance, investment analysis, financial modelling, and business strategy. Choose electives in advanced accounting or finance specialisations.',
      '**Year 4 - Professional Preparation & Specialisation**: Advanced financial reporting, strategic management accounting, and capstone project. Direct pathway to PCLL for students choosing the law conversion option.',
      '**Professional Exemptions**: Graduates receive maximum exemptions from HKICPA QP (all 4 modules), ACCA (9 papers), and CIMA (11 papers) — fast-tracking to professional qualification.',
      '**Big Four Internships**: Structured internship programmes with Deloitte, PwC, EY, and KPMG are built into the curriculum. Most students complete at least two internships before graduation.',
      '**Case Competitions**: Regular participation in international case competitions (e.g., CIMA Global Business Challenge, HKICPA QP Case Competition) develops practical problem-solving skills.'
    ]),
    career: sect('Career Pathways & Prospects', [
      '**Big Four Accounting Firms**: Audit, tax, and advisory roles at Deloitte, PwC, EY, and KPMG. Most graduates start here, with clear progression to manager and partner track.',
      '**Investment Banking**: The finance component opens doors to IB analyst roles, especially in Hong Kong\'s active deal market. Strong financial modelling skills are highly valued.',
      '**Corporate Finance**: FP&A (Financial Planning & Analysis), treasury, M&A, and investor relations roles at listed companies (HSBC, CK Hutchison, Swire) and multinationals.',
      '**Management Consulting**: Strategy consulting firms (McKinsey, BCG, Bain, Deloitte Consulting) recruit Acc&Fin graduates for their analytical and financial acumen.',
      '**Entrepreneurship**: The accounting + finance combo is powerful for founders who need to understand their numbers from day one. Many graduates launch startups in fintech, e-commerce, and professional services.',
      '**Professional Qualification Pathway**: Complete HKICPA QP (1.5 years) or ACCA (2-3 years) to become a Certified Public Accountant — a globally recognised qualification.'
    ]),
    campus: sect('Campus Life & Student Experience', [
      '**Main Campus (Pok Fu Lam)**: All four years at the Main Campus. Business School facilities include the K.K. Leung Building, Cheng Yu Tung Tower, and the Business Library.',
      '**Accounting & Finance Lab**: Dedicated lab with Bloomberg terminals, financial databases (Capital IQ, Thomson Reuters), and accounting software (SAP, Oracle).',
      '**Hall Life**: Business students are distributed across all halls. Popular choices include St. John\'s College (strong networking), Morrison Hall (entrepreneurial community), and Lee Shau Hall.',
      '**Business Society (BizSoc)**: The largest student society, organising case competitions, firm presentations, networking nights, mentorship programmes, and the annual BizBall.',
      '**Mentorship & Alumni Network**: Each student is assigned an industry mentor, typically a partner at a Big Four firm or a CFO at a listed company. The HKU Business School alumni network spans 150+ countries.'
    ]),
    competitiveness: sect('Admission Competitiveness Analysis', [
      '**Overall Difficulty**: High (4/5 stars). Approximately 1,500-2,000 applicants compete for ~150 places annually (~8% admission rate).',
      '**Score Distribution**: Top quartile: Best 5 = 31-33; Median: Best 5 = 28-30; Bottom quartile: Best 5 = 26-27.',
      '**Subject Weighting Strategy**: Maths (x1.3) + English (x1.0) + Best Elective (x1.0) + LS/CSD (x1.0) + Chinese (x1.0). Mathematics is important for the quantitative finance component.',
      '**No Interview**: Purely score-based admission means there is no subjectivity. However, this also means every single point matters enormously.',
      '**Band A Advantage**: Band A Choice 1 receives strong priority. Choice 2 has viable chances. Lower bands are less likely but possible.',
      '**Non-JUPAS Pathway**: IB (38+/45), GCE A-Levels (AAA including Maths/Accounting). Approximately 20-30 places reserved for non-JUPAS entrants.'
    ]),
    alumni: sect('Notable Alumni & Faculty', [
      '**Dr. David Li Kwok-po**: Former Chairman and CEO of Bank of East Asia. HKU Business School alumnus and one of Hong Kong\'s most prominent bankers.',
      '**Professor Richard Wong Yue-chim**: Pro-Vice-Chancellor of HKU, renowned economist specialising in property markets and public finance.',
      '**Professor Kalok Chan**: Former Dean of HKU Business School, leading finance academic with expertise in market microstructure and asset pricing.',
      '**Dr. Vincent Cheng Hoi-chuen**: Former Chairman of HSBC Asia-Pacific. Prominent figure in Hong Kong\'s banking and business community.',
      '**Professor T.J. Wong**: World-renowned accounting scholar, former Dean of Business School at Chinese University of Hong Kong. Expert in corporate governance and earnings quality.'
    ]),
    scholarships: sect('Scholarships & Financial Aid', [
      '**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in 3+ subjects). Full or half tuition coverage.',
      '**Business School Merit Scholarships**: For academic excellence and leadership potential (HKD 20,000-50,000/year). Renewable based on GPA.',
      '**Big Four Scholarship Programmes**: Deloitte, PwC, EY, and KPMG each offer scholarships to outstanding students (HKD 30,000-50,000/year) with guaranteed internship interviews.',
      '**Professional Body Scholarships**: HKICPA and ACCA offer scholarships to top-performing students covering exam fees and study materials.',
      '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans.'
    ]),
    tips: sect('Ace Sir\'s Acc&Fin Strategy', [
      '**Understand the QP Pathway**: This programme is designed to get you CPA-qualified fast. Know what HKICPA QP is, why exemptions matter, and the difference between CPA and ACCA. Show you understand the end game.',
      '**Excel Skills Matter**: Learn financial modelling in Excel before you arrive. Being able to build a three-statement model, a DCF valuation, and an LBO model gives you a massive head start over classmates.',
      '**Network from Day One**: Join the HKU Business School clubs, attend every firm presentation, and connect with alumni on LinkedIn. Accounting is a relationship-driven profession — your network is your net worth.',
      '**Start Interning Early**: Aim for a Big Four internship in Year 2 summer. The earlier you get your foot in the door, the better your chances of securing a graduate offer. Most graduate hires come from returning interns.',
      '**Think Beyond the Numbers**: The best accountants and finance professionals do not just crunch numbers — they tell stories with data. Develop your communication skills, presentation ability, and commercial awareness.'
    ])
  }, {
    admission: sect('入學要求與計分詳情 (DSE)', [
      '**學術門檻**：工商管理學士(會計及財務) 是港大的旗艦會計課程，可直接獲得 HKICPA QP 單元豁免。入學通常需要 Best 5 達 28-30 分。',
      '**數學**：強大的數學能力對財務分析、估值建模及會計計算至關重要。M1 或 M2 有幫助但非必需。',
      '**英國語文**：預期英文達 4 級或以上。課程涉及大量報告寫作、案例研究報告及專業溝通。',
      '**無面試**：純分數入學，因此 Best 5 每一分 DSE 分數都很重要。專注於最大化整體分數。',
      '**非學術因素**：雖然非正式評估，但領導經驗、商業比賽參與及會計相關活動 (如 Junior Achievement) 展示真正的興趣。'
    ]),
    curriculum: sect('課程結構與內容', [
      '**第一年 - 商業基礎**：經濟學、商業統計、商業溝通及財務會計入門。理解商業語言。',
      '**第二年 - 會計核心**：財務會計、管理會計、成本會計及稅務原則。審計及商法入門。',
      '**第三年 - 金融整合**：公司金融、投資分析、金融建模及商業策略。選修進階會計或金融專修。',
      '**第四年 - 專業準備及專修**：進階財務報告、策略管理會計及畢業專題。選擇法律轉換的學生可直接通往 PCLL。',
      '**專業豁免**：畢業生可獲 HKICPA QP (全部4個單元)、ACCA (9張試卷) 及 CIMA (11張試卷) 最高豁免——快速取得專業資格。',
      '**四大實習**：與德勤、羅兵咸、安永及畢馬威的結構化實習計劃已納入課程。大部分學生在畢業前完成至少兩次實習。',
      '**案例比賽**：定期參加國際案例比賽 (如 CIMA Global Business Challenge、HKICPA QP Case Competition) 培養實務解難技能。'
    ]),
    career: sect('職業前景與出路', [
      '**四大會計師行**：在德勤、羅兵咸、安永及畢馬威從事審計、稅務及顧問工作。大部分畢業生由此起步，有清晰的經理及合伙人晉升路徑。',
      '**投資銀行**：金融成分為投行分析師職位打開大門，特別是在香港活躍的交易市場。強大的財務建模技能極受重視。',
      '**企業金融**：在上市公司 (滙豐、長和、太古) 及跨國企業從事財務規劃、庫務、併購及投資者關係工作。',
      '**管理顧問**：策略顧問公司 (麥肯錫、BCG、貝恩、德勤顧問) 聘請 Acc&Fin 畢業生，因其分析及財務敏銳度。',
      '**創業**：會計加金融的組合對創辦人極為有力，讓你從第一天起就理解數字。很多畢業生在金融科技、電商及專業服務領域創業。',
      '**專業資格途徑**：完成 HKICPA QP (1.5年) 或 ACCA (2-3年) 成為註冊會計師——全球認可的專業資格。'
    ]),
    campus: sect('校園生活與學生體驗', [
      '**主校園 (薄扶林)**：四年均於主校園。商學院設施包括梁銶琚樓、鄭裕彤教學樓及商業圖書館。',
      '**會計及金融實驗室**：專用實驗室配備 Bloomberg 終端機、金融數據庫 (Capital IQ、Thomson Reuters) 及會計軟件 (SAP、Oracle)。',
      '**舍堂生活**：商科學生分佈於所有舍堂。熱門選擇包括聖約翰學院 (人脈網絡強大)、Morrison Hall (創業社群) 及李兆基堂。',
      '**商學會 (BizSoc)**：最大的學生學會，舉辦案例比賽、公司講座、聯誼之夜、師友計劃及年度 BizBall。',
      '**師友指導及校友網絡**：每位學生獲配業界導師，通常是四大合伙人或上市公司財務總監。港大商學院校友網絡遍及150多個國家。'
    ]),
    competitiveness: sect('入學競爭力分析', [
      '**整體難度**：高 (4/5星)。每年約1,500-2,000人競爭~150個學額 (入學率約8%)。',
      '**分數分佈**：最高四分位數：Best 5 = 31-33分；中位數：Best 5 = 28-30分；最低四分位數：Best 5 = 26-27分。',
      '**科目加權策略**：數學 (x1.3) + 英文 (x1.0) + 最佳選修科 (x1.0) + 通識/公社 (x1.0) + 中文 (x1.0)。數學對量化金融部分很重要。',
      '**無面試**：純分數入學意味沒有主觀因素。但這也表示每一分都極為重要。',
      '**Band A 優勢**：Band A 第一志願獲強烈優先考慮。第二志願有可行機會。較低 band 機會較少但仍有可能。',
      '**非聯招途徑**：國際文憑 (IB 38+/45)、GCE A-Level (AAA 包括數學/會計)。約20-30個學額預留予非聯招申請者。'
    ]),
    alumni: sect('知名校友及教職員', [
      '**李國寶博士**：前東亞銀行主席兼行政總裁。港大商學院校友，香港最傑出的銀行家之一。',
      '**王于漸教授**：港大副校長，著名經濟學家，專注於物業市場及公共財政。',
      '**陳家樂教授**：前港大商學院院長，領先金融學者，專長於市場微觀結構及資產定價。',
      '**鄭海泉博士**：前滙豐亞太區主席。香港銀行界及商界的傑出人物。',
      '**T.J. Wong 教授**：世界知名會計學者，前中文大學商學院院長。企業管治及盈利質素專家。'
    ]),
    scholarships: sect('獎學金及經濟援助', [
      '**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常3科5**或以上)。全額或半額學費資助。',
      '**商學院優異獎學金**：頒予學術卓越及領導潛質 (每年港幣20,000-50,000元)。按 GPA 續領。',
      '**四大獎學金計劃**：德勤、羅兵咸、安永及畢馬威各為優異學生提供獎學金 (每年港幣30,000-50,000元)，並保證實習面試機會。',
      '**專業團體獎學金**：HKICPA 及 ACCA 為頂尖表現學生提供獎學金，涵蓋考試費用及學習材料。',
      '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。'
    ]),
    tips: sect('Ace Sir 會計及財務攻略', [
      '**了解 QP 途徑**：這課程旨在讓你快速取得 CPA 資格。了解什麼是 HKICPA QP、為什麼豁免很重要，以及 CPA 與 ACCA 的區別。展示你了解最終目標。',
      '**Excel 技能很重要**：入學前學習 Excel 財務建模。能夠建立三表模型、DCF 估值及 LBO 模型會讓你比同學領先一大步。',
      '**從第一天起建立人脈**：加入港大商學院學會、參加每個公司講座、在 LinkedIn 上聯繫校友。會計是關係驅動的專業——你的人脈就是你的財富。',
      '**盡早開始實習**：第二年暑期目標四大實習。越早踏入門檻，獲得畢業聘請的機會越大。大部分畢業生聘請來自回聘實習生。',
      '**超越數字思考**：最優秀的會計師及金融專業人士不只計算數字——他們用數據講故事。培養你的溝通技巧、報告能力及商業觸覺。'
    ])
  })
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added JS6767. Total:', Object.keys(data.programmes).length);
