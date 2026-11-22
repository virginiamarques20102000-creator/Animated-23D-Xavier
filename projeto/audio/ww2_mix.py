# Trilha, ambiente e efeitos do vídeo "A Segunda Guerra Mundial" (16:9, 580,6 s). Tempos = palavras de out/ww2/tempos_palavras.txt.
# uso: python3 audio/ww2_mix.py public/ww2_narracao.mp3 out/ww2/mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 580.6; N = int(DUR * SR); rng = np.random.default_rng(11); t = np.arange(N, dtype=np.float32) / SR
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

# ================= events (absolute seconds, from the shot list) =================
# opening
bed(gfire, 0, 3.9, -24); planes(0, 4.0, -18); raid_siren(0, 4.0, -26); place(sfx, thud(0.8, 160), 3.05, db(-6)); booms([3.5], -6)
wind(3.9, 7.1, -28); [place(sfx, step(), 3.95 + k * 0.48, db(-28)) for k in range(6)]
rumble(7.1, 9.9, -18); booms([8.25, 8.9, 9.6], -4); cannon(8.9, -6)
wind(9.9, 13.5, -30); place(sfx, thud(0.4, 300), 11.2, db(-16))
sting(13.6, -8); wind(13.56, 18.1, -30); birds(14, 18, 4, -36)
bed(gfire, 18.15, 22.4, -30); planes(22.4, 24.6, -22); sting(22.55, -10)
wind(24.69, 27.9, -30); cheer(24.8, 27.8, -32); wind(27.9, 29.95, -26); crow(28.6); crow(29.3, -28)
rocket(30.6, 3.0, -8); place(sfx, boom(3.4), 30.8, db(-10)); planes(32.35, 35.2, -16)
tick(35.22, 37.2, -18); whoosh_ = place(sfx, whoosh(1.2, 400, 3000), 35.4, db(-20))
heart(37.28, 40.6, -20); rain(40.73, 43.85, -24); place(sfx, lp(boom(2), 400), 41.9, db(-20))
for at in [44.6, 44.95]: place(sfx, thud(0.5, 600), at, db(-10))
wind(46.68, 52.9, -28); [flyby(46.9 + k * 0.45, 2.6, -16, 110 + k * 6) for k in range(4)]
# chapter 1
sting(52.93, -8); wind(52.93, 60.3, -28); [place(sfx, step(), 53 + k * 0.55, db(-26)) for k in range(13)]
rain(60.38, 62.4, -24); stomps(60.4, 62.4, 0.62, -22, step)
paper(62.6); pen(63.3, 64.3, -22); pen(64.5, 66.2, -16)
paper(67.4); stamp_snd(68.9); [stamp_snd(at, -16) for at in [70.7, 71.0, 71.3, 71.5]]
place(sfx, norm(bp(rng.standard_normal(int(2.1 * SR)), 2000, 8000)), 71.9, db(-24)); coins_snd(74.0, 76.0, -16)
wind(76.74, 80.0, -30); paper(77.0, -20); wind(80.05, 81.8, -26); rain(81.8, 84.0, -22)
crowd(84.1, 89.4, -24); cheer(85.7, 89.4, -22); [clink(84.5 + k * 0.7, -26) for k in range(5)]
cheer(89.44, 92.2, -20); [place(sfx, thud(0.3, 900), 92.3 + k * 0.4, db(-22)) for k in range(4)]; place(sfx, hp(rng.standard_normal(int(1.6 * SR)), 3000) * 0.3, 92.5, db(-22))
engine(93.85, 97.2, -26, 38); cheer(97.2, 99.9, -18); [flash_pop(at) for at in [101.6, 102.3, 103.1]]
bed(gfire, 102.55, 105.8, -18); stamp_snd(104.6, -4)
engine(105.87, 108.9, -26, 32); place(sfx, thud(0.4, 400), 107.45, db(-14))
bed(gfire, 108.95, 111.2, -16); crowd(109.0, 111.2, -26); glass(111.9, -6)
stomps(114.11, 117.8, 0.5, -18); waves(114.11, 117.8, -30); tear(118.65, -8)
engine(120.74, 124.0, -26, 40); cheer(120.8, 124, -28); stomps(121.2, 124, 0.5, -24)
cheer(127.61, 131.7, -24); wind(131.75, 133.3, -20); thunder(132.6, -10)
wind(133.3, 135.1, -32); birds(135.2, 139.6, 5, -34); planes(136.8, 139.6, -20)
# chapter 2 — the war
waves(139.7, 142.9, -24); [cannon(at, -2) for at in [140.0, 140.3, 141.2, 142.4]]; booms([140.9, 142.1, 143.1], -10)
crack(143.9, -10); rumble(142.9, 145.0, -22); stomps(142.9, 145.0, 0.6, -24)
siren_stuka(147.85, 149.6, -8); thunder(149.1, -4)
rumble(150.72, 152.45, -14); planes(152.45, 152.9, -14); engine(152.9, 154.15, -20, 30); rumble(154.15, 155.7, -16); place(sfx, thud(0.6, 500), 154.85, db(-6)); [place(sfx, thud(0.3, 700), 154.9 + k * 0.1, db(-16)) for k in range(5)]
booms([156.2, 156.9, 157.6], -4)
static(158.74, 160.5, -26); crowd(160.5, 163.4, -28); place(sfx, horn(160.6, 1.0, -26) or np.zeros(1), 0, 0)
thunder(164.3, -8); thunder(165.4, -12); rain(163.45, 166.4, -26); sting(163.6, -10)
sea(166.43, 171.2, -26); stomps(166.5, 171.2, 0.6, -24); rumble(167, 171.2, -24)
clink(171.6, -20); stamp_snd(171.95, -6)
planes(174.16, 177.6, -20); sea(174.16, 177.6, -28)
[paper(at, -20) for at in [177.7, 178.55, 179.25, 179.9, 180.8]]
stomps(181.78, 184.4, 0.5, -18); wind(184.4, 186.0, -28)
rumble(186.08, 189.5, -16); planes(186.08, 189.5, -24)
sea(189.51, 193.5, -26); wind(189.51, 193.5, -30); sea(193.55, 199.7, -26); wind(193.55, 199.7, -30)
raid_siren(199.76, 206.6, -22); planes(199.76, 203.7, -14); [flak_ for flak_ in []]; [place(sfx, lp(boom(1.2), 900), 200 + k * 0.35, db(-22)) for k in range(14)]; [incoming(202.9 + k * 0.12, 203.7 + k * 0.12, -20) for k in range(3)]
bed(gfire, 203.7, 204.35, -16); booms([204.6, 205.4], -2)
[flyby(206.8 + k * 0.6, 2.4, -14, 130 + k * 10) for k in range(3)]; mg(207.2, 208.6, -16, 14); place(sfx, thud(0.4, 800), 208.4, db(-10))
place(sfx, lp(boom(2), 300), 211.2, db(-18)); crowd(210.62, 212.4, -32)
birds(212.45, 213.0, 3, -32); [clink(212.6 + k * 0.45, -24) for k in range(2)]; [flyby(213.3 + k * 0.4, 2.4, -14, 100 + k * 8) for k in range(2)]
sting(217.85, -12)
wind(219.02, 221.5, -30); [place(sfx, lp(boom(1.4), 300), 219.3 + k * 0.17, db(-22)) for k in range(14)]
tear(221.75, -4); [cannon(223.5 + k * 0.3, -4) for k in range(5)]
stomps(225.25, 228.8, 0.5, -16); rumble(225.25, 228.8, -24)
[paper(at, -24) for at in [230.4, 230.7, 231.0]]
rumble(233.18, 235.3, -12); rumble(235.35, 238.6, -22)
wind(238.63, 240.4, -16); breath(238.8, 240.4, -24); wind(240.45, 242.5, -22); rumble(240.45, 242.5, -20); [place(sfx, step(), 240.5 + k * 0.3, db(-24)) for k in range(6)]
rain(242.55, 244.9, -24); engine(242.55, 244.9, -16, 55); wind(244.95, 247.3, -18)
bed(gfire, 247.35, 249.6, -18); stomps(247.4, 249.6, 0.6, -24); sea(249.6, 254.0, -24); [flyby(250.3 + k * 0.9, 2.6, -18, 140) for k in range(3)]
# Pacific
sea(254.0, 257.3, -24); planes(254.0, 257.3, -14); planes(258.2, 260.5, -12); crowd(257.3, 258.4, -32); place(sfx, whoosh(0.8), 258.3, db(-16))
sea(260.5, 262.3, -24); [splash_snd(260.9 + k * 0.3, -18) for k in range(3)]
booms([263.15], 0); nuke(263.15, -8); bed(gfire, 263.6, 266.3, -18)
crowd(266.32, 268.6, -30); [flash_pop(266.72 + k * 0.9) for k in range(2)]; pen(269.4, 270.9, -16)
cheer(271.37, 276.4, -20)
static(276.5, 281.9, -34); sting(280.65, -10)
paper(282.2, -22); wind(286.75, 290.5, -28); bed(gfire, 286.75, 290.5, -30)
sea(290.5, 294.2, -24); [flyby(290.8 + k * 0.6, 2.4, -16, 120) for k in range(3)]; siren_stuka(292.7, 294.2, -12)
booms([294.6, 295.3, 295.9], -2); splash_snd(294.9, -10); bed(gfire, 294.8, 297.0, -16)
[cannon(297.3 + k * 0.27, -10) for k in range(6)]; [place(sfx, lp(boom(1.4), 400), 297.2 + k * 0.13, db(-22)) for k in range(16)]
rumble(299.4, 302.9, -16); wind(299.4, 302.9, -26)
sea(302.95, 307.5, -26); [splash_snd(at, -12) for at in [303.6, 304.8, 305.9]]; mg(303.2, 307.2, -28, 6)
bed(gfire, 307.55, 312.0, -16); sting(308.4, -8); wind(307.55, 312.0, -28)
[place(sfx, shot(), 312.4 + at, db(-10)) for at in [0, 0.5, 1.2, 1.6, 2.1, 2.7]]; mg(315.6, 316.9, -18, 8)
wind(316.95, 318.8, -18); bed(gfire, 318.85, 319.6, -24); booms([319.9], 0); [place(sfx, thud(0.2, 600), 320.0 + k * 0.08, db(-16)) for k in range(10)]
wind(321.38, 325.0, -22); stomps(321.4, 325.0, 0.7, -26, step)
place(sfx, thud(0.3, 300), 325.4, db(-18)); place(sfx, thud(0.6, 200), 328.2, db(0)); [clink(328.3 + k * 0.12, -14) for k in range(4)]
wind(330.1, 337.6, -24); crow(331.5); crow(333.2, -28); crow(335.0, -30)
rumble(337.6, 343.5, -14); sting(340.6, -14)
wind(343.5, 345.8, -30); waves(345.85, 349.1, -26); horn(346.4, 2.4, -22)
planes(349.19, 353.3, -12); [place(sfx, lp(boom(1.2), 900), 349.5 + k * 0.3, db(-20)) for k in range(14)]; mg(350.2, 352.8, -30, 6)
sea(353.3, 357.1, -22); [cannon(at, 0) for at in [353.8, 353.85, 354.6, 355.5]]
sting(357.3, -4); splash_snd(357.6, -8)
sea(358.6, 362.0, -14); [splash_snd(358.9 + k * 1.1, -16) for k in range(3)]; engine(358.6, 362.0, -20, 45)
place(sfx, thud(0.8, 300), 362.8, db(-4)); splash_snd(362.8, -8); cheer(362.9, 366.2, -22); mg(363.0, 366.2, -22, 10); booms([364.4, 365.1], -6)
mg(366.23, 368.7, -22, 9); sea(366.23, 372.3, -26); stomps(368.7, 370.4, 0.66, -22, step); wind(370.4, 372.3, -26)
mg(372.3, 376.5, -8, 20); [clink(372.4 + k * 0.07, -26) for k in range(56)]
booms([376.75], 0); [place(sfx, lp(rng.standard_normal(2000), 300), 376.8 + k * 0.05, db(-20)) for k in range(6)]; mg(377.15, 379.6, -20, 9)
sea(379.6, 382.2, -24); wind(382.2, 384.5, -26); cheer(384.5, 386.4, -16); engine(384.5, 386.4, -24, 60)
[paper(at, -22) for at in [387.2, 387.6, 388.8, 389.2]]; heart(391.8, 394.1, -16)
bed(gfire, 394.15, 398.3, -14); place(sfx, whoosh(1.0, 200, 2000), 395.4, db(-8))
[rocket(398.6 + k * 0.2, 1.4, -14) for k in range(14)]
wind(401.55, 403.1, -24); bed(gfire, 401.55, 403.1, -26)
rumble(403.1, 406.0, -16); cannon(405.6, -2); booms([406.2], -6); [place(sfx, shot(), 406.0 + at, db(-10)) for at in [0.3, 0.6, 0.9, 1.3, 1.5]]
wind(408.5, 411.8, -28); place(sfx, lp(boom(2), 300), 412.6, db(-14)); place(sfx, lp(boom(2), 300), 413.8, db(-12)); buzz(411.8, 415.3, -34)
# the end in Europe
place(sfx, clang(), 417.8, db(-10)); place(sfx, thud(0.8, 200), 418.2, db(-6)); buzz(418.75, 420.4, -36)
stomps(421.5, 423.7, 0.84, -18, step); pen(424.55, 426.4, -16)
cheer(427.11, 430.7, -12); bell(0) if False else [place(sfx, bell(392 * _K), 427.4 + k * 1.1, db(-20)) for k in range(3)]
rain(430.72, 434.3, -20); birds(430.8, 434.0, 4, -36)
mg(434.3, 437.5, -28, 8); wind(434.3, 437.5, -26)
siren_stuka(437.6, 438.95, -12); mg(437.6, 438.9, -22, 12); booms([438.95], 0); bed(gfire, 439.2, 440.3, -16)
tick(440.3, 442.4, -24); wind(442.45, 445.4, -32)
wind(445.44, 448.95, -22); planes(445.44, 451.0, -20); place(sfx, thud(0.3, 1000), 450.15, db(-14)); place(sfx, whoosh(1.4, 300, 2500), 450.2, db(-12))
wind(450.95, 452.4, -30); birds(451.0, 452.3, 3, -32)
nuke(452.4, 0); booms([452.5], 0); wind(454.8, 458.6, -22)
wind(458.63, 461.2, -30); nuke(463.1, -6); wind(463, 464.6, -26)
wind(464.65, 468.8, -24); tick(468.85, 472.3, -26); [place(sfx, hp(rng.standard_normal(200), 3000), 468.9 + rng.uniform(0, 3.3), db(-24)) for k in range(30)]
rumble(472.31, 479.8, -16); cannon(476.1, -6)
static(479.88, 486.3, -22); place(sfx, norm(bp(rng.standard_normal(int(6 * SR)), 300, 1800)) * 0.3, 480.0, db(-30))
waves(486.35, 489.8, -26); planes(486.35, 489.8, -24); pen(490.35, 492.1, -14)
cheer(492.39, 498.9, -14); horn(492.6, 2.4, -16); waves(492.39, 498.9, -28)
birds(498.97, 503.5, 8, -30); wind(498.97, 503.5, -32)
wind(503.58, 509.6, -38); rain(509.6, 512.1, -22)
wind(512.13, 515.8, -26); wind(515.85, 524.2, -34); bell(0) if False else place(sfx, bell(330 * _K), 518.9, db(-26))
[place(sfx, thud(0.2, 900), 524.5 + k * 1.25, db(-24)) for k in range(3)]; [place(sfx, thud(0.3, 900), 527.7 + k * 0.4, db(-24)) for k in range(5)]; train(530.3, 532.7, -30)
[paper(at, -24) for at in [533.6, 533.7, 533.8, 533.9]]; heart(535.8, 543.2, -24)
wind(543.25, 546.8, -18); sting(545.25, -10)
crowd(546.83, 549.4, -30); pen(549.9, 551.8, -14); place(sfx, thud(0.2, 900), 551.9, db(-18)); cheer(552.9, 555.4, -28)
wind(555.4, 559.2, -30); [place(amb, whoosh(0.25, 800, 3000), 555.6 + k * 0.3, db(-30)) for k in range(8)]
wind(559.2, 564.0, -32); birds(559.3, 564, 4, -36)
wind(564.07, 567.6, -36); bed(gfire, 567.6, 573.1, -18); stomps(567.7, 573.1, 0.5, -18)
wind(573.2, 577.0, -28); waves(577.0, DUR, -24); birds(577, 580, 3, -34)

