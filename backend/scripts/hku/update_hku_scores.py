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

# HKU programmes with verified scores from JUPAS 2025 PDF (af_2025_JUPAS.pdf)
# PDF table columns (left to right): Upper Quartile | Median | Lower Quartile
# Tuple format here: code, median, upper_quartile, lower_quartile
# Scores use new conversion: 5**=8.5, 5*=7, 5=5.5, 4=4, 3=3, 2=2, 1=1
hku_updates = [
    # Faculty of Architecture
    ("JS6004", 32, 29, 28),   # Bachelor of Arts in Architectural Studies
    ("JS6016", 31, 29, 28),   # Bachelor of Science in Surveying
    ("JS6028", 38, 35, 31),   # Bachelor of Arts in Landscape Studies
    ("JS6042", 32, 29, 27),   # Bachelor of Arts in Urban Studies
    ("JS6236", 37, 35, 34),   # Bachelor of Arts and Sciences in Design+
    # Faculty of Arts
    ("JS6054", 37, 35, 34),   # Bachelor of Arts
    ("JS6274", 33, 33, 32),   # Bachelor of Arts in Global Creative Industries
    ("JS6286", 41, 37, 35),   # Bachelor of Arts in Humanities and Digital Technologies
    ("JS6298", 44, 42, 42),   # Bachelor of Arts and Bachelor of Engineering in AI and Data Science
    # HKU Business School
    ("JS6755", 37, 37, 36),   # Bachelor of Business Administration
    ("JS6767", 40, 40, 39),   # Bachelor of Economics / Bachelor of Economics and Finance
    ("JS6781", 36, 35, 34),   # Bachelor of Business Administration in Accounting and Finance / Accounting Data Analytics
    ("JS6793", 36, 35, 34),   # Bachelor of Business Administration (Business Analytics)
    ("JS6808", 49, 46, 45),   # Bachelor of Business Administration (Law) and Bachelor of Laws
    ("JS6846", 34, 33, 32),   # Bachelor of Science in Marketing Analytics and Technology
    ("JS6860", 48, 47, 46),   # Bachelor of Finance in Asset Management and Private Banking
    ("JS6884", 55, 51, 50),   # Bachelor of Science in Quantitative Finance
    ("JS6896", 56, 54, 53),   # Bachelor of Business Administration (International Business and Global Management)
    # Faculty of Dentistry
    ("JS6107", 50, 48, 47),   # Bachelor of Dental Surgery
    # Faculty of Education
    ("JS6066", 34, 32, 32),   # Bachelor of Education in Early Childhood Education and Special Education
    ("JS6080", 36, 35, 34),   # Bachelor of Education in Chinese Language and Literature
    ("JS6092", 27, 27, 26),   # Bachelor of Education in English Language and Literature
    # Faculty of Engineering
    ("JS6119", 46, 44, 43),   # Bachelor of Engineering in Data Science and Engineering
    ("JS6157", 35, 34, 34),   # Bachelor of Engineering
    ("JS6303", 38, 36, 35),   # Bachelor of Engineering Elite Programme
    ("JS6315", 28, 26, 25),   # Bachelor of Engineering in Mechanical Engineering
    ("JS6339", 28, 27, 26),   # Bachelor of Engineering in Civil Engineering
    ("JS6353", 29, 28, 27),   # Bachelor of Engineering in Civil Engineering (existing)
    ("JS6377", 34, 33, 31),   # Bachelor of Engineering and Master of Science in Engineering in AI
    ("JS6937", 34, 32, 30),   # Global Engineering and Business Programme
    ("JS6987", 31, 29, 28),   # Bachelor of Engineering in Computer Engineering / Electrical Engineering / Electronic Engineering
    # Faculty of Law
    ("JS6078", 41, 38, 36),   # Bachelor of Arts and Bachelor of Laws
    ("JS6406", 36, 35, 35),   # Bachelor of Laws
    # Li Ka Shing Faculty of Medicine
    ("JS6250", 31, 29, 28),   # Bachelor of Arts and Sciences in Global Health and Development
    ("JS6418", 37, 37, 36),   # Bachelor of Nursing (Advanced Leadership Track)
    ("JS6456", 47, 44, 42),   # Bachelor of Medicine and Bachelor of Surgery
    ("JS6468", 28, 27, 26),   # Bachelor of Nursing
    ("JS6482", 34, 33, 31),   # Bachelor of Chinese Medicine
    ("JS6494", 41, 39, 38),   # Bachelor of Pharmacy
    ("JS6949", 41, 40, 39),   # Bachelor of Biomedical Sciences
    # Faculty of Science
    ("JS6688", 36, 34, 32),   # Science Master Class
    ("JS6858", 56, 54, 50),   # Bachelor of Science and Bachelor of Laws
    ("JS6901", 39, 37, 36),   # Bachelor of Science
    ("JS6729", 36, 35, 35),   # Bachelor of Science in Actuarial Science
    ("JS6779", 33, 33, 31),   # Bachelor of Science in Statistical Decision Sciences
    ("JS6999", 44, 41, 39),   # Bachelor of Arts and Sciences in Computing and Data Science
    ("JS6602", 58, 55, 52),   # Bachelor of Arts and Sciences
    # Faculty of Social Sciences
    ("JS6705", 31, 31, 29),   # Bachelor of Psychology
    ("JS6717", 31, 34, 29),   # Bachelor of Social Sciences (median, UQ, LQ)
    ("JS6731", 28, 28, 26),   # Bachelor of Social Work
    ("JS6810", 39, 37, 36),   # Bachelor of Social Sciences (Government and Laws) and Bachelor of Laws
    ("JS6822", 35, 32, 31),   # Bachelor of Journalism, Media and Artificial Intelligence
    # School of Biomedical Engineering
    ("JS6925", 31, 29, 29),   # Bachelor of Engineering in Biomedical Engineering
    # School of Computing and Data Science
    ("JS6224", 57, 53, 51),   # Bachelor of Arts and Sciences in Applied Artificial Intelligence
    ("JS6248", 35, 34, 32),   # Bachelor of Arts and Sciences in Financial Technology
]

updated = 0
skipped = 0

for code, median, uq, lq in hku_updates:
    try:
        query = f"SELECT * FROM c WHERE c.type = 'programme' AND c.code = '{code}'"
        items = list(container.query_items(query=query, enable_cross_partition_query=True))
        
        if items:
            doc = items[0]
            doc["median"] = median
            doc["band_a"] = lq
            doc["uq"] = uq
            doc["updatedAt"] = "2025-06-14T00:00:00Z"
            container.upsert_item(doc)
            print(f"[Update] {code} - median: {median}, UQ: {uq}, LQ: {lq}")
            updated += 1
        else:
            print(f"[Skip] {code} - not found in database")
            skipped += 1
    except Exception as e:
        print(f"[Error] {code}: {e}")
        skipped += 1

print(f"\nDone! Updated: {updated}, Skipped: {skipped}")
