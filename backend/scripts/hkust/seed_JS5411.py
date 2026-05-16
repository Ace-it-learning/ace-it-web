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

# JS5411 - BSc in Global China Studies / 理學士（環球中國研究）
programme = {
    "code": "JS5411",
    "nameEn": "BSc in Global China Studies",
    "nameZh": "理學士（環球中國研究）",
    "name": "BSc in Global China Studies",
    "university": "香港科技大學",
    "faculty": "人文社會科學學院",
    "median": 28,
    "band_a": 31,
    "category": "social_science"
}

details = {
    "code": "JS5411",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 28-31 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Chinese History, History, or Economics at Level 4+ is beneficial. No specific elective requirements.",
                    "**Interview**: May be required. Assesses interest in China studies, critical thinking, and communication skills.",
                    "**Non-Academic Factors**: Interest in Chinese culture, history, and contemporary issues. Experience in debate, Model UN, or writing is beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Chinese history, introduction to China studies, research methods, and social science fundamentals.",
                    "**Year 2 - Core GCS**: Chinese politics, economy, society, and international relations. Language training in Mandarin or Cantonese.",
                    "**Year 3 - Advanced Topics**: Regional studies, China's foreign policy, environmental issues, and urban development in China.",
                    "**Year 4 - Research & Internship**: Research thesis, internship in mainland China or Hong Kong, and capstone project.",
                    "**Interdisciplinary Approach**: Combines history, political science, economics, sociology, and geography for comprehensive China understanding.",
                    "**Language Training**: Intensive Mandarin language courses and option for study abroad in mainland China universities."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Government & Diplomacy**: Civil service, policy research, and diplomatic positions related to China affairs.",
                    "**Business & Consulting**: China-focused business analyst, market researcher, and consultant at companies entering China market.",
                    "**Media & Publishing**: Journalist, editor, and China correspondent at international media organizations.",
                    "**Education & Research**: Teaching and research positions at universities and think tanks focusing on China.",
                    "**NGOs & International Organizations**: Program officer and researcher at organizations working on China-related issues.",
                    "**Graduate Studies**: MA/PhD in China studies, international relations, or East Asian studies at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Research Centers**: HKUST Center for Chinese Economy and HKUST Institute for Advanced Study China programs.",
                    "**Language Labs**: Mandarin language training facilities with native-speaking instructors.",
                    "**Study Abroad**: Exchange opportunities with top mainland China universities (Peking, Tsinghua, Fudan).",
                    "**Field Research**: Organized field trips to mainland China cities for firsthand research experience.",
                    "**Student Community**: Active China Studies Society, cultural events, and guest lectures by China experts."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate (★★★☆☆). Niche programme with dedicated following.",
                    "**Academic Requirements**: Best 5 around 28-31. Well-rounded humanities and social sciences background.",
                    "**Band A Competition**: Moderate. Band A placement improves chances.",
                    "**Interview Weighting**: Moderate. Interest in China studies and critical thinking may be assessed.",
                    "**What Differentiates Winners**: Genuine interest in China plus strong writing and analytical skills.",
                    "**Trend**: Growing relevance as China's global influence increases and demand for China expertise rises."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Policy Advisors**: Alumni advising government and businesses on China-related policy and strategy.",
                    "**Journalists**: Graduates as China correspondents for major international media outlets.",
                    "**Business Consultants**: China market entry specialists at top consulting firms.",
                    "**Academic Researchers**: Alumni in China studies PhD programmes at Harvard, Oxford, and leading Asian universities.",
                    "**Faculty Excellence**: HKUST GCS faculty includes leading China scholars with extensive field research experience."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers.",
                    "**Area Studies Grants**: For research and study abroad in mainland China.",
                    "**Language Study Awards**: For intensive Mandarin language training.",
                    "**Research Funding**: For undergraduate thesis research on China-related topics.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Global China Studies Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 29+. Well-rounded academic profile.",
                    "**Read Widely on China**: Follow Chinese politics, economy, and society news. Read books by leading China scholars.",
                    "**Improve Mandarin**: Strong Mandarin skills are essential for research and career in China studies.",
                    "**Develop Writing Skills**: Essay writing and research skills are crucial for this programme.",
                    "**Stay Internationally Minded**: Understand both Chinese and international perspectives on global issues."
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
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
                    "**必需選修科**：中國歷史、歷史或經濟達4級或以上有益。無特定選修科要求。",
                    "**面試**：可能需要。評估對中國研究的興趣、批判思維及溝通技巧。",
                    "**非學術因素**：對中國文化、歷史及當代議題的興趣。辯論、模擬聯合國或寫作經驗有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：中國歷史、中國研究導論、研究方法及社會科學基礎。",
                    "**第二年 - 環球中國研究核心**：中國政治、經濟、社會及國際關係。普通話或粵語語言培訓。",
                    "**第三年 - 高級課題**：區域研究、中國外交政策、環境議題及中國城市發展。",
                    "**第四年 - 研究及實習**：研究論文、中國內地或香港實習及專題項目。",
                    "**跨學科方法**：結合歷史、政治學、經濟、社會學及地理學以全面了解中國。",
                    "**語言培訓**：密集普通話課程及中國內地大學交流選項。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**政府及外交**：公務員、政策研究及與中國事務相關的外交職位。",
                    "**商業及顧問**：於進入中國市場的公司擔任中國專注商業分析師、市場研究員及顧問。",
                    "**媒體及出版**：於國際媒體機構擔任記者、編輯及中國特派員。",
                    "**教育及研究**：於專注中國的大學及智庫擔任教學及研究職位。",
                    "**非政府組織及國際組織**：於從事中國相關議題的組織擔任項目主任及研究員。",
                    "**研究生課程**：於頂尖大學攻讀中國研究、國際關係或東亞研究文學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**研究中心**：科大中國經濟研究中心及科大高等研究院中國項目。",
                    "**語言實驗室**：配備母語導師的普通話語言培訓設施。",
                    "**海外交流**：與中國內地頂尖大學（北京大學、清華大學、復旦大學）的交流機會。",
                    "**實地研究**：組織前往中國內地城市進行第一手研究經驗的實地考察。",
                    "**學生社群**：活躍的中國研究學會、文化活動及中國專家客席講座。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中等（★★★☆☆）。具忠實追隨者的專門課程。",
                    "**學術要求**：最佳五科約28-31分。全面發展的人文及社會科學背景。",
                    "**Band A競爭**：中等。Band A選擇可提升機會。",
                    "**面試比重**：中等。可能評估對中國研究的興趣及批判思維。",
                    "**成功申請者特質**：對中國的 genuine 興趣加上強大寫作及分析能力。",
                    "**趨勢**：隨著中國全球影響力增加及對中國專業知識需求上升，相關性持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**政策顧問**：校友就中國相關政策及策略向政府及企業提供建議。",
                    "**記者**：畢業生於主要國際媒體機構擔任中國特派員。",
                    "**商業顧問**：頂尖顧問公司的中國市場進入專家。",
                    "**學術研究人員**：校友於哈佛、牛津及領先亞洲大學攻讀中國研究博士課程。",
                    "**教職員卓越**：科大環球中國研究教職員包括具備豐富實地研究經驗的領先中國學者。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**區域研究資助**：中國內地研究及交流資助。",
                    "**語言學習獎項**：密集普通話語言培訓獎項。",
                    "**研究資金**：中國相關議題本科生論文研究資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大環球中國研究攻略",
                "content": [
                    "**分數目標**：最佳五科目標29分以上。全面發展的學術背景。",
                    "**廣泛閱讀中國相關書籍**：追蹤中國政治、經濟及社會新聞。閱讀領先中國學者的著作。",
                    "**提高普通話**：強大的普通話技能對中國研究的事業及研究至關重要。",
                    "**培養寫作技巧**：論文寫作及研究技能對此課程至關重要。",
                    "**保持國際視野**：了解全球議題的中國及國際觀點。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
