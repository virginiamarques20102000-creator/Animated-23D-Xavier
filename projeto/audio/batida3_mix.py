# Sons do short do lutador na batida (10 s), todos sintetizados: vento, grilos, fogueira, passos, whoosh, golpe, queda, taiko e flauta.
# uso: python3 audio/samurai_mix.py out/samurai_mix.wav
import sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 12.0; N = int(DUR * SR); rng = np.random.default_rng(3); t = np.arange(N) / SR
def lp(x, f): return signal.sosfilt(signal.butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return signal.sosfilt(signal.butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return signal.sosfilt(signal.butter(2, [a, b], "band", fs=SR, output="sos"), x)
def db(v): return 10 ** (v / 20)
def place(d, x, at, g=1.0):
    i = int(at * SR); n = min(len(x), len(d) - i)
    if n > 0: d[i:i + n] += x[:n] * g
def norm(x): return x / (np.abs(x).max() + 1e-9)
mix = np.zeros(N)
T_HIT = 190 / 30
# ambience
wind = norm(hp(lp(np.cumsum(rng.standard_normal(N)) * 0.02, 600), 60)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t) ** 2)
mix += wind * db(-26)
for k in range(0):
    n = int(0.1 * SR); tt = np.arange(n) / SR
    place(mix, np.sin(2 * np.pi * 4400 * tt) * (np.sin(2 * np.pi * 32 * tt) > 0) * np.hanning(n), k / 2.5 + rng.uniform(0, 0.15), db(-36))
for _ in range(0):
    n = int(rng.uniform(0.004, 0.014) * SR)
    place(mix, hp(rng.standard_normal(n), 1500) * np.exp(-np.arange(n) / (n / 4)), rng.uniform(0, DUR), db(-24) * rng.uniform(0.3, 1))
T_CRASH = 2.0; T_LAND = T_CRASH + 0.993; T_UP = 4.2; T_WALK = 4.9; T_WALK_END = 6.3; T_DRAW = 6.4
SHOTS = [6.9, 8.15, 8.4]; T_IMPACT = 7.9; T_CRACK = 8.7; T_DOWN = T_CRACK + 1.342
for k in range(10):
    at = rng.uniform(0, DUR); n = int(0.25 * SR); tt = np.arange(n) / SR
    place(mix, np.sin(2 * np.pi * (2600 + 900 * np.sin(2 * np.pi * 9 * tt)) * tt) * np.hanning(n), at, db(-34))
def whoosh(L, a=500, b=4000):
    n = int(L * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return norm(bp(rng.standard_normal(n), a, b) * e)
thud = lambda L=0.25, f=250: norm(lp(rng.standard_normal(int(L * SR)), f)) * np.exp(-np.arange(int(L * SR)) / (0.05 * SR))
# engine + screech + crash
tt = t[:int(T_CRASH * SR)]; f0 = 55 + 12 * tt / T_CRASH
eng = signal.sawtooth(2 * np.pi * np.cumsum(f0) / SR) * 0.6 + 0.4 * lp(rng.standard_normal(len(tt)), 300)
mix[:len(tt)] += lp(eng, 900) * db(-16) * np.minimum(1, tt / 0.3)
n = int(0.85 * SR); tt = np.arange(n) / SR
place(mix, norm(bp(rng.standard_normal(n), 1800, 3200) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt))) * np.minimum(1, tt / 0.1), T_CRASH - 0.85, db(-14))
n = int(1.4 * SR); tt = np.arange(n) / SR
crash = norm(lp(rng.standard_normal(n), 2500) * np.exp(-tt / 0.15) + 0.6 * np.sin(2 * np.pi * 60 * tt * (1 - 0.3 * tt)) * np.exp(-tt / 0.25)
             + 0.4 * sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.3) for f in (730, 1170, 1630)))
place(mix, crash, T_CRASH, db(-1))
for k in range(14): place(mix, norm(hp(rng.standard_normal(int(0.04 * SR)), 5000)) * np.exp(-np.arange(int(0.04 * SR)) / (0.008 * SR)), T_CRASH + 0.05 + rng.uniform(0, 0.7), db(-16))
for at, g in [(T_CRASH + 0.36, -6), (T_CRASH + 0.6, -12), (T_CRASH + 0.78, -16)]: place(mix, thud(), at, db(g))
for k, at in enumerate([0.65, 0.95, 1.15, 1.3]): place(mix, thud(0.15), T_CRASH + at, db(-12 - 3 * k))
n = int(9.5 * SR); tt = np.arange(n) / SR      # fire/steam crackle-hiss under the black smoke
place(mix, norm(bp(rng.standard_normal(n), 2500, 7000)) * np.exp(-tt / 4) * np.minimum(1, tt / 0.3), T_CRASH + 0.3, db(-26))
# thrown out: rising whoosh while he flies, body slam + scrape slide, little dazed bird-tweet
place(mix, whoosh(0.95, 300, 2500), T_CRASH + 0.02, db(-11))
place(mix, thud(0.3, 200), T_LAND, db(-3))
n = int(0.5 * SR); tt = np.arange(n) / SR
place(mix, norm(bp(rng.standard_normal(n), 400, 2500)) * np.exp(-tt / 0.18), T_LAND + 0.03, db(-10))
for k in range(3):
    n = int(0.12 * SR); tt = np.arange(n) / SR; place(mix, np.sin(2 * np.pi * (2800 + 1200 * tt / 0.12) * tt) * np.hanning(n), T_LAND + 0.6 + k * 0.22, db(-24))
