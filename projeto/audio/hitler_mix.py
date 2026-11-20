# Trilha, ambiente e efeitos do vídeo "Quem foi Hitler?" (16:9, 327 s), sintetizados e mixados sob a narração.
# Os tempos dos efeitos batem com os acontecimentos de src/videos/hitler/story.ts (início do plano + tempo local).
# uso: python3 audio/hitler_mix.py public/hitler_narracao.mp3 out/hitler_mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 327.2; N = int(DUR * SR); rng = np.random.default_rng(7); t = np.arange(N) / SR
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

# ---------------- ambience beds ----------------
wind = norm(hp(lp(np.cumsum(noise) * 0.02, 600), 50)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t) ** 2)
for a, b, g in [(0, 5, -30), (11, 26, -30), (22, 26, -26), (35.7, 40, -32), (60.4, 70.3, -27), (70.3, 75, -28), (139, 149.3, -28), (203.9, 217.8, -29), (220.9, 242.5, -24), (242.5, 268.7, -28), (279.9, 291.9, -24), (310.2, 317.2, -30), (321.2, DUR, -30)]:
    amb += wind * env(a, b, 0.8, 0.8) * db(g)
rain = hp(bp(rng.standard_normal(N), 1500, 9000), 800)
for a, b in [(48.8, 56.6), (67.47, 70.3)]: amb += rain * env(a, b, 1.2, 0.6) * db(-27)
city = lp(rng.standard_normal(N), 900) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * t))
for a, b in [(5, 11), (39.9, 47.5), (52, 56.6), (128.2, 139.3), (180.4, 183.5)]: amb += city * env(a, b) * db(-34)
def birds(a, b, n, g=-33):
    for k in range(n):
        at = rng.uniform(a, b - 0.3); m = int(0.18 * SR); tt = np.arange(m) / SR
        place(amb, np.sin(2 * np.pi * (2600 + 1200 * np.sin(2 * np.pi * 12 * tt)) * tt) * np.hanning(m), at, db(g))
birds(5.1, 11, 14); birds(39.9, 47.4, 14); birds(287, 291.8, 5, -38); birds(310.3, 317, 12, -36); birds(321.3, 326, 8, -36)
def crowd(a, b, g, cheer=False):  # murmur (or cheering) of many voices: band noise with syllabic flutter
    n, tt = seg(a, b); x = bp(rng.standard_normal(n), 300, 2500 if cheer else 1400)
    x *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.3 * tt + rng.uniform(0, 6))) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tt))
    e = np.minimum(1, tt / 0.6) * np.minimum(1, (b - a - tt) / 0.5); place(amb, norm(x) * e, a, db(g))
for a, b, g, c in [(28.75, 35.7, -22, True), (56.56, 60.4, -26, True), (79.3, 85.1, -23, True), (85.1, 91.6, -30, False), (88.6, 91.6, -27, True), (94.2, 99.07, -30, False),
                   (99.07, 107.7, -21, True), (107.7, 115, -33, False), (149.25, 153.4, -23, True), (165, 170.2, -30, False), (296.2, 298.9, -22, True), (302.92, 303.96, -20, True), (25.83, 28.75, -32, True)]:
    crowd(a, b, g, c)
def fire_bed(a, b, g):
    n, tt = seg(a, b); x = lp(rng.standard_normal(n), 500) * 0.6
    cr = np.zeros(n)
    for k in range(int((b - a) * 18)): i = rng.integers(0, n - 400); cr[i:i + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 40)
    place(amb, norm(x + hp(cr, 1200)) * np.minimum(1, tt / 0.5) * np.minimum(1, (b - a - tt) / 0.5), a, db(g))
for a, b, g in [(22.08, 25.83, -24), (160.66, 165, -30), (165.02, 170.2, -20), (174.63, 176.6, -26), (242.5, 246, -27), (264.4, 268.7, -28), (307.6, 309.07, -22)]: fire_bed(a, b, g)

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

