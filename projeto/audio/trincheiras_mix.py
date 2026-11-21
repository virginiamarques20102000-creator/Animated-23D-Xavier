# Trilha, ambiente e efeitos do vídeo "O inferno das trincheiras" (Primeira Guerra Mundial, 16:9, 603 s).
# Os tempos dos efeitos batem com os acontecimentos de src/videos/trincheiras/shots_*.ts (tempos absolutos das palavras).
# uso: python3 audio/trincheiras_mix.py public/trincheiras_narracao.mp3 out/trinc/mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 603.25; N = int(DUR * SR); rng = np.random.default_rng(11); t = np.arange(N, dtype=np.float32) / SR
amb = np.zeros(N); sfx = np.zeros(N); mus = np.zeros(N)
def lp(x, f): return signal.sosfilt(signal.butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return signal.sosfilt(signal.butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return signal.sosfilt(signal.butter(2, [a, b], "band", fs=SR, output="sos"), x)
def db(v): return 10 ** (v / 20)
def norm(x): return x / (np.abs(x).max() + 1e-9)
def env(a, b, fa=0.6, fb=0.6): return np.clip((t - a) / fa, 0, 1) * np.clip((b - t) / fb, 0, 1)
def place(d, x, at, g=1.0):
    i = int(at * SR); n = min(len(x), len(d) - i)
    if n > 0 and i >= 0: d[i:i + n] += x[:n] * g
def seg(a, b): n = int((b - a) * SR); return n, np.arange(n) / SR
def addseg(d, x, a, g=1.0): place(d, x, a, g)
amb = np.zeros(N); sfx = np.zeros(N); mus = np.zeros(N)
noise = rng.standard_normal(N)

def birds(a, b, n, g=-33):
    for k in range(n):
        at = rng.uniform(a, b - 0.3); m = int(0.18 * SR); tt = np.arange(m) / SR
        place(amb, np.sin(2 * np.pi * (2600 + 1200 * np.sin(2 * np.pi * 12 * tt)) * tt) * np.hanning(m), at, db(g))
def crowd(a, b, g, cheer=False):  # murmur (or cheering) of many voices: band noise with syllabic flutter
    n, tt = seg(a, b); x = bp(rng.standard_normal(n), 300, 2500 if cheer else 1400)
    x *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.3 * tt + rng.uniform(0, 6))) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tt))
    e = np.minimum(1, tt / 0.6) * np.minimum(1, (b - a - tt) / 0.5); place(amb, norm(x) * e, a, db(g))
def fire_bed(a, b, g):
    n, tt = seg(a, b); x = lp(rng.standard_normal(n), 500) * 0.6
    cr = np.zeros(n)
    for k in range(int((b - a) * 18)): i = rng.integers(0, n - 400); cr[i:i + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 40)
    place(amb, norm(x + hp(cr, 1200)) * np.minimum(1, tt / 0.5) * np.minimum(1, (b - a - tt) / 0.5), a, db(g))
# ---------------- sfx ----------------
def boom(L=2.6):
    n = int(L * SR); tt = np.arange(n) / SR
    return norm(lp(rng.standard_normal(n), 140) * np.exp(-tt / 0.6) + 0.7 * np.sin(2 * np.pi * 42 * tt) * np.exp(-tt / 0.35) + 0.5 * hp(rng.standard_normal(n), 2000) * np.exp(-tt / 0.05))
def shot():
    n = int(0.9 * SR); tt = np.arange(n) / SR
    return norm(hp(rng.standard_normal(n), 900) * np.exp(-tt / 0.012) + lp(rng.standard_normal(n), 800) * np.exp(-tt / 0.1) + 0.8 * np.sin(2 * np.pi * 60 * tt) * np.exp(-tt / 0.12))
def stomp(): n = int(0.25 * SR); tt = np.arange(n) / SR; return norm(lp(rng.standard_normal(n), 320) * np.exp(-tt / 0.03) + 0.3 * bp(rng.standard_normal(n), 1500, 4000) * np.exp(-tt / 0.01))
def step(): n = int(0.18 * SR); tt = np.arange(n) / SR; return norm(bp(rng.standard_normal(n), 200, 2500) * np.exp(-tt / 0.025))
def thud(L=0.5, f=180): n = int(L * SR); tt = np.arange(n) / SR; return norm(lp(rng.standard_normal(n), f) * np.exp(-tt / 0.08) + 0.6 * np.sin(2 * np.pi * 70 * tt) * np.exp(-tt / 0.1))
def clang():
    n = int(2.2 * SR); tt = np.arange(n) / SR
    return norm(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in [(312, 0.9), (497, 0.6), (853, 0.4), (1290, 0.25)]) + 0.8 * hp(rng.standard_normal(n), 2000) * np.exp(-tt / 0.02))
def bell(f=392):
    n = int(4 * SR); tt = np.arange(n) / SR
    return norm(sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt / d) for m, a, d in [(0.5, 0.6, 2.5), (1, 1, 1.8), (1.19, 0.5, 1.2), (1.5, 0.4, 1.0), (2.0, 0.3, 0.7), (2.74, 0.2, 0.4)]))
