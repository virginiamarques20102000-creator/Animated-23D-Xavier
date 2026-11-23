# Trilha, ambiente e efeitos do vídeo "A Guerra do Paraguai" (16:9, 545,2 s). Tempos = palavras de out/paraguai/tempos_palavras.txt.
# uso: python3 audio/ww2_mix.py public/ww2_narracao.mp3 out/ww2/mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 545.2; N = int(DUR * SR); rng = np.random.default_rng(1864); t = np.arange(N, dtype=np.float32) / SR
amb = np.zeros(N); sfx = np.zeros(N); mus = np.zeros(N)
def lp(x, f): return signal.sosfilt(signal.butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return signal.sosfilt(signal.butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return signal.sosfilt(signal.butter(2, [a, b], "band", fs=SR, output="sos"), x)
def db(v): return 10 ** (v / 20)
def norm(x): return x / (np.abs(x).max() + 1e-9)
def env(a, b, fa=0.6, fb=0.6): return np.clip((t - a) / fa, 0, 1) * np.clip((b - t) / fb, 0, 1)
PANS = {}
def place(d, x, at, g=1.0, pan=None):
    i = int(at * SR); n = min(len(x), len(d) - i)
    if n > 0 and i >= 0:
        d[i:i + n] += x[:n] * g
        w = 0.65 if d is sfx else 0.3 if d is amb else 0.0
        p = rng.uniform(-w, w) if pan is None else pan
        PANS.setdefault(id(d), []).append((i, n, x[:n] * g, p))
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
    L *= rng.uniform(0.8, 1.3); n = int(L * SR); tt = np.arange(n) / SR; f = rng.uniform(30, 58); dec = rng.uniform(0.4, 0.95)
    body = lp(rng.standard_normal(n), rng.uniform(100, 240)) * np.exp(-tt / dec) + rng.uniform(0.4, 0.9) * np.sin(2 * np.pi * f * tt * (1 - 0.15 * tt)) * np.exp(-tt / rng.uniform(0.25, 0.5))
    crack = rng.uniform(0.2, 0.7) * hp(rng.standard_normal(n), rng.uniform(1200, 3500)) * np.exp(-tt / rng.uniform(0.03, 0.09))
    deb = np.zeros(n)
    for k in range(rng.integers(4, 14)):
        j = int(rng.uniform(0.3, min(L, 2.2) - 0.05) * SR); m = min(1200, n - j)
        if m > 0: deb[j:j + m] += bp(rng.standard_normal(m), rng.uniform(600, 2000), 6000) * np.exp(-np.arange(m) / rng.uniform(80, 300)) * rng.uniform(0.05, 0.25)
    return norm(body + crack + deb)
def shot():
    n = int(rng.uniform(0.6, 1.4) * SR); tt = np.arange(n) / SR; a, b, c = rng.uniform(600, 1600), rng.uniform(0.006, 0.02), rng.uniform(45, 95)
    echo = np.zeros(n); d = int(rng.uniform(0.12, 0.35) * SR); echo[d:] = lp(rng.standard_normal(n - d), 900) * np.exp(-np.arange(n - d) / SR / 0.25) * rng.uniform(0.1, 0.35)
    return norm(echo + hp(rng.standard_normal(n), a) * np.exp(-tt / b) + lp(rng.standard_normal(n), rng.uniform(500, 1200)) * np.exp(-tt / 0.1) + 0.8 * np.sin(2 * np.pi * c * tt) * np.exp(-tt / 0.12))
def shot_old():
    n = int(0.9 * SR); tt = np.arange(n) / SR
    return norm(hp(rng.standard_normal(n), 900) * np.exp(-tt / 0.012) + lp(rng.standard_normal(n), 800) * np.exp(-tt / 0.1) + 0.8 * np.sin(2 * np.pi * 60 * tt) * np.exp(-tt / 0.12))
def stomp(): n = int(0.25 * SR); tt = np.arange(n) / SR; return norm(lp(rng.standard_normal(n), 320) * np.exp(-tt / 0.03) + 0.3 * bp(rng.standard_normal(n), 1500, 4000) * np.exp(-tt / 0.01))
def step(): n = int(0.18 * SR); tt = np.arange(n) / SR; return norm(bp(rng.standard_normal(n), 200, 2500) * np.exp(-tt / 0.025))
def thud(L=0.5, f=180): f *= rng.uniform(0.75, 1.3); L *= rng.uniform(0.8, 1.25); n = int(L * SR); tt = np.arange(n) / SR; return norm(lp(rng.standard_normal(n), f) * np.exp(-tt / 0.08) + 0.6 * np.sin(2 * np.pi * 70 * tt) * np.exp(-tt / 0.1))
def clang():
    n = int(2.2 * SR); tt = np.arange(n) / SR
    return norm(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in [(312, 0.9), (497, 0.6), (853, 0.4), (1290, 0.25)]) + 0.8 * hp(rng.standard_normal(n), 2000) * np.exp(-tt / 0.02))
def bell(f=392):
    n = int(4 * SR); tt = np.arange(n) / SR
    return norm(sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt / d) for m, a, d in [(0.5, 0.6, 2.5), (1, 1, 1.8), (1.19, 0.5, 1.2), (1.5, 0.4, 1.0), (2.0, 0.3, 0.7), (2.74, 0.2, 0.4)]))
def whoosh(L=0.6, a=300, b=3500):
    a *= rng.uniform(0.7, 1.4); b *= rng.uniform(0.7, 1.3); L *= rng.uniform(0.85, 1.2); n = int(L * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return norm(bp(rng.standard_normal(n), a, b) * e)
def rumble(a, b, g, f=90):  # tank/engine: each column has its own engine note, track cadence and squeal
    f *= rng.uniform(0.7, 1.4); cad = rng.uniform(5, 11); n, tt = seg(a, b); x = lp(rng.standard_normal(n), f) * (1 + 0.5 * np.sin(2 * np.pi * cad * tt))
    sq = np.sin(2 * np.pi * rng.uniform(1800, 3200) * tt + 3 * np.sin(2 * np.pi * rng.uniform(0.5, 2) * tt)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(0.2, 0.7) * tt)) ** 6 * rng.uniform(0.03, 0.12)
    x = x + sq + 0.4 * np.sign(np.sin(2 * np.pi * 31 * tt)) * lp(rng.standard_normal(n), 400) * 0.3
    clat = np.zeros(n)
    for k in range(int((b - a) * 7)): i = int(k / 7 * SR); clat[i:i + 600] += hp(rng.standard_normal(600), 1500) * np.exp(-np.arange(600) / 90)
    place(sfx, norm(x + 0.5 * clat) * np.minimum(1, tt / 0.6) * np.minimum(1, (b - a - tt) / 0.6), a, db(g))
