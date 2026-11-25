# Trilha, ambiente e efeitos de "O homem que quase matou Hitler" (Georg Elser, 571 s). Tempos = palavras de src/videos/elser/tempos_palavras.txt.
# uso: python3 audio/elser_mix.py public/elser_narracao.mp3 out/elser/mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 571.32; N = int(DUR * SR); rng = np.random.default_rng(11); t = np.arange(N, dtype=np.float32) / SR
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

def big_blast(at, g=-2, dur=2.0): place(sfx, boom(3.0), at, db(g)); debris_rain(at + 0.35, dur, 30, g - 14)
def hammer(a, b, rate, g=-20):
    k = 0
    while a + k / rate < b: place(sfx, thud(0.25, 900), a + k / rate, db(g)); place(sfx, clank_s(), a + k / rate, db(g - 8)); k += 1
def clank_s(): n = int(0.2 * SR); tt = np.arange(n) / SR; return norm(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.03) for f in [1800, 2700, 4100]))
def plane_snd(a, b, g=-22):  # plaina na madeira
    k = 0
    while a + k * 1.11 < b: n = int(0.5 * SR); tt = np.arange(n) / SR; place(sfx, norm(bp(rng.standard_normal(n), 1500, 6000)) * np.sin(np.pi * tt / 0.5), a + k * 1.11, db(g)); k += 1
def ring(a, b, g=-14):  # campainha do telefone
    n, tt = seg(a, b); x = np.sign(np.sin(2 * np.pi * 22 * tt)) * np.sin(2 * np.pi * 1400 * tt) * (np.sin(2 * np.pi * 0.9 * tt) > -0.2); place(sfx, lp(x, 4000) * 0.5, a, db(g))
def steps(a, b, rate, g=-24):
    k = 0
    while a + k / rate < b: place(sfx, step(), a + k / rate, db(g)); k += 1
def door(at, g=-12): place(sfx, thud(0.6, 160), at, db(g)); place(sfx, whoosh(0.3, 300, 2000), at - 0.25, db(g - 8))
def car(a, b, g=-18): engine(a, b, g, 42)
def clock_ticks(a, b, g=-20): tick(a, b, g)

