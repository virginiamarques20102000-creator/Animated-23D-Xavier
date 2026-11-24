#!/bin/bash
# Junta os blocos do Contestado, coloca a mixagem e normaliza (-14 LUFS). Gera a versão máxima (crf 16) e a de envio (crf 23).
cd "$(dirname "$0")/.." && D=out/contestado/chunks
ls $D/c_*.mp4 | sed "s#^$D/#file '#; s/$/'/" > $D/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $D/list.txt -c copy out/contestado/video_mudo.mp4
ffmpeg -v error -y -i out/contestado/video_mudo.mp4 -i out/contestado/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart out/contestado/Contestado_max.mp4
ffmpeg -v error -y -i out/contestado/Contestado_max.mp4 -c:v libx264 -crf 23 -preset medium -c:a copy -movflags +faststart out/contestado/A_Guerra_do_Contestado.mp4
ls -la out/contestado/*.mp4
