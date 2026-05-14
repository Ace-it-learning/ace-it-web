/**
 * Seed HKU Batch 4 Programme Details - Batch 5 (Final 3 programmes)
 * Run: node backend/scripts/seed_hku_batch4_details_5.js
 *
 * Programmes:
 * JS6042 - 文學士(城市研究) (BA(UrbanSt))
 * JS6274 - 文學士(全球創意產業) (BA(GCI))
 * JS6236 - 文理學士(設計＋) (BASc(Design+))
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  // =====================================================
  // JS6042 - 文學士(城市研究) (BA(UrbanSt))
  // =====================================================
  {
    code: "JS6042",
    name: "文學士(城市研究) (BA(UrbanSt))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Interdisciplinary social science programme. Median admission score typically Best 6 = 25-27 (standard scale).",
            "**Core Subjects**: English (Level 5+ strongly preferred), Mathematics (Compulsory Part, Level 3+), and strong performance in humanities or social science electives.",
            "**Interdisciplinary Profile**: Values students with diverse subject combinations — Geography, Economics, History, and Liberal Studies all provide relevant foundations.",
            "**Urban Awareness**: Demonstrated interest in urban issues (housing, transport, sustainability, social inequality) through extracurriculars, reading, or community involvement.",
            "**Interview**: Panel interview assessing critical thinking about cities, understanding of Hong Kong's urban challenges, and interdisciplinary curiosity."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Urban Foundations**: Introduction to urban studies, urban geography, urban sociology, and urban economics. Research methods and data analysis.",
            "**Year 2 - City Systems**: Urban planning principles, transport systems, housing policy, and environmental management. First urban research project.",
            "**Year 3 - Specialisation & Fieldwork**: Choose streams — (1) Urban Planning & Design, (2) Urban Policy & Governance, or (3) Sustainable Cities. Overseas field trip to a major global city (London, Tokyo, Singapore).",
            "**Year 4 - Capstone Research**: Independent research thesis on an urban topic. Professional internship with government, NGOs, or urban consultancies.",
            "**Cross-Faculty Curriculum**: Courses from Social Sciences, Architecture, Business, and Science faculties. Unique interdisciplinary approach to understanding cities.",
            "**GIS & Data Skills**: Training in Geographic Information Systems (GIS), urban data visualisation, and spatial analysis software."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Urban Planning**: Planning officer at Planning Department, Urban Renewal Authority, or private planning consultancies (AECOM, Arup, Earthasia).",
            "**Housing & Policy**: Policy analyst at Housing Department, Transport Department, or think tanks focusing on urban policy (Civic Exchange, Our Hong Kong Foundation).",
            "**Real Estate & Development**: Research analyst at property developers, investment firms, or real estate consultancies studying urban development trends.",
            "**NGO & Community Work**: Community organiser, programme coordinator, or advocacy officer at urban-focused NGOs (Society for Community Organisation, HKCSS).",
            "**Further Studies**: MSc in Urban Planning, MSc in Urban Design, MPP (Master of Public Policy), or PhD in urban studies at top universities.",
            "**Smart Cities & Tech**: Urban data analyst, smart city consultant, or GIS specialist at tech companies and government digital departments."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Urban Research Hub**: Access to HKU's Urban Studies Research Hub with GIS labs, urban data archives, and simulation tools.",
            "**Field Research**: Regular field trips across Hong Kong — from dense urban neighbourhoods (Sham Shui Po, Mong Kok) to new towns (Tung Chung, Tseung Kwan O) and heritage districts.",
            "**Guest Lectures**: Weekly talks by urban planners, policymakers, community leaders, and academics on current urban issues.",
            "**Student Society**: Urban Studies Society organises city walks, documentary screenings, policy debates, and networking events with alumni.",
            "**Overseas Field Trips**: Annual study trips to world cities — Tokyo's transit-oriented development, Singapore's public housing, London's urban regeneration."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (3/5 stars). Approximately 300-400 applicants compete for ~50-60 places annually (~15% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 28-30; Median: Best 6 = 25-27; Bottom quartile: Best 6 = 23-25.",
            "**Subject Strategy**: English (Level 5+) + Geography/Economics/History (Level 4+). A well-rounded humanities/social science profile is preferred.",
            "**Interview Focus**: Critical thinking about urban issues, awareness of current events (housing crisis, urban renewal, climate adaptation), and interdisciplinary curiosity.",
            "**Experience Advantage**: Community volunteering, Model UN, or independent research on urban topics significantly strengthens applications.",
            "**Non-JUPAS Pathway**: IB (30+/45) with humanities subjects, GCE A-Levels (ABB including a social science). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Rebecca Chiu**: Leading expert in housing policy and urban governance in Hong Kong and mainland China. Former Head of Urban Planning.",
            "**Professor Mee Kam Ng**: Internationally recognised scholar in sustainable transport, walkable cities, and urban design.",
            "**Government Planners**: Alumni serving as senior planners at Planning Department, Urban Renewal Authority, and Housing Authority.",
            "**Urban Consultants**: Graduates at international consultancies (Arup, AECOM, Mott MacDonald) working on major Hong Kong and Greater Bay Area projects.",
            "**Community Leaders**: Alumni who have founded or lead community organisations advocating for housing rights, urban greening, and heritage preservation."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results and demonstrated interest in urban and social issues.",
            "**Faculty of Social Sciences Scholarships**: Merit-based awards for academic achievement in interdisciplinary urban research.",
            "**Urban Studies Field Trip Grants**: Funding for overseas field trips to study global cities (up to HKD 25,000).",
            "**Research Internship Awards**: Support for summer research internships at government departments or urban think tanks.",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Urban Studies Strategy",
          content: [
            "**Know Your City**: Walk different neighbourhoods. Observe how Sham Shui Po differs from Central, or how Tseung Kwan O was planned. Be ready to discuss specific examples.",
            "**Read Widely**: Follow urban news — housing policy, transport projects, urban renewal. Read books like 'The Death and Life of Great American Cities' (Jane Jacobs).",
            "**Think Interdisciplinary**: Urban issues require economics, sociology, geography, AND design. Show you can connect dots across disciplines.",
            "**Get Involved**: Volunteer at community organisations, attend District Council meetings, or join urban advocacy groups. Show genuine civic engagement.",
            "**Data Literacy**: Start learning basic data skills — Excel, GIS, or even just reading census data. Urban studies increasingly relies on data analysis."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：跨學科社會科學課程。中位數收生分數通常為 Best 6 = 25-27 分 (標準計分)。",
            "**核心科目**：英文 (強烈建議 Level 5 或以上)、數學 (必修部分，Level 3 或以上)，以及人文或社會科學選修科的優異表現。",
            "**跨學科背景**：重視具有多元學科組合的學生 — 地理、經濟、歷史及通識教育均提供相關基礎。",
            "**城市意識**：通過課外活動、閱讀或社區參與，展示對城市議題 (房屋、交通、可持續發展、社會不平等) 的興趣。",
            "**面試**：小組面試，考核對城市的批判思維、對香港城市挑戰的理解及跨學科好奇心。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 城市基礎**：城市研究導論、城市地理學、城市社會學及城市經濟學。研究方法及數據分析。",
            "**第二年 - 城市系統**：城市規劃原則、交通系統、房屋政策及環境管理。首個城市研究項目。",
            "**第三年 - 專修及實地考察**：選擇方向 — (1) 城市規劃與設計、(2) 城市政策與管治，或 (3) 可持續城市。前往主要國際城市 (倫敦、東京、新加坡) 海外考察。",
            "**第四年 - 畢業研究**：城市議題獨立研究論文。於政府、非政府組織或城市顧問公司進行專業實習。",
            "**跨學院課程**：社會科學學院、建築學院、商學院及理學院的課程。理解城市的獨特跨學科方法。",
            "**地理資訊系統及數據技能**：地理資訊系統 (GIS)、城市數據視覺化及空間分析軟件培訓。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**城市規劃**：於規劃署、市區重建局或私人規劃顧問公司 (AECOM、Arup、Earthasia) 擔任規劃主任。",
            "**房屋及政策**：於房屋署、運輸署或聚焦城市政策的研究所 (思匯政策研究所、團結香港基金) 擔任政策分析師。",
            "**房地產及發展**：於地產發展商、投資公司或房地產顧問公司擔任研究分析師，研究城市發展趨勢。",
            "**非政府組織及社區工作**：於城市為本的非政府組織 (香港社區組織協會、香港社會服務聯會) 擔任社區組織者、項目統籌或倡議主任。",
            "**進修深造**：城市規劃碩士、城市設計碩士、公共政策碩士 (MPP) 或頂尖大學的城市研究博士。",
            "**智慧城市及科技**：於科技公司及政府數碼部門擔任城市數據分析師、智慧城市顧問或 GIS 專家。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**城市研究中心**：使用港大城市研究中心，配備 GIS 實驗室、城市數據檔案館及模擬工具。",
            "**實地研究**：定期於香港各區實地考察 — 從密集市區 (深水埗、旺角) 到新市鎮 (東涌、將軍澳) 及文物區。",
            "**嘉賓講座**：城市規劃師、政策制定者、社區領袖及學者就當前城市議題每週舉行講座。",
            "**學生組織**：城市研究學會舉辦城市漫步、紀錄片放映、政策辯論及校友交流活動。",
            "**海外實地考察**：每年前往世界城市考察 — 東京的公共交通導向發展、新加坡的公共房屋、倫敦的城市更新。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：中等 (3/5星)。每年約300-400人競爭~50-60個學額 (入學率約15%)。",
            "**分數分佈**：最高四分位數：Best 6 = 28-30分；中位數：Best 6 = 25-27分；最低四分位數：Best 6 = 23-25分。",
            "**科目策略**：英文 (Level 5+) + 地理/經濟/歷史 (Level 4+)。均衡的人文/社會科學背景較受青睞。",
            "**面試重點**：對城市議題的批判思維、對時事 (房屋危機、市區重建、氣候適應) 的認知及跨學科好奇心。",
            "**經驗優勢**：社區義工、模擬聯合國或城市議題獨立研究能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 30+/45) 修讀人文科目、GCE A-Level (ABB 包括社會科學)。約5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**趙麗霞教授**：香港及中國內地房屋政策及城市管治領域的頂尖專家。前城市規劃系主任。",
            "**吳縉洮教授**：可持續交通、適宜步行城市及城市設計領域國際知名學者。",
            "**政府規劃師**：校友於規劃署、市區重建局及房屋署擔任高級規劃師。",
            "**城市顧問**：畢業生於國際顧問公司 (Arup、AECOM、Mott MacDonald) 從事香港及大灣區主要項目。",
            "**社區領袖**：校友創立或領導倡議房屋權益、城市綠化及文物保育的社區組織。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異及展示城市及社會議題興趣的學生。",
            "**社會科學學院獎學金**：頒予跨學科城市研究學術成就的 merit-based 獎項。",
            "**城市研究考察資助**：資助前往全球城市研究的海外考察 (最多港幣25,000元)。",
            "**研究實習獎項**：支援於政府部門或城市研究所的暑期研究實習。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 城市研究攻略",
          content: [
            "**認識你的城市**：遊走不同社區。觀察深水埗與中環的分別，或將軍澳如何規劃。準備討論具體例子。",
            "**廣泛閱讀**：追蹤城市新聞 — 房屋政策、交通項目、市區重建。閱讀《美國大城市的死與生》(珍·雅各布斯) 等書籍。",
            "**跨學科思考**：城市議題需要經濟學、社會學、地理學及設計。展示你能跨學科連繫。",
            "**參與其中**：於社區組織當義工、出席區議會會議，或加入城市倡議團體。展示真正的公民參與。",
            "**數據素養**：開始學習基本數據技能 — Excel、GIS，或甚至只是閱讀人口普查數據。城市研究日益依賴數據分析。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6274 - 文學士(全球創意產業) (BA(GCI))
  // =====================================================
  {
    code: "JS6274",
    name: "文學士(全球創意產業) (BA(GCI))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Creative industry-focused arts programme. Median admission score typically Best 6 = 26-28 (standard scale).",
            "**Core Subjects**: English (Level 5+ strongly preferred), Mathematics (Compulsory Part, Level 3+), and strong performance in arts, humanities, or business electives.",
            "**Creative Portfolio - Recommended**: Portfolio showcasing creative work — writing, photography, video, music, design, or any form of cultural production strengthens applications.",
            "**Relevant Electives**: Visual Arts, Music, Literature, Economics, or Business at Level 4+ preferred. Cultural awareness and creative thinking valued.",
            "**Interview**: Panel interview assessing creative thinking, understanding of creative industries, cultural awareness, and entrepreneurial mindset."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Creative Foundations**: Introduction to creative industries, cultural studies, media theory, and creative entrepreneurship. Basic production skills.",
            "**Year 2 - Industry Sectors**: Deep dive into film, music, gaming, publishing, fashion, and digital media. Case studies of successful creative businesses.",
            "**Year 3 - Global Context**: Creative industries in Asia-Pacific, Europe, and North America. Overseas exchange at partner universities (Goldsmiths, NYU Tisch, RMIT). Industry internship.",
            "**Year 4 - Capstone Project**: Independent creative project or business plan. Professional portfolio development and industry mentorship.",
            "**Practical Skills**: Training in content creation, digital marketing, audience analytics, IP management, and creative business modelling.",
            "**Industry Partnerships**: Collaborations with Hong Kong Design Centre, PMQ, K11, and media companies (TVB, ViuTV, South China Morning Post)."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Media & Entertainment**: Content producer, programme developer, or talent manager at TV stations, streaming platforms (Netflix, Disney+), or production houses.",
            "**Arts & Culture Management**: Programme curator, festival coordinator, or venue manager at museums, galleries, performing arts centres, or cultural districts (West Kowloon).",
            "**Creative Entrepreneurship**: Found creative startups in gaming, digital content, fashion, or experiential design. Access to HKU's iDendron incubator.",
            "**Brand & Marketing**: Creative strategist, brand manager, or content director at advertising agencies, luxury brands, or tech companies.",
            "**Further Studies**: MA in Creative Industries, MA in Media Management, or MFA in creative production at Goldsmiths, NYU, or Central Saint Martins.",
            "**Publishing & Journalism**: Editor, writer, or digital content strategist at publishing houses, online media, or independent platforms."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Creative Studios**: Access to media production labs, recording studios, photography darkrooms, and digital fabrication spaces at HKU.",
            "**Industry Events**: Regular film screenings, gallery openings, music performances, and talks by creative industry leaders at HKU and partner venues.",
            "**Student Productions**: Opportunities to produce student films, podcasts, zines, exhibitions, and cultural events through the Creative Industries Society.",
            "**Mentorship Programme**: Matched with mentors from Hong Kong's creative sector — film directors, gallery owners, music producers, and fashion designers.",
            "**Overseas Exposure**: Semester exchange at world-leading creative schools — Goldsmiths (London), Tisch (NYU), RMIT (Melbourne), or Ecole cantonale d'art de Lausanne."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (3/5 stars). Approximately 300-400 applicants compete for ~45-55 places annually (~14% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 29-31; Median: Best 6 = 26-28; Bottom quartile: Best 6 = 24-26.",
            "**Subject Strategy**: English (Level 5+) + Visual Arts/Music/Literature/Economics (Level 4+). A creative portfolio can compensate for slightly lower scores.",
            "**Portfolio Weighting**: Portfolio review carries ~20% of admission decision. Show originality, cultural awareness, and passion for creative work.",
            "**Interview Focus**: Creative thinking, understanding of Hong Kong's creative economy, and awareness of global trends (K-pop, streaming, gaming).",
            "**Non-JUPAS Pathway**: IB (30+/45) with arts/creative subjects, GCE A-Levels (ABB including an arts subject). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Eric Ma**: Leading scholar in creative industries policy and cultural economics in Asia. Advisor to Hong Kong government on creative sector development.",
            "**Professor Angela Wu**: Expert in digital media, gaming culture, and creative entrepreneurship in Greater China.",
            "**Film & TV Producers**: Alumni who have produced award-winning films, TV dramas, and documentaries screened at international festivals.",
            "**Gallery Owners**: Graduates who have founded contemporary art galleries and creative spaces in Hong Kong and Taipei.",
            "**Music Industry Professionals**: Alumni working as A&R managers, concert promoters, and music producers in Hong Kong and mainland China."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results and demonstrated creative talent.",
            "**Faculty of Arts Scholarships**: Merit-based awards for academic and creative achievement.",
            "**Creative Industry Scholarships**: Sponsored by media companies, design firms, and cultural organisations. Include internship opportunities.",
            "**Overseas Exchange Grants**: Funding for semester exchange at partner creative schools (up to HKD 40,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's GCI Strategy",
          content: [
            "**Create Something**: Start a YouTube channel, write a blog, design posters, or make short films. Show you are already a creator, not just a consumer.",
            "**Know the Industry**: Follow entertainment news, box office trends, and streaming wars. Understand how creative businesses make money.",
            "**Cultural Awareness**: Consume culture from different places — Korean dramas, Japanese anime, British TV, American podcasts. Show global cultural curiosity.",
            "**Network Early**: Attend film festivals, art exhibitions, and music gigs. Meet people in the industry. Creative industries are relationship-driven.",
            "**Business + Creativity**: This is NOT a pure arts degree. Show you understand the business side — marketing, IP, audience analytics."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：創意產業導向的藝術課程。中位數收生分數通常為 Best 6 = 26-28 分 (標準計分)。",
            "**核心科目**：英文 (強烈建議 Level 5 或以上)、數學 (必修部分，Level 3 或以上)，以及藝術、人文或商科選修科的優異表現。",
            "**創意作品集 - 建議**：展示創意作品 — 寫作、攝影、影片、音樂、設計或任何形式的文化創作的作品集能強化申請。",
            "**相關選修科**：視覺藝術、音樂、文學、經濟或商業達 Level 4+ 較佳。重視文化意識及創意思維。",
            "**面試**：小組面試，考核創意思維、對創意產業的理解、文化意識及創業思維。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 創意基礎**：創意產業導論、文化研究、媒體理論及創意創業。基本製作技能。",
            "**第二年 - 產業界別**：深入探討電影、音樂、遊戲、出版、時尚及數碼媒體。成功創意企業個案研究。",
            "**第三年 - 環球脈絡**：亞太、歐洲及北美的創意產業。於伙伴大學 (Goldsmiths、紐約大學 Tisch、RMIT) 海外交流。業界實習。",
            "**第四年 - 畢業專題**：獨立創意項目或商業計劃。專業作品集發展及業界師友指導。",
            "**實務技能**：內容創作、數碼營銷、受眾分析、知識產權管理及創意商業模式培訓。",
            "**業界伙伴**：與香港設計中心、PMQ、K11 及媒體公司 (無綫電視、ViuTV、南華早報) 合作。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**媒體及娛樂**：於電視台、串流平台 (Netflix、Disney+) 或製作公司擔任內容製作人、節目開發員或藝人經理。",
            "**藝術及文化管理**：於博物館、畫廊、表演藝術中心或文化區 (西九龍) 擔任節目策展人、藝術節統籌或場地經理。",
            "**創意創業**：創立遊戲、數碼內容、時尚或體驗設計的創意初創企業。可使用港大 iDendron 孵化中心。",
            "**品牌及營銷**：於廣告公司、奢侈品牌或科技公司擔任創意策略師、品牌經理或內容總監。",
            "**進修深造**：創意產業碩士、媒體管理碩士或 Goldsmiths、紐約大學或中央聖馬丁的創意製作碩士。",
            "**出版及新聞**：於出版社、網上媒體或獨立平台擔任編輯、作家或數碼內容策略師。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**創意工作室**：使用港大媒體製作實驗室、錄音室、攝影黑房及數碼製造空間。",
            "**業界活動**：定期於港大及伙伴場地舉行電影放映、畫廊開幕、音樂表演及創意產業領袖講座。",
            "**學生製作**：透過創意產業學會製作學生電影、播客、雜誌、展覽及文化活動的機會。",
            "**師友計劃**：與香港創意界導師配對 — 電影導演、畫廊主、音樂製作人及時裝設計師。",
            "**海外 exposure**：於世界領先創意學校進行交流學期 — Goldsmiths (倫敦)、Tisch (紐約大學)、RMIT (墨爾本) 或洛桑藝術設計大學。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：中等 (3/5星)。每年約300-400人競爭~45-55個學額 (入學率約14%)。",
            "**分數分佈**：最高四分位數：Best 6 = 29-31分；中位數：Best 6 = 26-28分；最低四分位數：Best 6 = 24-26分。",
            "**科目策略**：英文 (Level 5+) + 視覺藝術/音樂/文學/經濟 (Level 4+)。創意作品集可彌補稍低的分數。",
            "**作品集比重**：作品集評審佔入學決定約20%。展示原創性、文化意識及對創意工作的熱情。",
            "**面試重點**：創意思維、對香港創意經濟的理解及對環球趨勢 (K-pop、串流、遊戲) 的認知。",
            "**非聯招途徑**：國際文憑 (IB 30+/45) 修讀藝術/創意科目、GCE A-Level (ABB 包括藝術科目)。約5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**馬傑偉教授**：亞洲創意產業政策及文化經濟學領域的頂尖學者。香港政府創意產業發展顧問。",
            "**胡詠儀教授**：大中華數碼媒體、遊戲文化及創意創業專家。",
            "**影視製作人**：校友製作於國際影展放映的得獎電影、電視劇及紀錄片。",
            "**畫廊主**：畢業生於香港及台北創立當代藝術畫廊及創意空間。",
            "**音樂業界專業人士**：校友於香港及中國內地擔任 A&R 經理、演唱會主辦及音樂製作人。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異及展示創意才華的學生。",
            "**文學院獎學金**：頒予學術及創意成就的 merit-based 獎項。",
            "**創意產業獎學金**：由媒體公司、設計公司和文化組織贊助。包括實習機會。",
            "**海外交流資助**：資助於伙伴創意學校進行交流學期 (最多港幣40,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 全球創意產業攻略",
          content: [
            "**創造一些東西**：開設 YouTube 頻道、寫網誌、設計海報或製作短片。展示你已是創作者，而非僅是消費者。",
            "**認識產業**：追蹤娛樂新聞、票房趨勢及串流大戰。理解創意企業如何賺錢。",
            "**文化意識**：消費不同地方的文化 — 韓劇、日本動漫、英國電視、美國播客。展示環球文化好奇心。",
            "**及早建立網絡**：參加電影節、藝術展覽及音樂演出。認識業界人士。創意產業以關係為本。",
            "**商業 + 創意**：這不是純藝術學位。展示你理解商業層面 — 營銷、知識產權、受眾分析。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6236 - 文理學士(設計＋) (BASc(Design+))
  // =====================================================
  {
    code: "JS6236",
    name: "文理學士(設計＋) (BASc(Design+))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Innovative interdisciplinary design programme. Median admission score typically Best 6 = 29-31 (standard scale).",
            "**Core Subjects**: English (Level 5+), Mathematics (Compulsory Part, Level 4+), and strong performance in arts, science, or technology electives.",
            "**Portfolio - Critical**: A creative portfolio is HIGHLY RECOMMENDED. Show design thinking through sketches, prototypes, digital work, or any creative projects.",
            "**Interdisciplinary Mindset**: Values students who bridge arts and sciences — e.g., Visual Arts + Physics, Design + Biology, or Music + Mathematics.",
            "**Interview**: Design challenge and panel interview assessing creative problem-solving, systems thinking, and understanding of design's role in addressing complex global challenges."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Design Thinking Foundations**: Human-centred design, design research methods, rapid prototyping, and interdisciplinary collaboration. No prior design experience required.",
            "**Year 2 - Systems & Technology**: Systems thinking, interaction design, data visualisation, and emerging technologies (AI, IoT, biodesign). First interdisciplinary design project.",
            "**Year 3 - Social Impact**: Design for social innovation, sustainable design, healthcare design, and urban interventions. Overseas field studio at partner institutions (MIT Media Lab, RCA, Delft).",
            "**Year 4 - Capstone & Entrepreneurship**: Final year project addressing a real-world challenge. Business model development, IP strategy, and preparation for design entrepreneurship or further studies.",
            "**Cross-Faculty Collaboration**: Courses from Architecture, Engineering, Business, Medicine, and Social Sciences. Design+ is explicitly designed to break down disciplinary silos.",
            "**Maker Culture**: 24/7 access to fabrication labs, electronics workshops, bio-labs, and digital production suites."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Design Consultancies**: Service designer, UX strategist, or innovation consultant at IDEO, Frog Design, or local design studios.",
            "**Tech Industry**: Product designer, interaction designer, or design researcher at tech companies (Google, Apple, Xiaomi, Tencent).",
            "**Social Innovation**: Design lead at social enterprises, NGOs, or government innovation labs addressing healthcare, education, or environmental challenges.",
            "**Design Entrepreneurship**: Found design-driven startups in product innovation, experiential design, or sustainable technologies. Access to HKU's entrepreneurship ecosystem.",
            "**Further Studies**: MFA in Design, MSc in Design Engineering, or interdisciplinary PhD at RCA, MIT Media Lab, Stanford d.school, or TU Delft.",
            "**Research & Academia**: Design researcher at universities or research institutes focusing on human-computer interaction, design futures, or sustainable design."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Design+ Studio**: Dedicated interdisciplinary studio space with 24/7 access, prototyping equipment, and collaborative workspaces at the Faculty of Architecture.",
            "**Fabrication Labs**: 3D printers, laser cutters, CNC machines, electronics workstations, and biodesign equipment for experimental projects.",
            "**Interdisciplinary Community**: Regular 'Design Jams' bringing together students from medicine, engineering, business, and arts to solve challenges collaboratively.",
            "**Industry Mentors**: Matched with mentors from diverse fields — industrial designers, biomedical engineers, social entrepreneurs, and tech founders.",
            "**Global Studios**: Intensive 2-4 week studios at partner institutions — MIT Media Lab (Cambridge), Royal College of Art (London), TU Delft (Netherlands)."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: High (4/5 stars). Approximately 500-600 applicants compete for ~40-50 places annually (~8% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 32-34; Median: Best 6 = 29-31; Bottom quartile: Best 6 = 27-29.",
            "**Subject Strategy**: English (Level 5+) + ANY strong electives. This programme explicitly values diverse subject combinations — arts + sciences is ideal.",
            "**Portfolio Weighting**: Portfolio/design challenge carries ~30% of admission decision. Show creative problem-solving, not just artistic skill.",
            "**Interview Focus**: Systems thinking, empathy for users, and ability to articulate how design can address complex problems (climate, health, inequality).",
            "**Non-JUPAS Pathway**: IB (34+/45) with diverse HL subjects, GCE A-Levels (AAB from different disciplines). Approximately 5-8 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Cameron Campbell**: Founding Director of Design+. Pioneer in interdisciplinary design education bridging arts, sciences, and technology.",
            "**Professor Christian J. Lange**: Expert in digital fabrication, robotic construction, and computational design.",
            "**Design Entrepreneurs**: Alumni who have founded successful startups in sustainable packaging, wearable health tech, and educational toys.",
            "**Tech Industry Designers**: Graduates at Google, Apple, and Xiaomi working on next-generation product interfaces and experiences.",
            "**Social Innovators**: Alumni leading design initiatives at NGOs addressing elderly care, food waste, and accessible transportation."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with exceptional DSE results and outstanding creative portfolios.",
            "**Design+ Innovation Scholarships**: Merit-based awards for students demonstrating exceptional interdisciplinary design potential.",
            "**Maker Fund**: Seed funding for student design projects and prototypes (up to HKD 20,000 per project).",
            "**Overseas Studio Grants**: Funding for global studio experiences at partner institutions (up to HKD 40,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Design+ Strategy",
          content: [
            "**Think Beyond Art**: Design+ is NOT a fine arts degree. It's about solving problems creatively. Show how you would redesign a bus stop, a hospital waiting room, or a recycling system.",
            "**Build a Portfolio**: Include ANY creative work — sketches, Lego models, app wireframes, photography, craft projects. Show curiosity and hands-on making.",
            "**Be Interdisciplinary**: If you study both Visual Arts and Physics, or Biology and Music, emphasise this. Design+ values people who bridge disciplines.",
            "**Practice Design Thinking**: Learn the design thinking process — empathise, define, ideate, prototype, test. Be ready to walk through it in the interview.",
            "**Care About Problems**: Show passion for real issues — climate change, ageing population, mental health. Design+ students want to make the world better through design."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：創新的跨學科設計課程。中位數收生分數通常為 Best 6 = 29-31 分 (標準計分)。",
            "**核心科目**：英文 (Level 5 或以上)、數學 (必修部分，Level 4 或以上)，以及藝術、理科或科技選修科的優異表現。",
            "**作品集 - 關鍵**：強烈建議提交創意作品集。透過素描、原型、數碼作品或任何創意項目展示設計思維。",
            "**跨學科思維**：重視銜接藝術與科學的學生 — 例如視覺藝術 + 物理、設計 + 生物，或音樂 + 數學。",
            "**面試**：設計挑戰及小組面試，考核創意解難、系統思維，以及對設計在應對複雜環球挑戰中角色的理解。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 設計思維基礎**：以人為本的設計、設計研究方法、快速原型製作及跨學科協作。無需先前設計經驗。",
            "**第二年 - 系統與科技**：系統思維、互動設計、數據視覺化及新興科技 (人工智能、物聯網、生物設計)。首個跨學科設計項目。",
            "**第三年 - 社會影響**：社會創新設計、可持續設計、醫療設計及城市介入。於伙伴機構 (麻省理工媒體實驗室、皇家藝術學院、代爾夫特理工) 進行海外實地工作室。",
            "**第四年 - 畢業專題及創業**：應對真實世界挑戰的畢業專題。商業模式發展、知識產權策略及設計創業或進修準備。",
            "**跨學院協作**：建築學院、工程學院、商學院、醫學院及社會科學學院的課程。設計+明確旨在打破學科壁壘。",
            "**創客文化**：24小時開放製造實驗室、電子工場、生物實驗室及數碼製作室。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**設計顧問公司**：於 IDEO、Frog Design 或本地設計工作室擔任服務設計師、用戶體驗策略師或創新顧問。",
            "**科技業界**：於科技公司 (Google、蘋果、小米、騰訊) 擔任產品設計師、互動設計師或設計研究員。",
            "**社會創新**：於社會企業、非政府組織或政府創新實驗室擔任設計主管，應對醫療、教育或環境挑戰。",
            "**設計創業**：創立產品創新、體驗設計或可持續科技的設計驅動初創企業。可使用港大創業生態系統。",
            "**進修深造**：設計碩士、設計工程碩士或皇家藝術學院、麻省理工媒體實驗室、史丹福 d.school 或代爾夫特理工的跨學科博士。",
            "**研究及學術**：於大學或研究所擔任設計研究員，專注於人機互動、設計未來或可持續設計。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**設計+工作室**：建築學院配備24小時開放跨學科工作室空間、原型製作設備及協作工作間的專用設施。",
            "**製造實驗室**：3D 打印機、激光切割機、CNC 機器、電子工作站及生物設計設備供實驗項目使用。",
            "**跨學科社群**：定期舉辦「設計馬拉松」，匯集醫學、工程、商業及藝術學生協作解決挑戰。",
            "**業界導師**：與多元領域導師配對 — 工業設計師、生物醫學工程師、社會企業家及科技創辦人。",
            "**環球工作室**：於伙伴機構進行密集2-4週工作室 — 麻省理工媒體實驗室 (劍橋)、皇家藝術學院 (倫敦)、代爾夫特理工 (荷蘭)。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：高 (4/5星)。每年約500-600人競爭~40-50個學額 (入學率約8%)。",
            "**分數分佈**：最高四分位數：Best 6 = 32-34分；中位數：Best 6 = 29-31分；最低四分位數：Best 6 = 27-29分。",
            "**科目策略**：英文 (Level 5+) + 任何強項選修科。此課程明確重視多元學科組合 — 藝術 + 理科最理想。",
            "**作品集比重**：作品集/設計挑戰佔入學決定約30%。展示創意解難，而非僅藝術技巧。",
            "**面試重點**：系統思維、對用戶的同理心，以及闡述設計如何應對複雜問題 (氣候、健康、不平等) 的能力。",
            "**非聯招途徑**：國際文憑 (IB 34+/45) 修讀多元高等科目、GCE A-Level (AAB 來自不同學科)。約5-8個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**Cameron Campbell 教授**：設計+創辦總監。銜接藝術、科學及科技的跨學科設計教育先驅。",
            "**Christian J. Lange 教授**：數碼製造、機械人建造及運算設計領域專家。",
            "**設計創業家**：校友創立可持續包裝、可穿戴健康科技及教育玩具的成功初創企業。",
            "**科技業界設計師**：畢業生於 Google、蘋果及小米從事下一代產品介面及體驗工作。",
            "**社會創新者**：校友於非政府組織領導設計倡議，應對長者護理、食物浪費及無障礙交通。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績卓越及具傑出創意作品集的學生。",
            "**設計+創新獎學金**：頒予展現卓越跨學科設計潛能學生的 merit-based 獎項。",
            "**創客基金**：學生設計項目及原型的種子資金 (每個項目最多港幣20,000元)。",
            "**海外工作室資助**：資助於伙伴機構的環球工作室體驗 (最多港幣40,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 設計+攻略",
          content: [
            "**超越藝術思考**：設計+不是純藝術學位。它是關於創意解難。展示你會如何重新設計巴士站、醫院候診室或回收系統。",
            "**建立作品集**：包括任何創意作品 — 素描、樂高模型、應用程式線框圖、攝影、手工藝項目。展示好奇心及動手製作能力。",
            "**跨學科發展**：如果你同時修讀視覺藝術及物理，或生物及音樂，強調這一點。設計+重視跨學科人才。",
            "**練習設計思維**：學習設計思維流程 — 同理心、定義、構思、原型、測試。準備在面試中演示。",
            "**關心問題**：展示對真實議題的熱情 — 氣候變化、人口老化、心理健康。設計+學生希望透過設計讓世界變得更美好。"
          ]
        }
      }
    }
  }
];

async function seedBatch() {
  console.log("[Seed] Starting HKU Batch 4 - Batch 5 (FINAL) programme details seeding...");
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

  console.log("[Seed] Batch 5 (FINAL) seeding complete.");
  console.log("[Seed] All 15 HKU Batch 4 programme details have been seeded!");
  process.exit(0);
}

seedBatch().catch((error) => {
  console.error("[Seed] Fatal error:", error);
  process.exit(1);
});