# title
for at in [0.02, 1.64]: place(sfx, boom(3.2), at, db(-6))
stomps(0.5, 5.0, 0.43, -24)
# war machine / regime / devastation
rumble(11.02, 17.36, -16); planes(11.0, 17.4, -18)
for at in [11.62, 13.02, 14.42, 15.82]: place(sfx, boom(), at, db(-10))
stomps(17.36, 22.08, 0.3077, -12)
for at in [22.78, 24.28]: place(sfx, boom(), at, db(-6))
place(sfx, boom(2.2), 25.83, db(-14))
# rewind
n, tt = seg(35.7, 39.86); place(sfx, norm(bp(rng.standard_normal(n), 400, 4000)) * (tt / tt[-1]) ** 2 * np.minimum(1, (tt[-1] - tt) / 0.3), 35.7, db(-18))
k = 0
while 35.9 + k / 18 < 39.5: m = int(0.01 * SR); place(sfx, hp(rng.standard_normal(m), 2000), 35.9 + k / 18, db(-30)); k += 1
for at in [40.2, 41.5, 42.8]: place(amb, bell(392), at, db(-20))
# rejection, rain, thunder, steps
stamp_snd(48.02, -4); stamp_snd(48.72, -4); place(sfx, boom(3), 50.4, db(-20))
stomps(52.01, 56.5, 0.615, -18, step)
# 1914 and the trench
k = 0
while 56.56 + k * 0.307 < 60.4: m = int(0.06 * SR); place(sfx, bp(rng.standard_normal(m), 1500, 6000) * np.exp(-np.arange(m) / 400), 56.56 + k * 0.307, db(-16 if k % 4 == 0 else -22)); k += 1
stomps(56.56, 60.4, 0.42, -16)
for at in [60.93, 62.13, 63.33]: place(sfx, boom(), at, db(-5))
mg(61.5, 62.0, -20); mg(63.7, 64.3, -22)
place(sfx, boom(3), 65.4, db(-24))
stomps(67.6, 70.2, 0.62, -22, step)
for k in range(10): paper(70.6 + k * 0.45, -22)
scratch(75.6, 77.4); stamp_snd(77.62, -6)
for at in [80.6, 82.2]: place(sfx, clang()[: int(0.4 * SR)] * 0.6, at, db(-18))
place(sfx, whoosh(0.9, 200, 2000), 88.4, db(-14))
place(sfx, boom(2.0), 91.62, db(-14)); heart(94.3, 99.0, -18)
for at in [99.1, 101.5, 103.3, 105.6]: place(sfx, boom(2.0), at, db(-16))
stomps(107.8, 114.9, 0.75, -24, step)
stomps(114.96, 118.8, 0.67, -14)
for at in [118.97, 119.19, 119.41, 119.63]: place(sfx, shot(), at, db(-4))
place(sfx, clang(), 120.75, db(-4))
scratch(121.6, 124.4, -26); scratch(125.3, 127.8, -26)
for k in range(8): n = int(0.05 * SR); place(amb, np.sin(2 * np.pi * 1400 * np.arange(n) / SR) * np.exp(-np.arange(n) / 300), 122 + k * 0.8, db(-34))
place(sfx, clang()[: int(0.8 * SR)] * 0.5, 128.25, db(-18)); stomps(128.4, 131.8, 0.6, -18, step)
paper(136.2, -14)
place(sfx, whoosh(1.2, 600, 6000), 139.33, db(-10)); paper(140.4, -10); typewriter(140.6, 143.1, -24)
for at in [143.5, 146.0]: place(sfx, clang()[: int(0.6 * SR)] * 0.4, at, db(-22))
for i in range(6): paper(149.65 + i * 0.4, -14)
tick(153.4, 160.6, -24); scratch(157.4, 158.6, -24)
stomps(160.66, 165.0, 0.57, -14)
for at in [165.6, 167.3, 168.8]: place(sfx, clang()[: int(0.3 * SR)], at, db(-20))
stamp_snd(170.56, -4); stomps(171.95, 174.6, 0.33, -16, step); stamp_snd(175.03, -4)
heart(176.6, 180.3, -16); stomps(177.5, 180.3, 0.6, -24)
n, tt = seg(180.5, 183.3); place(sfx, norm(bp(rng.standard_normal(n), 500, 2500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 4.5 * tt)))) * 0.8, 180.5, db(-24))
place(sfx, boom(2.0), 183.5, db(-14))
for k in range(16): place(sfx, clang()[: int(0.25 * SR)], 185.5 + k * 0.3 + rng.uniform(0, 0.05), db(-20 - (k % 2) * 4))
rumble(185.3, 190.3, -24, 70)
rumble(190.31, 196.3, -14); planes(190.3, 196.3, -16); place(sfx, clang()[: int(0.5 * SR)], 191.98, db(-8)); place(sfx, thud(0.6, 300), 191.98, db(-8))
for at in [191.81, 193.11, 194.41]: place(sfx, boom(), at, db(-10))
n, tt = seg(196.3, 200.5); place(sfx, norm(bp(rng.standard_normal(n), 800, 3500)) * 0.4 * np.minimum(1, (200.5 - 196.3 - tt) / 0.5), 196.3, db(-30))
for at in [197.5, 197.9]: place(sfx, thud(0.2, 600), at, db(-12))
for at in [196.4, 198.6]: place(sfx, whoosh(0.8), at, db(-16))
for i in range(5): place(sfx, boom(), 200.56 + i * 0.6, db(-6))
stomps(203.92, 207.0, 0.31, -16); rumble(203.9, 207.1, -22)
tick(207.1, 210.3, -22)
stomps(210.4, 217.7, 0.53, -24, step)
for at in [217.9, 218.25, 218.6]: place(sfx, thud(0.3, 250), at, db(-6))
stomps(221.0, 222.8, 0.55, -20, step)
train(222.85, 227.0, -14)
place(sfx, clang()[: int(1.2 * SR)] * 0.5, 227.0, db(-26))
typewriter(239.1, 242.4, -20); stamp_snd(239.92, -6); stamp_snd(240.92, -6)
for at in [243.0, 244.6]: place(sfx, boom(3), at, db(-20))
for at in [246.99, 248.79, 250.59]: place(sfx, boom(), at, db(-7))
crowd(247.0, 252.6, -22, True); stomps(246.2, 252.7, 0.36, -18)
waves(252.82, 258.5, -14)
for at in [253.62, 255.12, 256.62]: place(sfx, boom(), at, db(-7))
mg(254.0, 254.9, -18); mg(256.9, 257.6, -18)
rumble(258.54, 262.1, -14); stomps(258.6, 262.0, 0.31, -18)
for at in [262.1, 262.5]: place(sfx, whoosh(1.0, 200, 2000), at, db(-14))
for at in [262.1, 263.3]: place(sfx, boom(2.2), at, db(-14))
for at in [265.02, 266.32, 267.62]: place(sfx, boom(), at, db(-6))
mg(265.5, 266.1, -18); stomps(264.5, 268.6, 0.32, -18)
n, tt = seg(268.67, 279.5); place(amb, norm(lp(rng.standard_normal(n), 60)) * np.minimum(1, (279.5 - 268.67 - tt) / 1.5), 268.67, db(-20))
place(sfx, lp(boom(3.0), 200), 271.97, db(-4)); place(sfx, lp(boom(3.0), 200), 277.44, db(-6))
stomps(273.94, 276.0, 0.6, -18, step); place(sfx, thud(0.8, 160), 276.2, db(-4)); place(sfx, clang()[: int(0.5 * SR)] * 0.5, 276.25, db(-16))
paper(292.6, -20); tick(291.9, 296.2, -28); tick(317.2, 321.2, -30); paper(318.4, -22)
stamp_snd(298.9, -12); place(sfx, boom(1.8), 302.92, db(-14)); place(sfx, shot(), 305.0, db(-10)); stamp_snd(306.35, -10)
place(sfx, boom(2.6), 309.07, db(-12)); stomps(310.4, 316.8, 0.8, -28, step)
# transition whooshes on the main cuts
for at in [11.02, 17.36, 22.08, 56.56, 60.43, 99.07, 114.96, 139.33, 160.66, 190.31, 200.56, 245.99, 252.82, 264.42, 298.85, 302.92, 303.96, 304.92, 306.3, 307.6]: place(sfx, whoosh(0.5), at - 0.25, db(-18))