# ================= events =================
B = 311.84
# gancho
bed(gcity, 0, 3.8, -34); tick(3.9, 7.1, -16); timp(5.45, db(-12)); sting(5.45, -10)
rain(7.15, 10.0, -26); steps(7.4, 9.9, 1.6, -26)
crowd(10.0, 12.6, -28, True); heart(11.25, 12.6, -18)
tick(12.63, 16.2, -14)
bed(gfire, 16.23, 18.3, -22); booms([16.9, 17.8], -6); rumble(16.3, 18.2, -20); cannon(17.2, -10)
birds(18.3, 22.0, 8, -30); crowd(18.4, 21.9, -34, True)
stomps(22.1, 24.6, 0.62, -20); sting(24.3, -16)
place(sfx, lp(rng.standard_normal(int(2.5 * SR)), 300) * 0.3, 24.7, db(-30)); sting(26.85, -16)
wind(27.3, 30.0, -26); birds(27.5, 29.8, 3, -34)
hammer(30.1, 32.4, 1.6, -18); plane_snd(32.5, 34.8, -24)
rain(34.9, 37.2, -32); big_blast(38.1, -4, 1.2); place(sfx, whoosh(0.6, 300, 4000), 37.6, db(-18))
crowd(38.9, 40.2, -26, True); planes(40.2, 42.1, -16)
place(sfx, whoosh(1.6, 200, 6000), 44.7, db(-14)); tick(44.8, 46.2, -18); paper(44.9); paper(45.5); paper(46.0)
bed(gcity, 46.3, 50.9, -36); paper(46.6, -20)
stomps(50.9, 57.2, 0.6, -18); crowd(51, 57, -32)
[stamp_snd(58.4 + k * 0.45, -10) for k in range(4)]
rain(58.9, 60.3, -28); car(59, 60.3, -24); place(sfx, door_ := thud(0.5, 200), 59.6, db(-14))
sting(60.4, -16); sting(61.3, -18)
cheer(63.1, 65.8, -18); car(63.1, 65.8, -26)
wind(65.8, 68.4, -30); [place(sfx, lp(boom(2), 300), at, db(-24)) for at in [66.6, 67.7]]
bed(gfire, 68.4, 71.8, -24); [place(sfx, thud(0.6, 200), 68.9 + i * 0.12, db(-22)) for i in range(0, 14, 3)]
cheer(71.9, 75.8, -22)
bed(gcity, 75.9, 77.3, -34); birds(76, 77.3, 3, -32)
hammer(77.4, 79.7, 1.6, -20); plane_snd(79.7, 81.8, -20)
bed(gcity, 81.8, 87.0, -36); steps(83.3, 87, 1.8, -26)
static(87.1, 89.6, -28); paper(87.4, -18)
stomps(89.7, 92.5, 0.6, -18); rumble(92.5, 94.7, -18); booms([93.4, 93.9], -6); cannon(93.0, -10)
heart(94.8, 96.8, -20); tick(94.8, 105.4, -28)
[place(mus, thud(0.4, 120), at, db(-12)) for at in [96.9, 98.3, 98.6, 98.9]]
[place(sfx, clink_ := thud(0.25, 700), 100.15 + i * 0.18, db(-14)) for i in range(4)]
birds(101, 104.5, 6, -32); wind(101, 104.8, -32)
place(sfx, thud(0.4, 200), 107.0, db(-16)); heart(107, 109.5, -22)
wind(110.1, 113.2, -24)
steps(113.3, 116.5, 2.0, -28); stomps(116.5, 119.3, 0.55, -16)
[paper(121.4 + k * 0.35, -18) for k in range(5)]; sting(124.05, -14)
car(124.9, 126.5, -22); cheer(125.3, 127.8, -20); rain(124.9, 130.0, -36)
[place(mus, bell(392), 130.9, db(-22))]
crowd(132.0, 134.1, -18, True); [clink(132.3 + k * 0.3, -22) for k in range(5)]
stomps(134.2, 138.8, 0.58, -16); place(sfx, shot_old(), 137.4, db(-14))
clink(139.3, -10); clink(139.35, -14); crowd(138.9, 140.2, -22, True)
crowd(140.2, 152.9, -30); clock_ticks(143.9, 147.6, -22)
# o plano
crowd(152.9, 161.3, -36); heart(155.7, 158.1, -24)
tick(161.3, 163.7, -18)
hammer(163.8, 166.2, 1.3, -26); big_blast(166.6, -12, 1.0); paper(168.0, -16)
tick(168.8, 177.0, -22); [clank(169 + k * 0.7, -26) for k in range(10)]
steps(177.9, 182.4, 1.8, -24); bed(gcity, 177.9, 182.4, -32)
crowd(182.5, 185.3, -32); clink(183.1, -24); steps(182.6, 184.7, 1.6, -30)
[place(sfx, thud(0.2, 1200), 186.5 + k * 0.25, db(-22)) for k in range(3)]; steps(185.4, 188.1, 1.4, -26)
heart(188.2, 189.4, -22)
for a0, b0 in [(189.4, 197.5), (216.2, 218.3), (218.3, 221.8), (340.1, 341.9)]: hammer(a0, b0, 1.6, -24)
place(sfx, whoosh(2.5, 200, 2000), 197.6, db(-26)); [tick(197.8, 199.9, -26)]
heart(200.5, 203.4, -16); steps(203.4, 205.9, 1.6, -18); heart(203.4, 205.9, -14)
place(sfx, clang(), 206.45, db(-4)); place(sfx, thud(0.3, 900), 206.5, db(-10))
steps(209.2, 211.0, 1.4, -18); place(sfx, clang(), 211.8, db(-4)); place(sfx, thud(0.8, 120), 211.8, db(-4))
paper(222.0, -16); tick(223.2, 229.0, -14); [place(sfx, clank_s(), 226.2 + k * 0.12, db(-22)) for k in range(8)]
crowd(229, 236.3, -40); tick(229, 236.3, -28)
place(sfx, thud(0.4, 400), 239.2, db(-14)); place(sfx, clank_s(), 239.25, db(-18))
wind(240.5, 244.1, -30); tick(240.5, 244.1, -28)
sting(244.45, -12); paper(244.3, -18)
crowd(248.5, 257.9, -20); [clink(248.7 + k * 0.5, -26) for k in range(14)]; steps(252.2, 254.4, 2.2, -24)
cheer(257.9, 259.9, -14); steps(257.9, 259.3, 2.2, -20)
crowd(259.9, 273.4, -34); tick(264.7, 268.5, -14)
place(sfx, whoosh(1.2, 200, 2000), 273.4, db(-18))
tick(277.0, 279.8, -20); crowd(279.8, 289.9, -36)
[place(sfx, step(), 289.9 + k * 0.3, db(-24)) for k in range(0)]; cheer(291.7, 294.6, -18)
tick(294.8, 301.6, -20); steps(297.8, 300.0, 1.8, -22); door(300.0, -14); car(300.2, 301.7, -18)
tick(301.7, B, -14); heart(301.7, B, -18); crowd(305.5, 311.0, -26)
# A EXPLOSÃO
big_blast(B, 0, 3.0); place(sfx, boom(4.0), B + 0.05, db(-2)); place(sfx, glass_ := lp(rng.standard_normal(int(1.5 * SR)), 6000) * np.exp(-np.arange(int(1.5 * SR)) / SR / 0.3), B + 0.1, db(-16))
scream(B + 0.1, B + 1.8, -20); debris_rain(314.2, 1.5, 24, -12); bed(gfire, 312.8, 331.8, -24)
[place(sfx, thud(0.8, 140), at, db(-6)) for at in [316.8, 318.65, 319.6, 320.25]]; debris_rain(316.6, 2.0, 30, -10); debris_rain(318.7, 1.5, 20, -12)
crowd(322.4, 331.8, -32); wind(326.2, 331.8, -30)
train(331.8, 334.4, -16)
tick(334.4, 337.8, -14); timp(336.25, db(-10))
heart(337.8, 339.0, -18); [paper(339.0 + k * 0.2, -20) for k in range(6)]; tick(341.9, 344.7, -18); crowd(344.7, 349.0, -30)
steps(349.0, 351.2, 1.8, -20); door(351.3, -6)
place(sfx, whoosh(0.7, 300, 5000), 352.9, db(-12)); wind(352.9, 356.4, -26); steps(353.0, 356.3, 1.5, -26)
place(sfx, lp(boom(3), 250), 357.1, db(-10)); bed(gcity, 356.4, 359.1, -36)
tick(359.1, 362.8, -28)
place(sfx, whoosh(1.0, 400, 3000), 364.8, db(-22)); wind(362.8, 367.3, -32)
wind(367.3, 375.3, -24); steps(367.3, 370.2, 1.4, -24); whistle(371.0, 0.8, -14); steps(370.2, 371.8, 3.0, -18); place(sfx, thud(0.4, 300), 371.75, db(-12))
tick(375.3, 379.1, -26); [stamp_snd(375.6 + k * 0.67, -18) for k in range(6)]
place(sfx, thud(0.3, 500), 379.5, db(-16)); [clank(382.9 + k * 0.45, -16) for k in range(4)]; paper(386.4, -14); sting(387.35, -14)
ring(389.1, 390.5, -12); heart(390.5, 392.8, -18)
stamp_snd(394.7, -4)
rain(396.5, 399.2, -24); car(396.5, 398.0, -20); [door(397.6 + k * 0.3, -18) for k in range(3)]
place(sfx, thud(0.5, 180), 400.65, db(-8)); buzz(399.2, 401.7, -34)
place(sfx, thud(0.4, 250), 403.45, db(-6)); stamp_snd(405.6, -8)
wind(406.1, 409.8, -30); heart(409.8, 414.5, -20); sting(415.65, -16)
place(sfx, whoosh(0.8, 300, 3000), 418.0, db(-16)); timp(418.0, db(-12))
# sozinho, preso, o fim
[clank(421.2 + k * 0.55, -22) for k in range(7)]; tick(421.0, 426.1, -22); sting(425.0, -12)
wind(426.1, 427.7, -24); static(427.7, 430.4, -30); sting(428.35, -16); sting(431.65, -16)
wind(433.5, 440.1, -32); place(sfx, thud(0.5, 150), 442.1, db(-6)); [paper(443.0 + k * 0.2, -16) for k in range(4)]
typewriter(446.1, 449.8, -24); stamp_snd(449.9, -6)
planes(451.4, 456.6, -14); booms([453.4, 455.6], -6); rumble(451.6, 456.6, -20)
wind(456.7, 459.0, -32); place(sfx, clang(), 457.0, db(-20))
[sting(at, -18) for at in [459.9, 460.2, 460.8]]; bed(gfire, 462.7, 467.5, -20); planes(462.7, 467.5, -22)
wind(467.5, 474.6, -32); place(sfx, clang(), 470.7, db(-14)); wind(474.6, 478.2, -28)
wind(478.2, 480.9, -28); rumble(480.9, 484.4, -18); wind(484.5, 487.8, -32)
paper(488.1, -16); wind(491.4, 495.3, -30); crow(492.0, -26); crow(493.2, -30)
[paper(495.8 + k * 0.4, -18) for k in range(5)]; chime(497.5, 3, -16)
wind(499.1, 503.5, -34); buzz(503.5, 507.2, -34); place(sfx, lp(boom(3), 200), 504.6, db(-20))
birds(507.2, 512.6, 5, -34); bed(gcity, 512.7, 518.9, -36)
tick(518.9, 522.6, -30); crowd(522.7, 528.8, -34)
birds(528.9, 531.4, 6, -30); [place(sfx, thud(0.6, 260), 532.5 + k * 0.25, db(-18)) for k in range(5)]
cheer(535.3, 538.5, -30); wind(538.6, 544.4, -28)
hammer(544.4, 546.7, 1.6, -24); tick(546.7, 550.2, -18); wind(550.2, 562.1, -30)
tick(562.1, 566.2, -14); timp(563.4, db(-10)); timp(565.1, db(-12))
timp(567.7, db(-10)); timp(570.1, db(-8))