def whoosh(L=0.6, a=300, b=3500):
    n = int(L * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return norm(bp(rng.standard_normal(n), a, b) * e)
def rumble(a, b, g, f=90):  # tank/engine
    n, tt = seg(a, b); x = lp(rng.standard_normal(n), f) * (1 + 0.5 * np.sin(2 * np.pi * 9 * tt)) + 0.4 * np.sign(np.sin(2 * np.pi * 31 * tt)) * lp(rng.standard_normal(n), 400) * 0.3
    clat = np.zeros(n)
    for k in range(int((b - a) * 7)): i = int(k / 7 * SR); clat[i:i + 600] += hp(rng.standard_normal(600), 1500) * np.exp(-np.arange(600) / 90)
    place(sfx, norm(x + 0.5 * clat) * np.minimum(1, tt / 0.6) * np.minimum(1, (b - a - tt) / 0.6), a, db(g))
def planes(a, b, g):
    n, tt = seg(a, b); x = sum(np.sin(2 * np.pi * f * tt * (1 + 0.004 * np.sin(2 * np.pi * 0.3 * tt))) for f in [92, 96.5, 184]) * lp(rng.standard_normal(n), 300) * 0.5 + lp(rng.standard_normal(n), 600)
    place(sfx, norm(x) * np.sin(np.pi * tt / (b - a)) ** 1.5, a, db(g))
def mg(a, b, g, rate=11):
    k = 0
    while a + k / rate < b: place(sfx, shot()[: int(0.15 * SR)], a + k / rate + rng.uniform(0, 0.01), db(g - rng.uniform(0, 4))); k += 1
def stomps(a, b, period, g, kind=stomp):
    k = 0
    while a + k * period < b: place(sfx, kind(), a + k * period, db(g - (0 if k % 2 == 0 else 2))); k += 1
def stamp_snd(at, g=-6): place(sfx, thud(0.4, 260), at, db(g)); place(sfx, whoosh(0.15, 800, 5000), at - 0.12, db(g - 10))
def paper(at, g=-16): place(sfx, whoosh(0.35, 1500, 7000), at, db(g))
def tick(a, b, g=-26):
    k = 0
    while a + k * 0.5 < b: n = int(0.03 * SR); place(sfx, hp(rng.standard_normal(n), 3000) * np.exp(-np.arange(n) / 120), a + k * 0.5, db(g - (0 if k % 2 else 4))); k += 1
def heart(a, b, g=-14):
    k = 0
    while a + k * 0.85 < b: place(sfx, thud(0.25, 90), a + k * 0.85, db(g)); place(sfx, thud(0.2, 90), a + k * 0.85 + 0.22, db(g - 4)); k += 1
def typewriter(a, b, g=-20):
    at = a
    while at < b: n = int(0.04 * SR); place(sfx, bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / 150), at, db(g)); at += rng.uniform(0.07, 0.2)
def scratch(a, b, g=-24): n, tt = seg(a, b); place(sfx, norm(bp(rng.standard_normal(n), 2500, 8000)) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 4 * tt))), a, db(g))
def waves(a, b, g):
    n, tt = seg(a, b); x = lp(rng.standard_normal(n), 1200) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.22 * tt) ** 4); place(sfx, norm(x) * np.minimum(1, tt / 0.6), a, db(g))
def train(a, b, g):
    k = 0
    while a + k * 0.42 < b: place(sfx, thud(0.18, 900), a + k * 0.42, db(g)); place(sfx, thud(0.18, 900), a + k * 0.42 + 0.12, db(g - 3)); k += 1
    n, tt = seg(a, b); place(sfx, norm(lp(rng.standard_normal(n), 300)) * np.minimum(1, tt / 0.5), a, db(g - 4))

# segment-local env (cheap) and long beds made from a reusable noise loop
def senv(n, fa, fb): tt = np.arange(n) / SR; return np.minimum(1, tt / max(fa, 1e-3)) * np.minimum(1, (n / SR - tt) / max(fb, 1e-3))
LOOP = 20 * SR
def bed(gen, a, b, g, fa=0.8, fb=0.8, dest=None):
    n = int((b - a) * SR); base = gen(min(n, LOOP)); x = np.resize(base, n); place(amb if dest is None else dest, x * senv(n, fa, fb), a, db(g))
gwind = lambda n: norm(hp(lp(np.cumsum(rng.standard_normal(n)) * 0.02, 600), 50)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * np.arange(n) / SR) ** 2)
grain = lambda n: norm(hp(bp(rng.standard_normal(n), 1500, 9000), 800))
gfire = lambda n: norm(lp(rng.standard_normal(n), 500))
gcity = lambda n: norm(lp(rng.standard_normal(n), 900))
gsea = lambda n: norm(lp(rng.standard_normal(n), 1200) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.22 * np.arange(n) / SR) ** 4))
ghiss = lambda n: norm(hp(rng.standard_normal(n), 3000))
def wind(a, b, g=-28): bed(gwind, a, b, g)
def rain(a, b, g=-26): bed(grain, a, b, g)
def sea(a, b, g=-22): bed(gsea, a, b, g)
def hiss(a, b, g=-26): bed(ghiss, a, b, g, 0.4, 0.8, sfx)
def booms(lst, g=-6):
    for at in lst: place(sfx, boom(), at, db(g))
