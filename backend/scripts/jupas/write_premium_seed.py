"""
Write thin seed file + upsert premium payload to Cosmos.
Usage: python backend/scripts/jupas/write_premium_seed.py backend/scripts/jupas/payload_JS6731.json
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

from azure.cosmos import CosmosClient

JUPAS_DIR = os.path.dirname(__file__)
HKU_DIR = os.path.join(JUPAS_DIR, "..", "hku")
VALIDATE = os.path.join(JUPAS_DIR, "validateProgramme.js")


def render_seed(code: str, payload_rel: str) -> str:
    return f'''import json
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

# {code} — premium rewrite (official JUPAS + HKU fact pack, JS6717 standard)
_PAYLOAD = os.path.join(os.path.dirname(__file__), "..", "jupas", "{payload_rel}")

with open(_PAYLOAD, encoding="utf-8") as f:
    _data = json.load(f)

programme = _data["programme"]
details = _data["details"]
scores = _data["scores"]

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
    {{**programme, "id": f"prog_{{programme['code']}}", "pk": "programmes", "type": "programme"}}
)
container.upsert_item(
    {{
        **details,
        "id": f"detail_{{details['code']}}",
        "pk": "details",
        "type": "programme_detail",
    }}
)

print(f"[Seed] {{programme['code']}} - {{programme['nameEn']}} / {{programme['nameZh']}} - Premium done!")
'''


def main():
    payload_path = os.path.abspath(sys.argv[1])
    with open(payload_path, encoding="utf-8") as f:
        payload = json.load(f)

    code = payload["programme"]["code"]
    payload_name = os.path.basename(payload_path)

    seed_path = os.path.join(HKU_DIR, f"seed_{code}.py")
    rel = payload_name
    with open(seed_path, "w", encoding="utf-8") as f:
        f.write(render_seed(code, rel))

    r = subprocess.run([sys.executable, seed_path], cwd=os.path.join(JUPAS_DIR, "..", ".."), capture_output=True, text=True)
    print(r.stdout)
    if r.returncode != 0:
        print(r.stderr, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