def planes(a, b, g):
    n, tt = seg(a, b); f0 = rng.uniform(70, 125); x = sum(np.sin(2 * np.pi * f * tt * (1 + 0.004 * np.sin(2 * np.pi * rng.uniform(0.2, 0.5) * tt))) for f in [f0, f0 * rng.uniform(1.03, 1.07), f0 * 2]) * lp(rng.standard_normal(n), 300) * 0.5 + lp(rng.standard_normal(n), 600)
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
# transpose the score to E minor (own key for this film), E major at the end
_K = 2 ** (2 / 12)
D2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, Cs4, Fs3, Fs4 = [f * _K for f in (D2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, Cs4, Fs3, Fs4)]
Dm, BbM, Gm, Am, FM, CM = [D2, A2, D3, F3], [Bb2, D3, F3], [G2, D3, G3, Bb3], [A2, E3, A3, Cs4], [F2, C3, F3, A3], [C3, G3, E3]
DM, GM, AM = [D2, A2, D3, Fs3], [G2, D3, G3, 246.94 * _K], [A2, E3, A3, Cs4]
theme = [(0, A4), (0.75, F4), (1.5, E4), (2.0, F4), (2.5, D4), (4.0, A4), (4.75, Bb4), (5.5, A4), (6.0, G4), (6.5, F4), (7.0, E4)]
lament = [(0, A4, 2.2), (2.2, F4, 1.2), (3.4, E4, 1.2), (4.6, D4, 2.8), (8.0, F4, 1.6), (9.6, E4, 1.2), (10.8, Cs4, 1.2), (12.0, D4, 3.4)]

# ---------------- extra sfx for WW2 ----------------
def siren_stuka(a, b, g=-12):  # Jericho trumpet: rising scream
    n = int((b - a) * SR); tt = np.arange(n) / SR; f = 500 + 900 * (tt / tt[-1]) ** 1.4; place(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * senv(n, 0.3, 0.1) * 0.6 + 0.4 * norm(bp(rng.standard_normal(n), 600, 2500)) * senv(n, 0.3, 0.1), a, db(g))
def raid_siren(a, b, g=-22):
    n = int((b - a) * SR); tt = np.arange(n) / SR; f = 420 + 280 * np.sin(2 * np.pi * 0.18 * tt - 1.5) ** 2; place(amb, np.sin(2 * np.pi * np.cumsum(f) / SR) * senv(n, 1.0, 1.0), a, db(g))
def flyby(at, L=2.2, g=-14, f0=120):  # doppler engine pass
    n = int(L * SR); tt = np.arange(n) / SR; x = tt / L - 0.5; f = f0 * (1 - 0.25 * np.tanh(x * 6)); e = np.exp(-(x * 3.4) ** 2)
    place(sfx, (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + lp(rng.standard_normal(n), 900)) * e, at, db(g))
def static(a, b, g=-30): n = int((b - a) * SR); place(sfx, norm(bp(rng.standard_normal(n), 800, 4000)) * senv(n, 0.1, 0.2) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * np.arange(n) / SR)), a, db(g))
def flash_pop(at, g=-18): n = int(0.12 * SR); place(sfx, hp(rng.standard_normal(n), 2000) * np.exp(-np.arange(n) / 300), at, db(g)); place(sfx, thud(0.1, 900), at, db(g - 6))
def glass(at, g=-8):
    for k in range(14): n = int(0.25 * SR); tt = np.arange(n) / SR; f = rng.uniform(2500, 7000); place(sfx, np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.05) * 0.6 + hp(rng.standard_normal(n), 4000) * np.exp(-tt / 0.02), at + rng.uniform(0, 0.6) * (k > 3), db(g - rng.uniform(0, 10)))
def coins_snd(a, b, g=-16):
    at = a
    while at < b: clink(at, g - rng.uniform(0, 8)); at += rng.uniform(0.04, 0.12)
def nuke(at, g=0):  # long sub-bass roar arriving after the flash
    n = int(9 * SR); tt = np.arange(n) / SR; x = lp(rng.standard_normal(n), 70) * np.minimum(1, tt / 0.6) * np.exp(-tt / 3.2) + 0.6 * lp(rng.standard_normal(n), 400) * np.exp(-tt / 1.2)
    place(sfx, norm(x), at, db(g))
def pen(a, b, g=-18): scratch(a, b, g)
def crack(at, g=-10): n = int(0.6 * SR); tt = np.arange(n) / SR; place(sfx, norm(hp(rng.standard_normal(n), 1500) * np.exp(-tt / 0.03) + lp(rng.standard_normal(n), 300) * np.exp(-tt / 0.2)), at, db(g))
def thunder(at, g=-8): n = int(3 * SR); tt = np.arange(n) / SR; place(sfx, norm(lp(rng.standard_normal(n), 200) * np.exp(-tt / 0.9) * (1 + 0.5 * np.sin(2 * np.pi * 3 * tt))), at, db(g)); crack(at, g - 4)
def rocket(at, L=2.0, g=-14): n = int(L * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 300, 5000)) * np.exp(-tt / 0.8) * np.minimum(1, tt / 0.05), at, db(g))
def splash_snd(at, g=-10): n = int(1.6 * SR); tt = np.arange(n) / SR; place(sfx, norm(lp(rng.standard_normal(n), 1500) * np.exp(-tt / 0.4) + bp(rng.standard_normal(n), 2000, 7000) * np.exp(-tt / 0.6) * 0.5), at, db(g))
def cheer(a, b, g=-18): crowd(a, b, g, True)
def tear(at, g=-10): n = int(0.5 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 1200, 6000)) * (tt / 0.5) * np.exp(-tt / 0.3) * (1 + np.sign(np.sin(2 * np.pi * 40 * tt))), at, db(g))

def debris_rain(at, dur=1.6, n=24, g=-18):  # chunks landing after a blast
    for k in range(n): place(sfx, thud(rng.uniform(0.08, 0.25), rng.uniform(300, 1400)), at + rng.uniform(0, dur) ** 1.3, db(g + rng.uniform(-8, 2)))
