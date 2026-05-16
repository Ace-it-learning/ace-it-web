import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
from azure.cosmos import CosmosClient

client = CosmosClient(os.getenv("AZURE_COSMOS_ENDPOINT"), credential=os.getenv("AZURE_COSMOS_KEY"))
db = client.get_database_client(os.getenv("AZURE_COSMOS_DATABASE", "aceit"))
c = db.get_container_client("jupas_programmes")

codes = ["JS6731", "JS6884", "JS6456", "JS6717", "JS6755"]
print("DB:", os.getenv("AZURE_COSMOS_DATABASE"), "endpoint:", (os.getenv("AZURE_COSMOS_ENDPOINT") or "")[:40])

for code in codes:
    q = "SELECT * FROM c WHERE c.type = 'programme_detail' AND c.code = @code"
    items = list(
        c.query_items(
            query=q,
            parameters=[{"name": "@code", "value": code}],
            enable_cross_partition_query=True,
        )
    )
    if not items:
        print(f"{code}: NO programme_detail in Cosmos")
        continue
    doc = items[0]
    adm = doc.get("en", {}).get("sections", {}).get("admission", {}).get("content", [])
    first = adm[0][:100] if adm else "(no admission)"
    print(f"{code}: updatedAt={doc.get('updatedAt','?')} sections={list(doc.get('en',{}).get('sections',{}).keys())}")
    print(f"  admission[0]: {first}")