# ================= score (E minor; E major at the end of the war and at the close) =================
pad([D2, A2, D3], 0, 13.5, db(-24), 1.0, 500); [timp(0.3 + k * 1.0, db(-20), 46) for k in range(13)]
progression(13.5, 35.2, db(-25), 2.0); ostinato(24.7, 35.0, D3, db(-28), 0.25); for_ = [piano(18.2 + dt, f, db(-22)) for dt, f in theme]
pad([D2, A2, D3, F3], 35.2, 46.6, db(-26), 1.0, 500); heart(43.9, 45.9, -18)
progression(46.68, 52.9, db(-23), 1.5, 1400, (Dm, BbM, FM, Am)); [timp(46.7 + k * 0.75, db(-18)) for k in range(8)]
# chapter 1: origins — lament, then a darkening march
pad([D2, A2, D3, F3], 52.9, 84.0, db(-27), 2.0, 600)
for s0 in [53.2, 67.4]:
    for dt, f, L in lament: strings(s0 + dt, f, L, db(-25))
progression(84.1, 99.9, db(-26), 2.0, 900, (Dm, Gm, Am, Dm)); snare(89.4, 99.9, db(-26)); [timp(89.4 + k * 1.23, db(-20)) for k in range(9)]
pad([D2, A2, D3], 99.9, 120.7, db(-26), 1.5, 500); ostinato(105.9, 113.3, D3, db(-28), 0.25); [timp(105.9 + k * 1.0, db(-19), 46) for k in range(8)]
progression(120.7, 135.1, db(-26), 2.0, 900, (Dm, BbM, FM, Am)); for_ = [piano(128.0 + dt, f, db(-23)) for dt, f in theme]
pad([D2, A2], 135.1, 139.6, db(-24), 1.0, 400)
# chapter 2: Blitzkrieg — driving ostinato
progression(139.7, 166.4, db(-24), 2.0); ostinato(145.0, 158.1, D3, db(-27), 0.2); [timp(145.0 + k * 0.6, db(-18)) for k in range(22)]; snare(150.7, 158.1, db(-24), 0.25)
pad([D2, A2, D3, F3], 166.4, 189.5, db(-27), 2.0, 600); ostinato(174.2, 181.7, D3, db(-28), 0.25); [timp(186.1 + k * 0.7, db(-19)) for k in range(5)]
progression(189.5, 199.7, db(-25), 2.5, 1300, (FM, CM, Dm, BbM))
pad([D2, A2, D3], 199.7, 215.5, db(-26), 1.5, 500); ostinato(206.7, 210.6, D3, db(-26), 0.18)
pad([D2, A2, D3, F3], 215.5, 247.3, db(-27), 2.0, 600); [timp(219.3 + k * 0.8, db(-19)) for k in range(12)]; ostinato(225.2, 238.6, D3, db(-28), 0.25)
for dt, f, L in lament: strings(238.7 + dt * 0.6, f, L * 0.6, db(-26))
progression(247.35, 254.0, db(-25), 2.0, 900, (Dm, BbM, Gm, Am))
# chapter 3: the world at war
pad([D2, A2, D3, F3], 254.0, 282.0, db(-27), 2.0, 600); ostinato(257.3, 262.3, D3, db(-26), 0.18); [timp(262.0 + k * 0.6, db(-18)) for k in range(6)]
progression(266.3, 282.0, db(-25), 2.0); for_ = [piano(276.6 + dt, f, db(-22)) for dt, f in theme]
progression(282.0, 302.9, db(-25), 2.0, 1100, (Dm, FM, CM, Am)); ostinato(290.5, 297.0, D3, db(-27), 0.2)
progression(293.6, 297.0, db(-23), 1.7, 1600, (DM, AM))
pad([D2, A2, D3, F3], 302.9, 343.5, db(-27), 2.0, 600)
for s0 in [312.0, 330.1]:
    for dt, f, L in lament: strings(s0 + dt * 0.95, f, L, db(-25))
