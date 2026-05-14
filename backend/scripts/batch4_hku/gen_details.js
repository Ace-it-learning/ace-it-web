const fs = require('fs');

function makeDetail(code, enAdm, enCur, enCar, enTips, zhAdm, zhCur, zhCar, zhTips) {
  return {
    id: `detail_${code}`,
    pk: "details",
    type: "programme_detail",
    code,
    university: "香港大學",
    content: {
      en: {
        sections: {
          admission: { title: "Admission Criteria", content: enAdm },
          curriculum: { title: "Programme Structure", content: enCur },
          career: { title: "Career Prospects", content: enCar },
          tips: { title: "Ace Sir Strategy", content: enTips }
        }
      },
      zh: {
        sections: {
          admission: { title: "收生要求", content: zhAdm },
          curriculum: { title: "課程結構", content: zhCur },
          career: { title: "職業前景", content: zhCar },
          tips: { title: "Ace Sir 攻略", content: zhTips }
        }
      }
    },
    createdAt: "2025-05-13T00:00:00Z"
  };
}

const details = [
  makeDetail("JS6004",
    ["Best 5 subjects with weighting. English and Mathematics are core requirements.","Portfolio submission is required. Applicants should demonstrate creative potential and spatial thinking.","Interview assesses design thinking, visual communication skills, and motivation for architecture."],
    ["Foundation Studios: Design projects exploring space, form, and materiality.","Architectural History and Theory: From classical to contemporary architecture across cultures.","Building Technology: Structural systems, environmental design, and construction methods.","Professional Practice: Legal framework, project management, and ethics in architecture.","Design Thesis: Final year capstone project with external critics."],
    ["Architecture Firms: Design architect, project architect at local and international practices.","Further Studies: MArch leading to professional registration as an architect.","Urban Design: Public realm design, master planning, and heritage conservation.","Alternative Paths: Set design, exhibition design, architectural visualization."],
    ["Portfolio Quality over Quantity: 5 strong projects beat 15 mediocre ones. Show process, not just outcomes.","Sketch Daily: Freehand drawing is still valued. Carry a sketchbook everywhere.","Visit Buildings: HKU Architecture has strong ties with Foster and Partners and local firms. Attend their lectures."],
    ["Best 5 計分，英文及數學為核心要求。","需要提交作品集，展示創意潛能及空間思維。","面試考核設計思維、視覺傳達能力及修讀建築的動機。"],
    ["基礎設計工作室：探索空間、形態及物料的設計項目。","建築歷史與理論：從古典到當代，跨越文化的建築發展。","建築科技：結構系統、環境設計及建造方法。","專業實務：法律框架、項目管理及建築倫理。","畢業設計論文：由校外評審參與的畢業設計項目。"],
    ["建築事務所：設計建築師、項目建築師，本地及國際事務所。","進修：修讀建築碩士 (MArch) 以取得註冊建築師資格。","城市設計：公共空間設計、總體規劃及文物保育。","另類出路：舞台設計、展覽設計、建築視覺化。"],
    ["質量重於數量：5個強項目勝過15個普通項目，展示過程而非只展示成果。","每日速寫：手繪仍然受重視，隨身攜帶速寫簿。","參觀建築物：港大建築學院與 Foster and Partners 及本地事務所關係密切，多出席講座。"]
  ),
  makeDetail("JS6016",
    ["Best 5 subjects. Mathematics and Physics are highly recommended.","No specific portfolio required, but spatial aptitude is assessed in interview.","Strong analytical and problem-solving skills are essential for surveying."],
    ["Measurement Science: Land surveying, hydrographic surveying, and geodesy.","Property Development: Valuation, investment analysis, and real estate finance.","Building Surveying: Building pathology, maintenance, and renovation.","Quantity Surveying: Cost planning, tendering, and contract administration.","Professional Accreditation: RICS and HKIS accredited programme."],
    ["Chartered Surveyor: Property, building, or quantity surveying routes.","Real Estate: Investment banking, REITs, and property development.","Government: Lands Department, Housing Department, and Architectural Services.","Consultancy: International surveying firms like JLL, CBRE, and Savills."],
    ["Maths is Key: Strong calculus and statistics skills give you an edge in valuation modules.","Summer Internships: Start early. The surveying profession values practical experience.","RICS Accreditation: Plan your APC route from Year 2."],
    ["Best 5 計分，數學及物理強烈建議修讀。","無需提交作品集，但面試會考核空間理解能力。","測量學需要強大的分析及解難能力。"],
    ["測量科學：土地測量、水文測量及大地測量學。","物業發展：估價、投資分析及房地產金融。","建築測量：建築病理學、維修及翻新。","工料測量：成本規劃、招標及合約管理。","專業認可：獲 RICS 及 HKIS 認可課程。"],
    ["特許測量師：物業、建築或工料測量方向。","房地產：投資銀行、房託及物業發展。","政府部門：地政總署、房屋署及建築署。","顧問公司：JLL、CBRE、Savills 等國際測量行。"],
    ["數學是關鍵：良好的微積分及統計能力在估價科目中佔優。","暑期實習：盡早開始，量度行業重視實務經驗。","RICS 認可：從第二年開始規劃 APC (專業能力評核) 路徑。"]
  ),
  makeDetail("JS6028",
    ["Best 5 subjects. Biology and Design and Technology are advantageous.","Portfolio showcasing design work, plant knowledge, or environmental projects is recommended.","Interview focuses on ecological awareness and design sensibility."],
    ["Studio Design: Landscape design projects from urban parks to ecological restoration.","Planting Design: Horticulture, plant ecology, and seasonal landscape effects.","Landscape Technology: Grading, drainage, and sustainable construction.","Urban Ecology: Green infrastructure, biodiversity, and climate adaptation.","Professional Practice: HKILA accreditation and project management."],
    ["Landscape Architecture: Design studios, urban planning consultancies.","Government: LCSD, AFCD, and Civil Engineering and Development Department.","Environmental NGOs: Conservation design, habitat restoration.","Academia: Research in urban ecology and landscape performance."],
    ["Know Your Plants: Start learning local flora now. Latin names impress professors.","Site Visits: Hong Kong has diverse landscapes from wetlands to sky gardens. Document them.","Climate Focus: Sustainability is huge. Read up on sponge city concepts and green infrastructure."],
    ["Best 5 計分，生物及設計與應用科技有優勢。","建議提交展示設計作品、植物知識或環境項目的作品集。","面試重點考核生態意識及設計敏感度。"],
    ["設計工作室：從城市公園到生態修復的景觀設計項目。","種植設計：園藝學、植物生態學及季節性景觀效果。","景觀科技：地形、排水及可持續建造。","城市生態學：綠色基建、生物多樣性及氣候適應。","專業實務：HKILA 認可及項目管理。"],
    ["景觀建築：設計工作室、城市規劃顧問公司。","政府部門：康文署、漁農署及土木工程拓展署。","環保非政府組織：保育設計、棲息地修復。","學術界：城市生態及景觀表現研究。"],
    ["認識植物：現在開始學習本地植物，拉丁學名能給教授留下深刻印象。","實地考察：香港擁有多樣景觀，從濕地到空中花園，記錄下來。","氣候焦點：可持續發展是大趨勢，多閱讀海綿城市及綠色基建概念。"]
  ),
  makeDetail("JS6042",
    ["Best 5 subjects. Geography and Economics are advantageous.","Interest in urban issues, housing, and public policy is assessed in interview.","Strong writing and data analysis skills are beneficial."],
    ["Urban Theory: Cities as systems, urban political economy, and spatial justice.","Housing Studies: Housing policy, affordability, and comparative housing systems.","Transport Planning: Mobility, public transit, and sustainable transport.","GIS and Spatial Analysis: Mapping, data visualization, and urban analytics.","Field Studies: Local and overseas urban field trips."],
    ["Urban Planning: Planning Department, urban design consultancies.","Housing Policy: Housing Authority, NGO policy research.","Transport: MTR Corporation, transport planning firms.","Smart Cities: Tech companies, urban data analytics startups."],
    ["Read Urbanist Books: Jane Jacobs, Jan Gehl, and local voices like Ng Mee Kam.","Follow HK Planning News: Stay updated on Lantau Tomorrow Vision, Northern Metropolis.","Learn GIS Early: QGIS is free. Start mapping your neighbourhood now."],
    ["Best 5 計分，地理及經濟有優勢。","面試會考核對城市議題、房屋及公共政策的興趣。","良好的寫作及數據分析能力有幫助。"],
    ["城市理論：城市作為系統、城市政治經濟學及空間公義。","房屋研究：房屋政策、可負擔性及比較房屋制度。","交通規劃：流動性、公共交通及可持續交通。","GIS 及空間分析：地圖繪製、數據視覺化及城市分析。","實地研究：本地及海外城市考察。"],
    ["城市規劃：規劃署、城市設計顧問公司。","房屋政策：房屋委員會、非政府組織政策研究。","交通運輸：港鐵公司、交通規劃公司。","智慧城市：科技公司、城市數據分析初創。"],
    ["閱讀城市學書籍：Jane Jacobs、Jan Gehl 及本地聲音如吳美瓊。","追蹤香港規劃新聞：緊貼明日大嶼、北部都會區等議題。","提早學 GIS：QGIS 是免費的，現在開始繪製你社區的地圖。"]
  ),
  makeDetail("JS6066",
    ["1.5 x English + Best 4 subjects. English must be at Level 4 or above.","Strong English language skills and communication ability are essential.","Interview includes English teaching demonstration and discussion on educational issues."],
    ["English Major: Linguistics, literature, and applied language studies.","Education Core: Curriculum design, pedagogical theory, and assessment.","Teaching Practicum: Two block practices in local secondary schools.","TESOL Methods: Second language acquisition and classroom strategies.","Professional Qualification: Qualified Teacher Status (QTS) in H