def ricochet(at, g=-16): n = int(rng.uniform(0.3, 0.6) * SR); tt = np.arange(n) / SR; f0 = rng.uniform(2500, 4200); place(sfx, np.sin(2 * np.pi * (f0 - rng.uniform(900, 1800) * tt / tt[-1]) * tt) * np.exp(-tt / 0.12) * 0.6 + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.01), at, db(g))
def whistle_in(at, L=0.8, g=-18): n = int(L * SR); tt = np.arange(n) / SR; f = rng.uniform(1100, 1700) - rng.uniform(400, 800) * tt / L; place(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / L) ** 1.5 * 0.5, at - L, db(g))
def clank(at, g=-20): n = int(0.5 * SR); tt = np.arange(n) / SR; place(sfx, norm(sum(np.sin(2 * np.pi * rng.uniform(400, 2400) * tt) * np.exp(-tt / rng.uniform(0.05, 0.2)) for _ in range(4))), at, db(g))
def big_blast(at, g=-2, dur=2.0): place(sfx, boom(3.0), at, db(g)); debris_rain(at + 0.35, dur, 30, g - 14); whistle_in(at, rng.uniform(0.5, 1.0), g - 14)

# ---------------- extra sfx for 1864-70 ----------------
_K2 = 2 ** (-4 / 12)   # this film's own key (C minor → C major at the end)
D2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, Cs4, Fs3, Fs4 = [f * _K2 for f in (D2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, Cs4, Fs3, Fs4)]
Dm, BbM, Gm, Am, FM, CM = [D2, A2, D3, F3], [Bb2, D3, F3], [G2, D3, G3, Bb3], [A2, E3, A3, Cs4], [F2, C3, F3, A3], [C3, G3, E3]
DM, GM, AM = [D2, A2, D3, Fs3], [G2, D3, G3, 246.94 * _K * _K2], [A2, E3, A3, Cs4]
theme = [(0, A4), (0.75, F4), (1.5, E4), (2.0, F4), (2.5, D4), (4.0, A4), (4.75, Bb4), (5.5, A4), (6.0, G4), (6.5, F4), (7.0, E4)]
lament = [(0, A4, 2.2), (2.2, F4, 1.2), (3.4, E4, 1.2), (4.6, D4, 2.8), (8.0, F4, 1.6), (9.6, E4, 1.2), (10.8, Cs4, 1.2), (12.0, D4, 3.4)]
def pluck(f, L=1.6):  # Karplus-Strong string (Paraguayan harp / guitar)
    n = int(L * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out
def harp(a, b, chords, g, step=0.18):  # rolling harp arpeggios over a chord list (one chord per 8 notes)
    k = 0
    while a + k * step < b:
        ch = chords[(k // 8) % len(chords)]; notes = sorted([x * 2 for x in ch] + [x * 4 for x in ch[:2]]); f = notes[[0, 1, 2, 3, 4, 3, 2, 1][k % 8] % len(notes)]
        place(mus, pluck(f, 1.2), a + k * step, g * (1 if k % 8 == 0 else 0.7)); k += 1
def musket(at, g=-10): place(sfx, shot(), at, db(g)); place(sfx, whoosh(0.5, 200, 1200), at + 0.03, db(g - 14))
def volley_snd(at, n=10, g=-10):
    for k in range(n): place(sfx, shot(), at + rng.uniform(0, 0.28), db(g - rng.uniform(0, 7)))
def gun1860(at, g=-4): place(sfx, boom(2.2), at, db(g)); place(sfx, thud(0.25, 700), at, db(g - 6)); place(sfx, whoosh(0.8, 200, 900), at + 0.08, db(g - 16))
def paddle(a, b, g=-26):  # steamer: paddle wheel slap + chuffing engine
    k = 0
    while a + k * 0.42 < b: place(sfx, norm(bp(rng.standard_normal(int(0.2 * SR)), 300, 2500)) * np.exp(-np.arange(int(0.2 * SR)) / 1500), a + k * 0.42, db(g - (k % 2) * 2)); k += 1
    engine(a, b, g - 4, rng.uniform(32, 44))
def drum_roll(a, b, g=-18, step=0.12):
    k = 0
    while a + k * step < b: n = int(0.1 * SR); place(sfx, norm(bp(rng.standard_normal(n), 150, 3000)) * np.exp(-np.arange(n) / 500), a + k * step, db(g - (0 if k % 4 == 0 else 5))); k += 1
def march_drum(a, b, g=-16, beat=0.5):
    k = 0
    while a + k * beat < b:
        x = thud(0.25, 160); m = len(x); place(sfx, x * 0.8 + norm(hp(rng.standard_normal(m), 1500)) * 0.2 * np.exp(-np.arange(m) / 900), a + k * beat, db(g - (0 if k % 2 == 0 else 4))); k += 1
def hammer(a, b, g=-14):
    k = 0
    while a + k * 0.52 < b: place(sfx, clang()[: int(0.6 * SR)], a + k * 0.52 + rng.uniform(0, 0.05), db(g - rng.uniform(0, 5))); k += 1
def cart(a, b, g=-26):  # creaking wooden wheels
    n = int((b - a) * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 400, 1400)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tt) ** 8) * senv(n, 0.3, 0.3), a, db(g))
def insects(a, b, g=-34):
    n = int((b - a) * SR); tt = np.arange(n) / SR; place(amb, np.sin(2 * np.pi * rng.uniform(4200, 5600) * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rng.uniform(18, 30) * tt))) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * tt)) * senv(n, 0.5, 0.5), a, db(g))
def frogs(a, b, n=8, g=-30):
    for k in range(n): m = int(0.15 * SR); tt = np.arange(m) / SR; place(amb, norm(np.sign(np.sin(2 * np.pi * rng.uniform(300, 700) * tt)) * np.sin(2 * np.pi * rng.uniform(20, 40) * tt)) * np.hanning(m), rng.uniform(a, b - 0.2), db(g))
def creak_ship(at, g=-24): n = int(0.8 * SR); tt = np.arange(n) / SR; place(sfx, norm(np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 1.5 * tt)) * tt) * bp(rng.standard_normal(n), 100, 900)) * np.hanning(n), at, db(g))
def candle(a, b, g=-34): bed(lambda n: norm(lp(rng.standard_normal(n), 300)), a, b, g)
def gasp(at, g=-20): n = int(0.4 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 600, 3000)) * np.sin(np.pi * tt / tt[-1]) * (1 - tt / tt[-1]), at, db(g))
def splashes(lst, g=-12):
    for at in lst: splash_snd(at, g - rng.uniform(0, 4))
def slap(at, g=-8): place(sfx, thud(0.3, 1200), at, db(g)); place(sfx, crack and hp(rng.standard_normal(int(0.1 * SR)), 2500) * np.exp(-np.arange(int(0.1 * SR)) / 200), at, db(g - 6))
def wood_crash(at, g=-6):
    for k in range(10): place(sfx, thud(rng.uniform(0.2, 0.5), rng.uniform(300, 1500)), at + rng.uniform(0, 0.7), db(g - rng.uniform(0, 10)))
    place(sfx, boom(1.5), at, db(g - 6))