[timp(321.4 + k * 0.7, db(-19), 46) for k in range(8)]; progression(337.6, 343.5, db(-24), 1.5, 1500, (DM, GM, AM, DM))
# D-Day
pad([D2, A2, D3], 343.5, 357.2, db(-26), 1.5, 500); ostinato(349.2, 357.0, D3, db(-27), 0.25); [timp(353.3 + k * 0.5, db(-17)) for k in range(8)]
progression(357.2, 386.4, db(-24), 2.0); ostinato(358.6, 379.6, D3, db(-27), 0.2); [timp(358.7 + k * 1.0, db(-18)) for k in range(21)]
progression(384.5, 386.4, db(-23), 0.95, 1600, (DM, AM))
pad([D2, A2, D3, F3], 386.4, 415.3, db(-26), 2.0, 600); ostinato(398.3, 408.5, D3, db(-27), 0.22)
for dt, f, L in lament[:4]: strings(408.6 + dt, f, L, db(-25))
# end in Europe; Pacific; the bombs
pad([D2, A2], 415.3, 427.0, db(-26), 1.5, 400); progression(427.1, 430.7, db(-22), 1.2, 1800, (DM, GM, AM))
pad([D2, A2, D3, F3], 430.7, 452.3, db(-27), 1.5, 600); ostinato(434.3, 440.3, D3, db(-27), 0.2); heart(445.5, 452.2, -18)
pad([D2, A2, D3], 454.8, 486.3, db(-27), 3.0, 500)
for s0 in [455.0, 465.0]:
    for dt, f, L in lament: strings(s0 + dt * 0.85, f, L, db(-25))
