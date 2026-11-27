#!/usr/bin/env bash
# Fotos de conferência + folha de contato. uso: previas.sh <pasta_do_projeto> <Composição> <saida_dir> quadro1 quadro2 ...
# Use 0,4x de escala: rápido e suficiente para julgar enquadramento, exposição e texto.
set -e
P=$1; C=$2; O=$3; shift 3; mkdir -p "$O"
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell}
cd "$P"
printf '%s\n' "$@" | xargs -P3 -I{} sh -c "npx remotion still src/index.ts $C '$O/f{}.png' --frame={} --browser-executable=$B --gl=swangle --scale=0.4 --timeout=240000 --log=error 2>&1 | grep -vE 'webpack|from pack' | tail -3"
python3 - "$O" "$@" <<'PY'
import sys
from PIL import Image
o, fs = sys.argv[1], sys.argv[2:]
ims = [Image.open(f'{o}/f{f}.png').convert('RGB').resize((270, 480)) for f in fs]
sh = Image.new('RGB', (270 * len(ims), 480))
for i, im in enumerate(ims): sh.paste(im, (i * 270, 0))
sh.save(f'{o}/folha.jpg', quality=88); print(f'{o}/folha.jpg')
PY