def bubble(a, b, g=-28):
    at = a
    while at < b: n = int(0.06 * SR); tt = np.arange(n) / SR; f = rng.uniform(300, 900); place(sfx, np.sin(2 * np.pi * f * (1 + 2 * tt / tt[-1]) * tt) * np.hanning(n), at, db(g)); at += rng.uniform(0.1, 0.4)

# ================= events (absolute seconds, from the shot list) =================
# hook
march_drum(0.1, 5.3, -16, 0.45); stomps(0.2, 5.3, 0.45, -22); wind(0.0, 5.4, -32); birds(0, 5, 3, -34); place(sfx, clink(2.9) if False else whoosh(0.4, 600, 4000), 2.6, db(-24))
fire_bed(5.4, 10.6, -20); wind(5.4, 10.6, -30); big_blast(9.0, -6); wood_crash(9.05, -8); gasp(9.1, -18)
candle(10.6, 12.3); heart(10.7, 12.3, -18)
crowd(12.3, 14.9, -26, True); [place(sfx, clink and thud(0.15, 1200), 13.0 + k * 0.4, db(-26)) for k in range(3)]
wind(14.9, 20.2, -26); crow(16.5, -28); crow(18.2, -30)
crowd(20.2, 24.8, -34); [place(sfx, whoosh(0.9, 400, 3000), at, db(-22)) for at in [20.25, 20.6, 21.65]]; [place(sfx, step(), 22.5 + k * 0.4, db(-20)) for k in range(6)]
stomps(24.8, 28.4, 0.5, -14); march_drum(24.8, 28.4, -18, 0.5); wind(24.8, 28.4, -30)
whistle_in(29.4, 0.7, -16); big_blast(29.4, -3); booms([29.9, 30.3], -6); wood_crash(29.5, -12)
wind(30.4, 35.1, -26); heart(31.0, 35.0, -20); [place(sfx, boom(1.2), at, db(-24)) for at in [31.5, 33.2]]
candle(35.1, 37.2); paper(35.2, -20)
waves(37.2, 43.4, -28); paddle(37.2, 43.4, -30); birds(38, 43, 4, -34); sting(38.5, -8)
tick(43.4, 46.7, -18)
[tear(at, -14) for at in [47.0, 47.5, 48.0, 48.4, 48.8]]; stamp_snd(49.25, -8)
paper(51.9, -24); [place(sfx, whoosh(0.3, 1500, 6000), at, db(-28)) for at in [54.95, 55.3, 56.25, 56.8]]
bed(gsea, 58.2, 61.9, -30); [place(sfx, bell(880), 60.6, db(-34))]
waves(61.9, 66.4, -24); paddle(61.9, 66.4, -24); horn(63.0, 1.8, -24); birds(62, 66, 5, -32)
crowd(66.4, 70.1, -36); [place(sfx, step(), 66.6 + k * 0.6, db(-28)) for k in range(5)]; chime(68.8, 2, -24)
waves(70.1, 73.2, -24); paddle(70.1, 73.2, -20); horn(70.6, 2.0, -18); birds(70, 73, 3, -32)
paper(73.2, -24); [place(sfx, whoosh(0.6, 500, 3000), at, db(-24)) for at in [74.3, 74.6, 74.9]]
wind(76.3, 79.1, -32); insects(76.3, 79.1, -34); bell(0) if False else place(sfx, bell(330), 76.6, db(-30)); [place(sfx, step(), 77 + k * 0.5, db(-28)) for k in range(4)]
candle(79.1, 82.5, -30); slap(81.45, -4); gasp(81.6, -16)
hammer(82.5, 86.5, -14); bed(gfire, 82.5, 86.5, -20); [place(sfx, whoosh(0.5, 2000, 8000), at, db(-24)) for at in [83.0, 84.2, 85.4]]
crowd(86.5, 89.8, -24); [place(sfx, step(), 86.6 + k * 0.22, db(-22)) for k in range(12)]; wind(86.5, 89.8, -28); stamp_snd(88.6, -18)
wind(89.8, 96.1, -24); crowd(93.8, 96.1, -22, True)
crowd(96.1, 98.7, -30); march_drum(96.2, 98.7, -22, 0.5); stomps(96.2, 98.7, 0.5, -22); clink(97.3, -22)
waves(98.7, 103.0, -28); [cannon(at, -4) for at in [99.4, 99.9, 100.2]]; booms([100.0, 100.6, 101.4, 102.0], -7); scream(100.1, 102.8, -30)
candle(103.0, 107.5, -30); paper(103.3, -18); heart(105.5, 107.5, -20)
place(sfx, clank(108.3) if False else clink(108.1), 0, 0) if False else clink(108.4, -16); place(sfx, thud(0.3, 400), 108.4, db(-20))
frogs(110.3, 113.1, 6, -28); insects(110.3, 113.1, -32); thunder(110.3 + 0.0, -14); thunder(112.5, -16); [place(sfx, thud(0.2, 600), 110.9 + k * 0.5, db(-24)) for k in range(3)]
# chapter 2
waves(113.1, 118.0, -26); paddle(113.1, 118.0, -22); cannon(116.65, -6); splash_snd(117.2, -10); horn(114.5, 1.6, -22)
creak_ship(118.1, -20); [place(sfx, step(), 118.2 + k * 0.18, db(-18)) for k in range(8)]; gasp(118.3, -16); place(sfx, thud(0.3, 300), 118.8, db(-16))
paper(119.7, -26); [place(sfx, whoosh(0.8, 400, 2500), at, db(-22)) for at in [121.6, 122.0]]; bed(gfire, 123.0, 124.4, -26)
volley_snd(122.9, 9, -10); volley_snd(124.1, 8, -10); booms([123.0, 124.0], -6); scream(122.4, 125.0, -28)
candle(125.0, 127.6, -34); paper(125.3, -20); gasp(125.7, -14); heart(125.8, 127.5, -22)
candle(127.6, 130.5, -28); [place(sfx, thud(0.1, 900), 128.3 + k * 0.6, db(-28)) for k in range(3)]
waves(130.5, 133.9, -24); paddle(130.5, 133.9, -26); [place(sfx, whoosh(0.4, 300, 2000), 130.8 + k * 0.5, db(-28)) for k in range(6)]; scream(132.6, 133.9, -32)
scream(133.9, 136.5, -22); [place(sfx, step(), 134.0 + k * 0.15, db(-20)) for k in range(16)]; volley_snd(135.2, 4, -16)
candle(136.5, 141.7, -36); stamp_snd(138.15, -4); paper(137.0, -22)
paper(141.7, -26); [place(sfx, whoosh(0.5, 500, 3000), at, db(-24)) for at in [144.5, 145.1]]
crowd(146.8, 150.7, -32); chime(147.0, 2, -26)
pen(150.8, 152.9, -14); place(sfx, thud(0.2, 900), 153.0, db(-18))
stomps(154.0, 159.1, 0.5, -16); march_drum(154.0, 159.1, -18, 0.5); wind(154.0, 159.1, -30)
[gun1860(159.4 + i * 0.8, -4) for i in range(4)]; sting(160.4, -6)
[place(sfx, step(), 165.0 + k * 0.17, db(-20)) for k in range(22)]; scream(165.0, 169.5, -24); [place(amb, thud(0.3, 140), 166.5 + k * 0.33, db(-24)) for k in range(6)]
waves(169.5, 174.3, -28); paddle(169.5, 174.3, -26); horn(170.8, 3.0, -16); bed(gwind, 169.5, 174.3, -26)
waves(174.3, 180.7, -24); [cannon(at, -4) for at in [176.0, 177.0, 178.4, 178.9]]; splashes([176.6, 177.8, 178.6, 179.4], -10); sting(178.4, -10)
waves(180.7, 183.0, -24); crowd(180.7, 183.0, -26, True); whistle(181.0, 0.8, -16); [place(sfx, whoosh(0.3, 1500, 6000), 181.3 + k * 0.4, db(-26)) for k in range(4)]
[cannon(at, -3) for at in [183.3, 183.6, 184.0]]; splashes([183.5, 184.3, 184.9], -8); big_blast(185.35, -2); wood_crash(185.35, -4); creak_ship(185.6, -12); bed(gfire, 185.4, 187.0, -18)
cheer(187.0, 190.2, -16); waves(187.0, 190.2, -30)
bed(gfire, 190.2, 194.1, -16); bubble(190.4, 194.0, -24); creak_ship(191.0, -16); creak_ship(192.8, -18); [place(sfx, thud(0.6, 200), at, db(-16)) for at in [190.8, 192.3]]
waves(194.1, 198.3, -28); wind(194.1, 198.3, -28); cart(194.3, 198.0, -30); birds(194, 198, 3, -34)
wind(198.3, 201.7, -26); [place(sfx, whoosh(0.3, 1500, 5000), 198.4 + k * 0.12, db(-30)) for k in range(8)]
insects(201.7, 207.5, -32); place(sfx, bell(294), 202.0, db(-28)); place(sfx, bell(294), 204.6, db(-30)); wind(201.7, 207.5, -32)
paper(207.5, -26); [place(sfx, whoosh(0.7, 400, 3000), at, db(-22)) for at in [208.8, 209.0, 209.2]]; place(sfx, clink(209.6) if False else thud(0.2, 1200), 210.3, db(-20))
wind(210.4, 216.1, -30); [place(sfx, thud(0.25, 500), 214.0 + k * 0.15, db(-20)) for k in range(4)]; clink(214.8, -14)
candle(216.1, 220.3, -34); crowd(216.1, 220.3, -34); [place(sfx, thud(0.1, 900), 217.2 + k * 0.4, db(-28)) for k in range(3)]
# chapter 3
waves(220.3, 227.9, -22); paddle(220.3, 227.9, -26); crowd(220.3, 227.9, -32); [place(sfx, whoosh(0.5, 200, 900), 220.5 + k * 0.9, db(-28)) for k in range(8)]
scream(227.9, 230.2, -20); [place(sfx, step(), 228.0 + k * 0.14, db(-18)) for k in range(14)]; splashes([228.1, 228.5], -18)
frogs(230.2, 236.1, 10, -26); insects(230.2, 236.1, -26); [place(sfx, whoosh(0.6, 200, 900), 230.6 + k * 1.1, db(-24)) for k in range(5)]; buzz(231.0, 235.5, -32)
shovel(236.1, 239.5, -14); insects(236.1, 239.5, -34)
wind(239.5, 242.8, -28); [place(sfx, thud(0.3, 300), 240.0, db(-22))]; creak_ship(240.5, -30)
bed(gfire, 242.8, 248.3, -24); crowd(242.8, 248.3, -32); birds(243, 248, 4, -32); harp(243.0, 248.2, [CM, FM], db(-26), 0.2)
rocket(248.4, 1.6, -12); [whistle_in(at, 0.8, -14) for at in [249.0, 249.7, 250.3]]; big_blast(249.0, -4); booms([249.7, 250.3], -4); scream(249.1, 251.0, -22)
volley_snd(251.6, 8, -8); booms([252.4, 253.4], -5); scream(251.0, 255.1, -18); mg(252.0, 254.5, -22, 7)
scream(255.1, 258.7, -16); [place(sfx, step(), 255.2 + k * 0.13, db(-16)) for k in range(26)]
[gun1860(258.8 + i * 0.4, -3) for i in range(4)]; booms([259.3, 259.7, 260.1, 260.5], -8); [place(sfx, thud(0.35, 260), 259.4 + i * 0.4, db(-14)) for i in range(4)]
wind(261.3, 265.5, -24); crow(262.0, -24); crow(263.4, -26); crow(264.6, -28); bed(gfire, 261.3, 265.5, -30)
rain(265.5, 270.1, -20); [place(sfx, thud(0.3, 200), 265.8 + k * 1.3, db(-18)) for k in range(4)]; [place(sfx, whoosh(0.5, 150, 600), 266.0 + k * 1.3, db(-22)) for k in range(4)]
wind(270.1, 273.9, -28); birds(270, 273.5, 4, -32); sting(272.3, -12)
waves(273.9, 277.6, -28); [cannon(at, -5) for at in [275.2, 275.8, 276.4, 276.8, 277.4]]; booms([275.8, 276.4, 277.0, 277.6], -10)
stomps(277.6, 280.9, 0.5, -14); march_drum(277.6, 280.9, -16, 0.5); drum_roll(279.5, 280.9, -20)
[gun1860(281.1 + i * 0.5, -2) for i in range(4)]; scream(281.3, 283.6, -24)
volley_snd(284.6, 14, -8); volley_snd(285.6, 14, -8); booms([285.0, 285.7, 286.4], -6); [place(sfx, thud(0.35, 260), at, db(-14)) for at in [285.0, 285.6, 286.1]]
volley_snd(288.0, 6, -10); [place(sfx, thud(0.2, 600), 287.2 + k * 0.3, db(-20)) for k in range(4)]; place(sfx, thud(0.4, 220), 288.3, db(-12)); gasp(287.5, -14)
cheer(290.8, 293.6, -12); [musket(291.2 + k * 0.5, -16) for k in range(4)]
wind(293.6, 296.7, -24); crow(294.5, -26); bed(gfire, 293.6, 296.7, -30)
[tear(296.8 + k * 0.5, -18) for k in range(8)]; tick(296.7, 300.7, -24)
rain(300.7, 303.0, -16); thunder(301.8, -16); breath(300.9, 303.0, -20)
rain(303.0, 306.2, -18); thunder(303.4, -6); thunder(304.7, -8); heart(303.2, 306.1, -16)
waves(306.2, 311.1, -26); birds(306, 311, 4, -32); sting(308.9, -10); bell(0) if False else place(sfx, bell(262), 307.0, db(-28))
paper(311.2, -26); place(sfx, whoosh(0.6, 400, 3000), 312.4, db(-22))
waves(316.1, 319.2, -24); [place(sfx, clank(0) if False else thud(0.12, 1500), 316.2 + k * 0.4, db(-26)) for k in range(6)]; volley_snd(316.6, 14, -10); splashes([317.1, 317.9, 318.5], -8); ricochet(318.1, -12)
[gun1860(319.7 + i * 0.9, -4) for i in range(3)]; booms([320.4, 321.2, 322.0, 322.8], -8); [rocket(320.0 + k * 1.6, 1.0, -26) for k in range(2)]; frogs(319.2, 323.7, 5, -32)
candle(323.7, 327.0, -30); cough(324.3, -16); cough(325.8, -18); place(sfx, thud(0.3, 300), 326.4, db(-26)); breath(324.0, 327.0, -24)
rain(327.0, 331.5, -16); [clink(327.4 + k * 0.7, -24) for k in range(4)]; bed(gfire, 327.0, 331.5, -32)
# chapter 4
[place(sfx, step(), 331.6 + k * 0.5, db(-20)) for k in range(5)]; [place(sfx, thud(0.15, 600), 332.85 + k * 0.05, db(-18)) for k in range(5)]; wind(331.5, 334.3, -30); drum_roll(331.6, 332.8, -22)
wind(334.3, 337.5, -30); sting(336.4, -12)
stomps(337.5, 339.7, 0.5, -14); march_drum(337.5, 339.7, -18, 0.5); whistle(337.7, 0.6, -18)
wind(339.7, 342.8, -22); [place(sfx, whoosh(1.2, 200, 1200), 339.8 + k * 1.0, db(-24)) for k in range(3)]; gasp(340.2, -20)
waves(342.8, 346.8, -24); paddle(342.8, 346.8, -24); volley_snd(343.2, 14, -12); volley_snd(344.8, 14, -12); [cannon(at, -5) for at in [343.6, 344.1]]; splashes([344.0, 345.0, 345.6], -10)
bed(gfire, 346.8, 350.0, -24); [place(sfx, whoosh(0.4, 600, 3000), 347.4 + k * 0.5, db(-28)) for k in range(3)]; cheer(349.1, 350.0, -14)
paper(350.0, -26); place(sfx, whoosh(1.4, 400, 2500), 351.7, db(-20))
[place(sfx, thud(0.18, 400), 356.7 + k * 0.17, db(-16)) for k in range(26)]; scream(356.8, 362.3, -18); volley_snd(361.2, 6, -8); booms([362.0], -6)
volley_snd(362.5, 14, -14); volley_snd(363.2, 14, -14); booms([362.8, 363.1, 363.4, 363.7], -10)
rain(363.9, 367.9, -24); [place(sfx, step(), 364.0 + k * 0.7, db(-24)) for k in range(6)]; cough(365.8, -22)
stomps(367.9, 374.2, 0.5, -14); march_drum(367.9, 374.2, -16, 0.5); place(sfx, bell(294), 369.0, db(-24)); place(sfx, bell(392), 371.5, db(-26))
birds(374.2, 376.8, 6, -28); harp(374.3, 376.8, [CM, GM], db(-24), 0.16); crowd(374.2, 376.8, -30, True)
fire_bed(376.8, 380.2, -20); frogs(376.8, 380.2, 5, -30); heart(377.0, 380.2, -24)
paper(380.2, -26); place(sfx, whoosh(1.0, 400, 2500), 381.5, db(-22)); place(sfx, whoosh(1.4, 400, 2500), 382.8, db(-22))
[place(sfx, step(), 384.0 + k * 0.5, db(-24)) for k in range(4)]; wind(384.0, 385.8, -28)
fire_bed(385.8, 389.9, -26); wind(385.8, 389.9, -30); cough(387.0, -22)
wind(389.9, 392.9, -22); bed(gfire, 389.9, 392.9, -28); crow(391.0, -28)
cart(392.9, 395.6, -22); [place(sfx, step(), 393.0 + k * 0.3, db(-26)) for k in range(9)]
candle(395.6, 397.4, -32); place(sfx, whoosh(0.3, 1500, 5000), 396.0, db(-28))
birds(397.4, 400.3, 5, -30); shovel(397.5, 400.3, -18); wind(397.4, 400.3, -32)
[clink(400.6 + k * 0.6, -22) for k in range(5)]; [place(sfx, thud(0.2, 500), 400.9 + k * 0.6, db(-24)) for k in range(5)]; heart(403.5, 406.6, -20)
drum_roll(406.7, 408.2, -20); [place(sfx, thud(0.15, 600), 407.0 + k * 0.05, db(-18)) for k in range(4)]; wind(406.7, 414.9, -30); chime(412.2, 2, -26)
[place(sfx, step(), 415.0 + k * 0.3, db(-20)) for k in range(10)]; insects(415.0, 417.9, -28); birds(415, 417.8, 4, -32)
fire_bed(417.9, 424.2, -14); wind(417.9, 424.2, -22); sting(420.7, -8)
fire_bed(424.2, 428.6, -22); heart(424.3, 432.5, -16); wind(424.2, 432.5, -28)
breath(428.7, 432.5, -18)
wind(432.5, 437.7, -28); [place(sfx, thud(0.2, 900), 435.2 + k * 0.25, db(-28)) for k in range(4)]
rain(437.7, 441.2, -18); waves(437.7, 441.2, -26); bed(gfire, 437.7, 441.2, -28); splashes([438.2, 439.4, 440.4], -26)
birds(441.2, 444.5, 6, -30); wind(441.2, 444.5, -32); sting(441.5, -8)
[place(sfx, step(), 444.6 + k * 0.15, db(-18)) for k in range(26)]; scream(444.8, 449.3, -26); splashes([446.0, 446.8], -22)
fire_bed(449.3, 452.1, -30); gasp(450.2, -12); heart(450.3, 452.1, -18)
[musket(at, -6) for at in [452.4, 452.55, 452.7, 453.2, 453.35, 453.5]]; splashes([452.6, 453.3], -16); place(sfx, thud(0.4, 220), 453.1, db(-12))
waves(454.3, 459.6, -26); [place(sfx, step(), 454.5 + k * 0.25, db(-22)) for k in range(8)]; musket(457.4, -4); heart(455.0, 457.4, -16); place(sfx, splash_snd and thud(0.2, 900), 457.6, db(-20)); splash_snd(457.55, -16)
wind(459.6, 464.4, -26); [place(sfx, thud(0.3, 300), 460.6 + k * 0.4, db(-20)) for k in range(4)]; place(sfx, bell(262), 460.2, db(-26))
birds(464.4, 468.8, 10, -26); waves(464.4, 468.8, -30); place(sfx, thud(0.3, 300), 465.5, db(-20)); sting(466.2, -12)
waves(468.8, 473.6, -26); horn(469.0, 2.4, -24); creak_ship(470.0, -26); [place(sfx, thud(0.2, 400), 469.3 + k * 0.7, db(-24)) for k in range(6)]
wind(473.6, 477.3, -22); bed(gwind, 473.6, 477.3, -26); [place(sfx, step(), 473.8 + k * 0.6, db(-28)) for k in range(6)]
candle(477.3, 479.5, -32); coins_snd(477.5, 479.4, -18); place(sfx, thud(0.3, 300), 479.2, db(-18))
waves(479.5, 482.4, -28); wind(479.5, 482.4, -26); creak_ship(480.3, -24); bed(gfire, 479.5, 482.4, -30)
candle(482.4, 486.0, -26); place(sfx, bell(220), 482.8, db(-24)); breath(483.0, 486.0, -26)
candle(486.0, 490.3, -34); [paper(486.4 + k * 0.9, -26) for k in range(4)]; crowd(486.0, 490.3, -34)
wind(490.3, 493.5, -26); bed(gfire, 490.3, 493.5, -28)
crowd(493.5, 496.6, -38); [place(sfx, thud(0.2, 500), 493.7 + k * 0.25, db(-24)) for k in range(3)]; paper(494.3, -20); gasp(494.5, -18)
coins_snd(496.6, 499.2, -14); [paper(497.0 + k * 0.6, -24) for k in range(3)]
stomps(499.2, 502.5, 0.5, -14); march_drum(499.2, 502.5, -16, 0.5); cheer(499.4, 502.5, -26)
candle(502.5, 507.7, -32); bed(gwind, 502.5, 507.7, -34); place(sfx, bell(196), 504.2, db(-28))
crowd(507.7, 513.5, -22); wind(507.7, 513.5, -28)
wind(513.5, 517.6, -20); [place(sfx, whoosh(1.0, 300, 2000), 513.8 + k * 1.0, db(-26)) for k in range(4)]
paper(517.7, -26); [place(sfx, whoosh(0.5, 500, 3000), at, db(-26)) for at in [518.6, 518.9, 519.2, 519.5]]
waves(521.5, 524.6, -28); birds(521.5, 524.6, 5, -32); insects(521.5, 524.6, -34)
wind(524.6, 527.3, -30); waves(524.6, 527.3, -32)
candle(527.3, 530.5, -34); slap(528.3, -4); [paper(528.35 + k * 0.05, -20) for k in range(3)]
[place(sfx, whoosh(0.8, 300, 2000), at, db(-22)) for at in [530.7, 530.9, 531.2]]; booms([531.6, 531.9, 532.2], -14)
wind(533.1, 538.7, -24); heart(533.5, 538.6, -22)
waves(538.7, 541.0, -30); birds(538.7, 541, 5, -30); bed(gwind, 538.7, 541.0, -32)
waves(541.0, DUR, -24); birds(541, 544.8, 6, -30)

