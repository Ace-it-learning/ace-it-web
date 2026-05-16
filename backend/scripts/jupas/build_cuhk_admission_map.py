"""Build JSxxxx -> admission.cuhk.edu.hk programme URL map."""
import json
import os
import re
import ssl
import urllib.request

LIST_URL = "https://admission.cuhk.edu.hk/programmes/list/"
OUT = os.path.join(os.path.dirname(__file__), "cuhk_admission_urls.json")


def fetch_url(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "AceIt-CUHK/1.0"})
    for ctx in (ssl.create_default_context(), ssl._create_unverified_context()):
        try:
            return urllib.request.urlopen(req, timeout=60, context=ctx).read().decode("utf-8", "replace")
        except Exception as e:
            err = str(e).lower()
            if "certificate" in err or "ssl" in err:
                continue
            raise
    raise RuntimeError(f"Failed to fetch {url}")


def main():
    html = fetch_url(LIST_URL)
    prog_map = {}
    for m in re.finditer(
        r'programme/([a-z0-9%-]+)/[\s\S]{0,4000}?<span class="label">JS(\d{4})</span>',
        html,
        re.I,
    ):
        prog_map[f"JS{m.group(2)}"] = f"https://admission.cuhk.edu.hk/programme/{m.group(1)}/"
    payload = {
        "updatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "source": LIST_URL,
        "count": len(prog_map),
        "programmes": dict(sorted(prog_map.items())),
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"[cuhk-map] {payload['count']} programmes -> {OUT}")


if __name__ == "__main__":
    main()