# ================= música (dó menor: tensão; abre em maior no fim) =================
pad([D2, A2, D3], 0, 7.1, db(-26), 0.4, 500); progression(7.1, 22.0, db(-26), 3.0)
pad([D2, A2, D3, F3], 22.0, 30.0, db(-28), 1.0, 600)
for dt, f in theme: piano(30.2 + dt * 0.7, f, db(-22))
progression(34.9, 42.1, db(-24), 2.0); [timp(37.3 + k * 0.4, db(-18)) for k in range(2)]
pad([D2, A2], 42.1, 50.9, db(-26), 1.0, 400)
progression(50.9, 63.1, db(-26), 2.5); ostinato(57.3, 62.5, D3, db(-28), 0.22)
progression(63.1, 65.8, db(-25), 1.3, 1400, (FM, CM)); pad([D2, A2, D3, F3], 65.8, 75.9, db(-27), 1.5, 600)
for dt, f, L in lament[:4]: strings(66.2 + dt * 0.8, f, L * 0.8, db(-26))
pad(Dm + [A3], 75.9, 94.8, db(-28), 2.0, 700)
for dt, f in theme: piano(77.4 + dt, f, db(-23))
pad([D2, A2, D3], 94.8, 113.2, db(-27), 1.5, 500); ostinato(96.8, 100.9, D3, db(-28), 0.25)
progression(100.9, 105.5, db(-25), 2.2, 1500, (FM, CM)); [timp(107.1 + k * 0.6, db(-18)) for k in range(4)]; timp(111.85, db(-12))
progression(113.2, 152.9, db(-27), 3.0); ostinato(119.4, 131.5, D3, db(-29), 0.25)
pad([D2, A2, D3, F3], 152.9, 185.3, db(-27), 2.0, 600)
for dt, f in theme: piano(163.8 + dt, f, db(-23))
ostinato(172.0, 177.0, D3, db(-28), 0.2)
pad([D2, A2], 185.3, 236.4, db(-28), 2.0, 380); heart(200.5, 202.9, -26)
for s0 in [189.4, 216.3]:
    for dt, f, L in lament[:4]: strings(s0 + dt, f, L, db(-27))