def cannon(at, g=-4): place(sfx, boom(2.0), at, db(g)); place(sfx, thud(0.3, 900), at, db(g - 4))
def whistle(a, L=0.9, g=-12):  # officer's whistle: trilled 2.8 kHz
    n = int(L * SR); tt = np.arange(n) / SR; place(sfx, np.sin(2 * np.pi * 2800 * tt + 3 * np.sin(2 * np.pi * 28 * tt)) * senv(n, 0.02, 0.1), a, db(g))
def incoming(a, b, g=-12):  # shell whistle falling in pitch
    n = int((b - a) * SR); tt = np.arange(n) / SR; f = 1800 - 1300 * tt / tt[-1]; place(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / tt[-1]) ** 1.5, a, db(g))
def cough(at, g=-18):
    for k in range(3): n = int(0.18 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 300, 2200)) * np.exp(-tt / 0.06), at + k * 0.26, db(g - k * 2))
def breath(a, b, g=-22):
    k = 0
    while a + k * 1.4 < b: n = int(0.7 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 200, 1200)) * np.sin(np.pi * tt / tt[-1]) ** 2, a + k * 1.4, db(g - (k % 2) * 3)); k += 1
def squeak(at, g=-26): n = int(0.12 * SR); tt = np.arange(n) / SR; place(sfx, np.sin(2 * np.pi * (3500 + 900 * np.sin(2 * np.pi * 30 * tt)) * tt) * np.hanning(n), at, db(g))
def buzz(a, b, g=-30): n = int((b - a) * SR); tt = np.arange(n) / SR; place(sfx, np.sign(np.sin(2 * np.pi * (180 + 25 * np.sin(2 * np.pi * 1.3 * tt)) * tt)) * senv(n, 0.3, 0.3) * 0.3, a, db(g))
def crow(at, g=-26): n = int(0.4 * SR); tt = np.arange(n) / SR; place(amb, norm(bp(np.sign(np.sin(2 * np.pi * 480 * tt)) + 0.3 * rng.standard_normal(n), 400, 2500)) * np.sin(np.pi * tt / tt[-1]), at, db(g))
def horn(at, L=2.2, g=-14): n = int(L * SR); tt = np.arange(n) / SR; place(sfx, lp(sum(np.sin(2 * np.pi * f * tt) for f in [110, 138.6, 165]), 900) * senv(n, 0.15, 0.4), at, db(g))
def engine(a, b, g=-20, f=48): n = int((b - a) * SR); tt = np.arange(n) / SR; place(sfx, norm(lp(np.sign(np.sin(2 * np.pi * f * tt)) + 0.3 * rng.standard_normal(n), 400)) * senv(n, 0.4, 0.4), a, db(g))
def clink(at, g=-20): n = int(0.4 * SR); tt = np.arange(n) / SR; place(sfx, sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.08) for f in [2400, 3700, 5100]), at, db(g))
def timp(at, g, f=55): n = int(1.6 * SR); tt = np.arange(n) / SR; place(mus, norm(np.sin(2 * np.pi * f * tt * (1 - 0.08 * tt)) * np.exp(-tt / 0.45) + 0.2 * lp(rng.standard_normal(n), 200) * np.exp(-tt / 0.05)), at, g)
def sting(at, g=-6):  # chapter card hit
    place(mus, boom(3.2) * 0.6, at, db(g - 6)); timp(at, db(g), 41)
def shovel(a, b, g=-18):
    k = 0
    while a + k * 0.62 < b: n = int(0.35 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 700, 4500)) * np.exp(-tt / 0.12), a + k * 0.62, db(g)); place(sfx, thud(0.2, 220), a + k * 0.62 + 0.3, db(g - 4)); k += 1
def morse(a, b, g=-24):
    at = a
    while at < b: L = rng.choice([0.06, 0.18]); n = int(L * SR); place(sfx, np.sin(2 * np.pi * 800 * np.arange(n) / SR) * senv(n, 0.005, 0.005), at, db(g)); at += L + 0.07 + (0.2 if rng.random() < 0.2 else 0)
def chime(at, n=3, g=-14):
    for k in range(n): place(sfx, bell(523.25), at + k * 0.55, db(g - k))
def scream(a, b, g=-24): crowd(a, b, g, True)

