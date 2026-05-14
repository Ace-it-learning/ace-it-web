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

// ============ JS6227 - QFin ============
data.programmes.JS6227 = {
  id: 'hku-qfin', code: 'JS6227', name: '計量金融學士 (QFin)', university: 'HKU',
  content: makeContent({
    admission: sect('Eligibility & Admission Criteria (DSE)', [
      '**Academic Threshold**: QFin sits at the intersection of mathematics, statistics, and finance. Admission requires Best 5 scores around 30-32 (standard scale).',
      '**Mathematics (Extended Part)**: M2 (Calculus & Statistics) is effectively required. M1 is acceptable but M2 is strongly preferred. The programme assumes fluency in calculus, linear algebra, and probability theory.',
      '**Physics or ICT**: Either subject helps build the computational and logical thinking needed for financial modelling and algorithmic trading.',
      '**English**: Level 5 in English is expected, as the programme involves reading academic papers, writing technical reports, and presenting quantitative findings.',
      '**No Interview**: Admission is primarily based on DSE scores, so every point in your Best 5 counts. Focus on maximising Maths and science subjects.'
    ]),
    curriculum: sect('Programme Structure & Curriculum', [
      '**Year 1 - Mathematical Foundations**: Real analysis, probability theory, linear algebra, and ordinary differential equations. These are the same mathematical tools used by quantitative traders on Wall Street.',
      '**Year 2 - Statistical & Computational Core**: Statistical inference, stochastic processes, numerical methods, and scientific computing in Python, R, and MATLAB.',
      '**Year 3 - Financial Engineering**: Option pricing models (Black-Scholes, binomial, Monte Carlo), interest rate models, credit risk modelling, and portfolio optimisation. Introduction to machine learning for finance.',
      '**Year 4 - Advanced Topics & Capstone**: Algorithmic trading, high-frequency trading systems, deep learning for market prediction, and a year-long capstone project with industry partners (banks, hedge funds, or fintech firms).',
      '**Programming & Data Science**: Python, R, C++, and MATLAB are taught and applied to real financial datasets. Students build trading algorithms, risk models, and pricing engines from scratch.',
      '**Mathematics Department Collaboration**: Unique joint programme between the Business School and Mathematics Department. Students take advanced pure mathematics courses alongside finance training.',
      '**Industry Projects**: Capstone projects are sponsored by major financial institutions. Recent projects include volatility forecasting for a hedge fund, optimal execution algorithms for a bank, and credit default prediction models.'
    ]),
    career: sect('Career Pathways & Prospects', [
      '**Quantitative Analyst (Quant)**: Design trading algorithms, risk models, and pricing engines at investment banks (Goldman Sachs, Morgan Stanley, JP Morgan) and proprietary trading firms (Jane Street, Optiver, Citadel).',
      '**Risk Management**: Model market, credit, and operational risk for major financial institutions. Develop stress testing frameworks and regulatory compliance models.',
      '**Data Science in Finance**: Apply machine learning to predict market movements, detect fraud, optimise portfolios, and build recommendation engines at asset managers and fintech companies.',
      '**Algorithmic Trading**: Build and maintain high-frequency trading systems, execution algorithms, and market-making strategies at quantitative trading firms.',
      '**Graduate Studies**: Many graduates pursue Master\'s or PhD programmes in Financial Engineering at MIT, Columbia, Princeton, Oxford, or Cambridge. The mathematical foundation makes them highly competitive applicants.',
      '**Fintech & Startups**: Apply quantitative skills to blockchain analytics, decentralised finance (DeFi) protocols, robo-advisory platforms, and insurtech ventures.'
    ]),
    campus: sect('Campus Life & Student Experience', [
      '**Main Campus (Pok Fu Lam)**: All four years at the Main Campus. QFin students split time between the Business School (K.K. Leung Building) and the Mathematics Department (Run Run Shaw Building).',
      '**Quantitative Finance Lab**: Dedicated computing lab with high-performance workstations, real-time market data feeds, and professional software (Bloomberg, Refinitiv Eikon, MATLAB, Mathematica).',
      '**Hall Life**: QFin students often choose St. John\'s College or University Hall for their strong academic communities and proximity to both the Business School and Mathematics Department.',
      '**Mathematics Society & Business Society**: Active participation in both societies — case competitions from BizSoc and mathematics competitions (Putnam, Mathematical Contest in Modelling) from MathSoc.',
      '**Mentorship**: Academic advisors from both the Mathematics Department and Business School. Industry mentors from quantitative trading firms and investment banks provide career guidance.'
    ]),
    competitiveness: sect('Admission Competitiveness Analysis', [
      '**Overall Difficulty**: Very High (4.5/5 stars). Approximately 1,200-1,500 applicants compete for ~60 places annually (~5% admission rate).',
      '**Score Distribution**: Top quartile: Best 5 = 33-35; Median: Best 5 = 30-32; Bottom quartile: Best 5 = 28-29.',
      '**Subject Weighting Strategy**: Maths (x2.0) + Best Elective (x1.0) + English (x1.0) + LS/CSD (x1.0) + Chinese (x1.0). Mathematics is by far the most critical subject — a 5** in Maths (especially M2) is almost essential.',
      '**No Interview Advantage**: Purely score-based admission means there is no subjectivity. However, this also means every single point matters enormously.',
      '**Band A Advantage**: Band A Choice 1 is essential. The programme rarely considers Choice 2 or lower bands due to high demand.',
      '**Non-JUPAS Pathway**: IB (40+/45 with HL Maths), GCE A-Levels (A*A*A including Further Maths). Approximately 10-15 places reserved for non-JUPAS entrants.'
    ]),
    alumni: sect('Notable Alumni & Faculty', [
      '**Professor Y.K. Kwok**: Renowned financial mathematician, author of the definitive textbook "Mathematical Models of Financial Derivatives." Leading researcher in option pricing and computational finance.',
      '**Professor W.K. Ching**: Chair of Mathematics, expert in stochastic modelling and numerical methods for financial engineering. Published extensively in top-tier journals.',
      '**Dr. Alan Chen**: Former Head of Quantitative Research at a major Hong Kong hedge fund. Pioneer in applying machine learning to Asian equity markets.',
      '**Professor Lixin Wu**: Expert in computational finance and risk management. Developed widely-used numerical methods for pricing complex derivatives.',
      '**Dr. Raymond Yuen**: Managing Director at a global investment bank, leading the quantitative strategies team for Asia-Pacific equities trading.'
    ]),
    scholarships: sect('Scholarships & Financial Aid', [
      '**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in Maths and 2+ other subjects). Full or half tuition coverage.',
      '**Mathematics Department Scholarships**: For outstanding performance in mathematics competitions (HKMO, AIMO) and academic excellence (HKD 10,000-30,000/year).',
      '**Business School Merit Awards**: For academic performance and quantitative research potential (HKD 15,000-40,000/year).',
      '**Quantitative Finance Research Grants**: Funding for students undertaking research projects with industry partners (up to HKD 20,000 per project).',
      '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans.'
    ]),
    tips: sect('Ace Sir\'s QFin Strategy', [
      '**Master M2 — No Excuses**: If you are serious about QFin, M2 (Calculus & Statistics) is not optional. The entire programme builds on multivariable calculus, probability theory, and linear algebra. A 5** in M2 is your golden ticket.',
      '**Learn to Code Before You Arrive**: Start with Python. Then learn R for statistics and C++ for performance-critical applications. Being able to write a Monte Carlo simulation or backtest a trading strategy gives you a massive edge over classmates who start from zero.',
      '**Understand the Math Behind the Money**: Do not just memorise formulas. Understand WHY Black-Scholes works, WHY stochastic calculus matters, and WHY eigenvalues appear in portfolio optimisation. The best quants are mathematicians first, traders second.',
      '**Build a GitHub Portfolio**: Employers care more about your code than your GPA. Build a volatility surface visualiser, an options backtester, or a risk parity portfolio optimiser. Show you can ship production-quality quantitative code.',
      '**Read the Classics**: "Options, Futures, and Other Derivatives" by John Hull, "The Concepts and Practice of Mathematical Finance" by Mark Joshi, and "Paul Wilmott on Quantitative Finance." These are the bibles of the profession.'
    ])
  }, {
    admission: sect('入學要求與計分詳情 (DSE)', [
      '**學術門檻**：計量金融學士 (QFin) 位處數學、統計學與金融的交匯點。入學通常需要 Best 5 達 30-32 分。',
      '**數學 (延伸部分)**：M2 (微積分與統計) 實際上是必需的。M1 可接受但強烈建議 M2。課程假設學生精通微積分、線性代數及概率論。',
      '**物理或資訊科技**：兩科均有助建立金融建模及算法交易所需的運算及邏輯思維。',
      '**英國語文**：預期英文達 5 級，因為課程涉及閱讀學術論文、撰寫技術報告及展示量化發現。',
      '**無面試**：入學主要基於 DSE 成績，因此 Best 5 每一分都很重要。專注於最大化數學及理科科目。'
    ]),
    curriculum: sect('課程結構與內容', [
      '**第一年 - 數學基礎**：實分析、概率論、線性代數及常微分方程。這些與華爾街量化交易員使用的數學工具相同。',
      '**第二年 - 統計及運算核心**：統計推斷、隨機過程、數值方法及 Python、R 和 MATLAB 科學計算。',
      '**第三年 - 金融工程**：期權定價模型 (Black-Scholes、二項式、蒙地卡羅)、利率模型、信貸風險建模及投資組合優化。機器學習在金融的應用入門。',
      '**第四年 - 進階專題及畢業專題**：算法交易、高頻交易系統、深度學習市場預測，以及與業界伙伴 (銀行、對沖基金或金融科技公司) 的全年畢業專題。',
      '**編程與數據科學**：教授 Python、R、C++ 及 MATLAB，並應用於真實金融數據集。學生從頭開始建立交易算法、風險模型及定價引擎。',
      '**數學系合作**：商學院與數學系獨特的聯合課程。學生在金融培訓的同時修讀進階純數學課程。',
      '**業界項目**：畢業專題由主要金融機構贊助。近期項目包括為對沖基金預測波動率、為銀行建立最佳執行算法及信貸違約預測模型。'
    ]),
    career: sect('職業前景與出路', [
      '**量化分析師 (Quant)**：在投資銀行 (高盛、摩根士丹利、摩根大通) 及自營交易公司 (Jane Street、Optiver、Citadel) 設計交易算法、風險模型及定價引擎。',
      '**風險管理**：為主要金融機構建模市場風險、信貸風險及營運風險。開發壓力測試框架及監管合規模型。',
      '**金融數據科學**：應用機器學習預測市場走勢、偵測欺詐、優化投資組合及在資產管理公司和金融科技公司建立推薦引擎。',
      '**算法交易**：在量化交易公司建立及維護高頻交易系統、執行算法及做市策略。',
      '**深造研究**：很多畢業生到 MIT、哥倫比亞、普林斯頓、牛津或劍橋修讀金融工程碩士或博士課程。數學基礎使他們成為極具競爭力的申請者。',
      '**金融科技及初創**：將量化技能應用於區塊鏈分析、去中心化金融 (DeFi) 協議、智能投顧平台及保險科技創業。'
    ]),
    campus: sect('校園生活與學生體驗', [
      '**主校園 (薄扶林)**：四年均於主校園。QFin 學生在商學院 (梁銶琚樓) 及數學系 (邵逸夫樓) 之間分配時間。',
      '**計量金融實驗室**：專用運算實驗室，配備高性能工作站、實時市場數據饋送及專業軟件 (Bloomberg、Refinitiv Eikon、MATLAB、Mathematica)。',
      '**舍堂生活**：QFin 學生常選擇聖約翰學院或大學堂，因其強大的學術社群及鄰近商學院和數學系。',
      '**數學學會及商學會**：積極參與兩個學會——BizSoc 的案例比賽及 MathSoc 的數學比賽 (Putnam、數學建模競賽)。',
      '**師友指導**：數學系及商學院的學術導師。量化交易公司及投資銀行的業界導師提供職業指導。'
    ]),
    competitiveness: sect('入學競爭力分析', [
      '**整體難度**：極高 (4.5/5星)。每年約1,200-1,500人競爭~60個學額 (入學率約5%)。',
      '**分數分佈**：最高四分位數：Best 5 = 33-35分；中位數：Best 5 = 30-32分；最低四分位數：Best 5 = 28-29分。',
      '**科目加權策略**：數學 (x2.0) + 最佳選修科 (x1.0) + 英文 (x1.0) + 通識/公社 (x1.0) + 中文 (x1.0)。數學是迄今為止最關鍵的科目——數學 (尤其 M2) 達5**幾乎是必須的。',
      '**無面試優勢**：純分數入學意味沒有主觀因素。但這也表示每一分都極為重要。',
      '**Band A 優勢**：Band A 第一志願是必須的。由於需求極高，課程極少考慮第二志願或較低 band。',
      '**非聯招途徑**：國際文憑 (IB 40+/45 包括高等數學)、GCE A-Level (A*A*A 包括進階數學)。約10-15個學額預留予非聯招申請者。'
    ]),
    alumni: sect('知名校友及教職員', [
      '**郭予宏教授**：著名金融數學家，《金融衍生工具的數學模型》權威教科書作者。期權定價及計算金融的領先研究者。',
      '**程瑋琪教授**：數學系系主任，隨機建模及金融工程數值方法專家。於頂尖期刊廣泛發表論文。',
      '**陳博士**：前香港大型對沖基金量化研究主管。將機器學習應用於亞洲股票市場的先驅。',
      '**吳立欣教授**：計算金融及風險管理專家。開發了廣泛使用的複雜衍生工具定價數值方法。',
      '**袁博士**：全球投資銀行董事總經理，領導亞太區股票交易的量化策略團隊。'
    ]),
    scholarships: sect('獎學金及經濟援助', [
      '**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常數學及另外2科達5**)。全額或半額學費資助。',
      '**數學系獎學金**：頒予數學比賽 (香港數學奧林匹克、亞洲國際數學奧林匹克) 及學術卓越表現 (每年港幣10,000-30,000元)。',
      '**商學院優異獎項**：頒予學術表現及量化研究潛質 (每年港幣15,000-40,000元)。',
      '**計量金融研究資助**：為與業界伙伴進行研究項目的學生提供資助 (每個項目最多港幣20,000元)。',
      '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。'
    ]),
    tips: sect('Ace Sir QFin 攻略', [
      '**精通 M2——沒有藉口**：如果你認真考慮 QFin，M2 (微積分與統計) 不是選修。整個課程都建立在多變量微積分、概率論及線性代數上。M2 達5**是你的黃金入場券。',
      '**入學前學習編程**：從 Python 開始。然後學習用於統計的 R 及用於性能關鍵應用的 C++。能夠編寫蒙地卡羅模擬或回測交易策略會讓你比從零開始的同學擁有巨大優勢。',
      '**理解金錢背後的數學**：不要只記公式。要理解為什麼 Black-Scholes 有效、為什麼隨機微積分重要，以及為什麼特徵值出現在投資組合優化中。最優秀的量化分析師首先是數學家，其次才是交易員。',
      '**建立 GitHub 作品集**：僱主更關心你的代碼而非 GPA。建立波動率曲面視覺化工具、期權回測器或風險平價投資組合優化器。展示你能交付生產級量化代碼。',
      '**閱讀經典**：John Hull 的《Options, Futures, and Other Derivatives》、Mark Joshi 的《The Concepts and Practice of Mathematical Finance》及《Paul Wilmott on Quantitative Finance》。這些是業界的聖經。'
    ])
  })
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added JS6227. Total:', Object.keys(data.programmes).length);
