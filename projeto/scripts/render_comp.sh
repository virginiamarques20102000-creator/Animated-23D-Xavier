#!/bin/bash
# uso: COMP=SepeShort LAST=1925 D=out/sepe_chunks [CHUNK=120] [CONC=2] scripts/render_comp.sh   (retomável: pula blocos prontos)
cd "$(dirname "$0")/.." && mkdir -p "$D"
CH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome; N=${CHUNK:-120}; C=${CONC:-2}
for a in $(seq 0 $N $LAST); do b=$((a+N-1)); [ $b -gt $LAST ] && b=$LAST
  f=$D/c_$(printf %05d $a).mp4; [ -f "$f" ] && continue
  npx remotion render src/index.ts $COMP $D/tmp.mp4 --frames=$a-$b --codec h264 --crf 16 --concurrency=$C --timeout=300000 --gl=swangle --browser-executable=$CH --log=error && mv $D/tmp.mp4 "$f"
  echo "chunk $a-$b done $(date +%T)"; done; echo ALLDONE
