# folha de contato: python3 scripts/elser_sheet.py pasta saida.jpg [colunas]
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
fs = sorted(glob.glob(os.path.join(d, "t*.jpg"))); ims = [Image.open(f) for f in fs]; w, h = ims[0].size
S = Image.new("RGB", (w * cols, h * ((len(ims) + cols - 1) // cols)))
for i, (f, im) in enumerate(zip(fs, ims)):
    S.paste(im, ((i % cols) * w, (i // cols) * h)); ImageDraw.Draw(S).text(((i % cols) * w + 8, (i // cols) * h + 6), os.path.basename(f)[1:-4], fill=(255, 255, 0))
S.save(out, quality=82)
