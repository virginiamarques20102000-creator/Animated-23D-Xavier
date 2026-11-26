# Thumbnail 1280x720 do Elser: salão explodindo ao fundo, Hitler sorrindo de costas para o fogo, Elser na sombra, relógio 21:20 e "13 MINUTOS".
import math, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance, ImageChops
D = "/home/user/Animated-23D-Xavier/projeto/out/elser/"; W, H = 1280, 720
FB = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
bg = Image.open(D + "thumb_c/t0312.30.jpg").convert("RGB").resize((1520, 855)).crop((120, 70, 120 + W, 70 + H))
bg = ImageEnhance.Contrast(ImageEnhance.Color(bg).enhance(1.4)).enhance(1.25)
red = Image.new("RGB", (W, H), (150, 10, 0)); bg = Image.blend(bg, ImageChops.multiply(bg, red.point(lambda v: min(255, v * 2))), 0.55); bg = ImageEnhance.Brightness(bg).enhance(0.7)
# vinheta escura
vig = Image.new("L", (W, H), 0); dv = ImageDraw.Draw(vig)
for i in range(60): r = i / 60; dv.ellipse((-W * 0.25 + r * 250, -H * 0.3 + r * 160, W * 1.25 - r * 250, H * 1.3 - r * 160), fill=int(255 * r))
vig = vig.filter(ImageFilter.GaussianBlur(60)); bg = Image.composite(bg, Image.new("RGB", (W, H), (8, 0, 0)), vig)
img = bg.convert("RGBA")
import random; random.seed(7)
fb = Image.new("RGBA", (W, H), (0, 0, 0, 0)); df = ImageDraw.Draw(fb)
for r, col in [(330, (120, 10, 0, 120)), (250, (230, 70, 0, 150)), (170, (255, 150, 20, 170)), (90, (255, 235, 150, 200))]:
    for k in range(14):
        a = k / 14 * 6.283; rr = r * random.uniform(0.6, 1.0); x, y = 640 + math.cos(a) * r * 0.45, 380 + math.sin(a) * r * 0.3
        df.ellipse((x - rr * 0.6, y - rr * 0.5, x + rr * 0.6, y + rr * 0.5), fill=col)
img.alpha_composite(fb.filter(ImageFilter.GaussianBlur(35)))
sm = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sm)
for k in range(40): x = random.uniform(0, W); y = random.uniform(-80, 260); r = random.uniform(60, 170); ds.ellipse((x - r, y - r * 0.6, x + r, y + r * 0.6), fill=(12, 4, 4, random.randint(60, 140)))
img.alpha_composite(sm.filter(ImageFilter.GaussianBlur(30)))
for k in range(60):
    x = random.uniform(300, 980); y = random.uniform(120, 560); s_ = random.uniform(6, 22); a = random.uniform(0, 6.28)
    pts = [(x + s_ * math.cos(a + j * 2.1) * random.uniform(0.6, 1.2), y + s_ * math.sin(a + j * 2.1)) for j in range(3)]
    ImageDraw.Draw(img).polygon(pts, fill=random.choice([(25, 10, 8), (60, 25, 15), (255, 170, 60)]))
def char(name, h, x, y, dark=0.0, rim=(255, 90, 20), flip=False):
    c = Image.open(D + "_thumb/" + name + ".png"); c = c.crop(c.getbbox())
    if flip: c = c.transpose(Image.FLIP_LEFT_RIGHT)
    s = h / c.height; c = c.resize((int(c.width * s), h), Image.LANCZOS); orig = c.copy()
    keep = c.convert("RGB").split()[2].point(lambda v: 255 if v > 215 else 0)
    a = c.split()[3]
    if dark: c = Image.composite(Image.blend(c, Image.new("RGBA", c.size, (15, 4, 4, 255)), dark), c, a); c.putalpha(a); c = Image.composite(orig, c, ImageChops.multiply(keep, a))
    glow = Image.new("RGBA", (c.width + 80, c.height + 80), rim + (0,)); ga = Image.new("L", glow.size, 0); ga.paste(a, (40, 40)); ga = ga.filter(ImageFilter.GaussianBlur(18)).point(lambda v: min(255, v * 2))
    glow.putalpha(ga); img.alpha_composite(glow, (x - 40, y - 40)); img.alpha_composite(c, (x, y))
