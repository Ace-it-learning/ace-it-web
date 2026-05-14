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
    "code": "JS4372",
    "nameEn": "Early Childhood Education",
    "nameZh": "幼兒教育",
    "name": "幼兒教育",
    "university": "香港中文大學",
    "faculty": "教育學院",
    "median": 20,
    "band_a": 22,
    "category": "education",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Early Childhood Education is moderately competitive. The median admission score is typically Best 5 = 18-20 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Any subject. Interest in child development, creativity, and nurturing young children is most important.",
            "**Interview**: Individual interview assessing understanding of early childhood development, creativity, patience, communication skills, and genuine love for young children.",
            "**Non-Academic Factors**: Volunteering at kindergartens, childcare experience, arts and crafts skills, music ability, and experience with young children are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Child development theories, early childhood education principles, play-based learning, and health and safety in early childhood settings.",
            "**Year 2 - Core Studies**: Curriculum design for young children, language and literacy development, mathematics in early years, creative arts, and special educational needs.",
            "**Year 3 - Specialisation & Practicum**: Students choose streams (General ECE, Special Needs, or Arts Education) and complete extended practicum at kindergartens.",
            "**Year 4 - Professional Integration**: Family and community partnerships, educational leadership, research methods, and capstone project on early childhood practice.",
            "**Practical Training**: Extensive practicum at kindergartens (total 20+ weeks), observation, lesson planning, and portfolio development.",
            "**Unique Features**: Strong emphasis on play-based learning, creativity, and holistic child development with partnerships with leading kindergartens in Hong Kong."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Kindergarten Teaching**: Class teachers and lead teachers at kindergartens and nursery schools across Hong Kong.",
            "**Special Education**: Early intervention specialists and special needs coordinators at inclusive kindergartens.",
            "**Kindergarten Leadership**: Principals, vice principals, and curriculum coordinators at kindergartens.",
            "**Curriculum Development**: Curriculum developers at educational publishers, toy companies, and early childhood resource centres.",
            "**Parent Education**: Parent educators and family support workers at community centres and NGOs.",
            "**Further Studies**: Master's programmes in early childhood education, child psychology, and educational leadership."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Child Development Centre**: On-campus early childhood learning environment for observation, practice teaching, and research.",
            "**Creative Arts Studios**: Dedicated spaces for music, visual arts, and drama education specifically designed for young learners.",
            "**Student Societies**: Early Childhood Education Society organises visits to kindergartens, creative workshops, and community outreach.",
            "**Industry Partnerships**: Collaborations with the Education Bureau, kindergarten associations, and international early childhood organisations.",
            "**Global Exposure**: Exchange programmes with early childhood programmes at University of Melbourne, University of British Columbia, and National Taiwan Normal University."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students who love working with young children and value creativity.",
            "**Academic Requirements**: Best 5 around 18-20. Diverse backgrounds welcome; genuine interest in child development matters most.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Experience with young children and creative abilities are valued.",
            "**Interview Weighting**: Very High. The interview assesses warmth, creativity, patience, and genuine passion for early childhood education.",
            "**What Differentiates Winners**: Demonstrated love for children, creative talents (music, art, storytelling), and understanding of play-based learning.",
            "**Trend**: Growing demand as Hong Kong expands kindergarten education and recognises the importance of early childhood development."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Nirmala Rao**: Internationally renowned expert in early childhood development and education in Asia.",
            "**Professor Cynthia Leung**: Leading researcher in language and literacy development in early childhood.",
            "**Alumni Network**: Graduates include kindergarten principals, curriculum leaders at major kindergarten chains, and early childhood policy advisors.",
            "**Research Excellence**: CUHK is recognised for research in play-based learning, bilingual development in early childhood, and inclusive education.",
            "**Community Impact**: Faculty and students contribute to Hong Kong's early childhood sector through research, teacher training, and community programmes."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Education Scholarships**: Merit-based awards for outstanding academic performance in education programmes.",
            "**Early Childhood Education Grants**: Special funding for students committed to careers in kindergarten teaching.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Practicum Support**: Funding for teaching materials, art supplies, and transportation during kindergarten placements."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Early Childhood Education Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 20+. Academic grades matter but your personality and love for children matter more.",
            "**Spend Time with Children**: Volunteer at kindergartens, Sunday schools, or community centres. Document your experiences.",
            "**Develop Creative Skills**: Learn songs, nursery rhymes, storytelling techniques, and simple crafts. Creativity is essential for ECE.",
            "**Understand Play-Based Learning**: Read about how children learn through play and be prepared to discuss why it's important.",
            "**Show Your Warmth**: In the interview, let your genuine love for children shine through. Patience, kindness, and enthusiasm are key."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大幼兒教育競爭程度中等。中位數入學成績通常為最佳五科18-20分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：任何科目。對兒童發展、創意及培育幼兒的興趣最重要。",
            "**面試**：個人面試，評估對幼兒發展的理解、創意、耐心、溝通技巧及對幼兒的真誠熱愛。",
            "**非學術因素**：幼稚園義工服務、照顧幼兒經驗、手工藝技巧、音樂能力及與幼兒相處的經驗均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：兒童發展理論、幼兒教育原則、遊戲為本學習及幼兒環境的健康與安全。",
            "**第二年 - 核心研習**：幼兒課程設計、語言及讀寫能力發展、幼兒數學、創意藝術及特殊教育需要。",
            "**第三年 - 專修與實習**：學生選擇專修方向（一般幼兒教育、特殊需要或藝術教育）並在幼稚園完成延伸實習。",
            "**第四年 - 專業整合**：家庭與社區夥伴關係、教育領導力、研究方法及幼兒實踐的畢業專題。",
            "**實務訓練**：幼稚園的廣泛實習（共20週以上）、觀察、課程計劃及作品集發展。",
            "**課程特色**：強調遊戲為本學習、創意及整全幼兒發展，與香港領先幼稚園有夥伴關係。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**幼稚園教學**：香港各幼稚園及幼兒園的班級教師及主任教師。",
            "**特殊教育**：融合幼稚園的早期介入專員及特殊需要統籌。",
            "**幼稚園領導**：幼稚園的校長、副校長及課程統籌。",
            "**課程發展**：教育出版社、玩具公司及幼兒資源中心的課程開發員。",
            "**家長教育**：社區中心及非政府組織的家長教育工作者及家庭支援工作者。",
            "**深造**：幼兒教育、兒童心理學及教育領導力的碩士課程。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**兒童發展中心**：校內幼兒學習環境，供觀察、實踐教學及研究。",
            "**創意藝術工作室**：專為幼兒學習者設計的音樂、視覺藝術及戲劇教育專用空間。",
            "**學生組織**：幼兒教育學會舉辦幼稚園參觀、創意工作坊及社區外展。",
            "**業界夥伴**：與教育局、幼稚園協會及國際幼兒組織的合作。",
            "**國際視野**：與墨爾本大學、英屬哥倫比亞大學及國立台灣師範大學的幼兒課程進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引喜愛與幼兒工作並重視創意的學生。",
            "**學術要求**：最佳五科約18-20分。歡迎不同背景；對兒童發展的真正興趣最重要。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。與幼兒相處的經驗及創意能力受重視。",
            "**面試比重**：非常高。面試評估溫暖、創意、耐心及對幼兒教育的真正熱情。",
            "**成功申請者特質**：展示對兒童的熱愛、創意才能（音樂、藝術、講故事）及對遊戲為本學習的理解。",
            "**趨勢**：隨著香港擴展幼稚園教育及認識幼兒發展的重要性，需求增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**Rao Nirmala教授**：亞洲幼兒發展及教育領域國際知名的專家。",
            "**梁慧敏教授**：幼兒語言及讀寫能力發展的領先研究者。",
            "**校友網絡**：畢業生包括幼稚園校長、主要幼稚園連鎖的課程領導及幼兒教育政策顧問。",
            "**研究卓越**：中大在遊戲為本學習、幼兒雙語發展及融合教育方面的研究獲得認可。",
            "**社區影響**：教職員及學生透過研究、教師培訓及社區計劃為香港幼兒界作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**教育學院獎學金**：根據教育學院課程的優異學術表現頒發的獎學金。",
            "**幼兒教育資助**：為致力於幼稚園教學職業的學生提供的特別資金。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**實習支援**：幼稚園實習期間的教學材料、美術用品及交通資助。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大幼兒教育攻略",
        "content": [
            "**分數目標**：最佳五科目標20分以上。學術成績重要，但你的個性及對兒童的熱愛更重要。",
            "**與兒童相處**：在幼稚園、主日學或社區中心做義工。記錄你的經驗。",
            "**培養創意技巧**：學習歌曲、童謠、講故事技巧及簡單手工。創意對幼兒教育至關重要。",
            "**理解遊戲為本學習**：閱讀兒童如何透過遊戲學習，並準備討論為何它很重要。",
            "**展示你的溫暖**：在面試中，讓你對兒童的真誠熱愛閃耀。耐心、善良及熱情是關鍵。"
        ]
    }
}

details = {
    "code": "JS4372",
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