# ---------------- score ----------------
def pad(freqs, a, b, gain, fade=2.0, cut=1000):
    g = env(a, b, fade, fade); x = sum(np.sin(2 * np.pi * f * t + i) / (i + 1) ** 0.7 for i, f in enumerate(freqs)); return lp(x * (0.85 + 0.15 * np.sin(2 * np.pi * 0.1 * t)), cut) * g * gain
D2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, Bb4, Cs4 = 73.42, 87.31, 98, 110, 116.54, 130.81, 146.83, 164.81, 174.61, 196, 220, 233.08, 261.63, 293.66, 329.63, 349.23, 392, 440, 466.16, 277.18
Dm, Bb, Fm, Cm, Am, Gm = [D2, A2, D3, F3], [Bb2 / 2 * 2, D3, F3, Bb3 / 2], [F2, C3, F3, A3], [C3, G3, E3], [A2, E3, A3, Cs4], [G2, D3, G3, Bb3 / 2]
prog = [Dm, Bb, Fm, Am]
def progression(a, b, gain, beat=4.0, cut=900):
    k = 0
    while a + k * beat < b: s0 = a + k * beat; mus[:] += pad(prog[k % 4], s0, min(b, s0 + beat + 0.8), gain, 0.8, cut); k += 1
def piano(at, f, g, L=2.5):
    n = int(L * SR); tt = np.arange(n) / SR
    place(mus, sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt / (d * (1.4 if m == 1 else 1))) for m, a, d in [(1, 1, 0.9), (2, 0.4, 0.5), (3, 0.15, 0.3), (4, 0.08, 0.2)]) * np.minimum(1, tt / 0.005), at, g)
