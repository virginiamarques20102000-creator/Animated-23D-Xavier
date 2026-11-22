# contact sheet: python3 scripts/ww2_sheet.py out.jpg img1 img2 ... (4 per row, labelled with frame number)
import sys, re
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
files.sort(key=lambda f: int(re.findall(r"_(\d+)\.jpg", f)[0]))
W, H, C = 480, 270, 4
sheet = Image.new("RGB", (W * C, H * ((len(files) + C - 1) // C)), "black")
for i, f in enumerate(files):
    im = Image.open(f).resize((W, H)); d = ImageDraw.Draw(im); n = re.findall(r"_(\d+)\.jpg", f)[0]
    d.rectangle([0, 0, 120, 22], fill=(0, 0, 0)); d.text((4, 4), f"{n}  {int(n)/30:.1f}s", fill=(255, 255, 0))
    sheet.paste(im, ((i % C) * W, (i // C) * H))
sheet.save(out, quality=85)
