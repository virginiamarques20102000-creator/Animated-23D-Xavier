# Sons do short do lutador samurai brasileiro (10 s), todos sintetizados: vento, grilos, fogueira, passos, whoosh, golpe, queda, taiko e flauta.
# uso: python3 audio/samurai_mix.py out/samurai_mix.wav
import sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 10.0; N = int(DUR * SR); rng = np.random.default_rng(3); t = np.arange(N) / SR
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
for k in range(int(DUR * 2.5)):
    n = int(0.1 * SR); tt = np.arange(n) / SR
    place(mix, np.sin(2 * np.pi * 4400 * tt) * (np.sin(2 * np.pi * 32 * tt) > 0) * np.hanning(n), k / 2.5 + rng.uniform(0, 0.15), db(-36))
for _ in range(int(DUR * 10)):
    n = int(rng.uniform(0.004, 0.014) * SR)
    place(mix, hp(rng.standard_normal(n), 1500) * np.exp(-np.arange(n) / (n / 4)), rng.uniform(0, DUR), db(-24) * rng.uniform(0.3, 1))
T_HIT = 191 / 30
def phys_to_real(tp): return tp / 0.4 if tp < 0.2 else 0.5 + (tp - 0.2)
# berimbau (ginga rhythm): plucked string with a pitch bend, plus caxixi shaker; fades out when the rival charges
def beri(f0, L=0.35, bend=1.0):
    n = int(L * SR); tt = np.arange(n) / SR; fr = f0 * (1 + (bend - 1) * np.minimum(1, tt / 0.08))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return norm((np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * np.exp(-tt / 0.18) * np.minimum(1, tt / 0.003))
pat = [(0.0, 196, 1.0), (0.3, 196, 1.0), (0.6, 220, 1.06), (0.9, 196, 1.0)]
for bar in range(5):
    for off, f0, bd in pat:
        at = bar * 1.2 + off
        g = db(-12) * (1 if at < 4.0 else max(0, 1 - (at - 4.0) / 1.0))
        place(mix, beri(f0, bend=bd), at, g)
        n = int(0.06 * SR); place(mix, norm(bp(rng.standard_normal(n), 5000, 11000)) * np.exp(-np.arange(n) / (0.015 * SR)), at + 0.15, g * db(-6))
# whip pan and zoom-through swishes
def whoosh(L, a=500, b=4000):
    n = int(L * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return norm(bp(rng.standard_normal(n), a, b) * e)
place(mix, whoosh(0.3, 900, 6000), 1.85, db(-10)); place(mix, whoosh(0.45, 300, 3000), 3.4, db(-10))
# rival footsteps (running in from 3.87 s)
for k in range(int((T_HIT - 3.87) * 4.8)):
    n = int(0.08 * SR); place(mix, lp(rng.standard_normal(n), 800) * np.exp(-np.arange(n) / (0.018 * SR)), 3.87 + k / 4.8, db(-12) * min(1, 0.4 + k * 0.08))
# taiko accelerating into the strike
def taiko(f0=70, L=0.7):
    n = int(L * SR); tt = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * f0 * tt * (1 - 0.25 * tt)) * np.exp(-tt / 0.18) + 0.3 * lp(rng.standard_normal(n), 400) * np.exp(-tt / 0.03))
for at, g in [(4.2, -12), (4.8, -11), (5.25, -10), (5.6, -9), (5.85, -8), (6.05, -7), (6.2, -6)]:
    place(mix, taiko(), at, db(g))
place(mix, whoosh(0.35, 800, 3000), 5.4, db(-16))           # blade up
place(mix, whoosh(0.18, 1200, 7000), T_HIT - 0.12, db(-7))  # the cut
n = int(1.6 * SR); tt = np.arange(n) / SR
clang = norm(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in [(1870, 0.5), (2630, 0.35), (3410, 0.25), (5120, 0.12)]) + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.01))
place(mix, clang, T_HIT, db(-6)); place(mix, taiko(48, 1.6), T_HIT, db(-2))
# slow-motion: a low pitched-down boom swell under the hanging moment
n = int(1.0 * SR); tt = np.arange(n) / SR
place(mix, norm(np.sin(2 * np.pi * 38 * tt) * np.sin(np.pi * tt / 1.0) + 0.3 * lp(rng.standard_normal(n), 150)), T_HIT + 0.05, db(-10))
tl = 2 * 3.4 / 9.8
place(mix, norm(lp(rng.standard_normal(int(0.3 * SR)), 300)) * np.exp(-np.arange(int(0.3 * SR)) / (0.06 * SR)), T_HIT + phys_to_real(tl), db(-6))
place(mix, whoosh(0.12, 2000, 9000), 236 / 30, db(-12))     # chiburi flick
# the berimbau comes back, lighter, at the end
for bar in range(2):
    for off, f0, bd in pat:
        at = 8.75 + bar * 1.2 + off
        if at < DUR - 0.2: place(mix, beri(f0, bend=bd), at, db(-15))
mix /= max(1, np.abs(mix).max() / 0.95)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok")