# ================= events (absolute seconds) =================
# 0-28.8 hook
rain(0, 4.1, -24); place(sfx, thud(0.6, 120), 0.75, db(-20)); wind(4.05, 6.6, -26); buzz(4.3, 6.4, -32)
incoming(7.7, 8.55, -16); booms([8.55], -2); booms([8.8], -8)
tick(11.4, 14.6, -18); heart(11.5, 14.5, -20); wind(11.4, 17.5, -32)
wind(17.46, 21, -26); [place(sfx, shot(), 18.6 + k * 0.33 + rng.uniform(0, 0.1), db(-16 - rng.uniform(0, 8))) for k in range(8)]; mg(19.3, 20.6, -20)
for at in [17.86, 19.06]: place(sfx, whoosh(0.5, 800, 5000), at, db(-22))
rain(20.93, 23.9, -24); wind(23.86, 28.8, -30); place(sfx, boom(3.5), 26.85, db(-10))
# 28.8-131 prologue + chapter 1
for at in [28.85, 32.4]: place(sfx, whoosh(0.7), at - 0.3, db(-16))
booms([32.6, 33.2, 33.9, 34.5, 35.0], -8); planes(32.4, 36.5, -18); rumble(32.4, 36.5, -22)
place(sfx, clang(), 37.6, db(-8)); booms([38.35, 38.9, 39.3], -4); scream(38.4, 40.0, -22)
place(sfx, boom(2.5), 42.55, db(-8))
crowd(45.46, 49.6, -20, True); [paper(47.8 + k * 0.28, -18) for k in range(5)]
bed(gfire, 49.61, 53.3, -26); booms([51.95], -4); [paper(50.4 + k * 0.35, -20) for k in range(4)]
place(sfx, whoosh(0.8), 53.1, db(-18)); [place(sfx, clang()[: int(0.3 * SR)], 59.7 + k * 0.33 + rng.uniform(0, 0.04), db(-20 - (k % 2) * 4)) for k in range(10)]
for at in [63.1, 63.65, 64.15, 64.95, 65.65]: place(sfx, thud(0.5, 160), at, db(-10))
for at in [70.6, 71.0, 71.2, 71.6]: place(sfx, whoosh(0.5, 300, 2500), at, db(-18))
stomps(72.65, 74.3, 0.36, -10)
sea(74.27, 76.6, -20); horn(74.9, 1.6, -16); horn(75.6, 1.0, -18)
hiss(77.4, 80.5, -22); place(sfx, boom(2.6), 80.45, db(-10))
crowd(82.11, 92.45, -26, True); birds(82.2, 92.4, 10, -34); engine(86.75, 92.45, -26, 32)
for at in [92.72, 92.95]: place(sfx, shot(), at, db(-2))
scream(92.8, 97.2, -18); crowd(97.24, 100.3, -26); [paper(97.5 + k * 0.35, -20) for k in range(7)]
place(sfx, whoosh(0.6), 101.4, db(-16)); stamp_snd(102.15, -4)
wind(103.11, 105.4, -24); stomps(103.11, 105.4, 0.4, -12)
for at in [106.2, 107.9, 108.9]: place(sfx, whoosh(0.6), at, db(-16))
stomps(110.02, 114.36, 0.38, -10); rumble(110.0, 114.3, -26, 70)
crowd(114.36, 117.3, -24, True); stomps(114.36, 117.3, 0.4, -14)
bed(gfire, 117.8, 121.3, -28)
crowd(121.31, 124.33, -18, True); stomps(121.31, 124.33, 0.42, -14); train(124.33, 126.15, -12)
chime(126.3, 3, -22)
rain(127.64, 131.1, -22); incoming(127.9, 128.4, -18); booms([128.4], -4)
# 131-207 chapter 2: trenches
sting(131.03); booms([131.6, 132.6, 133.5], -10); wind(131.03, 135.2, -28)
stomps(135.22, 138.5, 0.24, -14, step); crowd(135.3, 138.4, -26, True)
place(sfx, whoosh(0.7), 138.3, db(-16))
shovel(141.71, 144.0, -14); mg(144.75, 146.1, -12); booms([145.8], -6)
for k in range(4): place(sfx, thud(0.4, 200), 148.0 + k * 0.6, db(-14))
place(sfx, whoosh(0.8), 149.7, db(-18)); tick(152.6, 154.5, -24)
wind(155.85, 167.1, -24); booms([162.9, 163.3], -6); [crow(164.9 + k * 0.7, -26) for k in range(3)]; [place(sfx, shot(), 165.9 + k * 0.25, db(-14 - k)) for k in range(5)]
whistle(168.3, 1.0, -8); stomps(169.6, 170.5, 0.25, -14, step); crowd(169.7, 172.9, -22, True); stomps(170.55, 172.9, 0.2, -12, step)
mg(172.93, 175.9, -10); [place(sfx, whoosh(0.18, 2000, 8000), 173.1 + k * 0.23, db(-18)) for k in range(12)]
rain(175.89, 185.3, -22); [squeak(182.0 + k * 0.4) for k in range(5)]; [place(sfx, bp(rng.standard_normal(int(0.08 * SR)), 2000, 7000) * 0.4, 182.7 + k * 0.1, db(-24)) for k in range(14)]
for k in range(4): n = int(0.05 * SR); place(sfx, np.sin(2 * np.pi * 1200 * np.arange(n) / SR) * np.exp(-np.arange(n) / 300), 180.3 + k * 0.9, db(-26))
wind(185.27, 191, -32); [place(sfx, norm(lp(rng.standard_normal(int(1.2 * SR)), 250)) * np.hanning(int(1.2 * SR)), 185.6 + k * 1.6, db(-30)) for k in range(2)]
incoming(189.2, 189.75, -18); booms([189.75], -4)
buzz(191, 195, -24); heart(195.0, 197.1, -14)
[place(sfx, shot(), 197.3 + k * 0.2 + rng.uniform(0, 0.08), db(-16 - rng.uniform(0, 8))) for k in range(7)]; wind(197.15, 202.5, -30)
incoming(204.0, 205.3, -10); booms([205.3], 0)
# 207-287 chapter 3: weapons
sting(206.83); [cannon(at, -6) for at in [207.1, 207.6, 208.1, 208.6, 209.1, 209.7, 210.2]]
booms([211.9, 212.7, 213.4, 214.1], -8); planes(211.3, 215.3, -18); rumble(211.3, 215.3, -24)
mg(215.75, 219.3, -6, 12); [clink(215.9 + k * 0.17, -26) for k in range(18)]
mg(219.3, 222.9, -10, 12)
[cannon(at) for at in [223.3, 223.9, 224.3, 224.7, 225.3, 225.8, 226.3, 226.7]]
booms([227.75, 227.95, 228.62, 228.85, 229.35, 229.6], -4); wind(230.25, 232.7, -24)
hiss(235.6, 247.6, -20); crowd(243.2, 247.5, -30); [cough(244.2 + k * 0.8, -16) for k in range(3)]
breath(248.3, 253.0, -18); cough(251.5, -18)
rumble(253.07, 264.2, -12); [place(sfx, clang()[: int(0.25 * SR)], 257.8 + k * 0.15, db(-16)) for k in range(5)]; place(sfx, thud(0.8, 160), 263.15, db(-6)); place(sfx, clang()[: int(0.6 * SR)], 263.2, db(-10)); hiss(263.2, 264.2, -18)
rumble(264.21, 268.1, -16); stomps(264.21, 268.1, 0.5, -20, step)
planes(268.13, 273.6, -12); mg(271.8, 272.6, -16, 14); mg(273.0, 273.5, -16, 14)
place(sfx, whoosh(1.0, 200, 3000), 273.6, db(-8)); booms([274.4, 274.8], -4)
rumble(276.06, 278.2, -20); planes(276.06, 278.2, -22)
bed(gcity, 278.22, 281.6, -30); birds(278.3, 281.5, 6, -32); horn(279.0, 0.4, -20); horn(279.6, 0.4, -20)
[place(sfx, clang()[: int(0.3 * SR)], 281.8 + k * 0.4, db(-20 - (k % 2) * 3)) for k in range(12)]
# 287-358 chapter 4: battles
sting(286.68); [place(sfx, whoosh(0.5, 800, 5000), at, db(-22)) for at in [286.9, 288.0]]; wind(286.68, 291.2, -28)
booms([291.6, 292.3, 292.9, 293.5, 294.1], -8); crowd(291.2, 295.7, -26, True)
[cannon(at) for at in [297.6, 298.0, 298.2, 298.5, 298.7, 299.0, 299.3, 299.5, 299.8]]
place(sfx, whoosh(0.6), 300.2, db(-16)); rain(301.98, 307.0, -26); booms([302.6, 303.6, 304.5, 305.5], -6)
booms([309.6, 309.9, 310.2], -4); crowd(310.4, 313.3, -22, True); stomps(310.4, 313.3, 0.22, -14, step); [place(sfx, shot(), 311.5 + k * 0.08, db(-8)) for k in range(5)]
wind(313.34, 316.8, -30); tick(318.6, 321.3, -26); stomps(321.55, 324.4, 0.6, -22, step)
place(sfx, whoosh(0.6), 326.1, db(-16)); birds(328.1, 333.0, 6, -34); whistle(329.1, 1.2, -8)
mg(333.09, 341.3, -12); [place(sfx, whoosh(0.18, 2000, 8000), 333.5 + k * 0.4, db(-20)) for k in range(18)]; tick(335.2, 337.6, -24)
place(amb, bell(196), 341.5, db(-14)); place(amb, bell(196), 344.0, db(-18)); wind(341.33, 353, -28)
tick(347.6, 349.4, -28); stomps(353.03, 358.7, 0.6, -20)
# 358-440 chapter 5: world war
sting(358.75); place(sfx, whoosh(1.2, 200, 2000), 363.4, db(-16))
sea(366.04, 370.3, -18); horn(366.4, 2.4, -12); stomps(370.3, 374.4, 0.4, -14)
for at in [375.4, 376.2, 377.1, 378.0, 379.2, 379.5, 379.8]: place(sfx, whoosh(0.5), at, db(-18))
stomps(382.23, 385.6, 0.4, -14); wind(382.23, 389.3, -26); booms([386.4, 387.2, 388.0], -8); [place(sfx, shot(), 386.6 + k * 0.3, db(-14)) for k in range(6)]
[timp(390.4 + k * 0.8, db(-16), 50) for k in range(5)]; place(sfx, clang()[: int(0.6 * SR)] * 0.6, 394.6, db(-14))
stomps(396.41, 400.7, 0.4, -14); crowd(396.41, 400.7, -22, True)
sea(400.73, 405.3, -18); [place(sfx, np.sin(2 * np.pi * 1500 * np.arange(int(0.8 * SR)) / SR) * np.exp(-np.arange(int(0.8 * SR)) / (0.25 * SR)), at, db(-26)) for at in [401.0, 402.2]]
place(sfx, whoosh(1.0, 100, 1200), 402.8, db(-10)); place(sfx, whoosh(0.5, 300, 3000), 404.3, db(-12)); booms([404.75], -2); scream(404.9, 405.3, -28)
morse(405.3, 407.0, -22); stamp_snd(407.0, -6); place(sfx, whoosh(0.9), 409.1, db(-16))
sea(412.56, 418.3, -22); horn(412.8, 1.8, -16); [place(sfx, thud(0.35, 300), 413.2 + k * 0.5, db(-16)) for k in range(8)]; stomps(412.56, 418.3, 0.42, -16)
wind(418.32, 423.0, -20); crowd(418.4, 423.0, -32)
crowd(423.03, 428.9, -16, True); place(sfx, clang()[: int(0.8 * SR)], 424.2, db(-8)); place(sfx, thud(0.6, 300), 424.2, db(-8))
scratch(432.2, 433.5, -20); stamp_snd(433.6, -4)
booms([436.3, 436.9, 437.6, 438.4], -6); stomps(435.85, 439.8, 0.24, -16, step)
# 440-501 chapter 6: the end
sting(439.83); wind(439.83, 443.3, -28)
crowd(443.3, 448.0, -20, True); stomps(443.3, 448.0, 0.2, -12, step); booms([445.6, 446.6, 447.3], -6)
sea(448.0, 452.0, -20); horn(449.3, 2.0, -14); horn(450.2, 1.6, -16)
place(sfx, whoosh(0.7), 453.4, db(-16)); rain(455.11, 457.2, -26); sea(457.25, 458.7, -16)
rumble(458.75, 462.4, -16); stomps(458.75, 462.4, 0.4, -14); rain(462.48, 465.1, -22)
crowd(465.11, 467.3, -32); [paper(467.4 + k * 0.3, -20) for k in range(7)]
crowd(469.78, 474.1, -20, True); stomps(469.78, 474.1, 0.22, -14, step); rumble(469.8, 474.1, -22)
crowd(474.10, 478.1, -14, True); stomps(474.1, 478.1, 0.45, -18)
place(sfx, clang(), 479.85, db(-8)); stomps(481.9, 483.3, 0.55, -18, step)
birds(483.4, 487.2, 8, -30); wind(483.36, 487.2, -32); tick(487.2, 488.9, -16); chime(487.8, 3, -10)
stamp_snd(489.3, -2)
[place(sfx, shot(), at, db(-8)) for at in [491.35, 491.55, 491.75]]
birds(492.4, 498.6, 12, -30); crowd(496.8, 498.6, -16, True)
wind(498.63, 501.4, -30)
# 501-603 chapter 7: scars
sting(501.37, -10); wind(501.37, 506, -32); birds(501.5, 506, 5, -34)
tick(506.8, 509.0, -26); place(sfx, thud(0.3, 400), 511.0, db(-18)); place(sfx, thud(0.3, 400), 511.3, db(-20))
heart(518.0, 523.2, -16); [place(sfx, lp(boom(1.6), 300), at, db(-24)) for at in [518.6, 520.3, 521.9]]
for at in [530.4, 530.9, 531.4]: place(sfx, thud(0.3, 500), at, db(-16))
scratch(536.1, 538.2, -22); place(sfx, whoosh(0.8), 539.0, db(-16)); place(sfx, whoosh(0.25, 800, 6000), 540.75, db(-8)); [clink(541.9 + k * 0.12) for k in range(10)]
[place(sfx, hp(rng.standard_normal(int(0.03 * SR)), 2500), 544.4 + k * 0.16, db(-18)) for k in range(10)]
crowd(547.0, 553.4, -20, True); planes(553.49, 560.0, -18); bed(gfire, 553.5, 560.0, -28)
crowd(560.01, 565.8, -26, True)
wind(565.82, 567.7, -24); bed(gfire, 565.82, 567.7, -28); wind(567.75, 575.2, -30); birds(575.3, 581.7, 6, -34)
wind(587.91, 593.1, -28); birds(593.1, 603.0, 8, -34); wind(593.1, 603.0, -32)

