"""Fetch URL text (SSL fallback). Usage: python fetch_url.py <url> > out.html"""
import ssl
import sys
import urllib.request


def fetch_url(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "AceIt-JUPAS/1.0"})
    for ctx in (ssl.create_default_context(), ssl._create_unverified_context()):
        try:
            return urllib.request.urlopen(req, timeout=90, context=ctx).read().decode("utf-8", "replace")
        except Exception as e:
            if "certificate" in str(e).lower() or "ssl" in str(e).lower():
                continue
            raise
    raise RuntimeError(f"Failed to fetch {url}")


if __name__ == "__main__":
    print(fetch_url(sys.argv[1]))
