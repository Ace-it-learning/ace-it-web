const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'generated-programmes/batch1-hku-1-10-premium.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Helper to create 8-section premium content
function makeContent(en, zh) {
  return { en: { sections: en }, zh: { sections: zh } };
}

// Helper for section
function sect(title, content) {
  return { title, content };
}

// ============ JS6781 - GBF ============
data.programmes.JS6781 = {
  id: 'hku-gf', code: 'JS6781', name: '環球金融學士 (GBF)', university: 'HKU',
  content: makeContent({
    admission: sect('Eligibility & Admission Criteria (DSE)', [
      '**Academic Threshold**: GBF is HKU Business School\'s elite finance programme. Admission is highly competitive with typical Best 5 scores of 31-33 (standard scale).',
      '**Mathematics (Extended Part)**: M2 (Calculus & Statistics) is strongly preferred. The programme is quantitatively rigorous and assumes fluency in advanced calculus.',
      '**English**: Level 5+ in English is expected. The programme involves extensive case study analysis, presentations, and group projects in English.',
      '**Interview**: Selected candidates are interviewed to assess analytical thinking, awareness of global financial markets, leadership potential, and career motivation.',
      '**Non-Academic Factors**: Leadership roles in student societies, finance-related competitions (e.g., stock pitch contests), and internship experience strengthen applications.'
    ]),
    curriculum: sect('Programme Structure & Curriculum', [
      '**Year 1 - Business Foundations**: Economics, accounting, statistics, and business communication. Introduction to financial markets and investment principles.',
      '**Year 2 - Finance Core**: Corporate finance, financial econometrics, derivatives pricing, and portfolio theory. Bloomberg terminal certification training.',
      'Year 3 - Advanced Finance & Specialisation**: M&A, leveraged buyouts, IPO valuation, and restructuring. Choose tracks in Investment Banking, Asset Management, or Risk Management.',
      '**Year 4 - Capstone & Professional Preparation**: Final year project with industry sponsors, CFA Level 1 preparation, and structured recruitment preparation for bulge bracket banks.',
      '**Quantitative Finance Track**: Advanced stochastic calculus, Monte Carlo simulation, and algorithmic trading for students pursuing quantitative roles.',
      '**Global Immersion**: Mandatory semester exchange at partner institutions (Wharton, LSE, Bocconi, NYU Stern) plus summer internships in New York, London, or Hong Kong.',
      '**Bloomberg & Trading Room**: Students train on Bloomberg terminals, participate in simulated trading competitions, and manage real-money investment portfolios through the Student Managed Fund.'
    ]),
    career: sect('Career Pathways & Prospects', [
      '**Investment Banking (Front Office)**: Graduates regularly join Goldman Sachs, Morgan Stanley, JP Morgan, Citi, and Bank of America in M&A, ECM, DCM, and industry coverage groups.',
      '**Sales & Trading**: Equities, fixed income, foreign exchange, and derivatives trading desks at major global banks recruit GBF graduates for their quantitative and market knowledge.',
      '**Asset Management**: BlackRock, Fidelity, Point72, and Wellington Management hire GBF graduates for analyst and portfolio management roles.',
      '**Private Equity & Hedge Funds**: The quantitative training and deal experience open doors to analyst roles at PE firms (KKR, Carlyle, TPG) and hedge funds (Citadel, Two Sigma).',
      '**Consulting & Corporate Development**: McKinsey, BCG, Bain, and corporate strategy teams at multinationals value the analytical and financial modelling skills.',
      '**Fintech & Entrepreneurship**: Some graduates join fintech startups (WeLab, TNG, Lendela) or launch their own ventures in digital finance, blockchain, or robo-advisory.'
    ]),
    campus: sect('Campus Life & Student Experience', [
      '**Main Campus (Pok Fu Lam)**: All four years at the Main Campus. Business School facilities include the K.K. Leung Building, the Cheng Yu Tung Tower, and the newly renovated Business Library.',
      '**Bloomberg Trading Room**: State-of-the-art trading simulation facility with 40+ Bloomberg terminals, real-time market data feeds, and professional-grade analytics software.',
      '**Hall Life**: Business students often choose St. John\'s College, Morrison Hall, or Lee Shau Hall for their entrepreneurial and networking-oriented communities.',
      '**Business Society (BizSoc)**: The largest student society at HKU, organising case competitions, firm presentations, networking nights, mentorship programmes, and the annual BizBall.',
      '**Mentorship & Alumni Network**: Each student is assigned a mentor from the finance industry. The HKU Business School alumni network includes CEOs, CFOs, and managing directors at major financial institutions across Asia.'
    ]),
    competitiveness: sect('Admission Competitiveness Analysis', [
      '**Overall Difficulty**: Very High (4.5/5 stars). Approximately 1,500-2,000 applicants compete for ~80 places annually (~5% admission rate).',
      '**Score Distribution**: Top quartile: Best 5 = 34-36; Median: Best 5 = 31-33; Bottom quartile: Best 5 = 29-30.',
      '**Subject Weighting Strategy**: Maths (x1.5) + English (x1.3) + Best Elective (x1.0) + LS/CSD (x1.0) + Chinese (x1.0). M2 is particularly valuable as it demonstrates quantitative aptitude.',
      '**Interview Weighting**: The interview carries approximately 25-35% of the final admission decision. Candidates must demonstrate genuine interest in finance and awareness of current market events.',
      '**Band A Advantage**: Band A Choice 1 is strongly preferred. Choice 2 has reduced chances. Lower bands are rarely considered.',
      '**Non-JUPAS Pathway**: IB (40+/45), GCE A-Levels (AAA including Maths/Economics). Approximately 15-20 places reserved for non-JUPAS entrants.'
    ]),
    alumni: sect('Notable Alumni & Faculty', [
      '**Dr. Victor Fung Kwok-king**: Chairman of Fung Group (Li & Fung), former Chairman of the University Grants Committee. Global supply chain and business leader.',
      '**Dr. David Li Kwok-po**: Former Chairman and CEO of Bank of East Asia. One of Hong Kong\'s most prominent bankers and philanthropists.',
      '**Professor Kalok Chan**: Former Dean of HKU Business School, renowned finance academic specialising in market microstructure and asset pricing.',
      '**Edith Yeung**: Partner at 500 Startups, prominent venture capitalist investing in fintech and blockchain startups across Asia.',
      '**Ronald Arculli**: Former Chairman of the Hong Kong Exchanges and Clearing (HKEX). Key figure in Hong Kong\'s financial market development.'
    ]),
    scholarships: sect('Scholarships & Financial Aid', [
      '**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in 3+ subjects). Full or half tuition coverage.',
      '**Business School Merit Scholarships**: For academic excellence and leadership potential (HKD 20,000-50,000/year). Renewable based on performance.',
      '**CFA Scholarship Programme**: Partnership with CFA Institute providing partial CFA exam fee waivers and study materials for interested students.',
      '**Overseas Internship Grants**: Funding for summer internships at financial centres abroad (up to HKD 25,000 per internship).',
      '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans.'
    ]),
    tips: sect('Ace Sir\'s GBF Strategy', [
      '**Maths is Non-Negotiable**: M2 (Calculus & Statistics) is effectively required. If your school doesn\'t offer it, self-study or seek external tutoring. The entire programme builds on this foundation.',
      '**Follow the Markets Daily**: Read Financial Times, Bloomberg, and WSJ. Be ready to discuss recent M&A deals, Fed policy decisions, and market movements in your interview.',
      '**Start Early with Internships**: Aim for spring weeks in Year 1 and summer internships in Year 2. GBF students are expected to be career-ready from day one. Build your CV early.',
      '**Learn Financial Modelling**: Master Excel (DCF, LBO, M&A models) and basic Python for data analysis before you arrive. Being able to build a three-statement model gives you a massive head start.',
      '**Network Aggressively**: Attend every firm presentation, join finance clubs, and connect with alumni on LinkedIn. In investment banking, who you know is as important as what you know.'
    ])
  }, {
    admission: sect('入學要求與計分詳情 (DSE)', [
      '**學術門檻**：環球金融學士 (GBF) 是港大商學院的精英金融課程。入學競爭激烈，通常 Best 5 需達 31-33 分。',
      '**數學 (延伸部分)**：強烈建議修讀 M2 (微積分與統計)。課程對數學要求很高，假設學生精通高等微積分。',
      '**英國語文**：預期英文達 5 級或以上。課程涉及大量案例分析、報告及英語小組項目。',
      '**面試**：入圍考生接受面試，評估分析思維、對全球金融市場的認識、領導潛質及職業動機。',
      '**非學術因素**：學生會領導角色、金融相關比賽 (如股票推介比賽) 及實習經驗能大幅加強申請。'
    ]),
    curriculum: sect('課程結構與內容', [
      '**第一年 - 商業基礎**：經濟學、會計學、統計學及商業溝通。金融市場及投資原則入門。',
      '**第二年 - 金融核心**：公司金融、金融計量經濟學、衍生工具定價及投資組合理論。Bloomberg 終端機認證培訓。',
      '**第三年 - 進階金融及專修**：併購、槓桿收購、IPO 估值及重組。選擇投行、資產管理或風險管理軌道。',
      '**第四年 - 畢業專題及職業準備**：與業界贊助商的畢業專題、CFA 一級準備及大型投資銀行的結構化招聘準備。',
      '**量化金融軌道**：進階隨機微積分、蒙地卡羅模擬及算法交易，適合追求量化職位的學生。',
      '**全球沉浸體驗**：必須到伙伴院校 (Wharton、LSE、Bocconi、NYU Stern) 學期交流，並到紐約、倫敦或香港暑期實習。',
      '**Bloomberg 及交易室**：學生在 Bloomberg 終端機上受訓，參加模擬交易比賽，並通過學生管理基金操盤真實資金投資組合。'
    ]),
    career: sect('職業前景與出路', [
      '**投資銀行 (前台)**：畢業生定期加入高盛、摩根士丹利、摩根大通、花旗及美國銀行的併購、股債資本市場及行業覆蓋團隊。',
      '**銷售及交易**：大型全球銀行的股票、固定收益、外匯及衍生工具交易部聘請 GBF 畢業生，因其量化及市場知識。',
      '**資產管理**：貝萊德、富達、Point72 及威靈頓管理聘請 GBF 畢業生擔任分析師及投資組合管理職位。',
      '**私募及對沖基金**：量化訓練及交易經驗為私募基金 (KKR、凱雷、TPG) 及對沖基金 (Citadel、Two Sigma) 的分析師職位打開大門。',
      '**顧問及企業發展**：麥肯錫、BCG、貝恩及跨國企業的企業策略團隊重視分析及財務建模技能。',
      '**金融科技及創業**：部分畢業生加入金融科技初創 (WeLab、TNG、Lendela) 或在數碼金融、區塊鏈或智能投顧領域創業。'
    ]),
    campus: sect('校園生活與學生體驗', [
      '**主校園 (薄扶林)**：四年均於主校園。商學院設施包括梁銶琚樓、鄭裕彤教學樓及新近翻新的商業圖書館。',
      '**Bloomberg 交易室**：最先進的交易模擬設施，設有40多台 Bloomberg 終端機、實時市場數據饋送及專業級分析軟件。',
      '**舍堂生活**：商科學生常選擇聖約翰學院、Morrison Hall 或李兆基堂，因其創業及人脈導向的社群。',
      '**商學會 (BizSoc)**：港大最大的學生學會，舉辦案例分析比賽、公司講座、聯誼之夜、師友計劃及年度 BizBall。',
      '**師友指導及校友網絡**：每位學生獲配金融業導師。港大商學院校友網絡包括亞洲主要金融機構的行政總裁、財務總監及董事總經理。'
    ]),
    competitiveness: sect('入學競爭力分析', [
      '**整體難度**：極高 (4.5/5星)。每年約1,500-2,000人競爭~80個學額 (入學率約5%)。',
      '**分數分佈**：最高四分位數：Best 5 = 34-36分；中位數：Best 5 = 31-33分；最低四分位數：Best 5 = 29-30分。',
      '**科目加權策略**：數學 (x1.5) + 英文 (x1.3) + 最佳選修科 (x1.0) + 通識/公社 (x1.0) + 中文 (x1.0)。M2 特別有價值，因為它展示量化能力。',
      '**面試比重**：面試佔最終入學決定約25-35%。考生必須展示對金融的真正興趣及對當前市場事件的認識。',
      '**Band A 優勢**：強烈偏好 Band A 第一志願。第二志願機會減少。較低 band 極少考慮。',
      '**非聯招途徑**：國際文憑 (IB 40+/45)、GCE A-Level (AAA 包括數學/經濟)。約15-20個學額預留予非聯招申請者。'
    ]),
    alumni: sect('知名校友及教職員', [
      '**馮國經博士**：馮氏集團 (利豐) 主席、前大學教育資助委員會主席。全球供應鏈及商業領袖。',
      '**李國寶博士**：前東亞銀行主席兼行政總裁。香港最傑出的銀行家及慈善家之一。',
      '**陳家樂教授**：前港大商學院院長，著名金融學者，專注於市場微觀結構及資產定價。',
      '**楊佩珊**：500 Startups 合伙人，著名創投資本家，投資亞洲金融科技及區塊鏈初創。',
      '**夏佳理**：前香港交易及結算所 (HKEX) 主席。香港金融市場發展的關鍵人物。'
    ]),
    scholarships: sect('獎學金及經濟援助', [
      '**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常3科5**或以上)。全額或半額學費資助。',
      '**商學院優異獎學金**：頒予學術卓越及領導潛質的學生 (每年港幣20,000-50,000元)。按表現續領。',
      '**CFA 獎學金計劃**：與 CFA Institute 合作，為有興趣的學生提供部分 CFA 考試費用減免及學習材料。',
      '**海外實習資助**：為到海外金融中心暑期實習的學生提供資助 (每次最多港幣25,000元)。',
      '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。'
    ]),
    tips: sect('Ace Sir GBF 攻略', [
      '**數學不容妥協**：M2 (微積分與統計) 實際上是必需的。如果學校沒有開設，要自學或尋求校外補習。整個課程都建立在這個基礎上。',
      '**每天追蹤市場動態**：閱讀 Financial Times、Bloomberg 及華爾街日報。準備在面試中討論近期併購交易、聯儲局決策及市場走勢。',
      '**盡早開始實習**：第一年目標春季實習，第二年目標暑期實習。GBF 學生從第一天起就要為職業生涯做好準備。盡早建立履歷。',
      '**學習財務建模**：入學前精通 Excel (DCF、LBO、併購模型) 及基礎 Python 數據分析。能夠建立三表模型會給你巨大優勢。',
      '**積極建立人脈**：參加每個公司講座、加入金融學會、在 LinkedIn 上聯繫校友。在投資銀行，你認識誰與你知道什麼同樣重要。'
    ])
  })
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added JS6781. Total:', Object.keys(data.programmes).length);
