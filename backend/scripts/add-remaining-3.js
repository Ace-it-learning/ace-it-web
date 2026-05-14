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

// ============ JS6808 - BBA&LLB ============
data.programmes.JS6808 = {
  id: 'hku-bba-law', code: 'JS6808', name: '工商管理學士及法學士 (BBA&LLB)', university: 'HKU',
  content: makeContent({
    admission: sect('Eligibility & Admission Criteria (DSE)', [
      '**Academic Threshold**: The BBA&LLB double degree is one of HKU\'s most prestigious programmes. Admission requires Best 5 scores of 33-35 (standard scale) — among the highest at HKU.',
      '**English Language**: Level 5* or above is effectively required. The law component demands exceptional English reading, writing, and analysis at a level far beyond standard DSE.',
      '**Mathematics**: Strong maths for the BBA component, particularly for finance, accounting, and quantitative business courses. M1 or M2 is helpful.',
      '**Interview**: All shortlisted candidates are interviewed to assess intellectual maturity, time management awareness, motivation for the demanding dual workload, and career clarity.',
      '**Non-Academic Factors**: Leadership roles, debating/mooting experience, business competitions, and evidence of handling heavy workloads (e.g., multiple extracurriculars alongside strong academics) are highly valued.'
    ]),
    curriculum: sect('Programme Structure & Curriculum', [
      '**Year 1 - Integrated Foundations**: Business foundations (economics, accounting, marketing) alongside legal fundamentals (contract law, tort law, legal system). Heavy reading load begins immediately.',
      '**Year 2 - Core Expansion**: Constitutional law, criminal law, corporate finance, and business strategy. Students begin to see connections between legal frameworks and business decisions.',
      '**Year 3 - Law Specialisation**: Advanced legal subjects — corporate law, commercial law, international arbitration, competition law, and Chinese law. Mooting competitions intensify.',
      '**Year 4 - Business Specialisation & PCLL Prep**: Choose business concentrations (finance, marketing, management) alongside final law subjects. PCLL conversion courses for students pursuing legal practice.',
      '**Year 5 - Capstone & Professional Integration**: Final year dissertation on an interdisciplinary topic (e.g., "Corporate Governance in Cross-Border M&A"). Professional practice courses and graduate recruitment preparation.',
      '**Dual Pathways**: Graduates can pursue PCLL for legal practice OR enter business directly. The dual qualification is uniquely valuable for commercial law, investment banking, and consulting.',
      '**Workload Reality**: This is TWO degrees in five years. Students typically take 6-7 courses per semester (vs. 5 for single-degree students). Time management and resilience are essential.'
    ]),
    career: sect('Career Pathways & Prospects', [
      '**Commercial Law (The Perfect Fit)**: M&A lawyers, private equity legal advisors, and in-house counsel at banks value the dual qualification enormously. Firms like Kirkland & Ellis, Skadden, and Clifford Chance actively recruit BBA&LLB graduates.',
      '**Investment Banking**: IB teams highly prize candidates who understand both the deal structure AND the legal documentation. BBA&LLB graduates excel in execution-heavy roles.',
      '**Management Consulting**: Strategy consulting firms (McKinsey, BCG, Bain) recruit BBA&LLB graduates for their analytical rigour, commercial awareness, and ability to structure complex problems.',
      '**Private Equity & Venture Capital**: The legal + business combo is ideal for PE/VC roles involving deal structuring, due diligence, and portfolio company governance.',
      '**Entrepreneurship**: Founders with legal knowledge avoid costly mistakes in contracts, IP, regulatory compliance, and shareholder agreements. Many BBA&LLB graduates launch successful startups.',
      '**Government & Policy**: The Department of Justice, policy bureaux, and regulatory bodies (SFC, HKMA) value the dual perspective on law and economics.'
    ]),
    campus: sect('Campus Life & Student Experience', [
      '**Main Campus (Pok Fu Lam)**: All five years at the Main Campus. Students split time between the Business School (K.K. Leung Building) and the Law Faculty (Cheng Yu Tung Tower).',
      '**Dual Society Life**: Active participation in both Law Society (LawSoc) and Business Society (BizSoc) — mooting competitions, case competitions, firm presentations, and networking events.',
      '**Hall Life**: BBA&LLB students often choose St. John\'s College (academic excellence) or University Hall (proximity to both Law and Business buildings).',
      '**Study Groups**: The programme fosters tight-knit study groups due to the intense workload. Peer support is essential for surviving the dual degree.',
      '**Mentorship**: Dual mentorship from both Business School and Law Faculty alumni. Mentors include partners at Magic Circle firms, managing directors at investment banks, and general counsel at multinationals.'
    ]),
    competitiveness: sect('Admission Competitiveness Analysis', [
      '**Overall Difficulty**: Extreme (5/5 stars). Approximately 1,000-1,500 applicants compete for ~50 places annually (~4% admission rate).',
      '**Score Distribution**: Top quartile: Best 5 = 36-38; Median: Best 5 = 33-35; Bottom quartile: Best 5 = 31-32.',
      '**Subject Weighting Strategy**: English (x2.0) + Maths (x1.3) + Best Elective (x1.0) + LS/CSD (x1.0) + Chinese (x1.0). English is absolutely critical — most successful candidates have 5** in English.',
      '**Interview Weighting**: The interview carries approximately 30-40% of the final admission decision. Candidates must demonstrate they understand the workload and have a clear rationale for the dual degree.',
      '**Band A Advantage**: Band A Choice 1 is essential. The programme does not consider Choice 2 or lower bands.',
      '**Non-JUPAS Pathway**: IB (42+/45), GCE A-Levels (A*A*A including English and Maths/Economics). Approximately 10-15 places reserved for non-JUPAS entrants.'
    ]),
    alumni: sect('Notable Alumni & Faculty', [
      '**The Honourable Andrew Cheung Kui-nung**: Chief Justice of the Court of Final Appeal. HKU Law graduate who exemplifies the legal excellence the programme cultivates.',
      '**Ronny Tong Ka-wah, SC**: Senior Counsel and Executive Council member. Prominent public law advocate with deep commercial understanding.',
      '**Dr. David Li Kwok-po**: Former Chairman of Bank of East Asia. Demonstrates how legal training complements business leadership at the highest level.',
      '**Professor Johannes Chan SC**: Former Dean of HKU Law, constitutional scholar. First Chinese Dean, symbolising the programme\'s commitment to excellence.',
      '**Victor Li Tzar-kuoi**: Chairman of CK Hutchison and CK Asset Holdings. One of Hong Kong\'s most powerful business leaders, demonstrating the value of interdisciplinary business-legal acumen.'
    ]),
    scholarships: sect('Scholarships & Financial Aid', [
      '**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in 4+ subjects, especially English). Full or half tuition coverage.',
      '**Dual Degree Scholarships**: Special scholarships for BBA&LLB students covering partial tuition (HKD 30,000-60,000/year) based on academic merit.',
      '**Law Faculty Scholarships**: For mooting achievements, legal research potential, and academic performance (HKD 10,000-50,000/year).',
      '**Business School Merit Awards**: For academic excellence and leadership in business-related activities (HKD 20,000-50,000/year).',
      '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans. Given the 5-year duration, financial planning is important.'
    ]),
    tips: sect('Ace Sir\'s BBA&LLB Strategy', [
      '**Be Brutally Honest About the Workload**: This is TWO degrees in five years. You will have less free time than single-degree peers, fewer social events, and more all-nighters. Make sure you genuinely want both law and business — not just the prestige of the name.',
      '**English at 5* Level Minimum**: If your English is not consistently at 5* level, this programme will be extremely difficult. The law reading load is immense — hundreds of pages per week of dense legal texts.',
      '**Think at the Intersection**: The value of this degree is not in being a good lawyer OR a good businessman — it is in understanding how legal rules shape business decisions, deal structuring, and risk management. Cultivate this interdisciplinary mindset from day one.',
      '**Plan Your Career Early**: Decide by Year 3 whether you are pursuing PCLL (legal practice) or entering business directly. This determines your elective choices, internship targets, and networking focus. Trying to keep both doors open for too long dilutes your preparation.',
      '**Build Stamina**: Read long, complex texts daily. Practice writing clearly and concisely. The ability to absorb vast amounts of information and produce high-quality analysis quickly is the core skill this degree develops.'
    ])
  }, {
    admission: sect('入學要求與計分詳情 (DSE)', [
      '**學術門檻**：工商管理學士及法學士雙學位是港大最負盛名的課程之一。入學通常需要 Best 5 達 33-35 分——港大最高分之一。',
      '**英國語文**：實際上需要 5* 或以上。法律部分要求卓越的英文閱讀、寫作及分析能力，遠超標準 DSE 水平。',
      '**數學**：BBA 部分需要強大的數學能力，特別是金融、會計及量化商業課程。M1 或 M2 有幫助。',
      '**面試**：所有入圍考生均會接受面試，評估心智成熟度、時間管理意識、對繁重雙學位負擔的動機及職業清晰度。',
      '**非學術因素**：領導角色、辯論/模擬法庭經驗、商業比賽及處理繁重負擔的證明 (如在強大學術表現下同時參與多項課外活動) 極受重視。'
    ]),
    curriculum: sect('課程結構與內容', [
      '**第一年 - 整合基礎**：商業基礎 (經濟、會計、市場學) 與法律基礎 (合同法、侵權法、法律制度) 並行。繁重的閱讀量立即開始。',
      '**第二年 - 核心擴展**：憲法、刑法、公司金融及商業策略。學生開始看到法律框架與商業決策之間的聯繫。',
      '**第三年 - 法律專修**：進階法律科目——公司法、商法、國際仲裁、競爭法及中國法。模擬法庭比賽加劇。',
      '**第四年 - 商業專修及 PCLL 準備**：選擇商業專修 (金融、市場學、管理) 及最後的法律科目。追求法律執業的學生修讀 PCLL 轉換課程。',
      '**第五年 - 畢業專題及專業整合**：跨學科題目的畢業論文 (如「跨境併購的企業管治」)。專業實務課程及畢業招聘準備。',
      '**雙重途徑**：畢業生可以修讀 PCLL 從事法律工作，或直接進入商界。雙學位資格對商業法律、投資銀行及顧問工作特別有價值。',
      '**工作量現實**：這是五年內完成兩個學位。學生通常每學期修讀6-7科 (單學位學生為5科)。時間管理及抗壓能力是必須的。'
    ]),
    career: sect('職業前景與出路', [
      '**商業法律 (完美配搭)**：併購律師、私募法律顧問及銀行內部法律顧問極度重視雙學位資格。凱易、世達及高偉紳等律師行積極聘請 BBA&LLB 畢業生。',
      '**投資銀行**：投行團隊極度珍視同時理解交易結構及法律文件的候選人。BBA&LLB 畢業生在執行密集型職位表現出色。',
      '**管理顧問**：策略顧問公司 (麥肯錫、BCG、貝恩) 聘請 BBA&LLB 畢業生，因其分析嚴謹度、商業觸覺及結構化複雜問題的能力。',
      '**私募及創投**：法律加商業的組合對涉及交易結構、盡職審查及投資組合公司管治的私募/創投職位極為理想。',
      '**創業**：具備法律知識的創辦人能避免合約、知識產權、監管合規及股東協議方面的昂貴錯誤。很多 BBA&LLB 畢業生創辦成功的初創企業。',
      '**政府及政策**：律政司、政策局及監管機構 (證監會、金管局) 重視法律與經濟的雙重視角。'
    ]),
    campus: sect('校園生活與學生體驗', [
      '**主校園 (薄扶林)**：五年均於主校園。學生在商學院 (梁銶琚樓) 及法律學院 (鄭裕彤教學樓) 之間分配時間。',
      '**雙重學會生活**：積極參與法律學會 (LawSoc) 及商學會 (BizSoc)——模擬法庭比賽、案例比賽、公司講座及聯誼活動。',
      '**舍堂生活**：BBA&LLB 學生常選擇聖約翰學院 (學術卓越) 或大學堂 (鄰近法律及商業大樓)。',
      '**學習小組**：由於工作量極大，課程培養緊密的學習小組。同儕支援對於在雙學位中生存至關重要。',
      '**師友指導**：商學院及法律學院校友的雙重指導。導師包括 Magic Circle 律師行合伙人、投資銀行董事總經理及跨國企業總法律顧問。'
    ]),
    competitiveness: sect('入學競爭力分析', [
      '**整體難度**：極高 (5/5星)。每年約1,000-1,500人競爭~50個學額 (入學率約4%)。',
      '**分數分佈**：最高四分位數：Best 5 = 36-38分；中位數：Best 5 = 33-35分；最低四分位數：Best 5 = 31-32分。',
      '**科目加權策略**：英文 (x2.0) + 數學 (x1.3) + 最佳選修科 (x1.0) + 通識/公社 (x1.0) + 中文 (x1.0)。英文絕對是關鍵——大部分成功入學者英文達5**。',
      '**面試比重**：面試佔最終入學決定約30-40%。考生必須展示他們理解工作量並對雙學位有清晰的理由。',
      '**Band A 優勢**：Band A 第一志願是必須的。課程不考慮第二志願或較低 band。',
      '**非聯招途徑**：國際文憑 (IB 42+/45)、GCE A-Level (A*A*A 包括英文及數學/經濟)。約10-15個學額預留予非聯招申請者。'
    ]),
    alumni: sect('知名校友及教職員', [
      '**張舉能法官閣下**：香港終審法院首席法官。港大法律畢業生，體現了課程培養的法律卓越。',
      '**湯家驊資深大律師**：資深大律師及行政會議成員。具有深厚商業理解的著名公法倡導者。',
      '**李國寶博士**：前東亞銀行主席。展示法律培訓如何在高層次補充商業領導力。',
      '**陳文敏教授資深大律師**：前港大法律學院院長，憲法學者。首位華人院長，象徵課程對卓越的追求。',
      '**李澤鉅**：長和及長實集團主席。香港最有權力的商業領袖之一，展示跨學科商業法律才幹的價值。'
    ]),
    scholarships: sect('獎學金及經濟援助', [
      '**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常4科5**或以上，尤其英文)。全額或半額學費資助。',
      '**雙學位獎學金**：BBA&LLB 學生的特別獎學金，按學術成績涵蓋部分學費 (每年港幣30,000-60,000元)。',
      '**法律學院獎學金**：頒予模擬法庭成就、法律研究潛質及學術表現 (每年港幣10,000-50,000元)。',
      '**商學院優異獎項**：頒予商業相關活動的學術卓越及領導力 (每年港幣20,000-50,000元)。',
      '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。鑑於五年學制，財務規劃很重要。'
    ]),
    tips: sect('Ace Sir BBA&LLB 攻略', [
      '**現實評估工作量**：這是五年內完成兩個學位。你會比單學位同學擁有更少的空閒時間、更少的社交活動及更多的通宵達旦。確保你真正想要法律及商業——不只是名字的光環。',
      '**英文至少達 5* 水平**：如果你的英文未達 5* 水平，這課程會極為困難。法律閱讀量非常龐大——每週數百頁密集的法律文本。',
      '**具交匯思維**：這學位的價值不在於成為好律師或好商人——而在於理解法律規則如何塑造商業決策、交易結構及風險管理。從第一天起培養這種跨學科思維。',
      '**盡早規劃職業**：第三年決定是否修讀 PCLL (法律執業) 或直接進入商界。這決定你的選修課程、實習目標及人脈重點。太長時間試圖保持兩扇門敞開會削弱你的準備。',
      '**建立耐力**：每天閱讀長而複雜的文本。練習清晰簡潔地寫作。吸收大量資訊並快速產出高質量分析的能力，是這學位培養的核心技能。'
    ])
  })
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added JS6808. Total:', Object.keys(data.programmes).length);
