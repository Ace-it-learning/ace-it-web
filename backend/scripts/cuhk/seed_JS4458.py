import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client("jupas_programmes")

# JS4458 — CUHK JS6688-depth (JUPAS cuhk + admission.cuhk.edu.hk, Deepseek)
_PAYLOAD = os.path.join(os.path.dirname(__file__), "..", "jupas", "payload_JS4458.json")

with open(_PAYLOAD, encoding="utf-8") as f:
    _data = json.load(f)

programme = _data["programme"]
details = _data["details"]

validate_script = os.path.join(os.path.dirname(__file__), "..", "jupas", "validateProgramme.js")
result = subprocess.run(
    ["node", validate_script, _PAYLOAD],
    capture_output=True,
    text=True,
)
if result.returncode != 0:
    print(result.stdout, result.stderr)
    sys.exit(1)
print(result.stdout.strip())

container.upsert_item(
    {**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"}
)
container.upsert_item(
    {
        **details,
        "id": f"detail_{details['code']}",
        "pk": "details",
        "type": "programme_detail",
    }
)

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - CUHK JS6688 done!")
