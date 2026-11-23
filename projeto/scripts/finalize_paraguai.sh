#!/bin/bash
# Joins the ParaguaiFilm chunks, adds the mix (voice + score + sfx), normalises to -14 LUFS. Outputs the max-quality and a lighter copy.
cd "$(dirname "$0")/.." && D=out/paraguai/chunks
ls $D/c_*.mp4 | sed "s|^$D/|file '|; s/$/'/" > $D/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $D/list.txt -c copy out/paraguai/video_mudo.mp4
[ -f out/paraguai/mix.wav ] || python3 audio/paraguai_mix.py public/paraguai_narracao.mp3 out/paraguai/mix.wav
ffmpeg -v error -y -i out/paraguai/video_mudo.mp4 -i out/paraguai/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart out/paraguai/Guerra_do_Paraguai_max.mp4
ffmpeg -v error -y -i out/paraguai/Guerra_do_Paraguai_max.mp4 -c:v libx264 -preset medium -crf 23 -c:a copy -movflags +faststart out/paraguai/Guerra_do_Paraguai.mp4
ls -la out/paraguai/*.mp4