# ================= score (C minor; harp for Paraguay; C major at the end of the war and at the close) =================
pad([D2, A2, D3], 0, 12.3, db(-24), 1.0, 500); harp(0.2, 5.3, [Dm, BbM], db(-24), 0.22); [timp(5.4 + k * 0.9, db(-19), 46) for k in range(6)]
progression(12.3, 24.8, db(-25), 2.0); for_ = [piano(14.9 + dt, f, db(-22)) for dt, f in theme]
progression(24.8, 35.1, db(-24), 1.5, 1300, (Dm, BbM, Gm, Am)); ostinato(24.8, 34.9, D3, db(-27), 0.25); snare(24.8, 28.4, db(-24), 0.25)
pad([D2, A2, D3, F3], 35.1, 37.2, db(-26), 0.6, 500)
pad(DM + [A3], 37.2, 46.7, db(-22), 1.0, 1400); [strings(38.5 + dt, f, L, db(-23)) for dt, f, L in [(0, D4, 1.4), (1.4, Fs4, 1.4), (2.8, A4, 3.0)]]; harp(37.3, 46.6, [DM, GM, AM, DM], db(-25), 0.19)
progression(46.7, 51.8, db(-25), 1.25, 1200, (Dm, BbM, FM, Am))
pad([D2, A2, D3, F3], 51.8, 76.3, db(-27), 2.0, 600)
for s0 in [52.0, 66.5]:
    for dt, f, L in lament: strings(s0 + dt, f, L, db(-25))