def strings(at, f, L, g):  # bowed: filtered saw with vibrato and slow attack
    n = int(L * SR); tt = np.arange(n) / SR; ph = np.cumsum(f * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt))) / SR
    x = lp(2 * (ph % 1) - 1, 2200) * np.minimum(1, tt / 0.35) * np.minimum(1, (L - tt) / 0.5); place(mus, x, at, g)
def timp(at, g, f=55): n = int(1.6 * SR); tt = np.arange(n) / SR; place(mus, norm(np.sin(2 * np.pi * f * tt * (1 - 0.08 * tt)) * np.exp(-tt / 0.45) + 0.2 * lp(rng.standard_normal(n), 200) * np.exp(-tt / 0.05)), at, g)
def ostinato(a, b, f, g, step=0.25):
    k = 0
    while a + k * step < b: strings(a + k * step, f * (1 if k % 4 else 1.0), step * 0.9, g * (1 if k % 2 == 0 else 0.7)); k += 1
# 0-5 title: low drone; 5-11 Austria: gentle piano
mus += pad([D2, A2, D3], 0, 5.2, db(-22), 0.3)
for i, (dt, f) in enumerate([(0, D4), (0.5, F4), (1.0, A4), (1.5, F4), (2.0, G4), (2.5, E4), (3.0, F4), (3.5, D4), (4.0, E4), (4.5, Cs4 * 2 / 2), (5.0, D4)]): piano(5.2 + dt, f, db(-20))
# 11-35.7 war machine / regime / rally: dark progression + ostinato + timpani
progression(11.0, 35.7, db(-24), 4.0)
ostinato(11.0, 25.8, D3, db(-27)); ostinato(28.75, 35.6, D3, db(-28))
for k in range(int((25.8 - 11) / 1.0)): timp(11.0 + k * 1.0, db(-18 if k % 2 == 0 else -22))
for at in [25.83, 27.3]: timp(at, db(-12), 45)
# 39.9-56.5 childhood / youth: sad piano theme
theme = [(0, A4), (0.75, F4), (1.5, E4), (2.0, F4), (2.5, D4), (4.0, A4), (4.75, Bb4), (5.5, A4), (6.0, G4), (6.5, F4), (7.0, E4)]
for rep, s0 in enumerate([40.0, 48.0]):
    for dt, f in theme: piano(s0 + dt, f * (1 if rep == 0 else 0.5 * 2), db(-21 if rep == 0 else -23))
