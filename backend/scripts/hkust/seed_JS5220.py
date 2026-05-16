import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client("jupas_programmes")

# JS5220 - Department of Chemical and Biological Engineering / 化學及生物工程學系
programme = {
    "code": "JS5220",
    "nameEn": "Department of Chemical and Biological Engineering",
    "nameZh": "化學及生物工程學系",
    "name": "Chemical and Biological Engineering",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 28,
    "band_a": 31,
    "category": "engineering"
}

details = {
    "code": "JS5220",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 28-31 points.",
                    "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Chemistry at Level 4+ is highly preferred. Physics or Biology at Level 3+ is beneficial. Mathematics Extended Part (M1/M2) is advantageous.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Science fair projects, chemistry competition experience, and interest in sustainable technology are beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Engineering Foundation**: Mathematics, physics, chemistry, programming, and introduction to chemical engineering principles.",
                    "**Year 2 - Core CBE**: Thermodynamics, fluid mechanics, heat transfer, mass transfer, and chemical reaction engineering.",
                    "**Year 3 - Advanced Topics**: Process design, biochemical engineering, separation processes, and process control.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in chemical engineering, biological engineering, or environmental engineering. Complete design project.",
                    "**Available Majors**: Chemical Engineering, Biological Engineering, Environmental Engineering (select in Year 2).",
                    "**Laboratory Training**: Hands-on experience with chemical processes, bioreactors, and pilot plant operations."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Chemical Industry**: Process engineer, plant manager, and R&D roles at petrochemical, specialty chemical, and materials companies.",
                    "**Biotechnology & Pharma**: Bioprocess engineer, fermentation specialist, and quality control at biotech and pharmaceutical firms.",
                    "**Environmental Engineering**: Waste treatment, pollution control, and sustainability consulting for government and private sector.",
                    "**Energy Sector**: Battery technology, fuel cells, and renewable energy process development.",
                    "**Food & Beverage**: Process optimization, quality assurance, and product development at food manufacturing companies.",
                    "**Graduate Studies**: MPhil/PhD in chemical engineering, biotechnology, or environmental engineering at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Engineering Labs**: Chemical engineering laboratories with pilot plant facilities, bioreactors, and analytical instruments.",
                    "**Research Centers**: Access to HKUST Energy Institute, Biotechnology Research Institute, and environmental research facilities.",
                    "**Safety Training**: Comprehensive laboratory safety training and certification for handling chemicals and biological materials.",
                    "**Industry Connections**: Partnerships with CLP, HK Electric, and chemical companies for internships and site visits.",
                    "**Student Community**: Active CBE student society, industry networking events, and annual plant design competitions."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Steady demand with good career prospects.",
                    "**Academic Requirements**: Best 5 around 28-31. Chemistry at Level 4+ is important.",
                    "**Band A Competition**: Moderate competition. Band A placement improves admission chances significantly.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong chemistry grade plus mathematics and physics foundation.",
                    "**Trend**: Growing interest due to biotechnology boom, sustainability focus, and energy transition needs."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Industry Leaders**: Alumni in senior engineering roles at Shell, BASF, and local chemical companies.",
                    "**Biotech Pioneers**: Graduates in bioprocess development at GenScript, WuXi AppTec, and pharmaceutical companies.",
                    "**Environmental Consultants**: Alumni leading sustainability and environmental compliance at consulting firms.",
                    "**Academic Researchers**: Graduates pursuing doctoral studies at MIT, Caltech, and Imperial College in chemical engineering.",
                    "**Faculty Excellence**: HKUST CBE faculty includes leading researchers in catalysis, nanomaterials, and bioprocessing."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong science and mathematics grades.",
                    "**Engineering Scholarships**: Merit-based awards for academic excellence in engineering disciplines.",
                    "**Industry-Sponsored Awards**: From chemical and energy companies supporting engineering students.",
                    "**Research Grants**: Funding for undergraduate research in chemical and biological engineering.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Chemical & Biological Engineering Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 29+. Chemistry at Level 4+ is the key subject.",
                    "**Strengthen Chemistry Foundation**: This is the core subject for the programme. Strong understanding of chemical principles is essential.",
                    "**Take Physics or Biology**: Both complement the curriculum. Physics helps with thermodynamics; Biology helps with bioprocessing.",
                    "**Explore Sustainability**: Show interest in green technology, renewable energy, and environmental protection.",
                    "**Consider M1/M2**: Mathematics Extended Part helps with the quantitative aspects of process engineering."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：中等競爭。最佳五科通常28-31分。",
                    "**核心科目**：英文（Level 3+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：化學達4級或以上高度優先考慮。物理或生物達3級或以上有益。數學延伸部分（M1/M2）有優勢。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：科學展覽項目、化學競賽經驗及對可持續科技的興趣有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 工程基礎**：數學、物理、化學、編程及化學工程原理導論。",
                    "**第二年 - 化學及生物工程核心**：熱力學、流體力學、傳熱、傳質及化學反應工程。",
                    "**第三年 - 高級課題**：過程設計、生化工程、分離過程及過程控制。",
                    "**第四年 - 專修及專題**：選擇化學工程、生物工程或環境工程專修。完成設計項目。",
                    "**可選主修**：化學工程、生物工程、環境工程（第二年選擇）。",
                    "**實驗室培訓**：化學過程、生物反應器及中試工廠操作的實踐經驗。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**化工行業**：於石化、特種化學品及材料公司擔任工藝工程師、廠房經理及研發職位。",
                    "**生物科技及製藥**：於生物技術及製藥公司擔任生物工藝工程師、發酵專家及品質控制。",
                    "**環境工程**：為政府及私營部門提供廢物處理、污染控制及可持續發展顧問服務。",
                    "**能源界別**：電池技術、燃料電池及可再生能源過程開發。",
                    "**食品及飲料**：於食品製造公司從事過程優化、品質保證及產品開發。",
                    "**研究生課程**：於頂尖大學攻讀化學工程、生物科技或環境工程哲學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**工程實驗室**：配備中試工廠設施、生物反應器及分析儀器的化學工程實驗室。",
                    "**研究中心**：可使用科大能源研究院、生物科技研究院及環境研究設施。",
                    "**安全培訓**：全面的實驗室安全培訓及處理化學品和生物材料的認證。",
                    "**產業聯繫**：與中電、港燈及化學公司合作提供實習及實地考察。",
                    "**學生社群**：活躍的化學及生物工程學生學會、業界交流活動及年度工廠設計競賽。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。需求穩定，職業前景良好。",
                    "**學術要求**：最佳五科約28-31分。化學達4級或以上很重要。",
                    "**Band A競爭**：中等競爭。Band A選擇可顯著提升入學機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異化學成績加上數學及物理基礎。",
                    "**趨勢**：由於生物科技蓬勃、可持續發展專注及能源轉型需求，興趣持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**業界領袖**：校友於蜆殼、巴斯夫及本地化學公司擔任高級工程職位。",
                    "**生物科技先驅**：畢業生於金斯瑞、藥明康德及製藥公司從事生物工藝開發。",
                    "**環境顧問**：校友於顧問公司領導可持續發展及環境合規工作。",
                    "**學術研究人員**：畢業生於麻省理工學院、加州理工學院及倫敦帝國學院攻讀化學工程博士。",
                    "**教職員卓越**：科大化學及生物工程教職員包括催化、納米材料及生物加工領域的領先研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且科學及數學成績優異的學生。",
                    "**工程獎學金**：按工程學科學術卓越頒發的優異獎。",
                    "**業界贊助獎項**：化學及能源公司支持工程學生的獎項。",
                    "**研究資助**：化學及生物工程本科生研究資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大化學及生物工程學攻略",
                "content": [
                    "**分數目標**：最佳五科目標29分以上。化學達4級或以上為關鍵科目。",
                    "**加強化學基礎**：這是課程的核心科目。對化學原理的穩固理解至關重要。",
                    "**修讀物理或生物**：兩者均補充課程。物理有助於熱力學；生物有助於生物加工。",
                    "**探索可持續發展**：展示對綠色科技、可再生能源及環境保護的興趣。",
                    "**考慮M1/M2**：數學延伸部分有助於過程工程的量化方面。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
