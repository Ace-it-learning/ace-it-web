#!/usr/bin/env python3
"""Generate MP3 + word timings for one pronunciation drill using edge-tts WordBoundary events."""

import asyncio
import json
import re
import sys
from pathlib import Path

from edge_tts import Communicate

VOICE = "en-GB-SoniaNeural"
RATE = "-5%"


def tokenize_words(text: str) -> list[str]:
    tokens = [t for t in re.split(r"(\s+)", text) if t != ""]
    return [t for t in tokens if not re.match(r"^\s+$", t)]


def ticks_to_ms(ticks: float) -> int:
    return int(ticks / 10000)


async def synthesize(drill_id: str, text: str, out_mp3: Path, out_json: Path) -> None:
    communicate = Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")

    audio_parts: list[bytes] = []
    boundaries: list[dict] = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_parts.append(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            boundaries.append({
                "text": chunk.get("text", ""),
                "startMs": ticks_to_ms(chunk["offset"]),
                "durationMs": ticks_to_ms(chunk.get("duration", 0)),
            })

    out_mp3.write_bytes(b"".join(audio_parts))

    passage_words = tokenize_words(text)
    words = []

    for i, pw in enumerate(passage_words):
        if i < len(boundaries):
            start_ms = boundaries[i]["startMs"]
            end_ms = start_ms + boundaries[i]["durationMs"]
        elif words:
            start_ms = words[-1]["endMs"]
            end_ms = start_ms + 200
        else:
            start_ms = 0
            end_ms = 200
        words.append({"index": i, "startMs": start_ms, "endMs": end_ms})

    if words:
        words[-1]["endMs"] = max(words[-1]["endMs"], words[-1]["startMs"] + 100)

    duration_ms = words[-1]["endMs"] + 300 if words else 0

    payload = {
        "version": 1,
        "drillId": drill_id,
        "durationMs": duration_ms,
        "words": words,
    }
    out_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> None:
    if len(sys.argv) < 4:
        print("Usage: synthesize_karaoke_edge.py <drill_id> <text_file> <out_dir>", file=sys.stderr)
        sys.exit(1)

    drill_id = sys.argv[1]
    text = Path(sys.argv[2]).read_text(encoding="utf-8")
    out_dir = Path(sys.argv[3])
    out_dir.mkdir(parents=True, exist_ok=True)

    out_mp3 = out_dir / f"{drill_id}.mp3"
    out_json = out_dir / f"{drill_id}.timings.json"

    asyncio.run(synthesize(drill_id, text, out_mp3, out_json))
    print(f"OK {drill_id} {len(tokenize_words(text))} words -> {out_mp3.name}")


if __name__ == "__main__":
    main()