# ================= score (D minor → D major at the armistice) =================
def pad(freqs, a, b, gain, fade=2.0, cut=1000):
    a0 = max(0, a); n = int((b - a0) * SR)
    if n < SR // 10: return
    tt = np.arange(n) / SR + a0
    x = sum(np.sin(2 * np.pi * f * tt + i) / (i + 1) ** 0.7 for i, f in enumerate(freqs)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.1 * tt))
    place(mus, lp(x, cut) * senv(n, fade, fade) * gain, a0)
D2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, Cs4, Fs3, Fs4 = 73.42, 87.31, 98, 110, 116.54, 130.81, 146.83, 164.81, 174.61, 196, 220, 233.08, 261.63, 293.66, 329.63, 349.23, 392, 440, 466.16, 277.18, 185.0, 369.99
Dm, BbM, Gm, Am, FM, CM = [D2, A2, D3, F3], [Bb2, D3, F3], [G2, D3, G3, Bb3], [A2, E3, A3, Cs4], [F2, C3, F3, A3], [C3, G3, E3]
DM, GM, AM, Bm = [D2, A2, D3, Fs3], [G2, D3, G3, 246.94], [A2, E3, A3, Cs4], [123.47, Fs3, 246.94]
def progression(a, b, gain, beat=4.0, cut=900, prog=(Dm, BbM, Gm, Am)):
    k = 0
    while a + k * beat < b: s0 = a + k * beat; pad(prog[k % len(prog)], s0, min(b, s0 + beat + 0.8), gain, 0.6, cut); k += 1
