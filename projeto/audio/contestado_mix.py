# Trilha, ambiente e efeitos do vídeo "A Guerra do Contestado" (16:9, 635,6 s). Tempos = palavras de src/videos/contestado/tempos_palavras.txt.
# uso: python3 audio/contestado_mix.py public/contestado_narracao.mp3 out/contestado/mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 635.64; N = int(DUR * SR); rng = np.random.default_rng(23); t = np.arange(N, dtype=np.float32) / SR
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
# transpose the score to A minor (own key for this film), A major at the close
_K = 2 ** (-5 / 12)
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

def viola(at, f, g, L=1.6):  # plucked caipira guitar: paired strings (octave course) with a bright, fast-decaying attack
    n = int(L * SR); tt = np.arange(n) / SR; det = 1.003
    x = sum(a * (np.sin(2 * np.pi * f * m * tt) + 0.5 * np.sin(2 * np.pi * f * m * det * 2 * tt)) * np.exp(-tt / d) for m, a, d in [(1, 1, 0.7), (2, 0.5, 0.35), (3, 0.3, 0.2), (4, 0.18, 0.12), (5, 0.1, 0.08)])
    place(mus, norm(x) * np.minimum(1, tt / 0.003), at, g)
def rasgueado(a, b, chord, g, beat=0.62):  # strummed chords, downstroke on the beat, upstroke off it
    k = 0
    while a + k * beat < b:
        for j, f in enumerate(chord): viola(a + k * beat + j * 0.018, f * 2, g * (1 if k % 2 == 0 else 0.55), 1.2)
        k += 1
modinha = [(0, D4, 0.9), (0.9, F4, 0.45), (1.35, E4, 0.45), (1.8, D4, 0.9), (2.7, C4, 0.45), (3.15, A3, 1.35), (4.8, Bb3, 0.45), (5.25, C4, 0.45), (5.7, D4, 0.9), (6.6, E4, 0.45), (7.05, F4, 0.45), (7.5, E4, 0.6), (8.1, D4, 1.8)]
def tema(a, g, sp=1.0):
    for dt, f, L in modinha: viola(a + dt * sp, f, g, L * sp + 0.8)
def axe(at, g=-14):  # axe bite into wood
    n = int(0.35 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 400, 3000) * np.exp(-tt / 0.04) + 0.6 * np.sin(2 * np.pi * rng.uniform(180, 260) * tt) * np.exp(-tt / 0.06)), at, db(g))
def treefall(at, g=-8):  # creak, swish, crash
    n = int(1.2 * SR); tt = np.arange(n) / SR; place(sfx, np.sin(2 * np.pi * (120 + 60 * tt) * tt + 4 * np.sin(2 * np.pi * 7 * tt)) * senv(n, 0.3, 0.3) * 0.4, at - 1.1, db(g - 6))
    place(sfx, whoosh(0.8, 300, 2500), at - 0.5, db(g - 4)); place(sfx, boom(2.0), at, db(g)); debris_rain(at + 0.1, 1.2, 30, g - 10)
def hammer_hits(a, b, period, g=-16, f=1800):
    k = 0
    while a + k * period < b: place(sfx, thud(0.15, f), a + k * period, db(g)); k += 1
def steam(at, L=1.2, g=-18): n = int(L * SR); tt = np.arange(n) / SR; place(sfx, norm(hp(rng.standard_normal(n), 2500)) * senv(n, 0.05, 0.5), at, db(g))
def loco_whistle(at, L=1.4, g=-14): n = int(L * SR); tt = np.arange(n) / SR; place(sfx, lp(sum(np.sin(2 * np.pi * f * tt) for f in [440, 554, 659]) + 0.3 * bp(rng.standard_normal(n), 400, 2000), 2500) * senv(n, 0.08, 0.3) * 0.5, at, db(g))
def chuff(a, b, g=-18, rate=3.0):  # steam locomotive exhaust beats
    k = 0
    while a + k / rate < b: n = int(0.25 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 300, 3000)) * np.exp(-tt / 0.07), a + k / rate, db(g - (k % 2) * 3)); k += 1
def hooves(a, b, g=-18, rate=6):
    k = 0
    while a + k / rate < b: place(sfx, thud(0.12, 700), a + k / rate + rng.uniform(0, 0.03), db(g - rng.uniform(0, 5))); k += 1
