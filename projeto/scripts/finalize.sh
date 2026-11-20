#!/bin/bash
# Junta os pedaços, mistura o som e normaliza o volume para redes sociais (-14 LUFS).
cd "$(dirname "$0")/.." && cd ${D:-out/chunks} && ls c_*.mp4 | sed "s/^/file '/; s/$/'/" > list.txt && cd ../..
ffmpeg -v error -y -f concat -safe 0 -i ${D:-out/chunks}/list.txt -c copy out/video_mudo.mp4
python3 audio/lampiao_mix.py public/narracao.mp3 out/mix.wav
ffmpeg -v error -y -i out/video_mudo.mp4 -i out/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart out/${OUT:-Lampiao_final}.mp4
ls -la out/${OUT:-Lampiao_final}.mp4
