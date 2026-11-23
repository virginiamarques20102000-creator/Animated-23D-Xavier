#!/bin/bash
# usage: scripts/pg_sheet.sh <name> <t1,t2,...seconds>  -> out/paraguai/<name>.jpg contact sheet (4 columns)
cd "$(dirname "$0")/.." && N=$1; FR=$(python3 -c "print(','.join(str(int(float(x)*30)) for x in '$2'.split(',')))")
rm -f out/paraguai/s_*.jpg
CHROME=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome GL=swangle COMP=ParaguaiFilm REMOTION_TMP=/tmp/claude-0/rtmp node scripts/bridge-stills.mjs out/paraguai/s_ $FR 0.5 2>&1 | grep -v "memory\|Memory\|docker\|lower amount" | grep -v "^still"
python3 - "$N" "$FR" <<'PY'
import sys, subprocess
n, fr = sys.argv[1], sys.argv[2].split(',')
files = [f"out/paraguai/s_{f}.jpg" for f in fr]
cols = 4; rows = (len(files) + cols - 1) // cols
args = []; [args.extend(["-i", f]) for f in files]
lay = "|".join(f"{(i%cols)*960}_{(i//cols)*540}" for i in range(len(files)))
fc = "".join(f"[{i}]drawtext=text='{int(fr[i])/30:.1f}s':x=10:y=10:fontsize=36:fontcolor=yellow:box=1:boxcolor=black@0.6[v{i}];" for i in range(len(files)))
fc += "".join(f"[v{i}]" for i in range(len(files))) + f"xstack=inputs={len(files)}:layout={lay}:fill=black"
if len(files) == 1: fc = "[0]null"
subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", fc, "-q:v", "4", f"out/paraguai/{n}.jpg"], check=True)
PY
echo out/paraguai/$N.jpg