# getting up (cloth + grunt-like low thump), real footsteps: heel-toe, 2 per 0.62 s
place(mix, whoosh(0.4, 200, 1500), T_UP, db(-18)); place(mix, thud(0.12), T_UP + 0.5, db(-12))
n_steps = int((T_WALK_END - T_WALK) / 0.31)
for k in range(n_steps + 1):
    at = T_WALK + 0.1 + k * 0.31; place(mix, thud(0.07, 600), at, db(-14)); place(mix, thud(0.05, 1500), at + 0.05, db(-20))
# draw, tension drums, the first shot opens the slow-motion bullet: pitch-dropped whoosh and a low drone
place(mix, whoosh(0.2, 1500, 6000), T_DRAW, db(-14))
n = int(0.03 * SR); place(mix, norm(hp(rng.standard_normal(n), 3000)) * np.exp(-np.arange(n) / (0.004 * SR)), T_DRAW + 0.28, db(-10))
def drum(f0=70, L=0.6):
    n = int(L * SR); tt = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * f0 * tt * (1 - 0.25 * tt)) * np.exp(-tt / 0.15))
for at in [6.45, 6.62, 6.76, 6.85]: place(mix, drum(), at, db(-14))
def shot():
    n = int(0.8 * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 1200) * np.exp(-tt / 0.01) + lp(rng.standard_normal(n), 1500) * np.exp(-tt / 0.07) + np.sin(2 * np.pi * 80 * tt) * np.exp(-tt / 0.08)
    return norm(x + 0.4 * lp(rng.standard_normal(n), 800) * np.exp(-tt / 0.35))
place(mix, shot(), SHOTS[0], db(-1))
n = int((T_IMPACT - SHOTS[0]) * SR); tt = np.arange(n) / SR
fr = 900 * np.exp(-tt * 2.2) + 120
place(mix, norm(bp(rng.standard_normal(n), 150, 1200) * (0.4 + 0.6 * np.exp(-tt * 1.5))) + 0.5 * np.sin(2 * np.pi * np.cumsum(fr) / SR), SHOTS[0] + 0.05, db(-12))
place(mix, thud(0.2, 500), T_IMPACT, db(-4)); place(mix, whoosh(0.3, 2000, 8000), T_IMPACT, db(-14))
for g in SHOTS[1:]:
    place(mix, shot(), g, db(-2)); place(mix, thud(0.12), g + 0.04, db(-10))
for g in SHOTS:
    n = int(0.4 * SR); tt = np.arange(n) / SR
    place(mix, sum(np.sin(2 * np.pi * f * tt) for f in (4200, 6100)) * np.exp(-tt / 0.06) * 0.5, g + 0.55, db(-24))
# the tree: creak (resonant scraping), crack, a rushing fall, the huge thud + leaves
n = int(1.0 * SR); tt = np.arange(n) / SR
creak = sum(np.sin(2 * np.pi * f * tt * (1 + 0.15 * np.sin(2 * np.pi * 1.3 * tt))) for f in (180, 260)) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * tt) ** 2)
place(mix, norm(creak * np.hanning(n)), T_CRACK - 0.3, db(-14))
n = int(0.25 * SR); place(mix, norm(hp(rng.standard_normal(n), 1500)) * np.exp(-np.arange(n) / (0.03 * SR)), T_CRACK, db(-4))
place(mix, whoosh(T_DOWN - T_CRACK, 200, 2500), T_CRACK + 0.05, db(-10))
place(mix, thud(0.9, 160), T_DOWN, db(0)); place(mix, crash * 0.5, T_DOWN, db(-6))
n = int(1.5 * SR); place(mix, norm(bp(rng.standard_normal(n), 2000, 6000)) * np.hanning(n), T_DOWN, db(-14))
# his scared bits: a squeak on the jump, seat bump, scoot scrapes
n = int(0.15 * SR); tt = np.arange(n) / SR; place(mix, np.sin(2 * np.pi * (900 + 1500 * tt / 0.15) * tt) * np.hanning(n), T_CRACK + 0.15, db(-14))
place(mix, thud(0.15), T_CRACK + 0.45, db(-8))
for k in range(5): place(mix, norm(bp(rng.standard_normal(int(0.13 * SR)), 300, 2000)) * np.hanning(int(0.13 * SR)), T_CRACK + 0.6 + k * 0.36, db(-16))
mix /= max(1, np.abs(mix).max() / 0.95)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok")
