import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

from azure.cosmos import CosmosClient

endpoint = os.getenv('AZURE_COSMOS_ENDPOINT')
key = os.getenv('AZURE_COSMOS_KEY')
client = CosmosClient(endpoint, key)
db = client.get_database_client('aceit')
container = db.get_container_client('jupas_programmes')

programme = {
    "code": "JS4111",
    "nameEn": "Theology",
    "nameZh": "神學",
    "name": "神學",
    "university": "香港中文大學",
    "faculty": "文學院",
    "median": 19,
    "band_a": 21,
    "category": "arts",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Theology is moderately competitive. The median admission score is typically Best 5 = 17-19 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Ethics and Religious Studies, History, Literature, or any humanities subject are advantageous. Christian background is common but not required.",
            "**Interview**: Individual interview assessing understanding of theology as an academic discipline, spiritual maturity, commitment to service, and intellectual engagement with faith questions.",
            "**Non-Academic Factors**: Church involvement, community service, leadership in religious organisations, reading in theology or biblical studies, and mission experience are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Biblical studies (Old and New Testament), Christian theology, church history, and introduction to theological methods.",
            "**Year 2 - Core Theology**: Systematic theology, biblical interpretation, pastoral theology, and Christian ethics. Introduction to Greek or Hebrew.",
            "**Year 3 - Specialisation & Practicum**: Students choose streams (Biblical Studies, Systematic Theology, Practical Theology, or Christian Ministry) and complete supervised ministry placements.",
            "**Year 4 - Capstone & Integration**: Honours thesis, advanced seminars, and integration of theological knowledge with vocational calling.",
            "**Practical Training**: Ministry placements in churches, Christian NGOs, and social service agencies. Preaching workshops and pastoral counselling training.",
            "**Unique Features**: Strong integration of academic theology with practical ministry preparation. Affiliated with the Divinity School of Chung Chi College."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Christian Ministry**: Pastors, church planters, youth ministers, worship leaders, and chaplains in churches and Christian organisations.",
            "**Theological Education**: Bible college lecturers, seminary professors, and Christian educators in schools and churches.",
            "**Social Services**: Directors and programme officers at Christian social service agencies, rehabilitation centres, and community organisations.",
            "**Mission & Development**: Missionaries, development workers, and cross-cultural workers with Christian organisations worldwide.",
            "**Counselling & Chaplaincy**: Pastoral counsellors, hospital chaplains, school chaplains, and spiritual directors.",
            "**Further Studies**: Master of Divinity (M.Div.), Master of Theology (Th.M.), and Doctor of Philosophy (PhD) at seminaries worldwide."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**College Affiliation**: Part of Chung Chi College with strong Christian heritage, chapel services, and spiritual formation programmes.",
            "**Community Life**: Close-knit community with prayer groups, Bible studies, fellowship gatherings, and mentorship from faculty.",
            "**Chapel & Worship**: Regular chapel services, worship teams, and opportunities for students to lead and participate in worship.",
            "**Ministry Exposure**: Connections with churches across Hong Kong for practicum placements, internships, and ministry experience.",
            "**Global Networks**: Partnerships with seminaries worldwide including Fuller, Trinity Evangelical Divinity School, and Asian Theological Seminary."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students with Christian commitment and calling to ministry or theological study.",
            "**Academic Requirements**: Best 5 around 17-19. Academic ability combined with spiritual maturity and ministry potential.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Church involvement and clear sense of calling are important.",
            "**Interview Weighting**: Very High. The interview assesses spiritual maturity, understanding of theology, and commitment to Christian service.",
            "**What Differentiates Winners**: Genuine Christian faith, demonstrated service, leadership experience, and clear vocational direction.",
            "**Trend**: Steady demand from students committed to Christian ministry and theological education in Hong Kong and Asia."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Ying Fuk-tsang**: Renowned scholar in Chinese church history and Christianity in China.",
            "**Professor Philip L. Wickeri**: Leading expert in Asian Christianity and Anglican theology.",
            "**Alumni Network**: Graduates serve as pastors, seminary professors, social service directors, and missionaries throughout Hong Kong, mainland China, and Asia.",
            "**Research Excellence**: CUHK Theology is recognised for research in Chinese Christianity, biblical studies, and contextual theology.",
            "**Church Impact**: Faculty and alumni have shaped Christian education, social service, and church leadership across Chinese-speaking communities."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Theological Scholarships**: Special awards for students preparing for Christian ministry, supported by churches and Christian foundations.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Ministry Grants**: Funding for mission trips, ministry conferences, and theological library resources."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Theology Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 19+. Academic ability is important but spiritual maturity and calling matter greatly.",
            "**Know Your Calling**: Be prepared to articulate why you want to study theology and how you envision using it in service.",
            "**Engage with Scripture**: Read the Bible regularly and begin exploring theological books by authors like C.S. Lewis, N.T. Wright, or John Stott.",
            "**Serve in Church**: Active involvement in church ministry demonstrates commitment and provides practical context for theological study.",
            "**Think Theologically**: Be ready to discuss how theology addresses contemporary issues like social justice, ethics, and cultural engagement."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大神學競爭程度中等。中位數入學成績通常為最佳五科17-19分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：倫理與宗教研究、歷史、文學或任何人文科目均有優勢。基督教背景普遍但非必要。",
            "**面試**：個人面試，評估對神學作為學術學科的理解、靈性成熟度、對服務的承擔及對信仰問題的智力參與。",
            "**非學術因素**：教會參與、社區服務、宗教組織領導、神學或聖經研究閱讀及宣教經驗均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：聖經研究（舊約及新約）、基督教神學、教會歷史及神學方法導論。",
            "**第二年 - 核心神學**：系統神學、聖經詮釋學、牧養神學及基督教倫理學。希臘文或希伯來文導論。",
            "**第三年 - 專修與實習**：學生選擇專修方向（聖經研究、系統神學、實踐神學或基督教事工）並完成監督事工實習。",
            "**第四年 - 畢業專題與整合**：榮譽學位論文、高級研討班及將神學知識與職業呼召整合。",
            "**實務訓練**：教會、基督教非政府組織及社會服務機構的事工實習。講道工作坊及牧靈輔導培訓。",
            "**課程特色**：學術神學與實踐事工準備的強大整合。與崇基學院神學院有聯繫。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**基督教事工**：教會牧師、植堂者、青年事工導師、敬拜領袖及教會和基督教組織的牧師。",
            "**神學教育**：神學院講師、聖經學院教授及學校和教會的基督教教育工作者。",
            "**社會服務**：基督教社會服務機構、康復中心及社區組織的總監及項目主任。",
            "**宣教及發展**：全球基督教組織的宣教士、發展工作者及跨文化工作者。",
            "**輔導及牧靈**：牧靈輔導員、醫院牧師、學校牧師及靈修導師。",
            "**深造**：全球神學院的道學碩士（M.Div.）、神學碩士（Th.M.）及哲學博士（PhD）。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**書院聯繫**：崇基學院的一部分，擁有深厚基督教傳統、禮拜堂服務及靈命塑造計劃。",
            "**社群生活**：緊密社群，設有祈禱小組、聖經研讀、團契聚會及教職員指導。",
            "**禮拜堂及敬拜**：定期禮拜堂服務、敬拜團隊及學生領導和參與敬拜的機會。",
            "**事工接觸**：與香港各教會聯繫，提供實習實習、實習及事工經驗。",
            "**全球網絡**：與全球神學院合作，包括福樂神學院、三一神學院及亞洲神學院。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引具基督教承擔及事工或神學學習呼召的學生。",
            "**學術要求**：最佳五科約17-19分。學術能力結合靈性成熟度及事工潛質。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。教會參與及清晰呼召感很重要。",
            "**面試比重**：非常高。面試評估靈性成熟度、神學理解及對基督教服務的承擔。",
            "**成功申請者特質**：真誠的基督教信仰、展示的服務、領導經驗及清晰的職業方向。",
            "**趨勢**：來自致力於香港及亞洲基督教事工及神學教育的學生的穩定需求。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**邢福增教授**：中國教會歷史及中國基督教的著名學者。",
            "**魏克利教授**：亞洲基督教及聖公會神學的領先專家。",
            "**校友網絡**：畢業生在香港、中國內地及亞洲擔任牧師、神學院教授、社會服務總監及宣教士。",
            "**研究卓越**：中大神學在中國基督教、聖經研究及處境神學方面的研究獲得認可。",
            "**教會影響**：教職員及校友塑造華語社群的基督教教育、社會服務及教會領導。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**神學獎學金**：為預備基督教事工的學生而設的特別獎項，由教會及基督教基金會支持。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**事工資助**：宣教旅行、事工會議及神學圖書館資源的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大神學攻略",
        "content": [
            "**分數目標**：最佳五科目標19分以上。學術能力重要，但靈性成熟度及呼召感至關重要。",
            "**認識你的呼召**：準備闡述為何你想研讀神學及如何設想在服務中運用它。",
            "**參與聖經**：定期閱讀聖經，開始探索C.S. Lewis、N.T. Wright或John Stott等作者的神學書籍。",
            "**在教會服事**：積極參與教會事工展示承擔，並為神學學習提供實踐背景。",
            "**神學思考**：準備討論神學如何處理社會公義、倫理及文化參與等當代議題。"
        ]
    }
}

details = {
    "code": "JS4111",
    "university": "香港中文大學",
    "en": {"sections": en_sections},
    "zh": {"sections": zh_sections}
}

prog_doc = {
    "id": f"prog_{programme['code']}",
    "pk": "programmes",
    "type": "programme",
    **programme,
    "updatedAt": "2026-05-14T12:00:00Z"
}
container.upsert_item(body=prog_doc)
print(f"[Seed] Upserted programme {programme['code']}")

detail_doc = {
    "id": f"detail_{details['code']}",
    "pk": "details",
    "type": "programme_detail",
    **details,
    "updatedAt": "2026-05-14T12:00:00Z"
}
container.upsert_item(body=detail_doc)
print(f"[Seed] Upserted details {details['code']}")
print("[Seed] Done!")
