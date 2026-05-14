/**
 * Seed HKU Batch 4 Programme Details - Batch 4 (3 programmes)
 * Run: node backend/scripts/seed_hku_batch4_details_4.js
 *
 * Programmes:
 * JS6004 - 建築學文學士 (BA(ArchStud))
 * JS6016 - 理學士(測量學) (BSc(Survey))
 * JS6028 - 園境學文學士 (BA(LandSc))
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  // =====================================================
  // JS6004 - 建築學文學士 (BA(ArchStud))
  // =====================================================
  {
    code: "JS6004",
    name: "建築學文學士 (BA(ArchStud))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Competitive design-oriented programme. Median admission score typically Best 6 = 28-30 (standard scale).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and strong performance in humanities or arts electives.",
            "**Portfolio - Critical**: A creative portfolio showcasing design work, sketches, photography, or any visual arts is highly recommended. This is NOT mandatory but significantly strengthens applications.",
            "**Relevant Electives**: Visual Arts, Design & Applied Technology, Geography, or Physics at Level 4+ preferred. Spatial thinking and aesthetic sensibility valued.",
            "**Interview**: Portfolio review and panel interview assessing spatial awareness, design thinking, understanding of architecture's social role, and creative potential."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Design Fundamentals**: Introduction to architectural design, drawing and representation, architectural history, and building technology basics. Studio-based learning.",
            "**Year 2 - Architectural Design**: Design studios focusing on small-scale buildings, structural principles, environmental design, and architectural theory. First design critique.",
            "**Year 3 - Urban Context**: Design studios addressing urban architecture, housing, public buildings, and community spaces. Study trips to Asian cities (Tokyo, Singapore, Taipei).",
            "**Year 4 - Advanced Design & Thesis**: Independent design thesis project. Professional practice, building regulations, and preparation for Master of Architecture (MArch).",
            "**Studio Culture**: Intensive design studio environment — students often work late into the night on models, drawings, and digital presentations. Collaborative peer learning.",
            "**Technical Subjects**: Structural mechanics, environmental systems, construction technology, and digital fabrication (3D printing, CNC routing, parametric design)."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Master of Architecture (MArch)**: Most graduates proceed to HKU's MArch (2-year) or equivalent programmes abroad (AA School, Bartlett, Harvard GSD) to become registered architects.",
            "**Architecture Firms**: Graduate architect at international firms (Foster + Partners, Zaha Hadid Architects, KPF) or local practices (Rocco Design, Ronald Lu & Partners).",
            "**Urban Design & Planning**: Urban designer, planner, or heritage conservation specialist at government departments (PlanD, AMO) or consultancy firms.",
            "**Interior Design**: Interior architect at design studios specialising in commercial, hospitality, or residential spaces.",
            "**Further Studies**: MArch, MSc in Urban Design, MSc in Conservation, or PhD in architectural theory at top global schools.",
            "**Alternative Paths**: Architectural photography, architectural journalism, set design, exhibition design, or real estate development."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Architecture Building**: Dedicated studio spaces with 24/7 access, model-making workshops, digital fabrication lab, and exhibition galleries at the Faculty of Architecture.",
            "**Fabrication Lab**: 3D printers, laser cutters, CNC machines, and robotics for digital fabrication. Students build physical models of their designs.",
            "**Exhibition Culture**: Regular student exhibitions, guest critic reviews, and end-of-year show attracting industry professionals and potential employers.",
            "**Study Trips**: Annual study trips to architectural landmarks in Asia and Europe. Past destinations include Japan, Italy, Spain, and the Netherlands.",
            "**Student Society**: Architecture Society (ArchSoc) organises design competitions, firm visits, mentorship programmes, and social events."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: High (4/5 stars). Approximately 500-600 applicants compete for ~50-60 places annually (~10% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 31-33; Median: Best 6 = 28-30; Bottom quartile: Best 6 = 26-28.",
            "**Subject Strategy**: English (Level 5+) + Visual Arts/Geography/Physics (Level 4+). A portfolio can compensate for slightly lower academic scores.",
            "**Portfolio Weighting**: Portfolio review carries ~25% of admission decision. Quality of creative work often matters more than quantity.",
            "**Interview Focus**: Design thinking, spatial reasoning, and awareness of Hong Kong's urban challenges (housing, density, heritage).",
            "**Non-JUPAS Pathway**: IB (32+/45) with arts/design subjects, GCE A-Levels (ABB including an arts subject). Approximately 5-8 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor John Lin**: Award-winning architect known for innovative rural school designs in China. Recipient of multiple international architecture awards.",
            "**Professor Rocco Yim**: Founder of Rocco Design Architects. Designed iconic Hong Kong buildings including the Legislative Council Complex.",
            "**Rocco Design Alumni**: Many graduates have become partners and design directors at one of Hong Kong's most prestigious architecture firms.",
            "**International Practitioners**: Alumni working at Foster + Partners, Zaha Hadid Architects, BIG, and OMA across London, New York, and Copenhagen.",
            "**Academics**: Graduates who have become professors at HKU, CUHK, MIT, and ETH Zurich, shaping the next generation of architects."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results and exceptional creative portfolios.",
            "**Faculty of Architecture Scholarships**: Merit-based awards for design excellence and academic achievement.",
            "**Aedas Scholarship**: Sponsored by international architecture firm Aedas. Includes internship opportunities and mentorship.",
            "**Overseas Study Trip Grants**: Funding for study trips and exchange programmes at partner architecture schools (up to HKD 30,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Architecture Strategy",
          content: [
            "**Build a Portfolio**: Start sketching buildings, spaces, and urban scenes. Document your creative process — sketches, models, photos. Quality over quantity.",
            "**Observe Hong Kong**: Walk around the city with an architect's eye. Notice how buildings interact with streets, light, and people. Be ready to discuss specific examples.",
            "**Read Architecture**: Start with 'Towards a New Architecture' (Le Corbusier) and 'Complexity and Contradiction in Architecture' (Venturi). Show intellectual curiosity.",
            "**Learn Basic Software**: Familiarise yourself with SketchUp, Rhino, or AutoCAD. Free tutorials are available online.",
            "**Physical Stamina**: Architecture students work long hours. Show you can handle intense, deadline-driven projects. Mention any experience with sustained creative work."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：具競爭力的設計導向課程。中位數收生分數通常為 Best 6 = 28-30 分 (標準計分)。",
            "**核心科目**：英文 (Level 4 或以上)、數學 (必修部分，Level 3 或以上)，以及人文或藝術選修科的優異表現。",
            "**作品集 - 關鍵**：強烈建議提交展示設計作品、素描、攝影或任何視覺藝術的創意作品集。這非強制性，但能顯著強化申請。",
            "**相關選修科**：視覺藝術、設計與應用科技、地理或物理達 Level 4+ 較佳。重視空間思維及美學觸覺。",
            "**面試**：作品集評審及小組面試，考核空間意識、設計思維、對建築社會角色的理解及創意潛能。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 設計基礎**：建築設計導論、繪圖與表達、建築歷史及建築科技基礎。工作室為本的學習。",
            "**第二年 - 建築設計**：聚焦小型建築的設計工作室、結構原理、環境設計及建築理論。首次設計評審。",
            "**第三年 - 城市脈絡**：處理城市建築、住宅、公共建築及社區空間的設計工作室。前往亞洲城市 (東京、新加坡、台北) 考察。",
            "**第四年 - 進階設計及論文**：獨立設計論文項目。專業實務、建築法規及建築碩士 (MArch) 準備。",
            "**工作室文化**：密集的設計工作室環境 — 學生常徹夜製作模型、圖則及數碼演示。協作式同儕學習。",
            "**技術科目**：結構力學、環境系統、建造科技及數碼製造 (3D 打印、CNC 切割、參數化設計)。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**建築碩士 (MArch)**：大部分畢業生升讀港大建築碩士 (兩年制) 或海外同等課程 (AA 建築聯盟、巴特萊特建築學院、哈佛 GSD) 以成為註冊建築師。",
            "**建築師事務所**：於國際事務所 (Foster + Partners、Zaha Hadid Architects、KPF) 或本地公司 (嚴迅奇建築師事務所、呂元祥建築師事務所) 擔任畢業建築師。",
            "**城市設計及規劃**：於政府部門 (規劃署、古物古蹟辦事處) 或顧問公司擔任城市設計師、規劃師或文物保育專家。",
            "**室內設計**：於專營商業、酒店或住宅空間的設計工作室擔任室內建築師。",
            "**進修深造**：建築碩士、城市設計碩士、保育碩士或頂尖國際學院的建築理論博士。",
            "**另類出路**：建築攝影、建築新聞、佈景設計、展覽設計或房地產發展。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**建築學院大樓**：配備24小時開放工作室空間、模型製作工場、數碼製造實驗室及展覽畫廊的專用設施。",
            "**製造實驗室**：3D 打印機、激光切割機、CNC 機器及機械人供數碼製造使用。學生製作設計的實體模型。",
            "**展覽文化**：定期學生展覽、客席評審檢討及年終展覽，吸引業界專業人士及潛在僱主。",
            "**考察旅行**：每年前往亞洲及歐洲建築地標考察。過往目的地包括日本、意大利、西班牙及荷蘭。",
            "**學生組織**：建築學會 (ArchSoc) 舉辦設計比賽、事務所參觀、師友計劃及社交活動。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：高 (4/5星)。每年約500-600人競爭~50-60個學額 (入學率約10%)。",
            "**分數分佈**：最高四分位數：Best 6 = 31-33分；中位數：Best 6 = 28-30分；最低四分位數：Best 6 = 26-28分。",
            "**科目策略**：英文 (Level 5+) + 視覺藝術/地理/物理 (Level 4+)。作品集可彌補稍低的學術分數。",
            "**作品集比重**：作品集評審佔入學決定約25%。創意作品的質素常較數量重要。",
            "**面試重點**：設計思維、空間推理及對香港城市挑戰 (房屋、密度、文物) 的認知。",
            "**非聯招途徑**：國際文憑 (IB 32+/45) 修讀藝術/設計科目、GCE A-Level (ABB 包括藝術科目)。約5-8個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**林君翰教授**：以中國農村創新學校設計聞名的得獎建築師。獲得多項國際建築獎項。",
            "**嚴迅奇教授**：嚴迅奇建築師事務所創辦人。設計香港立法會綜合大樓等地標建築。",
            "**嚴迅奇建築師事務所校友**：不少畢業生已成為香港最負盛名建築師事務所的合伙人及設計總監。",
            "**國際執業者**：畢業生於 Foster + Partners、Zaha Hadid Architects、BIG 及 OMA 的倫敦、紐約及哥本哈根辦事處工作。",
            "**學者**：畢業生成為港大、中大、麻省理工及蘇黎世聯邦理工的教授，培育下一代建築師。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異及具卓越創意作品集的學生。",
            "**建築學院獎學金**：頒予設計卓越及學術成就的 merit-based 獎項。",
            "**Aedas 獎學金**：由國際建築師事務所 Aedas 贊助。包括實習機會及師友指導。",
            "**海外考察旅行資助**：資助考察旅行及伙伴建築學校交流計劃 (最多港幣30,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 建築學攻略",
          content: [
            "**建立作品集**：開始素描建築、空間及城市景觀。記錄你的創作過程 — 草圖、模型、照片。質素重於數量。",
            "**觀察香港**：以建築師的眼光遊走城市。留意建築如何與街道、光線及人群互動。準備討論具體例子。",
            "**閱讀建築**：從《走向新建築》(勒·柯比意) 及《建築的複雜性與矛盾性》(文丘里) 開始。展示知識好奇心。",
            "**學習基本軟件**：熟悉 SketchUp、Rhino 或 AutoCAD。網上有免費教程。",
            "**體能耐力**：建築學生工作時間長。展示你能應對密集、 deadline-driven 的項目。提及任何持續創作工作的經驗。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6016 - 理學士(測量學) (BSc(Survey))
  // =====================================================
  {
    code: "JS6016",
    name: "理學士(測量學) (BSc(Survey))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Professional accredited programme. Median admission score typically Best 6 = 27-29 (standard scale).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 4+ mandatory), and strong performance in science/technology electives.",
            "**Mathematics - Critical**: M1/M2 (Calculus & Statistics) recommended. Strong quantitative skills essential for land surveying, valuation, and spatial analysis.",
            "**Science/Technology Electives**: Physics, Chemistry, ICT, or Geography at Level 4+ preferred. Spatial reasoning and technical aptitude valued.",
            "**Interview**: Panel interview assessing logical thinking, understanding of the built environment, awareness of Hong Kong's land issues, and motivation for the surveying profession."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Built Environment Foundations**: Introduction to construction, building technology, land economics, and basic surveying principles. Mathematics and statistics.",
            "**Year 2 - Core Surveying**: Land surveying techniques, cadastral systems, property valuation, building pathology, and construction law. First field camp.",
            "**Year 3 - Professional Specialisation**: Choose streams — (1) Quantity Surveying, (2) Building Surveying, or (3) General Practice Surveying. Industry internship with surveying firms.",
            "**Year 4 - Professional Practice**: Advanced valuation, project management, dispute resolution, and preparation for professional qualification (MRICS, MHKIS).",
            "**Field Camps**: Residential field camps in Hong Kong and mainland China practising land surveying, building measurement, and site inspection.",
            "**Professional Accreditation**: Programme accredited by RICS (Royal Institution of Chartered Surveyors) and HKIS (Hong Kong Institute of Surveyors). Graduates eligible for Assessment of Professional Competence (APC)."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Quantity Surveying**: Cost consultant at firms like Rider Levett Bucknall, Davis Langdon, or Arcadis. Manage construction costs for major developments.",
            "**Building Surveying**: Building surveyor at property management firms, government departments (BD, HA), or consultancy practices. Building inspection and maintenance.",
            "**General Practice Surveying**: Property valuer, estate agent, or property manager at international firms (CBRE, JLL, Savills) or local practices.",
            "**Real Estate Development**: Development manager at property developers (Sun Hung Kai, Henderson Land, New World) managing acquisition and project feasibility.",
            "**Further Studies**: MSc in Real Estate, MSc in Construction Management, or MBA at HKU, Cambridge, or LSE.",
            "**Professional Recognition**: Path to MRICS (Member of RICS) and MHKIS — globally recognised professional qualifications opening doors worldwide."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Surveying Laboratories**: Dedicated labs for land surveying equipment (total stations, GPS, laser scanners), building measurement, and materials testing.",
            "**Field Equipment**: Access to professional-grade surveying instruments for field camps and project work.",
            "**Industry Links**: Strong connections with major surveying firms, property developers, and government departments. Regular site visits and firm tours.",
            "**Student Society**: Surveying Society organises professional networking events, mentorship programmes, sports competitions, and annual ball.",
            "**Overseas Field Trips**: Study trips to major construction projects and developments in Singapore, London, and Dubai."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate-High (3.5/5 stars). Approximately 300-400 applicants compete for ~50-60 places annually (~15% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 30-32; Median: Best 6 = 27-29; Bottom quartile: Best 6 = 25-27.",
            "**Subject Strategy**: Mathematics (Level 5+) + Physics/Geography (Level 4+). Strong numerical ability is essential for valuation and cost calculations.",
            "**Interview Focus**: Understanding of Hong Kong's property market, land supply issues, and the role of surveyors in the built environment.",
            "**Experience Advantage**: Work experience at property agencies, construction sites, or shadowing surveyors significantly strengthens applications.",
            "**Non-JUPAS Pathway**: IB (30+/45) with Mathematics, GCE A-Levels (ABB including Mathematics). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Francis K.W. Wong**: Leading expert in construction economics and quantity surveying. Former Head of Department of Real Estate and Construction.",
            "**RICS Presidents**: HKU surveying alumni who have served as Presidents of RICS Hong Kong and RICS Asia.",
            "**Property Tycoons**: Several Hong Kong property developers and real estate investors are HKU surveying graduates.",
            "**Government Surveyors**: Alumni serving as government land surveyors, property valuers, and building control officers.",
            "**International Practitioners**: Graduates working at global firms like CBRE, JLL, and Knight Frank across Asia-Pacific, Europe, and North America."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results and interest in the built environment profession.",
            "**RICS Scholarships**: Sponsored by the Royal Institution of Chartered Surveyors. Include mentorship and networking opportunities.",
            "**Property Industry Scholarships**: Sponsored by major developers (SHKP, Henderson Land) and surveying firms. Often include internship guarantees.",
            "**Field Camp Grants**: Funding for residential field camps and overseas study trips (up to HKD 20,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Surveying Strategy",
          content: [
            "**Mathematics Strong**: Excel in Mathematics. Surveying involves constant calculations — valuations, cost estimates, land measurements.",
            "**Understand Property**: Read property news daily. Know current property prices, government land sales, and major development projects.",
            "**Site Visits**: Visit construction sites (with permission), new property launches, or heritage buildings. Show curiosity about the physical built environment.",
            "**Professional Bodies**: Attend RICS or HKIS student events. Show early engagement with the profession.",
            "**Communication Skills**: Surveyors negotiate with clients, contractors, and government. Practice presenting arguments clearly and confidently."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：專業認證課程。中位數收生分數通常為 Best 6 = 27-29 分 (標準計分)。",
            "**核心科目**：英文 (Level 4 或以上)、數學 (必修部分，必須 Level 4 或以上)，以及理科/科技選修科的優異表現。",
            "**數學 - 關鍵**：建議修讀 M1/M2 (微積分與統計)。穩固的量化能力對土地測量、估價及空間分析至關重要。",
            "**理科/科技選修科**：物理、化學、資訊及通訊科技或地理達 Level 4+ 較佳。重視空間推理及技術能力。",
            "**面試**：小組面試，考核邏輯思維、對建成環境的理解、對香港土地議題的認知及測量專業的動機。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 建成環境基礎**：建造導論、建築科技、土地經濟學及基本測量原理。數學及統計學。",
            "**第二年 - 核心測量**：土地測量技術、地籍系統、物業估價、建築病理學及建造法。首次野外營。",
            "**第三年 - 專業專修**：選擇方向 — (1) 工料測量、(2) 建築測量，或 (3) 綜合測量。於測量師事務所實習。",
            "**第四年 - 專業實務**：進階估價、項目管理、爭議解決及專業資格準備 (MRICS、MHKIS)。",
            "**野外營**：於香港及中國內地進行住宿野外營，實踐土地測量、建築量度及工地視察。",
            "**專業認證**：課程獲 RICS (英國皇家特許測量師學會) 及 HKIS (香港測量師學會) 認證。畢業生符合專業能力評估 (APC) 資格。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**工料測量**：於利比建築工料測量師行、威寧謝或凱諦思等擔任工料測量師。管理大型發展項目的建造成本。",
            "**建築測量**：於物業管理公司、政府部門 (屋宇署、房委會) 或顧問公司擔任建築測量師。建築檢查及維修。",
            "**綜合測量**：於國際公司 (世邦魏理仕、仲量聯行、第一太平戴維斯) 或本地公司擔任物業估價師、地產代理或物業經理。",
            "**房地產發展**：於地產發展商 (新鴻基、恒基、新世界) 擔任發展經理，管理收購及項目可行性。",
            "**進修深造**：房地產碩士、建造管理碩士或港大、劍橋或倫敦政治經濟學院的工商管理碩士。",
            "**專業認可**：成為 MRICS (英國皇家特許測量師學會會員) 及 MHKIS 的途徑 — 全球認可的專業資格，打開世界各地的機會。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**測量實驗室**：配備土地測量儀器 (全站儀、GPS、激光掃描儀)、建築量度及材料測試的專用實驗室。",
            "**野外設備**：使用專業級測量儀器進行野外營及項目工作。",
            "**業界聯繫**：與主要測量師事務所、地產發展商及政府部門建立強大聯繫。定期工地參觀及事務所考察。",
            "**學生組織**：測量學會舉辦專業交流活動、師友計劃、體育比賽及年度舞會。",
            "**海外考察旅行**：前往新加坡、倫敦及迪拜的大型建造項目及發展考察。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：中至高 (3.5/5星)。每年約300-400人競爭~50-60個學額 (入學率約15%)。",
            "**分數分佈**：最高四分位數：Best 6 = 30-32分；中位數：Best 6 = 27-29分；最低四分位數：Best 6 = 25-27分。",
            "**科目策略**：數學 (Level 5+) + 物理/地理 (Level 4+)。穩固的數字能力對估價及成本計算至關重要。",
            "**面試重點**：對香港物業市場、土地供應議題及測量師在建成環境角色的理解。",
            "**經驗優勢**：於地產代理、建築工地的工作經驗或跟隨測量師實習能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 30+/45) 修讀數學、GCE A-Level (ABB 包括數學)。約5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**黃國威教授**：建造經濟學及工料測量領域的頂尖專家。前房地產及建設系系主任。",
            "**RICS 會長**：港大測量學校友曾擔任英國皇家特許測量師學會香港及亞洲會長。",
            "**地產大亨**：多位香港地產發展商及房地產投資者是港大測量學畢業生。",
            "**政府測量師**：校友擔任政府土地測量師、物業估價師及建築管制主任。",
            "**國際執業者**：畢業生於世邦魏理仕、仲量聯行及萊坊的亞太、歐洲及北美辦事處工作。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異及對建成環境專業有興趣的學生。",
            "**RICS 獎學金**：由英國皇家特許測量師學會贊助。包括師友指導及交流機會。",
            "**地產業界獎學金**：由主要發展商 (新鴻基、恒基) 及測量師事務所贊助。常包括實習保證。",
            "**野外營資助**：資助住宿野外營及海外考察旅行 (最多港幣20,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 測量學攻略",
          content: [
            "**數學要強**：數學取得卓越成績。測量涉及不斷計算 — 估價、成本估算、土地量度。",
            "**理解物業**：每天閱讀物業新聞。了解當前樓價、政府賣地及主要發展項目。",
            "**工地參觀**：參觀建築工地 (獲准後)、新盤或文物建築。展示對實體建成環境的好奇心。",
            "**專業機構**：參加 RICS 或 HKIS 學生活動。展示及早投入專業。",
            "**溝通技巧**：測量師與客戶、承包商及政府談判。練習清晰自信地表達論點。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6028 - 園境學文學士 (BA(LandSc))
  // =====================================================
  {
    code: "JS6028",
    name: "園境學文學士 (BA(LandSc))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Design-focused environmental programme. Median admission score typically Best 6 = 26-28 (standard scale).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and strong performance in arts, biology, or geography electives.",
            "**Portfolio - Recommended**: A creative portfolio showcasing drawings, photography, garden designs, or environmental art strengthens applications significantly.",
            "**Relevant Electives**: Visual Arts, Biology, Geography, or Design & Applied Technology at Level 4+ preferred. Appreciation for nature and ecology valued.",
            "**Interview**: Portfolio review and panel interview assessing aesthetic sensibility, environmental awareness, understanding of landscape's social role, and design potential."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Landscape Foundations**: Introduction to landscape architecture, plant science, site analysis, and design communication. Drawing and digital representation.",
            "**Year 2 - Design Studios**: Small-scale landscape design projects — gardens, parks, urban plazas. Planting design, ecology, and construction technology.",
            "**Year 3 - Urban Landscapes**: Large-scale projects — urban waterfronts, green infrastructure, heritage landscapes. Study trips to Asian cities known for landscape design (Singapore, Tokyo, Seoul).",
            "**Year 4 - Professional Practice**: Independent design thesis. Professional practice, landscape planning, and preparation for Master of Landscape Architecture (MLA).",
            "**Studio Culture**: Intensive design studio with emphasis on hand drawing, physical models, and digital visualisation. Field sketching trips to Hong Kong's country parks.",
            "**Technical Subjects**: Horticulture, soil science, hydrology, landscape engineering, and sustainable design principles."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Master of Landscape Architecture (MLA)**: Most graduates proceed to HKU's MLA (2-year) or equivalent programmes abroad (Harvard GSD, Penn, Edinburgh) to become registered landscape architects.",
            "**Landscape Architecture Firms**: Graduate landscape architect at international firms (AECOM, SWA, Sasaki) or local practices (AD+RG, Earthasia).",
            "**Government Landscape**: Landscape architect at Civil Engineering and Development Department (CEDD), Leisure and Cultural Services Department (LCSD), or Housing Authority.",
            "**Environmental Consultancy**: Ecological consultant, green infrastructure specialist, or sustainability advisor at environmental consultancies.",
            "**Further Studies**: MLA, MSc in Urban Design, MSc in Ecology, or PhD in landscape architecture at top global institutions.",
            "**Alternative Paths**: Garden design, botanical illustration, environmental education, or urban farming consultancy."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Landscape Studios**: Dedicated studio spaces with 24/7 access, plant reference library, and model-making workshops at the Faculty of Architecture.",
            "**Botanical Garden Access**: Regular visits to HKU's Kadoorie Institute, Hong Kong Botanical Gardens, and country parks for plant identification and ecology study.",
            "**Field Sketching**: Weekly field trips to sketch Hong Kong's diverse landscapes — urban parks, country trails, wetlands, and heritage gardens.",
            "**Student Society**: Landscape Architecture Society organises design charrettes, nursery visits, alumni talks, and green volunteering.",
            "**Overseas Study Trips**: Annual trips to world-renowned landscapes — Japanese gardens, Singapore's Gardens by the Bay, Dutch polder landscapes."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (3/5 stars). Approximately 200-300 applicants compete for ~40-50 places annually (~17% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 29-31; Median: Best 6 = 26-28; Bottom quartile: Best 6 = 24-26.",
            "**Subject Strategy**: English (Level 5+) + Visual Arts/Biology/Geography (Level 4+). A portfolio can compensate for slightly lower academic scores.",
            "**Portfolio Weighting**: Portfolio review carries ~25% of admission decision. Show creativity, observation skills, and love for nature.",
            "**Interview Focus**: Environmental awareness, understanding of Hong Kong's green space challenges, and design thinking.",
            "**Non-JUPAS Pathway**: IB (30+/45) with arts/design subjects, GCE A-Levels (ABB including an arts or science subject). Approximately 3-5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Patrick Lau**: Renowned landscape architect specialising in urban green infrastructure and sustainable city design.",
            "**Professor Matthew Pryor**: Leading expert in landscape ecology and urban biodiversity. Director of HKU's Landscape Architecture programme.",
            "**Government Landscape Architects**: Alumni who have designed major Hong Kong public parks, waterfront promenades, and green corridors.",
            "**International Practitioners**: Graduates working at top landscape firms in Singapore, Australia, UK, and Netherlands.",
            "**Environmental Advocates**: Alumni who have founded urban farming initiatives, community gardens, and environmental education NGOs."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results and creative portfolios demonstrating environmental interest.",
            "**Faculty of Architecture Scholarships**: Merit-based awards for design excellence in landscape architecture.",
            "**Landscape Industry Scholarships**: Sponsored by landscape contractors, nursery operators, and garden design firms.",
            "**Overseas Study Trip Grants**: Funding for landscape study trips and exchange programmes (up to HKD 25,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Landscape Architecture Strategy",
          content: [
            "**Love Nature**: Spend time in Hong Kong's country parks. Learn to identify common plants. Show genuine passion for the natural environment.",
            "**Sketch Regularly**: Carry a sketchbook. Draw landscapes, plants, and outdoor scenes. Hand drawing is still fundamental in landscape architecture.",
            "**Visit Gardens**: Visit Hong Kong Park, Nan Lian Garden, and Singapore's Gardens by the Bay (if possible). Analyse what makes spaces work.",
            "**Understand Ecology**: Read about Hong Kong's native species, wetlands, and biodiversity. Landscape architects are part ecologist.",
            "**Build a Portfolio**: Include sketches, photos of nature, garden designs, or any creative work showing spatial thinking and aesthetic sensibility."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：設計導向的環境課程。中位數收生分數通常為 Best 6 = 26-28 分 (標準計分)。",
            "**核心科目**：英文 (Level 4 或以上)、數學 (必修部分，Level 3 或以上)，以及藝術、生物或地理選修科的優異表現。",
            "**作品集 - 建議**：展示繪圖、攝影、園林設計或環境藝術的創意作品集能顯著強化申請。",
            "**相關選修科**：視覺藝術、生物、地理或設計與應用科技達 Level 4+ 較佳。重視對自然及生態的欣賞。",
            "**面試**：作品集評審及小組面試，考核美學觸覺、環境意識、對園境社會角色的理解及設計潛能。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 園境基礎**：園境建築導論、植物科學、場地分析及設計表達。繪圖及數碼表達。",
            "**第二年 - 設計工作室**：小型園境設計項目 — 花園、公園、城市廣場。種植設計、生態學及建造科技。",
            "**第三年 - 城市園境**：大型項目 — 城市海濱、綠色基建、文物園境。前往以園境設計聞名的亞洲城市 (新加坡、東京、首爾) 考察。",
            "**第四年 - 專業實務**：獨立設計論文。專業實務、園境規劃及園境建築碩士 (MLA) 準備。",
            "**工作室文化**：密集設計工作室，強調手繪、實體模型及數碼視覺化。前往香港郊野公園寫生考察。",
            "**技術科目**：園藝學、土壤科學、水文學、園境工程及可持續設計原則。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**園境建築碩士 (MLA)**：大部分畢業生升讀港大 MLA (兩年制) 或海外同等課程 (哈佛 GSD、賓夕法尼亞大學、愛丁堡大學) 以成為註冊園境師。",
            "**園境建築師事務所**：於國際公司 (AECOM、SWA、Sasaki) 或本地公司 (AD+RG、Earthasia) 擔任畢業園境師。",
            "**政府園境**：於土木工程拓展署 (CEDD)、康樂及文化事務署 (LCSD) 或房委會擔任園境師。",
            "**環境顧問**：於環境顧問公司擔任生態顧問、綠色基建專家或可持續發展顧問。",
            "**進修深造**：園境建築碩士、城市設計碩士、生態學碩士或頂尖國際機構的園境建築博士。",
            "**另類出路**：花園設計、植物插畫、環境教育或都市農耕顧問。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**園境工作室**：配備24小時開放工作室空間、植物參考圖書館及模型製作工場的專用設施。",
            "**植物園使用**：定期前往港大嘉道理研究所、香港植物公園及郊野公園進行植物辨識及生態學習。",
            "**野外寫生**：每週前往香港多元園境寫生 — 城市公園、郊遊徑、濕地及文物園林。",
            "**學生組織**：園境建築學會舉辦設計馬拉松、苗圃參觀、校友講座及綠色義工活動。",
            "**海外考察旅行**：每年前往世界知名園境 — 日本庭園、新加坡濱海灣花園、荷蘭圩田景觀。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：中等 (3/5星)。每年約200-300人競爭~40-50個學額 (入學率約17%)。",
            "**分數分佈**：最高四分位數：Best 6 = 29-31分；中位數：Best 6 = 26-28分；最低四分位數：Best 6 = 24-26分。",
            "**科目策略**：英文 (Level 5+) + 視覺藝術/生物/地理 (Level 4+)。作品集可彌補稍低的學術分數。",
            "**作品集比重**：作品集評審佔入學決定約25%。展示創意、觀察能力及對自然的熱愛。",
            "**面試重點**：環境意識、對香港綠色空間挑戰的理解及設計思維。",
            "**非聯招途徑**：國際文憑 (IB 30+/45) 修讀藝術/設計科目、GCE A-Level (ABB 包括藝術或理科科目)。約3-5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**劉興達教授**：專注於城市綠色基建及可持續城市設計的知名園境師。",
            "**Matthew Pryor 教授**：園境生態學及城市生物多樣性領域的頂尖專家。港大園境建築課程總監。",
            "**政府園境師**：校友設計香港主要公共公園、海濱長廊及綠色走廊。",
            "**國際執業者**：畢業生於新加坡、澳洲、英國及荷蘭的頂尖園境公司工作。",
            "**環境倡導者**：校友創立都市農耕計劃、社區花園及環境教育非政府組織。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異及展示環境興趣的創意作品集的學生。",
            "**建築學院獎學金**：頒予園境建築設計卓越的 merit-based 獎項。",
            "**園境業界獎學金**：由園境承包商、苗圃經營者及花園設計公司贊助。",
            "**海外考察旅行資助**：資助園境考察旅行及交流計劃 (最多港幣25,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 園境學攻略",
          content: [
            "**熱愛自然**：花時間於香港郊野公園。學習辨識常見植物。展示對自然環境的真誠熱情。",
            "**定期素描**：隨身攜帶素描本。繪畫園境、植物及戶外場景。手繪仍然是園境建築的基礎。",
            "**參觀園林**：參觀香港公園、南蓮園池及新加坡濱海灣花園 (如可能)。分析空間如何運作。",
            "**理解生態**：閱讀香港本地物種、濕地及生物多樣性的資料。園境師也是生態學家的一部分。",
            "**建立作品集**：包括素描、自然照片、園林設計或任何展示空間思維及美學觸覺的創意作品。"
          ]
        }
      }
    }
  }
];

async function seedBatch() {
  console.log("[Seed] Starting HKU Batch 4 - Batch 4 programme details seeding...");
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