def piano(at, f, g, L=2.5):
    n = int(L * SR); tt = np.arange(n) / SR
    place(mus, sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt / (d * (1.4 if m == 1 else 1))) for m, a, d in [(1, 1, 0.9), (2, 0.4, 0.5), (3, 0.15, 0.3), (4, 0.08, 0.2)]) * np.minimum(1, tt / 0.005), at, g)
def strings(at, f, L, g):
    n = int(L * SR); tt = np.arange(n) / SR; ph = np.cumsum(f * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt))) / SR
    x = lp(2 * (ph % 1) - 1, 2200) * np.minimum(1, tt / 0.35) * np.minimum(1, (L - tt) / 0.5); place(mus, x, at, g)
def timp(at, g, f=55): n = int(1.6 * SR); tt = np.arange(n) / SR; place(mus, norm(np.sin(2 * np.pi * f * tt * (1 - 0.08 * tt)) * np.exp(-tt / 0.45) + 0.2 * lp(rng.standard_normal(n), 200) * np.exp(-tt / 0.05)), at, g)
def ostinato(a, b, f, g, step=0.25):
    k = 0
    while a + k * step < b: strings(a + k * step, f, step * 0.9, g * (1 if k % 2 == 0 else 0.7)); k += 1
def snare(a, b, g, step=0.3077):
    k = 0
    while a + k * step < b: n = int(0.12 * SR); place(mus, hp(rng.standard_normal(n), 1500) * np.exp(-np.arange(n) / 600), a + k * step, g * (1 if k % 4 == 0 else 0.6)); k += 1