def rooster(at, g=-28): n = int(1.0 * SR); tt = np.arange(n) / SR; f = 700 + 500 * np.sin(np.pi * np.clip(tt / 0.9, 0, 1)) ; place(amb, norm(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(f) / SR)) * senv(n, 0.05, 0.2), at, db(g))
def hen(a, b, g=-32):
    k = 0
    while a + k * 0.5 < b: n = int(0.12 * SR); tt = np.arange(n) / SR; place(amb, np.sin(2 * np.pi * rng.uniform(600, 900) * tt) * np.hanning(n), a + k * 0.5 + rng.uniform(0, 0.3), db(g)); k += 1
def saw(a, b, g=-22): n = int((b - a) * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(np.sign(np.sin(2 * np.pi * 95 * tt)) + 0.4 * rng.standard_normal(n), 800, 5000)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tt)) * senv(n, 0.3, 0.3), a, db(g))
def pray(a, b, g=-30):  # low murmured prayer
    n, tt = seg(a, b); x = bp(rng.standard_normal(n), 150, 700) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 2.2 * tt))); place(amb, norm(x) * senv(n, 0.6, 0.6), a, db(g))
def door_kick(at, g=-6): place(sfx, thud(0.5, 300), at, db(g)); place(sfx, whoosh(0.2, 1500, 6000), at, db(g - 8))
def volley(at, n=6, g=-10):
    for k in range(n): place(sfx, shot(), at + rng.uniform(0, 0.18), db(g - rng.uniform(0, 5)))