ostinato(218.4, 228.4, D3, db(-28), 0.25); progression(229.0, 236.4, db(-25), 2.0)
pad([D2, A2, D3], 236.4, 248.5, db(-27), 1.5, 500); [timp(244.45 + k * 0.7, db(-18)) for k in range(5)]
progression(248.5, 273.4, db(-27), 2.5); ostinato(260.9, 272.7, D3, db(-28), 0.22); [timp(268.6 + k * 0.5, db(-20)) for k in range(8)]
pad([D2, A2], 273.4, 294.7, db(-27), 1.0, 400); ostinato(277.0, 289.9, D3, db(-28), 0.18)
ostinato(294.7, B - 0.05, D3, db(-26), 0.2); snare(301.7, B - 0.05, db(-26), 0.2); [timp(305.6 + k * 0.5, db(-17)) for k in range(12)]
pad([D2, A2, D3, F3], B + 1.0, 337.8, db(-26), 2.5, 500)
for dt, f, L in lament: strings(322.5 + dt * 0.9, f, L * 0.9, db(-25))
progression(337.8, 352.9, db(-25), 2.0); timp(344.7, db(-16))
pad([D2, A2, D3], 352.9, 375.3, db(-27), 1.0, 500); ostinato(367.3, 375.0, D3, db(-27), 0.2)
pad([D2, A2, D3, F3], 375.3, 396.5, db(-28), 1.5, 600); ostinato(388.9, 396.4, D3, db(-27), 0.2)
progression(396.5, 417.6, db(-26), 2.0); [timp(399.2 + k * 0.8, db(-19)) for k in range(6)]
pad(DM, 417.6, 433.5, db(-25), 1.0, 1400)
for dt, f in theme: piano(421.2 + dt, f, db(-22))
pad([D2, A2, D3, F3], 433.5, 451.4, db(-27), 2.0, 600)
for dt, f, L in lament[:4]: strings(434.0 + dt, f, L, db(-26))
progression(451.4, 467.5, db(-25), 2.0); [timp(451.6 + k * 0.7, db(-18)) for k in range(8)]
pad([D2, A2, D3], 467.5, 487.8, db(-27), 2.0, 500)
for dt, f, L in lament: strings(468.0 + dt, f, L, db(-26))
pad([D2, A2], 487.8, 512.6, db(-26), 1.5, 380); timp(492.35, db(-14))
for dt, f, L in lament: strings(495.4 + dt, f, L, db(-26))
pad(DM + [A3], 512.6, 522.6, db(-24), 2.0, 1500)
for dt, f in theme: piano(513.0 + dt, f, db(-22))
pad([D2, A2, D3, F3], 522.6, 540.9, db(-27), 1.5, 600); ostinato(528.9, 538.5, D3, db(-29), 0.25)
progression(540.9, 562.1, db(-24), 2.5, 1500, (DM, GM, AM, DM))
for dt, f, L in [(0.5, Fs4, 2.0), (2.5, A4, 2.0), (4.5, D4 * 2, 2.8)]: strings(555.9 + dt, f, L, db(-24))
pad([D2, A2, D3], 562.1, 566.3, db(-24), 0.6, 600)
pad(DM + [A3, D4], 566.3, DUR, db(-21), 1.0, 1800); piano(566.5, D4, db(-20), 4); piano(567.7, Fs4, db(-21), 4); piano(569.0, A4, db(-21), 3)
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
