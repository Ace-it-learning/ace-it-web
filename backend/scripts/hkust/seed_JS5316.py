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

# JS5316 - BBA in Marketing / 工商管理學士（市場學）
programme = {
    "code": "JS5316",
    "nameEn": "BBA in Marketing",
    "nameZh": "工商管理學士（市場學）",
    "name": "BBA in Marketing",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 30,
    "band_a": 33,
    "category": "business"
}

details = {
    "code": "JS5316",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 30-33 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is recommended. BAFS or Economics at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Creativity, communication skills, social media presence, marketing competition participation, and consumer insight interest strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Consumer behavior, marketing principles, business communication, statistics, and economics.",
                    "**Year 2 - Core Marketing**: Marketing research, brand management, digital marketing, advertising, and sales management.",
                    "**Year 3 - Advanced Topics**: Marketing analytics, social media marketing, international marketing, retail management, and service marketing.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in digital marketing, brand management, or marketing analytics. Complete real client project.",
                    "**Available Tracks**: Digital Marketing, Brand Management, Marketing Analytics (select in Year 3).",
                    "**Practical Experience**: Live client projects, marketing competitions, internship, and industry certification."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Brand Management**: Brand manager and product manager at FMCG companies (P&G, Unilever, L'Oreal) and luxury brands.",
                    "**Digital Marketing**: Growth marketing, performance marketing, and social media strategy at tech companies and agencies.",
                    "**Marketing Analytics**: Marketing data analyst, customer insights, and CRM analytics at data-driven companies.",
                    "**Advertising & PR**: Account management, creative strategy, and media planning at advertising agencies.",
                    "**E-commerce**: E-commerce operations, marketplace management, and online merchandising at retailers and platforms.",
                    "**Market Research**: Research analyst at Nielsen, Kantar, and specialized research firms."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Marketing Labs**: Consumer behavior lab with eye-tracking, focus group facilities, and survey tools.",
                    "**Digital Studio**: Content creation studio with video production, photo editing, and social media analytics tools.",
                    "**Research Centers**: HKUST Center for Consumer Insights and Digital Marketing Research Lab.",
                    "**Industry Projects**: Real marketing campaigns for brands, from strategy to execution.",
                    "**Student Community**: Active Marketing Society, advertising competitions, and brand challenge teams."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand from creatively inclined business students.",
                    "**Academic Requirements**: Best 5 around 30-33. Well-rounded profile with strong communication skills.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong academics plus creativity, communication skills, and marketing interest.",
                    "**Trend**: Growing demand due to digital marketing boom and data-driven marketing evolution."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Brand Managers**: Alumni managing major brands at P&G, Unilever, Nestle, and luxury houses.",
                    "**Digital Marketers**: Graduates leading growth and performance marketing at tech giants and startups.",
                    "**Agency Leaders**: Alumni in senior roles at Ogilvy, DDB, and digital marketing agencies.",
                    "**E-commerce Experts**: Marketing leaders at Alibaba, Amazon, and major retailers.",
                    "**Faculty Excellence**: HKUST marketing faculty includes experts in consumer psychology, digital marketing, and brand strategy."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong academic records.",
                    "**Marketing Excellence Awards**: Merit-based scholarships for creative and analytical talent.",
                    "**Industry-Sponsored Scholarships**: From FMCG, tech, and agency partners.",
                    "**Competition Grants**: Funding for marketing case competitions and creative challenges.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Marketing Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 31+. Well-rounded academics with strong English.",
                    "**Develop Creativity**: Show creative thinking through projects, content creation, or design work.",
                    "**Build Digital Presence**: Understand social media platforms, content marketing, and digital analytics.",
                    "**Stay Consumer-Focused**: Observe brands, analyze campaigns, and understand consumer psychology.",
                    "**Practice Communication**: Strong writing and presentation skills are essential for marketing careers."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。最佳五科通常30-33分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上建議。企業、會計與財務概論或經濟達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：創意、溝通技巧、社交媒體存在、市場學競賽參與及消費者洞察興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：消費者行為、市場學原理、商業傳播、統計及經濟。",
                    "**第二年 - 市場學核心**：市場研究、品牌管理、數碼市場學、廣告及銷售管理。",
                    "**第三年 - 高級課題**：市場學分析、社交媒體市場學、國際市場學、零售管理及服務市場學。",
                    "**第四年 - 專修及專題**：選擇數碼市場學、品牌管理或市場學分析專修。完成真實客戶項目。",
                    "**可選方向**：數碼市場學、品牌管理、市場學分析（第三年選擇）。",
                    "**實踐經驗**：實時客戶項目、市場學競賽、實習及業界認證。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**品牌管理**：於快速消費品公司（寶潔、聯合利華、歐萊雅）及奢侈品牌擔任品牌經理及產品經理。",
                    "**數碼市場學**：於科技公司及代理機構擔任增長市場學、績效市場學及社交媒體策略。",
                    "**市場學分析**：於數據驅動公司擔任市場數據分析師、客戶洞察及客戶關係管理分析。",
                    "**廣告及公關**：於廣告代理機構擔任客戶管理、創意策略及媒體策劃。",
                    "**電子商務**：於零售商及平台擔任電子商務營運、市場管理及網上商品銷售。",
                    "**市場研究**：於尼爾森、凱度及專門研究公司擔任研究分析師。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**市場學實驗室**：配備眼球追蹤、焦點小組設施及調查工具的消費者行為實驗室。",
                    "**數碼工作室**：配備影片製作、照片編輯及社交媒體分析工具的內容創作工作室。",
                    "**研究中心**：科大消費者洞察中心及數碼市場學研究實驗室。",
                    "**產業項目**：從策略到執行為品牌進行真實市場推廣活動。",
                    "**學生社群**：活躍的市場學會、廣告競賽及品牌挑戰隊伍。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。深受具創意傾向商學生歡迎。",
                    "**學術要求**：最佳五科約30-33分。具備強大溝通技巧的全面發展背景。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異學術成績加上創意、溝通技巧及市場學興趣。",
                    "**趨勢**：由於數碼市場學蓬勃及數據驅動市場學演變，需求持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**品牌經理**：校友於寶潔、聯合利華、雀巢及奢侈品牌管理主要品牌。",
                    "**數碼市場營銷人員**：畢業生於科技巨頭及初創企業領導增長及績效市場學。",
                    "**代理機構領袖**：校友於奧美、DDB及數碼市場學代理機構擔任高級職位。",
                    "**電子商務專家**：阿里巴巴、亞馬遜及主要零售商的市場學領導者。",
                    "**教職員卓越**：科大市場學教職員包括消費心理學、數碼市場學及品牌策略專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**市場學卓越獎**：按創意及分析才能頒發的優異獎學金。",
                    "**業界贊助獎學金**：快速消費品、科技及代理機構夥伴的獎學金。",
                    "**競賽資助**：市場學案例競賽及創意挑戰的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大市場學攻略",
                "content": [
                    "**分數目標**：最佳五科目標31分以上。具備強大英文的全面發展學術成績。",
                    "**培養創意**：透過項目、內容創作或設計工作展示創意思維。",
                    "**建立數碼存在**：了解社交媒體平台、內容市場學及數碼分析。",
                    "**保持以消費者為中心**：觀察品牌、分析活動及了解消費者心理學。",
                    "**練習溝通**：強大的寫作及演講技巧對市場學事業至關重要。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
