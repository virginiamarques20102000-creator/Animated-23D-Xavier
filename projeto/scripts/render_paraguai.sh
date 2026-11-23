#!/bin/bash
# Renders ParaguaiFilm in resumable 600-frame chunks (out/paraguai/chunks), then nothing else (see finalize_paraguai.sh).
cd "$(dirname "$0")/.." && D=out/paraguai/chunks && mkdir -p $D
export TMPDIR=/tmp/claude-0/rtmp REMOTION_TMP=/tmp/claude-0/rtmp; mkdir -p $TMPDIR
CH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
TOT=$(python3 -c "import math;print(math.ceil(545.2*30))")
for a in $(seq 0 600 $((TOT-1))); do
  b=$((a+599)); [ $b -gt $((TOT-1)) ] && b=$((TOT-1))
  f=$D/c_$(printf %05d $a).mp4; [ -f "$f" ] && continue
  npx remotion render src/index.ts ParaguaiFilm $D/tmp.mp4 --frames=$a-$b --codec h264 --crf 16 --concurrency=${CONC:-4} --timeout=300000 --gl=swangle --browser-executable=$CH --log=error && mv $D/tmp.mp4 "$f"
  echo "chunk $a-$b done $(date +%T)"; rm -rf $TMPDIR/remotion-* 2>/dev/null
done
echo ALLDONE
