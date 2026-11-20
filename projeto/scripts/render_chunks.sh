#!/bin/bash
# Renderiza em pedaços de 120 quadros (retoma de onde parou se o computador reiniciar).
cd "$(dirname "$0")/.." && mkdir -p ${D:-out/chunks}
CH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
for a in $(seq 0 120 2209); do
  b=$((a+119)); [ $b -gt 2209 ] && b=2209
  f=${D:-out/chunks}/c_$(printf %04d $a).mp4
  [ -f "$f" ] && continue
  npx remotion render src/index.ts LampiaoShort ${D:-out/chunks}/tmp.mp4 --frames=$a-$b --codec h264 --crf 18 --concurrency=2 --timeout=300000 --gl=swangle --browser-executable=$CH --log=error && mv ${D:-out/chunks}/tmp.mp4 "$f"
  echo "chunk $a-$b done $(date +%T)"
done
echo ALLDONE
