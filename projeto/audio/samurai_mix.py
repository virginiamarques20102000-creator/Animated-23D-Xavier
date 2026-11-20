# Sons do short do samurai (10 s), todos sintetizados: vento, grilos, fogueira, passos, whoosh, golpe, queda, taiko e flauta.
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
# bandit footsteps (running in from 4.27 s)
for k in range(int((T_HIT - 4.27) * 4.4)):
    n = int(0.08 * SR); place(mix, lp(rng.standard_normal(n), 800) * np.exp(-np.arange(n) / (0.018 * SR)), 4.27 + k / 4.4, db(-12) * min(1, 0.4 + k * 0.08))
# taiko: sparse, then accelerating into the strike
def taiko(f0=70, L=0.7):
    n = int(L * SR); tt = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * f0 * tt * (1 - 0.25 * tt)) * np.exp(-tt / 0.18) + 0.3 * lp(rng.standard_normal(n), 400) * np.exp(-tt / 0.03))
for at, g in [(0.3, -12), (1.6, -14), (2.66, -10), (3.0, -6), (4.2, -12), (4.7, -11), (5.1, -10), (5.4, -9), (5.65, -8), (5.85, -7), (6.0, -6), (6.12, -6)]:
    place(mix, taiko(), at, db(g))
# shock sting when he hears the noise
place(mix, norm(bp(rng.standard_normal(int(0.5 * SR)), 2000, 6000)) * np.exp(-np.arange(int(0.5 * SR)) / (0.08 * SR)), 3.0, db(-16))
# anticipation swish (blade up) and the strike swish
def whoosh(L, a=500, b=4000):
    n = int(L * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return norm(bp(rng.standard_normal(n), a, b) * e)
place(mix, whoosh(0.4, 800, 3000), 5.0, db(-18))
place(mix, whoosh(0.22, 1200, 7000), T_HIT - 0.15, db(-8))
# hit: metallic clang + body thump + big taiko, then the fall thud
n = int(1.2 * SR); tt = np.arange(n) / SR
clang = norm(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in [(1870, 0.35), (2630, 0.25), (3410, 0.18), (5120, 0.1)]) + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.01))
place(mix, clang, T_HIT, db(-6)); place(mix, taiko(52, 1.2), T_HIT, db(-2))
place(mix, norm(lp(rng.standard_normal(int(0.3 * SR)), 300)) * np.exp(-np.arange(int(0.3 * SR)) / (0.06 * SR)), T_HIT + 0.45, db(-8))
# calm shakuhachi-like flute after the fight (D minor pentatonic)
for at, f, L in [(7.9, 587.3, 0.9), (8.7, 523.3, 0.6), (9.2, 440.0, 0.8)]:
    n = int(L * SR); tt = np.arange(n) / SR; vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * tt)
    x = (np.sin(2 * np.pi * f * vib * tt) + 0.25 * np.sin(4 * np.pi * f * vib * tt)) * np.minimum(1, tt / 0.12) * np.minimum(1, (L - tt) / 0.25)
    x += 0.15 * bp(rng.standard_normal(n), f, f * 3) * np.minimum(1, tt / 0.12) * np.minimum(1, (L - tt) / 0.25)
    place(mix, x, at, db(-18))
mix /= max(1, np.abs(mix).max() / 0.95)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok")