theme = [(0, A4), (0.75, F4), (1.5, E4), (2.0, F4), (2.5, D4), (4.0, A4), (4.75, Bb4), (5.5, A4), (6.0, G4), (6.5, F4), (7.0, E4)]
lament = [(0, A4, 2.2), (2.2, F4, 1.2), (3.4, E4, 1.2), (4.6, D4, 2.8), (8.0, F4, 1.6), (9.6, E4, 1.2), (10.8, Cs4, 1.2), (12.0, D4, 3.4)]
# hook: low drone, heartbeat timps
pad([D2, A2, D3], 0, 28.8, db(-24), 1.0, 500)
for dt, f in theme[:6]: piano(14.8 + dt * 0.6, f, db(-22))
[timp(23.9 + k * 1.0, db(-20), 46) for k in range(5)]
# prologue + chapter 1: building progression, march snare 1914
progression(28.8, 53.3, db(-25), 4.0); ostinato(32.4, 36.5, D3, db(-27), 0.2); [timp(32.6 + k * 0.7, db(-18)) for k in range(6)]
pad(Dm, 53.3, 82.1, db(-27), 2.0, 700); ostinato(59.6, 70.4, D3, db(-29)); [timp(66.6 + k * 0.5, db(-18)) for k in range(6)]
progression(82.1, 92.4, db(-28), 4.0, 900, (FM, CM, Dm, BbM)); pad([D2, A2], 92.5, 97.2, db(-22), 0.2, 300); [timp(92.72 + k * 0.4, db(-16), 44) for k in range(6)]
progression(97.2, 121.3, db(-25), 2.0); ostinato(103.1, 121.3, D3, db(-27), 0.2); [timp(103.1 + k * 1.0, db(-19)) for k in range(18)]
progression(121.3, 127.6, db(-25), 2.0, 1200, (FM, CM, BbM, FM)); snare(121.3, 126.1, db(-24))
for dt, f in [(0, A4), (0.5, F4), (1.0, D4)]: piano(126.2 + dt, f, db(-22))
# chapter 2: trenches — dark pads, slow strings lament
pad([D2, A2, D3, F3], 131.0, 207.0, db(-27), 2.0, 600)
for s0 in [147.7, 175.9]:
    for dt, f, L in lament: strings(s0 + dt, f, L, db(-26))
