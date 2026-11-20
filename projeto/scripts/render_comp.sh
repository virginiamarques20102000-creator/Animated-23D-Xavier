#!/bin/bash
# Renderiza qualquer composição em blocos de 120 quadros, retomável (pula blocos prontos).
# uso: COMP=SepeShort LAST=1925 D=out/sepe_chunks scripts/render_comp.sh
cd "$(dirname "$0")/.." && mkdir -p "$D"
CH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
for a in $(seq 0 120 $LAST); do b=$((a+119)); [ $b -gt $LAST ] && b=$LAST
  f=$D/c_$(printf %04d $a).mp4; [ -f "$f" ] && continue
  npx remotion render src/index.ts $COMP $D/tmp.mp4 --frames=$a-$b --codec h264 --crf 16 --concurrency=2 --timeout=300000 --gl=swangle --browser-executable=$CH --log=error && mv $D/tmp.mp4 "$f"
  echo "chunk $a-$b done $(date +%T)"; done; echo ALLDONE
