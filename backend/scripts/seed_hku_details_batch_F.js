/**
 * Seed HKU Programme Details - Batch F
 * Programmes: JS6822, JS6810, JS6418, JS6468
 * Faculties: Social Sciences, Medicine
 * Run: node backend/scripts/seed_hku_details_batch_F.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  // =====================================================
  // JS6822 - 新聞媒體及人工智能學士 (BJMAI)
  // =====================================================
  {
    code: "JS6822",
    nameZh: "新聞媒體及人工智能學士",
    nameEn: "BJMAI",
    university: "香港大學",
    faculty: "社會科學學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Interdisciplinary journalism-tech programme. Median admission score typically Best 6 = 24-27 (standard scale).",
            "**Core Subjects**: English (Level 5+ strongly preferred), Chinese (Level 4+), and strong performance in humanities or technology electives.",
            "**Communication Skills**: Demonstrated writing ability, public speaking experience, or media production skills through school publications, debate teams, or video projects.",
            "**Tech Interest**: Basic understanding of AI, data journalism, or digital media tools. Self-taught coding or content creation experience is valued.",
            "**Interview**: Panel interview assessing media literacy, ethical reasoning about AI in journalism, and communication skills. May include a writing test."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Media Foundations**: News writing, media ethics, introduction to journalism, and digital storytelling. Basic programming for journalists (Python, data scraping).",
            "**Year 2 - AI & Media**: Machine learning for media, automated journalism, AI-generated content detection, and algorithmic bias in news recommendation systems.",
            "**Year 3 - Specialisation**: Choose tracks — (1) Data Journalism, (2) AI Media Production, or (3) Media Policy & Ethics. Internship at newsroom or media tech company.",
            "**Year 4 - Capstone**: Final project combining journalism and AI — e.g., an AI-powered investigative tool, an interactive data story, or a media ethics research thesis.",
            "**Technical Skills**: Python, R, data visualisation (D3.js, Flourish), video editing, social media analytics, NLP tools for text analysis.",
            "**Industry Partnerships**: Collaborations with SCMP, RTHK, and local digital media startups. Guest lectures from award-winning journalists and AI researchers."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Digital Journalism**: Data journalist, AI editor, or interactive storyteller at news organisations (SCMP, Reuters, Bloomberg).",
            "**Media Technology**: Product manager or UX researcher at media tech companies, developing AI-powered content platforms.",
            "**Content Strategy**: Content strategist or digital producer at streaming platforms, social media companies, or brand marketing teams.",
            "**Media Analytics**: Social media analyst, audience insights specialist, or media metrics consultant.",
            "**Policy & Ethics**: AI ethics researcher, media policy analyst at government or NGOs focusing on digital rights and information integrity.",
            "**Further Studies**: MA in Journalism, MSc in Data Science, or MA in Media Studies at Columbia, LSE, or NUS."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Media Lab**: State-of-the-art media production lab with video studios, podcast recording rooms, and data journalism workstations.",
            "**Newsroom Simulation**: Regular newsroom simulations where students produce digital content under deadline pressure using real news scenarios.",
            "**Guest Lectures**: Weekly talks by journalists from SCMP, RTHK, and international media. Workshops on investigative reporting and data storytelling.",
            "**Student Media**: Opportunities to contribute to HKU's student publications and digital media platforms. Build a professional portfolio before graduation.",
            "**Overseas Exchange**: Partnerships with Columbia Journalism School, University of Missouri, and City University London for semester exchanges."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (3/5 stars). Approximately 250-350 applicants for ~40-50 places annually (~12-15% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 27-29; Median: Best 6 = 24-27; Bottom quartile: Best 6 = 22-24.",
            "**Subject Strategy**: English (Level 5+) + Chinese (Level 4+) + any humanities elective. ICT or Mathematics demonstrates tech readiness.",
            "**Interview Focus**: Media awareness, ethical reasoning about AI, and ability to articulate complex ideas clearly in both English and Chinese.",
            "**Experience Advantage**: School newspaper editor, debate team, YouTube channel, or blog with substantial following strengthens applications.",
            "**Non-JUPAS Pathway**: IB (32+/45) with strong writing subjects, GCE A-Levels (ABB including English). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Francis Lee**: Leading scholar in digital journalism and media effects research. Author of influential studies on Hong Kong media landscape.",
            "**Dr. Alice Wong**: Expert in AI ethics and automated journalism. Consultant for international media organisations on responsible AI use.",
            "**Alumni - Kevin Lau (Class of 2022)**: Data Journalist at Reuters, specialising in financial data visualisation and investigative reporting.",
            "**Alumni - Michelle Chan (Class of 2021)**: AI Content Strategist at a major streaming platform, developing personalised content recommendation systems.",
            "**Alumni - Brian Tsang (Class of 2023)**: Founder of a Hong Kong digital media startup using AI to analyse public sentiment on social issues."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Journalism Scholarship**: $20,000/year for students with exceptional writing portfolios and academic merit (Best 6 = 26+).",
            "**Media Innovation Award**: $15,000 for students developing innovative media projects using AI or data journalism techniques.",
            "**Faculty of Social Sciences Scholarship**: $10,000-25,000 for high-achieving DSE students. No separate application required.",
            "**Industry-Sponsored Scholarships**: Partnerships with SCMP and RTHK offering $20,000/year + guaranteed internships.",
            "**Need-Based Financial Aid**: HKU's comprehensive financial aid programme covers tuition and living expenses for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Start a Blog or YouTube Channel**: Even a small following demonstrates initiative. Cover local Hong Kong issues with a data-driven angle to stand out.",
            "**Ace Sir's Tip #2 — Learn Basic Data Journalism**: Try tools like Flourish, Datawrapper, or Tableau Public. Create one data visualisation about a Hong Kong topic for your portfolio.",
            "**Ace Sir's Tip #3 — Follow AI in Media Debates**: Read about deepfakes, algorithmic bias, and AI-generated news. Be ready to discuss both opportunities and risks in your interview.",
            "**Ace Sir's Tip #4 — Practice Bilingual Writing**: This programme requires strong skills in both English and Chinese. Write op-eds, blog posts, or social media content in both languages.",
            "**Ace Sir's Tip #5 — Understand Media Business Models**: Know how digital media makes money (subscriptions, ads, memberships). Mention trends like newsletter platforms (Substack) and podcast monetisation."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：跨學科新聞科技課程。中位數入學成績通常最佳六科 = 24-27分（標準計分）。",
            "**核心科目**：英文（Level 5+較佳），中文（Level 4+），人文或科技選修科表現優異。",
            "**溝通技巧**：透過學校刊物、辯論隊或視頻項目展示寫作能力、公開演講經驗或媒體製作技能。",
            "**科技興趣**：對AI、數據新聞或數碼媒體工具的基本理解。自學編程或內容創作經驗受重視。",
            "**面試**：小組面試評估媒體素養、對AI在新聞中應用的倫理推理和溝通技巧。可能包括寫作測試。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 媒體基礎**：新聞寫作、媒體倫理、新聞學導論和數碼敘事。記者基礎編程（Python、數據抓取）。",
            "**第二年 - AI與媒體**：媒體機器學習、自動化新聞、AI生成內容檢測和新聞推薦系統中的算法偏見。",
            "**第三年 - 專修**：選擇方向——(1) 數據新聞、(2) AI媒體製作或 (3) 媒體政策與倫理。在新聞編輯室或媒體科技公司實習。",
            "**第四年 - 畢業項目**：結合新聞與AI的畢業項目——例如AI驅動的調查工具、互動數據故事或媒體倫理研究論文。",
            "**技術技能**：Python、R、數據視覺化（D3.js、Flourish）、視頻編輯、社交媒體分析、文本分析NLP工具。",
            "**業界合作**：與南華早報、香港電台和本地數碼媒體初創公司合作。獲獎記者和AI研究員的嘉賓講座。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**數碼新聞**：新聞機構（南華早報、路透社、彭博）的數據記者、AI編輯或互動敘事員。",
            "**媒體科技**：媒體科技公司的產品經理或UX研究員，開發AI驅動的內容平台。",
            "**內容策略**：串流平台、社交媒體公司或品牌營銷團隊的內容策略師或數碼製作人。",
            "**媒體分析**：社交媒體分析師、受眾洞察專家或媒體指標顧問。",
            "**政策與倫理**：AI倫理研究員、政府或非政府組織的媒體政策分析師，專注於數碼權利和信息完整性。",
            "**進修出路**：哥倫比亞、倫敦政經或新加坡國立大學的新聞學文學碩士、數據科學理學碩士或媒體研究文學碩士。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**媒體實驗室**：配備視頻工作室、播客錄音室和數據新聞工作站的尖端媒體製作實驗室。",
            "**新聞編輯室模擬**：定期新聞編輯室模擬，學生在截稿壓力下使用真實新聞場景製作數碼內容。",
            "**嘉賓講座**：南華早報、香港電台和國際媒體記者每週講座。調查報道和數據敘事工作坊。",
            "**學生媒體**：有機會為港大學生刊物和數碼媒體平台供稿。畢業前建立專業作品集。",
            "**海外交流**：與哥倫比亞新聞學院、密蘇里大學和倫敦城市大學合作，提供學期交流機會。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：中等（3/5星）。每年約250-350人申請，錄取約40-50人（~12-15%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 27-29；中位數：最佳六科 = 24-27；最低四分位：最佳六科 = 22-24。",
            "**科目策略**：英文（Level 5+）+ 中文（Level 4+）+ 任何人文科選修。資訊科技或數學展示科技準備度。",
            "**面試重點**：媒體意識、AI倫理推理和以中英文清晰表達複雜概念的能力。",
            "**經驗優勢**：學校報紙編輯、辯論隊、YouTube頻道或擁有大量追隨者的博客增強申請。",
            "**非聯招途徑**：IB（32+/45）含強寫作科目，GCE A-Level（ABB包括英文）。約保留5個名額。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**李立峯教授**：數碼新聞學和媒體效果研究領先學者。香港媒體格局影響力研究的作者。",
            "**黃愛麗絲博士**：AI倫理和自動化新聞專家。國際媒體組織負責任AI使用顧問。",
            "**校友 - 劉家健（2022屆）**：路透社數據記者，專門從事金融數據視覺化和調查報道。",
            "**校友 - 陳美琪（2021屆）**：大型串流平台AI內容策略師，開發個人化內容推薦系統。",
            "**校友 - 曾秉仁（2023屆）**：香港數碼媒體初創公司創辦人，使用AI分析社交議題公眾情緒。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**港大新聞學獎學金**：每年$20,000，授予具有傑出寫作作品集和學術成績的學生（最佳六科 = 26+）。",
            "**媒體創新獎**：$15,000，授予使用AI或數據新聞技術開發創新媒體項目的學生。",
            "**社會科學學院獎學金**：$10,000-25,000，授予優秀DSE學生。無需另行申請。",
            "**業界贊助獎學金**：與南華早報和香港電台合作，每年$20,000 + 保證實習機會。",
            "**按需經濟援助**：港大全面的經濟援助計劃為合資格學生支付學費和生活費。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 開設博客或YouTube頻道**：即使少量追隨者也展示主動性。以數據驅動角度報道香港本地議題以脫穎而出。",
            "**Ace Sir 貼士 #2 — 學習基礎數據新聞**：嘗試Flourish、Datawrapper或Tableau Public等工具。為你的作品集創建一個關於香港主題的數據視覺化。",
            "**Ace Sir 貼士 #3 — 關注媒體中的AI辯論**：閱讀關於深度偽造、算法偏見和AI生成新聞的資料。準備在面試中討論機遇和風險。",
            "**Ace Sir 貼士 #4 — 練習雙語寫作**：此課程要求中英文皆強。以兩種語言撰寫專欄、博客文章或社交媒體內容。",
            "**Ace Sir 貼士 #5 — 了解媒體商業模式**：知道數碼媒體如何賺錢（訂閱、廣告、會員）。提及通訊平台（Substack）和播客變現等趨勢。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6810 - 社會科學學士(政治學與法學)及法學士 (BSocSc(Govt&Laws)&LLB)
  // =====================================================
  {
    code: "JS6810",
    nameZh: "社會科學學士(政治學與法學)及法學士",
    nameEn: "BSocSc(Govt&Laws)&LLB",
    university: "香港大學",
    faculty: "社會科學學院/法律學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Highly competitive dual-degree programme. Median admission score typically Best 6 = 31-34 (standard scale).",
            "**Core Subjects**: English (Level 5*), Chinese (Level 5), Mathematics (Level 4+), and Liberal Studies/Citizenship (Level 5+).",
            "**Analytical Skills**: Strong critical thinking, argumentation, and essay-writing skills demonstrated through humanities electives and extracurricular debate.",
            "**Civic Awareness**: Demonstrated interest in politics, governance, public policy, or social justice through Model UN, debate, volunteering, or community organising.",
            "**Interview**: Rigorous panel interview assessing legal reasoning, political awareness, and ability to construct coherent arguments on complex societal issues."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Foundations**: Introduction to political science, constitutional law, legal methods, and research skills. Small group tutorials on legal reasoning.",
            "**Year 2 - Core Law & Politics**: Contract law, tort law, criminal law, comparative politics, and political theory. Moot court competitions begin.",
            "**Year 3 - Specialisation**: Choose streams — (1) Public Law & Governance, (2) International Relations & Law, or (3) Constitutional Law & Human Rights. Overseas exchange options.",
            "**Year 4 - Integration & Capstone**: Final year dissertation combining political science and legal analysis. Clinical legal education placements. PCLL preparation.",
            "**Dual Degree**: 5-year programme awarding BOTH Bachelor of Social Sciences (Government and Laws) AND Bachelor of Laws. Graduates eligible for PCLL.",
            "**Practical Training**: Mooting competitions, negotiation workshops, parliamentary debating, and internships at law firms and government departments."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Legal Profession**: Solicitor or barrister after completing PCLL. Specialise in constitutional law, administrative law, or public interest litigation.",
            "**Government & Civil Service**: Administrative Officer (AO), Policy Analyst, or Legal Advisor in Hong Kong Government bureaux and departments.",
            "**International Organisations**: Legal officer or policy analyst at UN agencies, WTO, or international NGOs focusing on human rights and governance.",
            "**Think Tanks & Research**: Research fellow at policy institutes (Civic Exchange, Our Hong Kong Foundation) or academic pursuing PhD in political science or law.",
            "**Political Consultancy**: Political risk analyst, government relations consultant, or public affairs advisor for multinational corporations.",
            "**Further Studies**: LLM at Harvard, Oxford, or Cambridge. MPP/MPA at Kennedy School or LSE. Direct PhD entry for academic careers."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Moot Court**: Dedicated moot court room simulating real courtroom environments. Regular internal and external mooting competitions.",
            "**Political Science Society**: Active student society organising policy debates, mock elections, guest lectures by politicians and diplomats, and networking events.",
            "**Law Society**: HKU Law Society is one of the most active on campus. Organises law firm visits, career talks, and social events connecting students with legal professionals.",
            "**Overseas Exchange**: Partnerships with LSE, Sciences Po, Georgetown Law, and National University of Singapore for semester exchanges.",
            "**Internship Network**: Strong connections with top law firms (Clifford Chance, Linklaters), government legal departments, and international organisations."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Very High (5/5 stars). Approximately 600-800 applicants for ~25-30 places annually (~3-4% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 34-36; Median: Best 6 = 31-34; Bottom quartile: Best 6 = 29-31.",
            "**Subject Strategy**: English (Level 5*) + Chinese (Level 5) + Liberal Studies (Level 5*). Strong essay-based subjects are essential.",
            "**Interview Focus**: Legal reasoning, political awareness, and structured argumentation. Expect to analyse a current political-legal issue on the spot.",
            "**Experience Advantage**: Model UN leadership, debate championships, legal internships, or published opinion pieces on political topics.",
            "**Non-JUPAS Pathway**: IB (40+/45) with HL humanities, GCE A-Levels (A*AA including an essay-based subject). Very few places available."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Johannes Chan**: Renowned constitutional law scholar. Former Dean of HKU Law Faculty and prominent public intellectual in Hong Kong.",
            "**Professor Joseph Cheng**: Expert in comparative politics and Hong Kong governance. Former editor of China Perspectives journal.",
            "**Alumni - Audrey Eu (Class of 1980s)**: Prominent barrister and former legislator. Leading figure in Hong Kong's legal and political landscape.",
            "**Alumni - Rimsky Yuen (Class of 1980s)**: Former Secretary for Justice of Hong Kong. Distinguished legal career in both private practice and government.",
            "**Alumni - Dennis Kwok (Class of 2000s)**: Former Legislative Councillor (Legal) and prominent barrister specialising in constitutional and administrative law."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Scholarship for Law & Politics**: Full tuition + $30,000/year stipend. For top 1% of applicants with exceptional academic and leadership records.",
            "**Faculty of Law Entrance Scholarship**: $20,000-40,000 for high-achieving DSE students (Best 6 = 32+). No separate application required.",
            "**Social Sciences Excellence Award**: $15,000/year for students with outstanding performance in political science and law courses.",
            "**PCLL Preparation Scholarship**: $10,000 for students undertaking additional PCLL preparation courses and mooting competitions.",
            "**Need-Based Financial Aid**: HKU's comprehensive financial aid programme covers tuition, accommodation, and living expenses for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Master Essay Writing**: Both law and political science require exceptional essay-writing skills. Practice writing timed essays on current affairs. Focus on structure: introduction, argument, counter-argument, synthesis, conclusion.",
            "**Ace Sir's Tip #2 — Follow Hong Kong Politics Closely**: Read SCMP, Ming Pao, and The Stand News daily. Understand key constitutional debates, legislative processes, and judicial review cases.",
            "**Ace Sir's Tip #3 — Join Model UN or Debate**: These activities develop the exact skills this programme values — structured argumentation, research, and public speaking. Leadership positions (Secretary-General, Team Captain) are especially impressive.",
            "**Ace Sir's Tip #4 — Read Landmark Court Cases**: Familiarise yourself with significant Hong Kong constitutional cases (e.g., Ng Ka Ling, Congo case). Being able to discuss these shows genuine legal interest.",
            "**Ace Sir's Tip #5 — Shadow a Lawyer or Politician**: Arrange a day shadowing a barrister, legislator, or policy analyst. Reference this experience in your personal statement and interview."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：競爭激烈的雙學位課程。中位數入學成績通常最佳六科 = 31-34分（標準計分）。",
            "**核心科目**：英文（Level 5*），中文（Level 5），數學（Level 4+），通識教育/公民與社會發展（Level 5+）。",
            "**分析能力**：透過人文選修和課外辯論展示強大的批判思維、論證和論文寫作技巧。",
            "**公民意識**：透過模擬聯合國、辯論、義工服務或社區組織展示對政治、管治、公共政策或社會正義的興趣。",
            "**面試**：嚴格的小組面試，評估法律推理、政治意識和就複雜社會議題構建連貫論證的能力。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 基礎**：政治學導論、憲法、法律方法和研究技巧。法律推理小組導修課。",
            "**第二年 - 法律與政治核心**：合同法、侵權法、刑法、比較政治學和政治理論。開始模擬法庭競賽。",
            "**第三年 - 專修**：選擇方向——(1) 公法與管治、(2) 國際關係與法律或 (3) 憲法與人權。海外交流選項。",
            "**第四年 - 整合與畢業項目**：結合政治學和法律分析的畢業論文。臨床法律教育實習。PCLL準備。",
            "**雙學位**：5年課程同時頒授社會科學學士（政治學與法學）和法學士學位。畢業生符合PCLL資格。",
            "**實務培訓**：模擬法庭競賽、談判工作坊、議會辯論和律師事務所及政府部門實習。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**法律專業**：完成PCLL後成為律師或大律師。專攻憲法、行政法或公共利益訴訟。",
            "**政府與公務員**：香港政府決策局和部門的政務主任（AO）、政策分析師或法律顧問。",
            "**國際組織**：聯合國機構、世貿組織或專注於人權和管治的國際非政府組織的法律人員或政策分析師。",
            "**智庫與研究**：政策研究所（思匯政策研究所、團結香港基金）的研究員或攻讀政治學或法律博士學位的學者。",
            "**政治顧問**：跨國公司的政治風險分析師、政府關係顧問或公共事務顧問。",
            "**進修出路**：哈佛、牛津或劍橋的法學碩士。肯尼迪學院或倫敦政經的公共政策碩士/公共行政碩士。學術職業可直接入讀博士。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**模擬法庭**：專用模擬法庭模擬真實法庭環境。定期舉辦內部和外部模擬法庭競賽。",
            "**政治學學會**：活躍的學生學會，舉辦政策辯論、模擬選舉、政治家和外交官嘉賓講座以及交流活動。",
            "**法律學會**：港大法律學會是校園最活躍的學會之一。舉辦律師事務所參觀、職業講座和連結學生與法律專業人士的社交活動。",
            "**海外交流**：與倫敦政經、巴黎政治學院、喬治城大學法律中心和新加坡國立大學合作，提供學期交流機會。",
            "**實習網絡**：與頂尖律師事務所（高偉紳、年利達）、政府法律部門和國際組織的緊密聯繫。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：極高（5/5星）。每年約600-800人申請，錄取約25-30人（~3-4%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 34-36；中位數：最佳六科 = 31-34；最低四分位：最佳六科 = 29-31。",
            "**科目策略**：英文（Level 5*）+ 中文（Level 5）+ 通識教育（Level 5*）。強大的論文型科目至關重要。",
            "**面試重點**：法律推理、政治意識和結構化論證。預期即場分析當前政治法律議題。",
            "**經驗優勢**：模擬聯合國領導、辯論冠軍、法律實習或關於政治議題的已發表評論文章。",
            "**非聯招途徑**：IB（40+/45）含高等人文科目，GCE A-Level（A*AA包括論文型科目）。名額非常有限。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**陳文敏教授**：著名憲法學者。前港大法律學院院長和香港傑出公共知識分子。",
            "**鄭宇碩教授**：比較政治學和香港管治專家。前《China Perspectives》期刊編輯。",
            "**校友 - 余若薇（1980年代）**：著名大律師和前立法會議員。香港法律和政治界的重要人物。",
            "**校友 - 袁國強（1980年代）**：前香港律政司司長。私人執業和政府的傑出法律生涯。",
            "**校友 - 郭榮鏗（2000年代）**：前立法會議員（法律界）和專攻憲法與行政法的著名大律師。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**港大法律與政治基金獎學金**：全額學費 + 每年$30,000津貼。授予前1%具有傑出學術和領導記錄的申請者。",
            "**法律學院入學獎學金**：$20,000-40,000，授予優秀DSE學生（最佳六科 = 32+）。無需另行申請。",
            "**社會科學卓越獎**：每年$15,000，授予政治學和法律課程表現傑出的學生。",
            "**PCLL準備獎學金**：$10,000，授予參加額外PCLL準備課程和模擬法庭競賽的學生。",
            "**按需經濟援助**：港大全面的經濟援助計劃為合資格學生支付學費、住宿和生活費。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 掌握論文寫作**：法律和國際關係都需要卓越的論文寫作技巧。練習就時事撰寫限時論文。專注結構：引言、論點、反駁、綜合、結論。",
            "**Ace Sir 貼士 #2 — 密切關注香港政治**：每天閱讀南華早報、明報和立場新聞。了解關鍵憲法辯論、立法程序和司法覆核案件。",
            "**Ace Sir 貼士 #3 — 參加模擬聯合國或辯論**：這些活動培養此課程重視的確切技能——結構化論證、研究和公開演講。領導職位（秘書長、隊長）尤其令人印象深刻。",
            "**Ace Sir 貼士 #4 — 閱讀 landmark 法庭案例**：熟悉重要的香港憲法案例（例如吳嘉玲案、剛果案）。能夠討論這些案例展示真正的法律興趣。",
            "**Ace Sir 貼士 #5 — 跟隨律師或政治家實習**：安排一天跟隨大律師、立法會議員或政策分析師。在個人陳述和面試中提及此經歷。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6418 - 護理學學士菁英領袖培育專修組別 (BNurs-ALT)
  // =====================================================
  {
    code: "JS6418",
    nameZh: "護理學學士菁英領袖培育專修組別",
    nameEn: "BNurs-ALT",
    university: "香港大學",
    faculty: "醫學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Elite nursing leadership track. Median admission score typically Best 6 = 26-29 (standard scale).",
            "**Core Subjects**: English (Level 4+), Chinese (Level 4+), Mathematics (Level 3+), and strong performance in biology or chemistry.",
            "**Leadership Potential**: Demonstrated leadership in school, community service, or healthcare volunteering. Evidence of initiative and team coordination.",
            "**Healthcare Commitment**: Genuine interest in nursing and healthcare leadership. Shadowing experience at hospitals or clinics is highly valued.",
            "**Interview**: Panel interview assessing communication skills, empathy, ethical reasoning in healthcare, and leadership potential."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Nursing Foundations**: Anatomy, physiology, microbiology, and fundamental nursing skills. Leadership workshops and team-building exercises.",
            "**Year 2 - Clinical Practice**: Medical-surgical nursing, pharmacology, and health assessment. First clinical placement in hospital settings.",
            "**Year 3 - Leadership & Specialisation**: Nursing management, healthcare policy, quality improvement, and evidence-based practice. Specialise in a clinical area.",
            "**Year 4 - Advanced Leadership**: Healthcare administration, strategic planning, interprofessional collaboration, and capstone leadership project. Management internship.",
            "**Elite Components**: Additional leadership seminars, mentorship by senior nurse leaders, research methodology training, and international healthcare study tours.",
            "**Clinical Placements**: Extensive placements at Queen Mary Hospital, Prince of Wales Hospital, and other HA hospitals across all major specialties."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Nurse Leadership**: Ward manager, department head nurse, or nursing supervisor within 3-5 years of graduation. Fast-track to senior management.",
            "**Hospital Administration**: Healthcare administrator, quality improvement coordinator, or patient safety officer at public and private hospitals.",
            "**Healthcare Policy**: Policy analyst at Food and Health Bureau, Hospital Authority, or WHO regional office.",
            "**Nursing Education**: Clinical instructor or lecturer at nursing schools. Pathway to becoming a professor of nursing.",
            "**Advanced Practice**: Nurse practitioner, clinical nurse specialist, or nurse consultant with additional postgraduate qualifications.",
            "**Further Studies**: MSc in Nursing Leadership, MPH, MBA in Healthcare Management, or PhD in Nursing at top universities."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Simulation Centre**: Advanced nursing simulation centre with high-fidelity patient simulators, virtual reality training, and realistic clinical scenarios.",
            "**Leadership Programme**: Exclusive leadership development programme including executive coaching, mentorship by hospital CEOs, and boardroom exposure.",
            "**Student Nursing Association**: Active student association organising health promotion campaigns, community outreach, and peer support networks.",
            "**International Exposure**: Study tours to healthcare systems in Singapore, UK, and Australia. Exchange opportunities with top nursing schools globally.",
            "**Research Opportunities**: Early involvement in nursing research projects. Presentation opportunities at international nursing conferences."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate-High (3.5/5 stars). Approximately 300-400 applicants for ~30-35 places annually (~8-10% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 29-31; Median: Best 6 = 26-29; Bottom quartile: Best 6 = 24-26.",
            "**Subject Strategy**: English (Level 4+) + Chinese (Level 4+) + Biology/Chemistry (Level 4+). Strong science background is preferred.",
            "**Interview Focus**: Empathy, communication skills, ethical reasoning in patient care, and demonstrated leadership potential.",
            "**Experience Advantage**: Hospital volunteering, St. John Ambulance, Red Cross, or healthcare-related community service significantly strengthens applications.",
            "**Non-JUPAS Pathway**: IB (34+/45) with science subjects, GCE A-Levels (ABB including Biology). Approximately 3-5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Sophia Chan**: Former Secretary for Food and Health of Hong Kong. Distinguished nursing leader and public health advocate.",
            "**Professor Diana Lee**: Expert in gerontological nursing and chronic disease management. Leading researcher in ageing and long-term care.",
            "**Alumni - Janet Wong (Class of 2018)**: Nurse Manager at Queen Mary Hospital, overseeing a 40-bed medical ward. Youngest nurse manager in her department.",
            "**Alumni - Pauline Cheung (Class of 2019)**: Healthcare Policy Analyst at Hospital Authority, leading quality improvement initiatives across public hospitals.",
            "**Alumni - Angela Lau (Class of 2020)**: Clinical Nurse Specialist in oncology at Prince of Wales Hospital, pursuing PhD part-time."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Nursing Elite Leadership Scholarship**: Full tuition + $15,000/year stipend. For students with exceptional leadership potential and academic merit (Best 6 = 28+).",
            "**Hospital Authority Nursing Scholarship**: Full tuition + $10,000/year + guaranteed employment at HA upon graduation. Requires service commitment.",
            "**Faculty of Medicine Entrance Scholarship**: $15,000-30,000 for high-achieving DSE students. No separate application required.",
            "**Community Nursing Award**: $10,000 for students with outstanding community health promotion projects.",
            "**Need-Based Financial Aid**: HKU's comprehensive financial aid programme covers tuition and living expenses for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Volunteer in Healthcare**: Hospital volunteering, elderly care centres, or community health programmes demonstrate genuine commitment. Aim for 50+ hours.",
            "**Ace Sir's Tip #2 — Develop Leadership Experience**: Lead a student organisation, organise a health campaign, or coordinate a volunteer team. Specific leadership examples are crucial for this elite track.",
            "**Ace Sir's Tip #3 — Understand Healthcare Challenges**: Read about Hong Kong's healthcare system challenges — ageing population, nurse shortage, hospital capacity. Show awareness in your interview.",
            "**Ace Sir's Tip #4 — Practice Empathy Scenarios**: Be ready for ethical dilemmas in healthcare (e.g., patient autonomy vs. family wishes). Show balanced, compassionate reasoning.",
            "**Ace Sir's Tip #5 — Shadow a Nurse Leader**: If possible, shadow a nurse manager or department head. Understanding the difference between bedside nursing and nursing leadership will set you apart."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：精英護理領袖培育課程。中位數入學成績通常最佳六科 = 26-29分（標準計分）。",
            "**核心科目**：英文（Level 4+），中文（Level 4+），數學（Level 3+），生物或化學表現優異。",
            "**領導潛能**：在學校、社區服務或醫療義工中展示領導力。展示主動性和團隊協調能力的證據。",
            "**醫療承諾**：對護理和醫療領導的真正興趣。醫院或診所的跟隨經驗極受重視。",
            "**面試**：小組面試評估溝通技巧、同理心、醫療倫理推理和領導潛能。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 護理基礎**：解剖學、生理學、微生物學和基礎護理技能。領導力工作坊和團隊建設活動。",
            "**第二年 - 臨床實踐**：內外科護理、藥理學和健康評估。首次醫院環境臨床實習。",
            "**第三年 - 領導力與專修**：護理管理、醫療政策、質量改進和循證實踐。專攻臨床領域。",
            "**第四年 - 進階領導力**：醫療行政、策略規劃、跨專業協作和畢業領導項目。管理實習。",
            "**精英元素**：額外領導力研討會、高級護理領袖導師、研究方法培訓和國際醫療考察團。",
            "**臨床實習**：在瑪麗醫院、威爾斯親王醫院和其他醫管局醫院進行廣泛實習，涵蓋所有主要專科。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**護理領導**：畢業後3-5年內成為病房經理、部門總護士長或護理主管。快速晉升高級管理層。",
            "**醫院行政**：公立和私立醫院的醫療行政人員、質量改進協調員或病人安全主任。",
            "**醫療政策**：食物及衞生局、醫院管理局或世衞區域辦事處的政策分析師。",
            "**護理教育**：護理學校的臨床導師或講師。成為護理學教授的路徑。",
            "**進階實踐**：具額外研究生資格的護士執業者、臨床護理專家或護理顧問。",
            "**進修出路**：頂尖大學的護理領導理學碩士、公共衞生碩士、醫療管理工商管理碩士或護理學博士。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**模擬中心**：先進護理模擬中心，配備高仿真病人模擬器、虛擬實境培訓和真實臨床場景。",
            "**領導力計劃**：專屬領導力發展計劃，包括行政教練、醫院行政總裁導師和董事會曝光機會。",
            "**學生護理學會**：活躍的學生學會，舉辦健康推廣活動、社區外展和同儕支援網絡。",
            "**國際視野**：考察新加坡、英國和澳洲的醫療系統。與全球頂尖護理學校的交流機會。",
            "**研究機會**：早期參與護理研究項目。在國際護理會議發表的機會。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：中高（3.5/5星）。每年約300-400人申請，錄取約30-35人（~8-10%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 29-31；中位數：最佳六科 = 26-29；最低四分位：最佳六科 = 24-26。",
            "**科目策略**：英文（Level 4+）+ 中文（Level 4+）+ 生物/化學（Level 4+）。較偏好強大的科學背景。",
            "**面試重點**：同理心、溝通技巧、病人護理的倫理推理和展示的領導潛能。",
            "**經驗優勢**：醫院義工、聖約翰救傷隊、紅十字會或醫療相關社區服務大幅增強申請。",
            "**非聯招途徑**：IB（34+/45）含科學科目，GCE A-Level（ABB包括生物）。約保留3-5個名額。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**陳肇始教授**：前香港食物及衞生局局長。傑出護理領袖和公共衞生倡導者。",
            "**李麗婷教授**：老年護理和慢性病管理專家。老齡化和長期護理領先研究員。",
            "**校友 - 王珍妮（2018屆）**：瑪麗醫院護士經理，管理40床內科病房。其部門最年輕的護士經理。",
            "**校友 - 張寶琳（2019屆）**：醫院管理局醫療政策分析師，領導公立醫院質量改進計劃。",
            "**校友 - 劉安琪（2020屆）**：威爾斯親王醫院腫瘤科臨床護理專家，兼讀博士學位。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**護理精英領導獎學金**：全額學費 + 每年$15,000津貼。授予具有傑出領導潛能和學術成績的學生（最佳六科 = 28+）。",
            "**醫院管理局護理獎學金**：全額學費 + 每年$10,000 + 畢業後保證醫管局就業。需要服務承諾。",
            "**醫學院入學獎學金**：$15,000-30,000，授予優秀DSE學生。無需另行申請。",
            "**社區護理獎**：$10,000，授予具有傑出社區健康推廣項目的學生。",
            "**按需經濟援助**：港大全面的經濟援助計劃為合資格學生支付學費和生活費。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 在醫療機構做義工**：醫院義工、安老院或社區健康計劃展示真正的承諾。目標50小時以上。",
            "**Ace Sir 貼士 #2 — 培養領導經驗**：領導學生組織、舉辦健康活動或協調義工團隊。具體的領導例子對此精英課程至關重要。",
            "**Ace Sir 貼士 #3 — 了解醫療挑戰**：閱讀關於香港醫療系統挑戰的資料——人口老齡化、護士短缺、醫院容量。在面試中展示認知。",
            "**Ace Sir 貼士 #4 — 練習同理心場景**：準備醫療倫理困境（例如病人自主權與家屬意願）。展示平衡、富同理心的推理。",
            "**Ace Sir 貼士 #5 — 跟隨護理領袖**：如有可能，跟隨護士經理或部門主管。了解臨床護理與護理領導的區別將使你脫穎而出。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6468 - 護理學學士 (BNurs)
  // =====================================================
  {
    code: "JS6468",
    nameZh: "護理學學士",
    nameEn: "BNurs",
    university: "香港大學",
    faculty: "醫學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Standard nursing programme. Median admission score typically Best 6 = 22-25 (standard scale).",
            "**Core Subjects**: English (Level 3+), Chinese (Level 3+), Mathematics (Level 2+), and biology or chemistry (Level 3+ preferred).",
            "**Caring Disposition**: Genuine interest in patient care and health promotion. Evidence of empathy and compassion through volunteering or community service.",
            "**Communication Skills**: Ability to communicate effectively in both English and Chinese. Nursing requires clear communication with diverse patients.",
            "**Interview**: Panel interview assessing communication skills, empathy, motivation for nursing, and understanding of the nursing profession."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Foundations**: Anatomy, physiology, microbiology, psychology, and fundamental nursing skills. Introduction to healthcare systems.",
            "**Year 2 - Medical-Surgical Nursing**: Adult health nursing, pharmacology, pathophysiology, and health assessment. Clinical placement in medical-surgical units.",
            "**Year 3 - Speciality Nursing**: Mental health nursing, community health nursing, maternal and child health, and gerontological nursing. Rotations across specialties.",
            "**Year 4 - Advanced Practice & Leadership**: Complex care, nursing research, healthcare management, and capstone project. Final clinical internship.",
            "**Clinical Hours**: Over 1,400 hours of supervised clinical practice across hospitals, community health centres, and long-term care facilities.",
            "**Registration**: Graduates are eligible for registration as Registered Nurses (General) with the Nursing Council of Hong Kong."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Hospital Nursing**: Staff nurse in medical, surgical, paediatric, or emergency departments at public and private hospitals.",
            "**Community Nursing**: Community health nurse, school nurse, or occupational health nurse in community settings and corporations.",
            "**Specialised Nursing**: Pursue specialisation in ICU, oncology, operating theatre, or mental health nursing with postgraduate training.",
            "**Nursing Education**: Clinical instructor or lecturer after gaining experience and further qualifications.",
            "**Healthcare Management**: Nursing administration roles including ward manager, nursing officer, or quality improvement coordinator.",
            "**Further Studies**: MSc in Nursing, Master of Public Health, or specialist nursing programmes at local and overseas universities."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Nursing Skills Lab**: Well-equipped skills laboratory with hospital beds, patient simulators, and clinical equipment for practice.",
            "**Clinical Placements**: Rotations at Queen Mary Hospital, Queen Elizabeth Hospital, and other HA hospitals. Exposure to diverse clinical settings.",
            "**Student Nursing Association**: Active student body organising health promotion events, blood donation drives, and peer mentoring programmes.",
            "**Community Outreach**: Regular health screening and education programmes in underserved communities. Hands-on public health experience.",
            "**Support Network**: Strong peer support system and academic advising. Senior students mentor juniors through clinical placements."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (2.5/5 stars). Approximately 400-500 applicants for ~80-100 places annually (~15-20% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 25-27; Median: Best 6 = 22-25; Bottom quartile: Best 6 = 20-22.",
            "**Subject Strategy**: English (Level 3+) + Chinese (Level 3+) + Biology (Level 3+). Science background helpful but not strictly required.",
            "**Interview Focus**: Empathy, communication skills, motivation for nursing, and realistic understanding of the profession's demands.",
            "**Experience Advantage**: Healthcare volunteering, elderly care experience, or first aid certification (St. John, Red Cross) strengthens applications.",
            "**Non-JUPAS Pathway**: IB (30+/45), GCE A-Levels (BBB). Approximately 5-10 places reserved for non-JUPAS applicants."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Agnes Tiwari**: Expert in mental health nursing and violence prevention. Internationally recognised researcher in psychiatric nursing.",
            "**Professor Wendy Wong**: Specialist in community health nursing and health promotion. Advisor to Department of Health on public health nursing.",
            "**Alumni - Cindy Lam (Class of 2019)**: ICU Nurse at Queen Mary Hospital, pursuing specialisation in critical care nursing.",
            "**Alumni - Raymond Ng (Class of 2020)**: Community Health Nurse at a district health centre, leading chronic disease management programmes.",
            "**Alumni - Karen Cheung (Class of 2021)**: Operating Theatre Nurse at a private hospital, specialising in orthopaedic surgery nursing."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Hospital Authority Nursing Scholarship**: Full tuition + $8,000/year + guaranteed employment at HA upon graduation. Service commitment required.",
            "**Faculty of Medicine Entrance Scholarship**: $10,000-20,000 for high-achieving DSE students. No separate application required.",
            "**Nursing Excellence Award**: $8,000 for students with outstanding clinical performance and academic achievement.",
            "**Community Health Scholarship**: $5,000 for students demonstrating commitment to community health and health promotion.",
            "**Need-Based Financial Aid**: HKU's comprehensive financial aid programme covers tuition and living expenses for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Volunteer in Care Settings**: Any experience in hospitals, elderly homes, or disability centres shows commitment. Even 20-30 hours makes a difference.",
            "**Ace Sir's Tip #2 — Get First Aid Certified**: St. John Ambulance or Red Cross first aid certification demonstrates practical healthcare interest and responsibility.",
            "**Ace Sir's Tip #3 — Understand Nursing Realities**: Nursing is physically and emotionally demanding. Show in your interview that you understand both the challenges and rewards.",
            "**Ace Sir's Tip #4 — Highlight Communication Skills**: Nursing requires communicating with patients from all backgrounds. Mention any experience working with elderly, children, or non-Chinese speakers.",
            "**Ace Sir's Tip #5 — Show Teamwork Experience**: Nurses work in teams. Reference group projects, sports teams, or volunteer teams where you collaborated effectively under pressure."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：標準護理課程。中位數入學成績通常最佳六科 = 22-25分（標準計分）。",
            "**核心科目**：英文（Level 3+），中文（Level 3+），數學（Level 2+），生物或化學（Level 3+較佳）。",
            "**關懷特質**：對病人護理和健康推廣的真正興趣。透過義工或社區服務展示同理心和同情心。",
            "**溝通技巧**：能夠以中英文有效溝通。護理需要與不同病人清晰溝通。",
            "**面試**：小組面試評估溝通技巧、同理心、護理動機和對護理專業的理解。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 基礎**：解剖學、生理學、微生物學、心理學和基礎護理技能。醫療系統導論。",
            "**第二年 - 內外科護理**：成人健康護理、藥理學、病理生理學和健康評估。內外科病房臨床實習。",
            "**第三年 - 專科護理**：精神健康護理、社區健康護理、婦幼健康和老年護理。各專科輪轉。",
            "**第四年 - 進階實踐與領導力**：複雜護理、護理研究、醫療管理和畢業項目。最後臨床實習。",
            "**臨床時數**：在醫院、社區健康中心和長期護理設施進行超過1,400小時監督臨床實踐。",
            "**註冊**：畢業生符合在香港護士管理局註冊為註冊護士（普通科）的資格。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**醫院護理**：公立和私立醫院內科、外科、兒科或急症科的註冊護士。",
            "**社區護理**：社區環境和企業的社區健康護士、學校護士或職業健康護士。",
            "**專科護理**：具研究生培訓的深切治療、腫瘤科、手術室或精神健康護理專科。",
            "**護理教育**：獲得經驗和進一步資格後的臨床導師或講師。",
            "**醫療管理**：病房經理、護理主任或質量改進協調員等護理行政職位。",
            "**進修出路**：本地和海外大學的護理學理學碩士、公共衞生碩士或專科護理課程。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**護理技能實驗室**：配備病床、病人模擬器和臨床設備的完善技能實驗室供練習。",
            "**臨床實習**：在瑪麗醫院、伊利沙伯醫院和其他醫管局醫院輪轉。接觸多樣臨床環境。",
            "**學生護理學會**：活躍的學生團體，舉辦健康推廣活動、捐血活動和同儕導師計劃。",
            "**社區外展**：在服務不足社區定期進行健康篩查和教育計劃。實踐公共衞生經驗。",
            "**支援網絡**：強大的同儕支援系統和學術指導。高年級學生在臨床實習中指導低年級學生。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：中等（2.5/5星）。每年約400-500人申請，錄取約80-100人（~15-20%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 25-27；中位數：最佳六科 = 22-25；最低四分位：最佳六科 = 20-22。",
            "**科目策略**：英文（Level 3+）+ 中文（Level 3+）+ 生物（Level 3+）。科學背景有幫助但非嚴格要求。",
            "**面試重點**：同理心、溝通技巧、護理動機和對專業要求的現實理解。",
            "**經驗優勢**：醫療義工、安老經驗或急救證書（聖約翰、紅十字會）增強申請。",
            "**非聯招途徑**：IB（30+/45），GCE A-Level（BBB）。約保留5-10個名額予非聯招申請者。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**Tiwari Agnes教授**：精神健康護理和暴力預防專家。精神護理領域國際知名研究員。",
            "**黃慧妍教授**：社區健康護理和健康推廣專家。衞生署公共衞生護理顧問。",
            "**校友 - 林詩迪（2019屆）**：瑪麗醫院深切治療部護士，進修深切治療護理專科。",
            "**校友 - 吳偉倫（2020屆）**：地區健康中心社區健康護士，領導慢性病管理計劃。",
            "**校友 - 張嘉欣（2021屆）**：私立醫院手術室護士，專攻骨科手術護理。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**醫院管理局護理獎學金**：全額學費 + 每年$8,000 + 畢業後保證醫管局就業。需要服務承諾。",
            "**醫學院入學獎學金**：$10,000-20,000，授予優秀DSE學生。無需另行申請。",
            "**護理卓越獎**：$8,000，授予臨床表現和學術成就傑出的學生。",
            "**社區健康獎學金**：$5,000，授予展示社區健康和健康推廣承諾的學生。",
            "**按需經濟援助**：港大全面的經濟援助計劃為合資格學生支付學費和生活費。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 在護理機構做義工**：醫院、安老院或殘疾中心的任何經驗都展示承諾。即使是20-30小時也有幫助。",
            "**Ace Sir 貼士 #2 — 獲取急救證書**：聖約翰救傷隊或紅十字會急救證書展示實踐醫療興趣和責任感。",
            "**Ace Sir 貼士 #3 — 了解護理現實**：護理在體力和情感上都要求高。在面試中展示你理解挑戰和回報。",
            "**Ace Sir 貼士 #4 — 強調溝通技巧**：護理需要與來自各種背景的病人溝通。提及與長者、兒童或非華語人士工作的任何經驗。",
            "**Ace Sir 貼士 #5 — 展示團隊合作經驗**：護士在團隊中工作。參考小組項目、運動隊或義工團隊中你在壓力下有效協作的經歷。"
          ]
        }
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch F...");
  console.log(`[Seed] Programmes: ${PROGRAMME_DETAILS.map(p => p.code).join(", ")}`);
  for (const prog of PROGRAMME_DETAILS) {
    try {
      await JupasProgrammeService.upsertProgrammeDetails(prog);
      console.log(`[Seed] ✓ Success: ${prog.code} - ${prog.nameZh}`);
    } catch (err) {
      console.error(`[Seed] ✗ Failed: ${prog.code} - ${err.message}`);
    }
  }
  console.log("[Seed] Batch F complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Fatal error:", err);
  process.exit(1);
});