mus += pad([D2, A2, F3], 39.9, 56.6, db(-30)) + pad([D2, A2, F3], 47.5, 56.6, db(-28))
# 56.5-70 WWI march then defeat
for k in range(int((60.4 - 56.56) / 0.307)): timp(56.56 + k * 0.614, db(-22), 70) if k % 2 == 0 else None
progression(60.4, 64.4, db(-24), 2.0); mus += pad([D2, F2, A2, D3], 64.4, 79.3, db(-26))
for dt, f in [(0, A3), (1.5, G3), (3.0, F3), (4.5, E3), (6.0, D3)]: strings(64.6 + dt, f, 1.8, db(-26))
# 79-139 rise: pulsing ostinato building, timpani on the rallies
progression(79.3, 139.3, db(-25), 4.0)
ostinato(79.3, 99.0, D3, db(-30)); ostinato(99.07, 107.7, D3, db(-25), 0.2); ostinato(114.96, 121.3, D3, db(-27))
for k in range(int((107.7 - 99.07) / 0.5)): timp(99.07 + k * 0.5, db(-16 if k % 2 == 0 else -20))
for dt, f in theme: strings(121.5 + dt * 0.9, f / 2, 0.9, db(-28))
# 139-190 crisis, chancellor, darkness
mus += pad([D2, A2, D3, F3], 139.3, 160.7, db(-26))
for k in range(int((165 - 160.66) / 0.57)): timp(160.66 + k * 0.57, db(-18), 60)
mus += pad([D2, Bb2 / 2 * 2, D3, F3], 165.0, 190.3, db(-23), 1.0, 700)
ostinato(176.6, 190.3, D3, db(-28))
# 190-207 war
progression(190.3, 207.1, db(-23), 2.0); ostinato(190.3, 207.0, D3, db(-25), 0.2)
for k in range(int((207 - 190.3) / 1.0)): timp(190.31 + k * 1.0, db(-17))
# 207-242 persecution and Holocaust: sparse, a single bowed lament
mus += pad([D2, A2, D3], 207.0, 242.5, db(-28), 2.5, 600)
lament = [(0, A4, 2.2), (2.2, F4, 1.2), (3.4, E4, 1.2), (4.6, D4, 2.8), (8.0, F4, 1.6), (9.6, E4, 1.2), (10.8, Cs4, 1.2), (12.0, D4, 3.4)]
for s0 in [210.5, 227.3]:
    for dt, f, L in lament: strings(s0 + dt, f, L, db(-24))
for dt, f, L in lament[:4]: strings(234.0 + dt * 1.2, f / 2, L * 1.2, db(-26))
# 242-268 the war turns
progression(242.5, 268.7, db(-24), 2.0); ostinato(245.9, 268.6, D3, db(-26), 0.2)
for k in range(int((268.6 - 245.99) / 1.0)): timp(245.99 + k * 1.0, db(-18))
# bunker: sub drone, nearly silent before the date card
mus += pad([D2 / 2 * 2, A2], 268.67, 278.6, db(-24), 1.0, 300)
# aftermath, lesson, never again: lament -> piano -> hopeful D major swell
mus += pad([D2, A2, D3, F3], 279.9, 296.2, db(-27))
for dt, f, L in lament: strings(283.6 + dt, f, L, db(-25))
for dt, f in theme[:6]: piano(292.0 + dt * 1.2, f, db(-21))
progression(296.2, 309.07, db(-25), 2.0)
for k in range(int((309 - 298.85) / 0.5)): timp(298.85 + k * 0.5, db(-20))
mus += pad([D2, A2, D3, F3], 310.2, 321.3, db(-26))
for dt, f in [(0, D4), (1.2, F4), (2.4, A4), (3.6, G4), (4.8, F4), (6.0, E4), (7.2, D4)]: piano(310.4 + dt, f, db(-22))
for dt, f in [(0, A4), (1.0, G4), (2.0, F4), (3.0, E4)]: piano(317.3 + dt, f, db(-23))
Dmaj = [D2, A2, D3, 185.0, A3, D4]
mus += pad(Dmaj, 321.2, DUR, db(-21), 2.5, 1800)
for dt, f, L in [(0.5, 369.99, 2.0), (2.5, A4, 2.0), (4.5, D4 * 2, 2.8)]: strings(321.2 + dt, f, L, db(-24))
piano(321.3, D4, db(-20), 4); piano(323.3, 369.99, db(-21), 4); piano(325.3, A4, db(-21), 3)

# ---------------- voice + mix ----------------
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64); v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
e = lp(np.abs(v), 4); e /= e.max() + 1e-9; duck = 1 - 0.55 * np.clip(e * 3, 0, 1)
mix = v + (amb + mus * db(3)) * duck + sfx * db(-6) * (1 - 0.35 * np.clip(e * 3, 0, 1))
mix /= max(1.0, np.abs(mix).max() / 0.97)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", round(N / SR, 2))
