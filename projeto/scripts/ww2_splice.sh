#!/bin/bash
# Splice the 3D action shots (Ww2Film3D, full-length, black elsewhere) over the 2.5D master, frame-exact, then mux the mix.
# usage: scripts/ww2_splice.sh <base.mp4> <film3d.mp4> <mix.wav> <out.mp4>
set -e
EXPR=$(grep -ho "t0: [0-9.]*, t1: [0-9.]*" src/videos/ww2/three/shots3d_*.ts | awk -F'[ ,]+' '{a=int($2*30+0.999); b=int($4*30+0.999)-1; printf "%sbetween(n\\,%d\\,%d)", (NR>1?"+":""), a, b}')
ffmpeg -y -v error -i "$1" -i "$2" -i "$3" -filter_complex "[0:v][1:v]overlay=enable='$EXPR'[v]" -map "[v]" -map 2:a -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart "$4"
