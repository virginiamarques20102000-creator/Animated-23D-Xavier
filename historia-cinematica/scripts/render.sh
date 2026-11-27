#!/usr/bin/env bash
# Render final + compressão para celular. uso: render.sh <pasta_do_projeto> <Composição> <saida.mp4>
# Sem placa de vídeo o 3D roda em software (swangle): ~1-3 s por quadro. Rode em segundo plano.
set -e
P=$1; C=$2; OUT=$3
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell}
cd "$P"
npx remotion render src/index.ts "$C" "${OUT%.mp4}_bruto.mp4" --browser-executable=$B --gl=swangle --concurrency=4 --crf=16 --timeout=240000 --log=error 2>&1 | grep -vE 'webpack|from pack' | tail -3
ffmpeg -v error -y -i "${OUT%.mp4}_bruto.mp4" -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -movflags +faststart -an "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"; ls -la "$OUT"
