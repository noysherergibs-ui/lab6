#!/usr/bin/env bash
# Render the whole video to the next free renders/render-NN.mp4 (never overwrites),
# then compress it with ffmpeg to renders/render-NN-small.mp4.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p renders

n=1
while [ -e "$(printf 'renders/render-%02d.mp4' "$n")" ]; do n=$((n + 1)); done
out=$(printf 'renders/render-%02d.mp4' "$n")
small=$(printf 'renders/render-%02d-small.mp4' "$n")

echo "Rendering $out"
npx remotion render HashMap "$out" --concurrency="${CONCURRENCY:-8}"

echo "Compressing to $small"
ffmpeg -hide_banner -loglevel error -n -i "$out" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart "$small"

ls -lh "$out" "$small"
