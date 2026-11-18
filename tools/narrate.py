"""Generate narration with Kokoro and set scene lengths from it.

Reads the numbered lines under "## Narration text only" in SCRIPT.md,
writes public/audio/sceneN.wav, and updates src/timing.json so each scene
lasts as long as its audio plus PADDING seconds.

Usage:  .venv/bin/python tools/narrate.py [scene numbers...]   (default: all)
"""

import json
import re
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
VOICE = "af_heart"
SPEED = 1.0
PADDING = 0.6  # seconds of silence after each scene's narration


def read_lines() -> dict[int, str]:
    text = (ROOT / "SCRIPT.md").read_text()
    section = text.split("## Narration text only", 1)[1].split("\n## ", 1)[0]
    return {int(n): line.strip() for n, line in re.findall(r"^(\d+)\.\s+(.+)$", section, re.M)}


def main() -> None:
    lines = read_lines()
    wanted = [int(a) for a in sys.argv[1:]] or sorted(lines)
    kokoro = Kokoro(str(ROOT / "models/kokoro-v1.0.int8.onnx"), str(ROOT / "models/voices-v1.0.bin"))

    timing_path = ROOT / "src/timing.json"
    timing = json.loads(timing_path.read_text())
    by_id = {s["id"]: s for s in timing["scenes"]}

    out_dir = ROOT / "public/audio"
    out_dir.mkdir(parents=True, exist_ok=True)

    for n in wanted:
        samples, rate = kokoro.create(lines[n], voice=VOICE, speed=SPEED, lang="en-us")
        path = out_dir / f"scene{n}.wav"
        sf.write(path, samples, rate)
        seconds = len(samples) / rate
        scene = by_id[f"scene{n}"]
        scene["seconds"] = round(seconds + PADDING, 2)
        scene["audio"] = True
        print(f"scene{n}: {seconds:5.2f}s audio -> {scene['seconds']}s scene")

    timing_path.write_text(json.dumps(timing, indent=2) + "\n")
    total = sum(s["seconds"] for s in timing["scenes"])
    print(f"total: {total:.1f}s")


if __name__ == "__main__":
    main()