harp(76.3, 89.8, [Dm, Gm, Am, Dm], db(-24), 0.2); pad([D2, A2, D3], 76.3, 89.8, db(-28), 1.5, 500); [timp(82.5 + k * 1.0, db(-20)) for k in range(4)]
progression(89.8, 103.0, db(-26), 2.0, 900, (Dm, Gm, Am, Dm)); snare(96.2, 103.0, db(-26)); [timp(98.7 + k * 0.8, db(-19)) for k in range(5)]
pad([D2, A2, D3], 103.0, 113.1, db(-26), 1.5, 500); ostinato(107.5, 113.0, D3, db(-27), 0.2)
progression(113.1, 141.7, db(-26), 2.0, 900, (Dm, BbM, FM, Am)); ostinato(119.7, 125.0, D3, db(-27), 0.2); [timp(130.6 + k * 0.7, db(-20)) for k in range(5)]
pad([D2, A2, D3, F3], 141.7, 154.0, db(-26), 1.5, 600); for_ = [piano(147.0 + dt, f, db(-23)) for dt, f in theme]
progression(154.0, 169.5, db(-23), 1.5, 1500, (DM, GM, AM, DM)); snare(154.0, 159.1, db(-24), 0.25); [timp(159.4 + k * 0.8, db(-17)) for k in range(4)]
pad([D2, A2, D3], 169.5, 180.7, db(-25), 1.5, 500); ostinato(169.6, 180.7, D3, db(-26), 0.18); [timp(174.4 + k * 0.6, db(-18)) for k in range(10)]
progression(180.7, 190.2, db(-24), 1.5, 1300); ostinato(180.7, 187.0, D3, db(-26), 0.15); progression(187.0, 190.2, db(-22), 1.0, 1800, (DM, AM))
pad([D2, A2, D3, F3], 190.2, 216.1, db(-27), 2.0, 600)
for dt, f, L in lament: strings(194.2 + dt, f, L, db(-26))
ostinato(207.5, 214.5, D3, db(-27), 0.2); progression(214.5, 220.3, db(-23), 1.2, 1600, (DM, GM, AM))
progression(220.3, 230.2, db(-24), 1.5, 1300, (Dm, BbM, Gm, Am)); snare(220.3, 230.0, db(-27), 0.3)
pad([D2, A2, D3], 230.2, 242.8, db(-27), 2.0, 500); harp(236.2, 242.8, [Dm, Am], db(-27), 0.2)
pad([D2, A2, D3, F3], 248.3, 265.5, db(-25), 1.0, 700); ostinato(248.3, 261.3, D3, db(-26), 0.15); [timp(248.4 + k * 0.6, db(-17)) for k in range(21)]
for dt, f, L in lament: strings(261.4 + dt * 0.6, f, L * 0.7, db(-24))
pad([D2, A2, D3], 265.5, 283.7, db(-26), 1.5, 500); ostinato(273.9, 283.7, D3, db(-27), 0.2); [timp(277.7 + k * 0.5, db(-19)) for k in range(6)]
progression(283.7, 296.7, db(-25), 1.5, 1200, (Dm, Gm, Am, Dm)); harp(290.9, 293.6, [DM, AM], db(-24), 0.15)
pad([D2, A2, D3, F3], 296.7, 323.7, db(-27), 2.0, 600); [timp(303.2 + k * 0.8, db(-18), 41) for k in range(4)]
for dt, f, L in lament: strings(306.5 + dt, f, L, db(-26))
pad([D2, A2, D3], 323.7, 331.5, db(-27), 1.5, 500)
for dt, f, L in lament[:4]: strings(324.0 + dt, f, L, db(-26))
progression(331.5, 342.8, db(-24), 1.5, 1500, (DM, GM, AM, DM)); snare(337.5, 339.7, db(-25), 0.25)
pad([D2, A2, D3], 342.8, 350.0, db(-26), 1.0, 500); ostinato(342.8, 349.0, D3, db(-27), 0.18); progression(349.0, 356.6, db(-22), 1.5, 1700, (DM, GM, AM, DM))
progression(356.6, 367.9, db(-24), 1.2, 1300, (Dm, BbM, Gm, Am)); [timp(356.7 + k * 0.6, db(-18)) for k in range(12)]
progression(367.9, 376.8, db(-23), 1.5, 1600, (DM, GM, AM, DM))
pad([D2, A2, D3, F3], 376.8, 406.7, db(-27), 2.0, 600); harp(380.3, 392.9, [Dm, Am, Gm, Am], db(-27), 0.24)
for dt, f, L in lament: strings(392.9 + dt, f, L, db(-25))
progression(406.7, 417.9, db(-25), 2.0, 1100, (FM, CM, Dm, BbM))
pad([D2, A2, D3], 417.9, 437.7, db(-26), 2.0, 500)
for dt, f, L in lament: strings(424.3 + dt * 0.95, f, L, db(-24))
ostinato(437.7, 441.2, D3, db(-27), 0.2); pad([D2, A2, D3, F3], 437.7, 452.1, db(-26), 1.0, 600); [timp(444.6 + k * 0.6, db(-18)) for k in range(12)]
pad([D2, A2], 452.1, 464.4, db(-25), 1.0, 400); [timp(454.5 + k * 0.85, db(-19), 41) for k in range(4)]
pad(DM + [A3, D4], 464.4, 473.6, db(-22), 2.0, 1800); [strings(465.0 + dt, f, L, db(-23)) for dt, f, L in [(0.5, Fs4, 2.0), (2.5, A4, 2.0), (4.5, D4 * 2, 2.8)]]
pad([D2, A2, D3, F3], 473.6, 507.7, db(-28), 2.0, 600)
for s0 in [477.4, 493.6]:
    for dt, f, L in lament: strings(s0 + dt, f, L, db(-25))