ostinato(167.1, 175.9, D3, db(-27), 0.2); [timp(168.3 + k * 0.6, db(-18)) for k in range(12)]; heart(195.0, 197.0, -18)
pad([D2, A2], 197.1, 205.3, db(-24), 1.0, 300)
# chapter 3: weapons — driving progression + timpani
progression(206.8, 286.7, db(-25), 2.0); ostinato(211.3, 232.7, D3, db(-27), 0.2); ostinato(253.0, 276.0, D3, db(-28), 0.25)
[timp(211.3 + k * 1.0, db(-19)) for k in range(22)]; [timp(253.0 + k * 1.0, db(-20)) for k in range(22)]
pad([D2, A2, D3], 232.7, 253.0, db(-24), 1.5, 500)
progression(278.2, 281.6, db(-24), 1.7, 1600, (DM, GM)); pad([D2, Bb2 / 2 * 2, D3], 281.6, 286.7, db(-23), 0.5, 500)
# chapter 4: battles — lament and toll
pad([D2, A2, D3, F3], 286.7, 358.7, db(-27), 2.0, 650); ostinato(291.2, 313.3, D3, db(-28), 0.25); [timp(295.8 + k * 0.5, db(-18)) for k in range(36)]
progression(313.3, 316.8, db(-23), 1.75, 1600, (DM, AM)); [strings(313.5 + dt, f, L, db(-23)) for dt, f, L in [(0, D4, 1.6), (1.6, Fs4, 1.6)]]
for dt, f, L in lament: strings(316.9 + dt * 0.95, f, L, db(-25))
for dt, f, L in lament: strings(341.4 + dt, f, L, db(-24))
ostinato(333.1, 341.3, D3, db(-27), 0.2)
# chapter 5: world war — broad progression
progression(358.7, 418.3, db(-25), 4.0, 900, (Dm, BbM, FM, Am)); ostinato(366.0, 389.3, D3, db(-28), 0.25)
for dt, f in theme: piano(374.6 + dt, f, db(-23))
[timp(400.7 + k * 0.7, db(-19)) for k in range(6)]
pad([D2, A2, D3, F3], 418.3, 439.8, db(-25), 1.5, 600); ostinato(423.0, 428.9, D3, db(-26), 0.2); [timp(423.0 + k * 0.5, db(-17)) for k in range(12)]
for dt, f, L in lament[:4]: strings(429.0 + dt, f, L, db(-25))
# chapter 6: the end — tension, then D major at the armistice
progression(439.8, 483.3, db(-25), 2.0); ostinato(443.3, 448.0, D3, db(-26), 0.2); ostinato(469.8, 478.1, D3, db(-26), 0.2); [timp(443.3 + k * 1.0, db(-18)) for k in range(5)]
pad([D2, A2, D3], 483.3, 491.3, db(-26), 1.0, 600); [timp(487.4 + k * 0.5, db(-20), 46) for k in range(6)]
pad(DM + [A3, D4], 491.4, 501.4, db(-22), 2.0, 1800)
for dt, f, L in [(0.5, Fs4, 2.0), (2.5, A4, 2.0), (4.5, D4 * 2, 2.8)]: strings(492.6 + dt, f, L, db(-23))
for dt, f in [(0, D4), (0.6, Fs4), (1.2, A4), (1.8, D4 * 2)]: piano(496.8 + dt, f, db(-20))
pad([D2, A2, D3], 498.6, 501.4, db(-26), 1.0, 500)
# chapter 7: scars — piano theme, lament, closing D major swell
pad([D2, A2, D3, F3], 501.4, 596.5, db(-28), 2.0, 600)
for s0 in [506.0, 523.4, 547.1]:
    for dt, f in theme: piano(s0 + dt, f, db(-22))
for s0 in [514.7, 532.8, 565.9]:
    for dt, f, L in lament: strings(s0 + dt, f, L, db(-25))
progression(553.5, 560.0, db(-25), 1.6); [timp(553.5 + k * 0.8, db(-19), 46) for k in range(8)]
pad([D2, A2, D3, F3, A3], 560.0, 565.8, db(-26), 1.0, 900)
for dt, f in [(0, D4), (1.2, F4), (2.4, A4), (3.6, G4), (4.8, F4), (6.0, E4), (7.2, D4)]: piano(575.4 + dt, f, db(-21))
for dt, f, L in lament[:4]: strings(587.9 + dt, f / 2, L, db(-25))
pad(DM + [A3, D4], 596.5, DUR, db(-21), 2.0, 1800); piano(596.6, D4, db(-20), 4); piano(598.6, Fs4, db(-21), 4); piano(600.6, A4, db(-21), 3)
for dt, f, L in [(0.3, Fs4, 2.2), (2.5, A4, 2.4)]: strings(596.6 + dt, f, L, db(-24))

# ================= voice + mix =================
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64); v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
e = lp(np.abs(v), 4); e /= e.max() + 1e-9; duck = 1 - 0.55 * np.clip(e * 3, 0, 1)
mix = v + (amb + mus * db(3)) * duck + sfx * db(-6) * (1 - 0.35 * np.clip(e * 3, 0, 1))
mix /= max(1.0, np.abs(mix).max() / 0.97)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", round(N / SR, 2))
