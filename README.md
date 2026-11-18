# lab6 — Hash Maps in under two minutes

A short animated explainer about how a hash map works: hashing, buckets, collisions and resizing.
[SCRIPT.md](SCRIPT.md) holds the scene-by-scene plan and the narration.

- **Animation:** [Remotion](https://www.remotion.dev/) (React). Each scene is its own file in [src/scenes/](src/scenes/).
- **Narration:** [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) text-to-speech, run locally.
- **Encoding:** ffmpeg compresses the final video.

All illustrations are drawn in code (HTML/CSS/SVG). No generated images.

## Setup

```bash
npm install

# narration (only needed to regenerate the audio, which is already committed)
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
mkdir -p models && cd models
wget https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
wget https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

On Linux/WSL, Remotion's headless browser needs a few system libraries (see the
[Remotion Linux docs](https://www.remotion.dev/docs/miscellaneous/linux-dependencies)), and you need `sudo apt install ffmpeg`.

## Work on it

```bash
npm run studio                       # live preview in the browser
.venv/bin/python tools/narrate.py    # regenerate narration from SCRIPT.md (or: narrate.py 3 5)
npx remotion still HashMap out/f.png --frame=600   # check a single frame
```

`tools/narrate.py` reads the narration from SCRIPT.md, writes `public/audio/sceneN.wav`, and sets each
scene's length in [src/timing.json](src/timing.json) to its audio length plus a short pause. Scenes time their
animation as fractions of their length, so they stretch to fit.

## Render

```bash
tools/render.sh
```

Writes the next free `renders/render-NN.mp4` (earlier renders are never overwritten) and a compressed
`renders/render-NN-small.mp4`.