progression(472.3, 479.8, db(-26), 2.0); [timp(486.6 + k * 0.6, db(-20), 46) for k in range(5)]
# the end — E major
pad(DM + [A3, D4], 489.8, 499.0, db(-22), 2.0, 1800)
for dt, f, L in [(0.5, Fs4, 2.0), (2.5, A4, 2.0), (4.5, D4 * 2, 2.8)]: strings(492.4 + dt, f, L, db(-23))
for dt, f in [(0, D4), (0.6, Fs4), (1.2, A4), (1.8, D4 * 2)]: piano(494.3 + dt, f, db(-20))
pad([D2, A2, D3, F3], 499.0, 559.2, db(-28), 2.0, 600)
for s0 in [503.6, 532.8]:
    for dt, f in theme: piano(s0 + dt, f, db(-22))
for s0 in [512.2, 543.3]:
    for dt, f, L in lament: strings(s0 + dt, f, L, db(-25))
progression(546.8, 559.2, db(-25), 2.0, 1400, (DM, GM, AM, DM))
pad([D2, A2, D3, F3, A3], 559.2, 573.2, db(-26), 1.0, 900); [timp(567.7 + k * 0.6, db(-19), 46) for k in range(9)]
pad(DM + [A3, D4], 573.2, DUR, db(-21), 2.0, 1800); piano(573.4, D4, db(-20), 4); piano(575.4, Fs4, db(-21), 4); piano(577.2, A4, db(-21), 3)
for dt, f, L in [(0.3, Fs4, 2.2), (2.5, A4, 2.4)]: strings(573.4 + dt, f, L, db(-24))
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