# ================= events (absolute seconds, from the shot list) =================
# hook: the family, the company, the soldiers
wind(0, 4.4, -32); birds(0, 4.4, 6, -30); rooster(0.6, -30); hen(0.4, 4.2)
wind(4.4, 9.7, -32); birds(4.4, 9.7, 3, -34); [place(sfx, thud(0.18, 1400), 6.9 + k * 0.62, db(-12)) for k in range(3)]; stamp_snd(8.15, -8)
[place(sfx, thud(0.15, 1800), 10.9 + k * 0.36, db(-16)) for k in range(5)]; [place(sfx, step(), 10.05 + k * 0.18, db(-24)) for k in range(4)]
wind(12.2, 16.3, -30); place(sfx, whoosh(0.4), 13.7, db(-20))
stomps(16.33, 18.2, 0.5, -12); whistle(16.4, 0.6, -18); stomps(18.2, 21.4, 0.55, -20); door_kick(19.95, -12); crowd(18.2, 21.4, -32)
place(sfx, whoosh(1.2, 200, 2000), 23.6, db(-14)); stamp_snd(24.75, -6)
fire_bed(25.67, 28.9, -22); bed(gwind, 25.6, 28.9, -26)
volley(29.5, 5, -16); place(sfx, boom(), 31.6, db(-4)); place(sfx, boom(), 32.4, db(-8)); incoming(30.9, 31.6, -16); crowd(28.9, 34.0, -30, True)
place(sfx, whoosh(0.4, 600, 4000), 33.9, db(-16)); stamp_snd(34.5, -8)
wind(37.9, 45.2, -32)
paper(45.4, -20); paper(46.2, -20); tear(46.9, -14)
incoming(48.2, 48.8, -12); big_blast(48.8, -2); place(sfx, boom(), 49.5, db(-6)); scream(47.9, 50.5, -26)
stomps(50.58, 54.4, 0.5, -12); bed(gwind, 50.5, 54.4, -30)
fire_bed(54.43, 58.9, -26); wind(54.4, 58.9, -36)
place(sfx, whoosh(1.6, 200, 2500), 59.6, db(-16)); tick(60.2, 62.4, -22); hooves(58.9, 63.2, -26, 4)
paper(63.4, -22); stamp_snd(66.9, -18); stamp_snd(67.8, -18)
[place(sfx, thud(0.2, 600), at, db(-16)) for at in [70.2, 71.1, 72.0, 72.6]]; sting(74.5, -8)
crowd(75.7, 78.8, -30); place(sfx, thud(0.4, 220), 77.55, db(-6))
wind(78.9, 81.9, -30); birds(78.9, 81.9, 4, -32); hen(79.0, 81.8, -36)
wind(81.9, 92.3, -34); [place(sfx, thud(0.2, 300), 85.2 + k * 0.72, db(-20)) for k in range(2)]; hooves(86.4, 87.5, -22, 3); hen(86.4, 87.5, -30)
place(sfx, thud(0.3, 300), 91.5, db(-12)); birds(92.4, 96.9, 3, -34)
hammer_hits(97.1, 101.4, 0.31, -18); [place(sfx, clang(), 98.25 + k * 1.1, db(-26)) for k in range(3)]
crowd(101.5, 104.4, -34); stamp_snd(103.4, -14); pen(108.4, 110.0, -14); paper(110.2, -22)
loco_whistle(112.7, 1.6, -12); chuff(112.7, 115.8, -16, 2.5); steam(115.6, 1.4, -18); cheer(113.2, 116.5, -22)
heart(116.6, 120.4, -20); stamp_snd(117.4, -20)
paper(121.2, -22); [place(sfx, thud(0.15, 1600), 125.0 + k * 0.33, db(-14)) for k in range(5)]; wind(124.7, 132.3, -32)
wind(132.4, 138.5, -32); [place(sfx, thud(0.2, 300), 133.0 + k * 0.91, db(-22)) for k in range(6)]
door_kick(139.0, -4); scream(139.1, 140.6, -26)
hammer_hits(144.9, 145.9, 0.5, -22); place(sfx, clang(), 145.95, db(-6)); loco_whistle(147.2, 1.8, -16); chuff(147.0, 152.2, -18, 3.4)
[place(sfx, thud(0.2, 500), 150.85 + k * 0.08, db(-16)) for k in range(12)]
rain(152.2, 156.6, -22); thunder(153.0, -18)
saw(156.6, 164.9, -26); chuff(157.0, 160.0, -30, 2); birds(161.6, 164.9, 5, -32); wind(161.6, 164.9, -28)
[axe(164.95 + k * 0.28, -14) for k in range(2)]; treefall(166.4, -6); treefall(167.0, -12); treefall(167.6, -14)
loco_whistle(167.3, 1.2, -12); chuff(167.3, 170.3, -12, 5); [place(sfx, thud(0.12, 900), 167.4 + k * 0.21, db(-20)) for k in range(14)]
wind(170.3, 174.6, -24)
fire_bed(174.6, 176.6, -20); crowd(174.6, 176.6, -26); crowd(176.6, 182.6, -36, True); wind(176.6, 182.6, -34)
# José Maria
wind(182.6, 188.6, -30); birds(183.0, 188.6, 5, -32); [place(sfx, step(), 183.0 + k * 0.55, db(-26)) for k in range(10)]
pray(191.1, 195.0, -30); [place(sfx, step(), 195.1 + k * 0.38, db(-24)) for k in range(7)]; fire_bed(197.7, 201.0, -26)
wind(201.1, 206.9, -36); cough(202.4, -24); cough(205.0, -28); place(sfx, whoosh(0.8, 200, 1500), 206.9, db(-18))
crowd(209.7, 216.8, -30); [place(sfx, step(), 209.8 + k * 0.21, db(-28)) for k in range(18)]
crowd(216.8, 219.4, -36); place(sfx, thud(0.4, 400), 219.6, db(-8)); [place(sfx, thud(0.15, 900), 217.3 + k * 0.45, db(-16)) for k in range(4)]
crowd(222.0, 224.8, -26, True); wind(224.8, 229.7, -28); stamp_snd(228.75, -8)
crowd(229.7, 233.0, -24, True); place(sfx, thud(0.4, 220), 235.45, db(-6)); crowd(233.0, 238.0, -32)
paper(238.4, -22); stamp_snd(241.5, -16); hooves(244.0, 247.8, -20, 5); [place(sfx, step(), 247.0 + k * 0.3, db(-26)) for k in range(10)]
paper(248.0, -22); stamp_snd(249.7, -16); morse(254.9, 257.0, -20); [place(sfx, step(), 256.4 + k * 0.17, db(-22)) for k in range(8)]; stamp_snd(257.1, -10)
paper(258.6, -24); place(sfx, whoosh(0.5), 262.0, db(-18)); stamp_snd(263.1, -10)
stomps(264.8, 268.3, 0.52, -12); whistle(265.0, 0.7, -16); [timp(265.0 + k * 0.52, db(-24), 46) for k in range(6)]
wind(268.3, 275.6, -28); paper(269.8, -22); sting(271.6, -6)
wind(275.6, 278.3, -26); place(sfx, thud(0.2, 900), 276.3, db(-20))
pray(278.3, 284.7, -26); bed(gwind, 278.3, 284.7, -30)
volley(285.0, 8, -8); volley(285.6, 6, -10); volley(286.3, 8, -8); scream(284.8, 288.0, -22); mg(285.2, 287.6, -16, 9)
heart(288.1, 290.9, -18); place(sfx, thud(0.5, 200), 291.0, db(-10)); place(sfx, shot(), 292.3, db(-8)); place(sfx, thud(0.5, 200), 293.0, db(-10))
clink(296.4, -18); clink(296.6, -20); crowd(296.5, 299.9, -36, True)
wind(299.97, 303.0, -30); pray(300.6, 303.0, -26)
# the legend, the redoubts
wind(302.9, 306.8, -32); pray(302.9, 306.8, -28); place(sfx, whoosh(2.0, 200, 1500), 306.8, db(-18)); hooves(309.6, 313.6, -30, 5)
chime(312.5, 2, -16); crowd(313.6, 316.8, -24, True); pray(316.8, 321.2, -26)
crowd(321.3, 327.4, -32); [place(sfx, step(), 321.4 + k * 0.25, db(-28)) for k in range(20)]; birds(321.3, 327.4, 4, -32)
wind(327.4, 334.6, -36); chime(332.3, 3, -24); crowd(336.3, 339.7, -24, True); birds(334.6, 339.7, 5, -30)
[place(sfx, step(), 339.9 + k * 0.3, db(-20)) for k in range(4)]; hammer_hits(341.6, 345.1, 0.45, -24); crowd(341.6, 354.7, -34)
fire_bed(345.1, 348.9, -30); [place(sfx, thud(0.1, 1200), 348.9 + k * 0.31, db(-22)) for k in range(6)]
pray(350.8, 354.7, -24)
wind(354.7, 359.2, -34); tick(354.7, 359.1, -26); stamp_snd(361.95, -4)
cannon(366.15, -2); cannon(366.9, -4); incoming(367.2, 367.8, -10)
big_blast(367.8, -2); place(sfx, boom(), 368.3, db(-4)); place(sfx, boom(), 368.8, db(-6)); fire_bed(367.9, 369.6, -18); scream(367.9, 369.6, -24)
[place(sfx, step(), 369.7 + k * 0.16, db(-22)) for k in range(25)]; fire_bed(369.6, 374.2, -32)
rooster(374.5, -30); crowd(375.5, 376.7, -26, True)
[place(sfx, step(), 379.1 + k * 0.14, db(-20)) for k in range(12)]; scream(379.1, 381.0, -24); fire_bed(380.9, 384.9, -10); [place(sfx, thud(0.6, 200), 381.3 + k * 0.9, db(-14)) for k in range(3)]
place(sfx, whoosh(0.6, 400, 5000), 385.0, db(-12)); place(sfx, thud(0.3, 600), 385.6, db(-10))
paper(388.4, -18); paper(388.9, -20); crowd(388.1, 392.3, -34)
bell(0) if False else place(sfx, bell(330), 392.5, db(-24)); pen(393.6, 394.6, -18)
loco_whistle(395.8, 1.6, -14); steam(396.4, 1.6, -16); stomps(396.0, 398.4, 0.5, -16)
whistle(398.6, 0.5, -20); stomps(402.8, 407.3, 0.48, -12); [timp(403.0 + k * 0.48, db(-20), 46) for k in range(9)]
mg(408.2, 409.1, -10, 12); cannon(409.2, -2); planes(410.1, 412.2, -12)
wind(412.2, 419.7, -32); birds(412.3, 419.7, 3, -36); [place(sfx, step(), 415.3 + k * 0.4, db(-28)) for k in range(10)]
volley(422.8, 4, -8); volley(423.4, 3, -10); scream(422.9, 425.0, -26); [place(sfx, thud(0.35, 260), 423.1 + k * 0.25, db(-14)) for k in range(4)]
tick(425.8, 429.5, -24); pen(426.6, 428.2, -22)
paper(430.0, -24); stomps(432.3, 434.1, 0.4, -26); place(sfx, thud(0.3, 300), 435.4, db(-10))
rain(438.2, 441.0, -24); heart(438.3, 441.0, -18)
# the end of the redoubts
rain(441.0, 450.1, -22); cough(446.0, -18); cough(447.8, -22); cough(449.0, -20)
crowd(450.1, 455.5, -32); birds(450.1, 455.5, 4, -34)
for at in [457.3, 458.05, 458.55, 459.15]: cannon(at, -3)
for at in [460.0, 460.7]: place(sfx, boom(), at, db(-4))
incoming(461.1, 461.7, -10); big_blast(461.7, -1); fire_bed(460.0, 462.9, -14); scream(460.0, 462.8, -24)
wind(462.9, 470.1, -26); fire_bed(462.9, 470.1, -30)
wind(470.1, 471.6, -28); [place(sfx, step(), 471.6 + k * 0.16, db(-22)) for k in range(14)]
rain(473.8, 475.7, -22); scream(474.4, 475.7, -26); [place(sfx, step(), 475.8 + k * 0.15, db(-20)) for k in range(30)]; place(sfx, shot(), 477.5, db(-8)); place(sfx, shot(), 478.6, db(-8))
paper(480.9, -22); [stamp_snd(481.4 + k * 0.3, -18) for k in range(6)]; fire_bed(484.3, 486.6, -30)
hooves(486.6, 492.9, -10, 8); bed(gwind, 486.6, 492.9, -26)
rain(493.0, 501.5, -20); fire_bed(493.0, 501.5, -30); cough(496.0, -20)
wind(501.5, 506.2, -30); [place(sfx, step(), 506.3 + k * 0.5, db(-24)) for k in range(14)]; fire_bed(506.2, 513.2, -32)
wind(513.2, 516.9, -22); wind(516.9, 523.4, -28); place(sfx, thud(0.4, 260), 521.9, db(-12))
place(sfx, thud(0.3, 500), 526.0, db(-12)); [place(sfx, step(), 524.0 + k * 0.2, db(-24)) for k in range(8)]
wind(527.6, 533.9, -30); birds(530, 533.9, 5, -30); tick(528.2, 529.8, -18)
pen(535.0, 537.4, -14); paper(538.4, -22); stamp_snd(540.2, -10)
wind(544.2, 550.7, -24); sting(548.85, -12)
stomps(550.75, 556.4, 0.5, -20); [timp(550.8 + k * 1.0, db(-26), 46) for k in range(5)]
wind(556.4, 562.6, -30); crow(557.4, -28); crow(559.6, -30)
paper(562.8, -24); tick(562.6, 566.0, -26); wind(566.0, 575.4, -30)
loco_whistle(575.8, 1.4, -20); chuff(575.6, 578.3, -22, 3)
rain(578.3, 581.2, -22); coins_snd(581.3, 587.0, -16)
loco_whistle(587.1, 1.0, -10); chuff(587.1, 588.9, -10, 6); saw(588.9, 591.4, -18)
birds(591.4, 598.5, 6, -30); rooster(591.8, -32); [place(sfx, thud(0.15, 1600), 591.8 + k * 0.62, db(-18)) for k in range(9)]
paper(598.6, -26); wind(598.5, 606.8, -32); [place(sfx, step(), 606.8 + k * 0.45, db(-26)) for k in range(4)]; coins_snd(609.4, 611.0, -20); place(sfx, thud(0.3, 600), 610.6, db(-16))
wind(614.3, 618.8, -30); [place(sfx, thud(0.2, 500), 616.3 + k * 0.1, db(-20)) for k in range(6)]
birds(618.8, 625.2, 6, -30); hen(619.0, 625.0, -34); wind(625.2, DUR, -30)
# ================= score (A minor; a caipira viola theme; A major at the close) =================
pad([D2, A2, D3], 0, 12.2, db(-25), 1.5, 600); tema(0.3, db(-20)); tema(9.9, db(-22), 0.9)
progression(12.2, 21.4, db(-24), 2.0, 900, (Dm, Gm, Am, Dm)); ostinato(16.3, 21.4, D3, db(-27), 0.25); [timp(16.3 + k * 0.5, db(-18)) for k in range(10)]
pad([D2, A2, D3, F3], 21.4, 25.6, db(-26), 1.5, 500); timp(24.75, db(-12), 41)
progression(25.7, 37.9, db(-24), 1.5, 1200); ostinato(28.9, 34.0, D3, db(-26), 0.2); [timp(28.9 + k * 0.6, db(-17)) for k in range(9)]
pad([D2, A2, D3], 37.9, 45.2, db(-25), 1.5, 600); [strings(38.0 + dt, f, L, db(-25)) for dt, f, L in lament[:5]]
progression(45.2, 58.9, db(-24), 1.7, 1100, (Dm, BbM, Gm, Am)); snare(50.6, 54.4, db(-25)); heart(54.6, 58.8, -22)
# the land and its people: the viola theme in the open air
pad([D2, A2, D3, F3], 58.9, 75.7, db(-27), 2.0, 600); tema(63.4, db(-22)); timp(74.5, db(-12), 41)
progression(75.7, 97.0, db(-26), 2.2, 900, (Dm, BbM, FM, CM)); rasgueado(78.9, 96.9, [D3, A3, D4, F4], db(-30)); tema(82.0, db(-23)); tema(90.2, db(-24), 0.85)
# the railway and the company: brass-like ostinato, mechanical
progression(97.0, 116.5, db(-25), 1.6, 1300, (Dm, Gm, Am, Dm)); ostinato(97.0, 112.6, D3, db(-28), 0.21); [timp(97.0 + k * 0.84, db(-22), 46) for k in range(18)]
pad([D2, A2, D3, F3], 116.5, 124.7, db(-25), 1.5, 500); [strings(116.6 + dt, f, L, db(-24)) for dt, f, L in lament[:4]]
progression(124.7, 142.6, db(-26), 2.0, 900, (Dm, BbM, Gm, Am)); [piano(132.4 + dt, f, db(-23)) for dt, f in theme]
pad([D2, A2, D3], 142.6, 156.6, db(-26), 1.5, 500); [strings(147.0 + dt * 0.7, f, L * 0.7, db(-25)) for dt, f, L in lament]
progression(156.6, 174.6, db(-25), 1.6, 1200, (Dm, Gm, Am, Dm)); ostinato(161.6, 174.6, D3, db(-28), 0.25); [timp(164.9 + k * 0.6, db(-19)) for k in range(16)]
progression(174.6, 182.6, db(-23), 1.0, 1500, (Dm, BbM, Am, Dm)); [timp(174.7 + k * 0.5, db(-16)) for k in range(16)]
# José Maria: hope — major colour, the viola again
pad(DM + [A3], 182.6, 201.0, db(-24), 2.5, 1500); tema(183.5, db(-22), 1.1); [strings(191.2 + dt, f, L, db(-26)) for dt, f, L in [(0, Fs4, 2.0), (2.0, A4, 2.0), (4.0, D4 * 2, 3.0)]]
pad([D2, A2, D3, F3], 201.0, 206.9, db(-27), 1.5, 500)
pad(DM + [A3, D4], 206.9, 224.8, db(-23), 1.5, 1600); rasgueado(209.7, 224.6, [D3, A3, D4, Fs4], db(-30)); tema(212.9, db(-22)); tema(219.0, db(-23), 0.8)
progression(224.8, 238.1, db(-25), 1.6, 1100, (Dm, Gm, Am, Dm)); ostinato(229.7, 238.0, D3, db(-28), 0.25)
pad([D2, A2, D3, F3], 238.1, 258.6, db(-27), 2.0, 600); tema(244.1, db(-24), 0.9)
progression(258.6, 268.3, db(-25), 1.4, 1100, (Dm, BbM, Gm, Am)); snare(264.8, 268.2, db(-24), 0.26)
pad([D2, A2, D3], 268.3, 278.3, db(-26), 2.0, 500); progression(278.3, 284.7, db(-24), 1.6, 1200, (Dm, FM, Gm, Am))
progression(284.7, 288.1, db(-22), 0.85, 1600, (Dm, BbM, Am, Dm)); [timp(284.8 + k * 0.42, db(-15)) for k in range(8)]
pad([D2, A2, D3, F3], 288.1, 300.0, db(-26), 2.0, 500); [strings(288.2 + dt, f, L, db(-23)) for dt, f, L in lament]
pad(DM + [A3], 300.0, 316.8, db(-25), 2.0, 1400); [strings(306.9 + dt, f, L, db(-24)) for dt, f, L in [(0, Fs4, 2.0), (2.0, A4, 2.0), (4.0, D4 * 2, 2.6)]]; timp(311.7, db(-14), 46)
# the holy redoubts — the community theme, warm
pad(DM + [A3, D4], 316.8, 354.7, db(-25), 2.0, 1400); tema(321.4, db(-23)); rasgueado(339.7, 354.6, [D3, A3, D4, Fs4], db(-29)); tema(341.7, db(-22)); tema(348.9, db(-22), 0.95)
progression(354.7, 363.3, db(-25), 2.0, 900, (Dm, BbM, Gm, Am)); timp(361.95, db(-12), 41)
progression(363.3, 376.7, db(-23), 1.2, 1300, (Dm, Gm, Am, Dm)); [timp(363.4 + k * 0.6, db(-17)) for k in range(22)]
progression(376.7, 392.3, db(-24), 1.2, 1300, (Dm, BbM, Am, Dm)); ostinato(376.7, 392.0, D3, db(-27), 0.2)
pad([D2, A2, D3, F3], 392.3, 402.8, db(-26), 1.5, 600); snare(395.8, 402.7, db(-25), 0.24)
progression(402.8, 412.2, db(-23), 1.2, 1400); ostinato(402.8, 412.0, D3, db(-26), 0.2); [timp(402.9 + k * 0.6, db(-16)) for k in range(15)]
pad([D2, A2, D3, F3], 412.2, 429.5, db(-27), 2.0, 600); ostinato(419.7, 425.6, D3, db(-28), 0.3)
progression(429.5, 441.0, db(-25), 1.8, 900, (Dm, BbM, Gm, Am)); heart(434.2, 438.0, -24)
pad([D2, A2, D3], 441.0, 455.6, db(-26), 2.0, 500); [strings(441.2 + dt, f, L, db(-24)) for dt, f, L in lament]
progression(455.6, 462.9, db(-22), 0.75, 1600, (Dm, BbM, Am, Dm)); [timp(455.7 + k * 0.38, db(-14)) for k in range(19)]
pad([D2, A2, D3, F3], 462.9, 486.6, db(-26), 2.5, 600); [strings(462.9 + dt * 1.2, f, L * 1.2, db(-23)) for dt, f, L in lament]
progression(486.6, 493.0, db(-24), 1.0, 1300, (Dm, Gm, Am, Dm)); [timp(486.7 + k * 0.5, db(-18)) for k in range(12)]
pad([D2, A2, D3, F3], 493.0, 527.6, db(-27), 2.5, 600); tema(501.6, db(-25), 1.1); [strings(513.3 + dt, f, L, db(-24)) for dt, f, L in lament]
# the end of the war and the epilogue — towards A major
pad(DM + [A3, D4], 527.6, 544.2, db(-23), 2.0, 1600); [strings(528.2 + dt, f, L, db(-24)) for dt, f, L in [(0, Fs4, 2.0), (2.0, A4, 2.0), (4.0, D4 * 2, 3.0)]]; tema(533.9, db(-24))
pad([D2, A2, D3, F3], 544.2, 575.4, db(-27), 2.0, 600); timp(548.85, db(-14), 41); [strings(556.4 + dt, f, L, db(-24)) for dt, f, L in lament]; [piano(566.0 + dt, f, db(-24)) for dt, f in theme]
progression(575.4, 591.4, db(-25), 2.0, 900, (Dm, BbM, Gm, Am)); ostinato(581.2, 591.3, D3, db(-28), 0.25)
pad(DM + [A3], 591.4, 614.3, db(-24), 2.0, 1400); tema(591.8, db(-22)); [strings(603.4 + dt, f, L, db(-25)) for dt, f, L in lament]
pad(DM + [A3, D4], 614.3, DUR, db(-22), 2.5, 1800); rasgueado(618.8, 629.0, [D3, A3, D4, Fs4], db(-30)); tema(618.9, db(-21)); tema(625.4, db(-21), 1.15)
for dt, f, L in [(0.3, Fs4, 2.2), (2.5, A4, 2.4), (5.0, D4 * 2, 4.0)]: strings(629.0 + dt, f, L, db(-23))
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