# Elser na sombra (direita, atrás), Hitler sorrindo (esquerda, grande, cortado na cintura)
char("elser_knife2", 980, 820, 150, dark=0.62, rim=(255, 30, 0), flip=True)
sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse((930, 150, 1270, 330), fill=(0, 0, 0, 150)); img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(25)))
char("hit_grin", 1120, 20, 60, dark=0.1, rim=(255, 110, 20))
gr = Image.new("L", (1, H)); gr.putdata([int(max(0, (y - 430) / 290) ** 1.3 * 235) for y in range(H)]); gr = gr.resize((W, H))
img.alpha_composite(Image.merge("RGBA", (*Image.new("RGB", (W, H), (10, 0, 0)).split(), gr)))
d = ImageDraw.Draw(img)
# relógio 21:20 com os 13 minutos em vermelho
cx, cy, R = 640, 185, 118
d.ellipse((cx - R - 14, cy - R - 14, cx + R + 14, cy + R + 14), fill=(30, 18, 10)); d.ellipse((cx - R - 8, cy - R - 8, cx + R + 8, cy + R + 8), fill=(214, 168, 70))
d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=(245, 236, 215))
a0, a1 = -90 + 7 * 6, -90 + 20 * 6; d.pieslice((cx - R + 6, cy - R + 6, cx + R - 6, cy + R - 6), a0, a1, fill=(205, 20, 15))
for k in range(60):
    ang = math.radians(k * 6 - 90); r0 = R - (22 if k % 5 == 0 else 10)
    d.line((cx + r0 * math.cos(ang), cy + r0 * math.sin(ang), cx + (R - 4) * math.cos(ang), cy + (R - 4) * math.sin(ang)), fill=(30, 20, 20), width=6 if k % 5 == 0 else 2)
def hand(deg, L, w, col): a = math.radians(deg - 90); d.line((cx, cy, cx + L * math.cos(a), cy + L * math.sin(a)), fill=col, width=w)
hand(9 * 30 + 20 * 0.5, R * 0.55, 14, (25, 15, 15)); hand(20 * 6, R * 0.85, 9, (25, 15, 15)); d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=(25, 15, 15))
# rachadura no vidro
for pts in [[(cx + 30, cy - 120), (cx + 10, cy - 60), (cx + 40, cy - 10), (cx + 5, cy + 50), (cx + 35, cy + 125)], [(cx + 10, cy - 60), (cx - 60, cy - 85)], [(cx + 40, cy - 10), (cx + 110, cy + 20)]]:
    d.line(pts, fill=(255, 255, 255), width=3)
# texto
def text(s, size, x, y, fill, stroke=(0, 0, 0), sw=10, glow=None, anchor="la"):
    f = ImageFont.truetype(FB, size)
    if glow:
        g = Image.new("RGBA", img.size, (0, 0, 0, 0)); ImageDraw.Draw(g).text((x, y), s, font=f, fill=glow, stroke_width=sw + 10, stroke_fill=glow, anchor=anchor)
        img.alpha_composite(g.filter(ImageFilter.GaussianBlur(22)))
    ImageDraw.Draw(img).text((x, y), s, font=f, fill=fill, stroke_width=sw, stroke_fill=stroke, anchor=anchor)
f13 = ImageFont.truetype(FB, 250); fm = ImageFont.truetype(FB, 150); w13 = f13.getlength("13 "); wm = fm.getlength("MINUTOS"); x0 = (W - w13 - wm) / 2
text("13 ", 250, x0, 690, (255, 214, 40), sw=14, glow=(255, 50, 0, 230), anchor="ls")
text("MINUTOS", 150, x0 + w13, 690, (255, 255, 255), sw=12, glow=(255, 30, 0, 220), anchor="ls")
img = img.convert("RGB"); img.save(D + "Elser_thumbnail.jpg", quality=93); img.resize((640, 360)).save(D + "_thumb/prev.jpg")
print("ok")
