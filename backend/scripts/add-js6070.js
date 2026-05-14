const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'generated-programmes/batch1-hku-1-10-premium.json'), 'utf8'));

data.programmes.JS6070 = {
  id: 'hku-law',
  code: 'JS6070',
  name: '法學士 (LLB)',
  university: 'HKU',
  content: {
    en: {
      sections: {
        admission: {
          title: 'Eligibility & Admission Criteria (DSE)',
          content: [
            '**Academic Threshold**: HKU Law is consistently ranked among Asia\'s top law schools. Admission is highly competitive with typical Best 5 scores of 30-32 (standard scale).',
            '**Core Subjects**: English (Level 5+ mandatory — this is non-negotiable for law). Mathematics (Compulsory Part, Level 3+) and strong Liberal Studies / Citizenship and Social Development performance.',
            '**Liberal Studies / Citizenship**: Strong performance helps significantly, as legal reasoning requires deep understanding of social, political, and ethical contexts.',
            '**Interview**: Selected candidates are invited for interview to assess analytical thinking, communication clarity, logical reasoning, and genuine interest in the legal profession.',
            '**Non-Academic Factors**: Debating experience, mooting participation, Model UN, and legal-related volunteering (e.g., legal aid clinics) strengthen applications considerably.'
          ]
        },
        curriculum: {
          title: 'Programme Structure & Curriculum',
          content: [
            '**Year 1 - Legal Foundations**: Contract Law, Tort Law, and Legal System & Methodology. Introduction to legal research, case analysis, and statutory interpretation.',
            '**Year 2 - Core Subjects**: Constitutional Law, Criminal Law, and Land Law. Mooting competitions begin — students argue simulated cases before judges.',
            '**Year 3 - Advanced Core**: Equity & Trusts, Company Law, and Administrative Law. Optional subjects in international law, human rights, or commercial law.',
            '**Year 4 - Specialisation & PCLL Preparation**: Choose from concentrations in Commercial Law, Human Rights & Constitutional Law, or International Law. PCLL conversion courses for the legal practice pathway.',
            '**PCLL Pathway**: HKU LLB is a direct feeder to the Postgraduate Certificate in Laws (PCLL), the mandatory qualification for barristers and solicitors in Hong Kong.',
            '**Mooting Programme**: HKU has one of Asia\'s most successful mooting programmes. Teams regularly win the Philip C. Jessup International Law Moot Court Competition and the Willem C. Vis Moot.',
            '**Overseas Exchange**: Semester exchanges with Oxford, Cambridge, UCL, LSE, Melbourne, Toronto, and National University of Singapore. Some students pursue dual LLB degrees.'
          ]
        },
        career: {
          title: 'Career Pathways & Prospects',
          content: [
            '**International Law Firms**: Graduates regularly join Magic Circle firms (Clifford Chance, Linklaters, Freshfields) and White Shoe firms (Skadden, Sullivan & Cromwell) in Hong Kong and London.',
            '**Local Heavyweights**: Hong Kong\'s top local firms — Kirkland & Ellis, Deacons, Tanner De Witt, and Johnson Stokes & Master — recruit heavily from HKU Law.',
            '**Barristers\' Chambers**: Top graduates secure pupillage at leading chambers including Temple Chambers, Des Voeux Chambers, and Hong Kong Bar Association members.',
            '**In-House Counsel**: Multinationals (HSBC, Standard Chartered, Cathay Pacific) and investment banks (Goldman Sachs, Morgan Stanley) hire HKU lawyers for compliance, regulatory, and transactional roles.',
            '**Government & Public Sector**: The Department of Justice, Legal Aid Department, and various policy bureaux recruit HKU law graduates for prosecution, legal policy, and advisory positions.',
            '**Alternative Careers**: Management consulting (McKinsey, BCG, Bain), investment banking, compliance, journalism, and NGOs value the analytical and communication skills that legal training provides.'
          ]
        },
        campus: {
          title: 'Campus Life & Student Experience',
          content: [
            '**Main Campus (Pok Fu Lam)**: All four years at the historic Main Campus. Law students have dedicated spaces in the K.K. Leung Building and the Cheng Yu Tung Tower.',
            '**Law Library**: One of Hong Kong\'s most comprehensive legal research libraries, with subscriptions to Westlaw, LexisNexis, and HeinOnline. 24-hour access during exam periods.',
            '**Hall Life**: Law students are distributed across all 17 halls. Popular choices include St. John\'s College (strong academic tradition), University Hall (close to the Law building), and Ricci Hall.',
            '**Law Society (LawSoc)**: One of the largest student societies, organising mooting competitions, law firm networking nights, charity pro bono programmes, and the annual Law Ball.',
            '**Mentorship**: Each student is assigned an academic advisor and can access the alumni mentorship programme, connecting with partners at major law firms and members of the judiciary.'
          ]
        },
        competitiveness: {
          title: 'Admission Competitiveness Analysis',
          content: [
            '**Overall Difficulty**: Very High (4.5/5 stars). Approximately 2,000-2,500 applicants compete for ~220 places annually (~10% admission rate).',
            '**Score Distribution**: Top quartile: Best 5 = 33-35; Median: Best 5 = 30-32; Bottom quartile: Best 5 = 28-29.',
            '**Subject Weighting Strategy**: English (x1.5-2.0) + Best Elective (x1.0) + Maths (x1.0) + LS/CSD (x1.0) + Chinese (x1.0). English is by far the most critical subject — a 5** in English is almost essential.',
            '**Interview Weighting**: The interview carries approximately 20-30% of the final admission decision for borderline candidates. Strong interview performance can lift a candidate from the waiting list.',
            '**Band A Advantage**: Band A Choice 1 receives strong priority. Choice 2 has reduced but still viable chances. Lower bands are very unlikely.',
            '**Non-JUPAS Pathway**: IB (40+/45), GCE A-Levels (AAA* including English/History). Approximately 30-40 places reserved for non-JUPAS entrants, many with overseas boarding school backgrounds.'
          ]
        },
        alumni: {
          title: 'Notable Alumni & Faculty',
          content: [
            '**The Honourable Andrew Cheung Kui-nung**: Chief Justice of the Court of Final Appeal of Hong Kong. HKU LLB graduate who rose through the judiciary to the highest position.',
            '**The Honourable Geoffrey Ma Tao-li**: Former Chief Justice of the Court of Final Appeal. One of Hong Kong\'s most respected jurists.',
            '**Ronny Tong Ka-wah, SC**: Senior Counsel, former Chairman of the Hong Kong Bar Association, and current Executive Council member. Prominent public law advocate.',
            '**Audrey Eu Yuet-mee, SC**: Senior Counsel, former Chairman of the Hong Kong Bar Association, and founder of the Civic Party. Leading constitutional law expert.',
            '**Professor Johannes Chan SC**: Former Dean of HKU Law, renowned constitutional and human rights scholar. First Chinese Dean in the Faculty\'s history.'
          ]
        },
        scholarships: {
          title: 'Scholarships & Financial Aid',
          content: [
            '**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in 3+ subjects, especially English). Full or half tuition coverage.',
            '**Faculty of Law Scholarships**: Merit-based awards for academic excellence, mooting achievements, and legal research potential (HKD 10,000-50,000/year).',
            '**PCLL Scholarships**: For LLB graduates proceeding to PCLL, covering partial PCLL tuition fees (HKD 50,000-100,000).',
            '**Overseas Mooting Grants**: Funding for students representing HKU in international mooting competitions (up to HKD 20,000 per competition).',
            '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans for tuition and living expenses.'
          ]
        },
        tips: {
          title: 'Ace Sir\'s HKU Law Strategy',
          content: [
            '**English is Everything**: Level 5 in DSE English is the absolute minimum. Most successful candidates have 5* or 5**. Read legal news daily, write essays, debate — live in English.',
            '**Start Mooting Early**: Join your school\'s debate team or mooting club. The ability to construct logical arguments and deliver them persuasively under pressure is what separates good lawyers from great ones.',
            '**Stay Informed**: Follow Court of Final Appeal judgments, constitutional law developments, and commercial law cases. Show intellectual curiosity about how the law shapes society.',
            '**Read Beyond the Syllabus**: Read books like "The Rule of Law" by Tom Bingham or "Letters to a Law Student" by Nicholas McBride. Demonstrate genuine intellectual interest.',
            '**Understand the PCLL Pathway**: Know what PCLL is, why it matters, and the difference between solicitor and barrister pathways. Show you understand the full journey, not just the degree.'
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: '入學要求與計分詳情 (DSE)',
          content: [
            '**學術門檻**：港大法律學院長期位居亞洲頂尖法學院之列。入學競爭激烈，通常 Best 5 需達 30-32 分。',
            '**核心科目**：英文 (必須達 Level 5 或以上——這是法律系的硬性要求)。數學 (必修部分，Level 3 或以上) 及通識教育/公民與社會發展科的優異表現。',
            '**通識教育 / 公民科**：優異表現非常有幫助，因為法律推理需要深入理解社會、政治及道德背景。',
            '**面試**：入圍考生獲邀面試，評估分析思維、溝通清晰度、邏輯推理及對法律專業的真正興趣。',
            '**非學術因素**：辯論經驗、模擬法庭參與、模擬聯合國及法律相關義工服務 (如法律援助診所) 能大幅加強申請。'
          ]
        },
        curriculum: {
          title: '課程結構與內容',
          content: [
            '**第一年 - 法律基礎**：合同法、侵權法及法律制度與方法論。法律研究、案例分析及法規詮釋入門。',
            '**第二年 - 核心科目**：憲法、刑法及土地法。開始模擬法庭比賽——學生在法官前辯論模擬案件。',
            '**第三年 - 進階核心**：衡平法與信託、公司法及行政法。可選修國際法、人權法或商法。',
            '**第四年 - 專修及 PCLL 準備**：選擇商法、人權與憲法或國際法專修。PCLL 轉換課程為法律執業途徑做好準備。',
            '**PCLL 途徑**：港大 LLB 是直接通往法律專業證書 (PCLL) 的課程，PCLL 是在香港成為大律師及律師的必須資格。',
            '**模擬法庭計劃**：港大擁有亞洲最成功的模擬法庭計劃之一。隊伍經常贏得 Philip C. Jessup 國際法模擬法庭比賽及 Willem C. Vis Moot。',
            '**海外交流**：與牛津、劍橋、UCL、LSE、墨爾本、多倫多及新加坡國立大學的學期交流。部分學生修讀雙 LLB 學位。'
          ]
        },
        career: {
          title: '職業前景與出路',
          content: [
            '**國際律師行**：畢業生定期加入 Magic Circle 律師行 (高偉紳、年利達、富而德) 及 White Shoe 律師行 (世達、蘇利文) 的香港及倫敦辦事處。',
            '**本地大型律師行**：香港頂尖本地律師行——凱易、的近、譚德律師行及孫士打——大量聘請港大法律畢業生。',
            '**大律師事務所**：頂尖畢業生於 Temple Chambers、Des Voeux Chambers 及香港大律師公會成員事務所取得實習大律師資格。',
            '**企業法律顧問**：跨國企業 (滙豐、渣打、國泰) 及投資銀行 (高盛、摩根士丹利) 聘請港大法律畢業生擔任合規、監管及交易職位。',
            '**政府及公共部門**：律政司、法律援助署及各政策局聘請港大法律畢業生擔任檢控、法律政策及顧問職位。',
            '**另類出路**：管理顧問 (麥肯錫、BCG、貝恩)、投資銀行、合規、新聞界及非政府組織均重視法律訓練提供的分析及溝通技巧。'
          ]
        },
        campus: {
          title: '校園生活與學生體驗',
          content: [
            '**主校園 (薄扶林)**：四年均於歷史悠久的主校園。法律學生有專用空間於梁銶琚樓及鄭裕彤教學樓。',
            '**法律圖書館**：香港最全面的法律研究圖書館之一，訂閱 Westlaw、LexisNexis 及 HeinOnline。考試期間提供24小時開放。',
            '**舍堂生活**：法律學生分佈於所有17間舍堂。熱門選擇包括聖約翰學院 (學術傳統深厚)、大學堂 (鄰近法律大樓) 及利瑪竇宿舍。',
            '**法律學會 (LawSoc)**：最大的學生學會之一，舉辦模擬法庭比賽、律師行聯誼之夜、慈善義務法律服務及年度 Law Ball。',
            '**師友指導**：每位學生獲配學術導師，並可參加校友師友計劃，與大型律師行合伙人及司法機構成員聯繫。'
          ]
        },
        competitiveness: {
          title: '入學競爭力分析',
          content: [
            '**整體難度**：極高 (4.5/5星)。每年約2,000-2,500人競爭~220個學額 (入學率約10%)。',
            '**分數分佈**：最高四分位數：Best 5 = 33-35分；中位數：Best 5 = 30-32分；最低四分位數：Best 5 = 28-29分。',
            '**科目加權策略**：英文 (x1.5-2.0) + 最佳選修科 (x1.0) + 數學 (x1.0) + 通識/公社 (x1.0) + 中文 (x1.0)。英文是迄今為止最關鍵的科目——英文達5**幾乎是必須的。',
            '**面試比重**：面試佔最終入學決定約20-30% (對邊緣考生)。面試表現卓越可將候補名單上的考生提升為正取。',
            '**Band A 優勢**：Band A 第一志願獲強烈優先考慮。第二志願機會減少但仍有可能。較低 band 機會甚微。',
            '**非聯招途徑**：國際文憑 (IB 40+/45)、GCE A-Level (AAA* 包括英文/歷史)。約30-40個學額預留予非聯招申請者，很多具有海外寄宿學校背景。'
          ]
        },
        alumni: {
          title: '知名校友及教職員',
          content: [
            '**張舉能法官閣下**：香港終審法院首席法官。港大 LLB 畢業生，從司法機構晉升至最高職位。',
            '**馬道立法官閣下**：前香港終審法院首席法官。香港最受尊崇的法官之一。',
            '**湯家驊資深大律師**：資深大律師、前香港大律師公會主席、現任行政會議成員。著名公法倡導者。',
            '**余若薇資深大律師**：資深大律師、前香港大律師公會主席、公民黨創黨主席。領先憲法專家。',
            '**陳文敏教授資深大律師**：前港大法律學院院長，著名憲法及人權學者。學院歷史上首位華人院長。'
          ]
        },
        scholarships: {
          title: '獎學金及經濟援助',
          content: [
            '**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常3科5**或以上，尤其英文)。全額或半額學費資助。',
            '**法律學院獎學金**：頒予學術卓越、模擬法庭成就及法律研究潛質的 merit-based 獎項 (每年港幣10,000-50,000元)。',
            '**PCLL 獎學金**：予修讀 PCLL 的 LLB 畢業生，涵蓋部分 PCLL 學費 (港幣50,000-100,000元)。',
            '**海外模擬法庭資助**：為代表港大參加國際模擬法庭比賽的學生提供資助 (每次最多港幣20,000元)。',
            '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供學費及生活費低息貸款。'
          ]
        },
        tips: {
          title: 'Ace Sir 港大法律攻略',
          content: [
            '**英文是一切**：DSE 英文 5 級是絕對最低要求。大部分成功入學者達 5* 或 5**。每天閱讀法律新聞、寫文章、辯論——讓自己活在英語中。',
            '**盡早開始模擬法庭**：加入學校的辯論隊或模擬法庭學會。在壓力下構建邏輯論點並有說服力地表達的能力，是好律師與卓越律師的分水嶺。',
            '**保持資訊靈通**：追蹤終審法院判決、憲法發展及商業法案例。展示你對法律如何塑造社會的求知慾。',
            '**超越課程閱讀**：閱讀 Tom Bingham 的《The Rule of Law》或 Nicholas McBride 的《Letters to a Law Student》等書籍。展示真正的求知興趣。',
            '**了解 PCLL 途徑**：了解什麼是 PCLL、為什麼重要，以及事務律師與大律師途徑的區別。展示你了解整個旅程，不只是學位。'
          ]
        }
      }
    }
  }
};

fs.writeFileSync(path.join(__dirname, 'generated-programmes/batch1-hku-1-10-premium.json'), JSON.stringify(data, null, 2));
console.log('Added JS6070. Total programmes:', Object.keys(data.programmes).length);