progression(507.7, 524.6, db(-26), 2.0, 1100, (Dm, BbM, FM, Am)); for_ = [piano(513.7 + dt, f, db(-23)) for dt, f in theme]
pad([D2, A2, D3, F3], 524.6, 538.7, db(-27), 2.0, 600); harp(524.7, 538.6, [Dm, BbM, Gm, Am], db(-27), 0.24)
pad(DM + [A3, D4], 538.7, DUR, db(-21), 1.5, 1800); harp(538.8, DUR - 0.6, [DM, GM, DM], db(-23), 0.2); piano(539.2, D4, db(-20), 4); piano(540.6, Fs4, db(-21), 4); piano(542.0, A4, db(-21), 3)
# ================= voice + mix =================
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64); v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
e = lp(np.abs(v), 4); e /= e.max() + 1e-9; duck = 1 - 0.55 * np.clip(e * 3, 0, 1)
def stereo(d):  # rebuild a bus in stereo from its panned placements (constant-power), plus what was added directly
    L = np.zeros(N); R = np.zeros(N); placed = np.zeros(N)
    for i, n, x, p in PANS.get(id(d), []):
        a = (p + 1) * np.pi / 4; L[i:i + n] += x * np.cos(a) * 1.414; R[i:i + n] += x * np.sin(a) * 1.414; placed[i:i + n] += x
    rest = d - placed; return L + rest, R + rest
aL, aR = stereo(amb); sL, sR = stereo(sfx); sd = 1 - 0.35 * np.clip(e * 3, 0, 1)
mixL = v + (aL + mus * db(3)) * duck + sL * db(-6) * sd; mixR = v + (aR + mus * db(3)) * duck + sR * db(-6) * sd
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); mixL /= max(1.0, pk / 0.97); mixR /= max(1.0, pk / 0.97)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mixL, mixR], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", round(N / SR, 2))
