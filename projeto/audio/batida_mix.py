# Sons do short do lutador na batida (10 s), todos sintetizados: vento, grilos, fogueira, passos, whoosh, golpe, queda, taiko e flauta.
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
for k in range(0):
    n = int(0.1 * SR); tt = np.arange(n) / SR
    place(mix, np.sin(2 * np.pi * 4400 * tt) * (np.sin(2 * np.pi * 32 * tt) > 0) * np.hanning(n), k / 2.5 + rng.uniform(0, 0.15), db(-36))
for _ in range(0):
    n = int(rng.uniform(0.004, 0.014) * SR)
    place(mix, hp(rng.standard_normal(n), 1500) * np.exp(-np.arange(n) / (n / 4)), rng.uniform(0, DUR), db(-24) * rng.uniform(0.3, 1))
T_CRASH = 72 / 30; T_EXIT = 4.3; SHOTS = [7.0, 7.5, 8.05]
# daytime: no crickets in this one (ambience above kept quiet), add birds
for k in range(10):
    at = rng.uniform(0, DUR); n = int(0.25 * SR); tt = np.arange(n) / SR
    place(mix, np.sin(2 * np.pi * (2600 + 900 * np.sin(2 * np.pi * 9 * tt)) * tt) * np.hanning(n), at, db(-34))
# engine: low sawtooth hum + rumble, pitch rising, gone at the crash
tt = t[:int(T_CRASH * SR)]
f0 = 55 + 12 * tt / T_CRASH
eng = signal.sawtooth(2 * np.pi * np.cumsum(f0) / SR) * 0.6 + 0.4 * lp(rng.standard_normal(len(tt)), 300)
mix[:len(tt)] += lp(eng, 900) * db(-16) * np.minimum(1, tt / 0.3)
# tyre screech on the swerve (1.55 s ->)
n = int((T_CRASH - 1.55) * SR); tt = np.arange(n) / SR
place(mix, norm(bp(rng.standard_normal(n), 1800, 3200) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt))) * np.minimum(1, tt / 0.1), 1.55, db(-14))
# the crash: noise blast, metal crunch, glass tinkle, thump of the rear slamming down, two small bounces
n = int(1.4 * SR); tt = np.arange(n) / SR
crash = norm(lp(rng.standard_normal(n), 2500) * np.exp(-tt / 0.15) + 0.6 * np.sin(2 * np.pi * 60 * tt * (1 - 0.3 * tt)) * np.exp(-tt / 0.25)
             + 0.4 * sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.3) for f in (730, 1170, 1630)))
place(mix, crash, T_CRASH, db(-1))
for k in range(14): place(mix, norm(hp(rng.standard_normal(int(0.04 * SR)), 5000)) * np.exp(-np.arange(int(0.04 * SR)) / (0.008 * SR)), T_CRASH + 0.05 + rng.uniform(0, 0.7), db(-16))
thud = lambda L=0.25: norm(lp(rng.standard_normal(int(L * SR)), 250)) * np.exp(-np.arange(int(L * SR)) / (0.05 * SR))
for at, g in [(T_CRASH + 0.36, -6), (T_CRASH + 0.6, -12), (T_CRASH + 0.78, -16)]: place(mix, thud(), at, db(g))
# tyre bouncing away, steam hiss, leaves rustle
for k, at in enumerate([0.65, 0.95, 1.15, 1.3]): place(mix, thud(0.15), T_CRASH + at, db(-12 - 3 * k))
n = int(6.5 * SR); tt = np.arange(n) / SR
place(mix, norm(bp(rng.standard_normal(n), 3000, 8000)) * np.exp(-tt / 2.5) * np.minimum(1, tt / 0.3), T_CRASH + 0.3, db(-24))
place(mix, norm(bp(rng.standard_normal(int(1.5 * SR)), 2000, 6000)) * np.hanning(int(1.5 * SR)), T_CRASH + 0.1, db(-22))
# jump out: whoosh + landing thud + furious stomps
def whoosh(L, a=500, b=4000):
    n = int(L * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return norm(bp(rng.standard_normal(n), a, b) * e)
place(mix, whoosh(0.4), T_EXIT, db(-14)); place(mix, thud(), T_EXIT + 0.45, db(-6))
for k in range(5): place(mix, thud(0.12), 5.1 + k * 0.45, db(-9))
# pistol: draw (leather + click), three shots with a crack and a wood thunk, casings tinkling
place(mix, whoosh(0.2, 1500, 6000), 6.0, db(-14))
n = int(0.03 * SR); place(mix, norm(hp(rng.standard_normal(n), 3000)) * np.exp(-np.arange(n) / (0.004 * SR)), 6.3, db(-10))
def shot():
    n = int(0.8 * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 1200) * np.exp(-tt / 0.01) + lp(rng.standard_normal(n), 1500) * np.exp(-tt / 0.07) + np.sin(2 * np.pi * 80 * tt) * np.exp(-tt / 0.08)
    return norm(x + 0.4 * lp(rng.standard_normal(n), 800) * np.exp(-tt / 0.35))
for g in SHOTS:
    place(mix, shot(), g, db(-2)); place(mix, thud(0.12), g + 0.04, db(-10))
    n = int(0.4 * SR); tt = np.arange(n) / SR
    place(mix, sum(np.sin(2 * np.pi * f * tt) for f in (4200, 6100)) * np.exp(-tt / 0.06) * 0.5, g + 0.55, db(-24))
# a little tension drum before the shots, then a cheeky ending sting
def drum(f0=70, L=0.6):
    n = int(L * SR); tt = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * f0 * tt * (1 - 0.25 * tt)) * np.exp(-tt / 0.15))
for at in [6.3, 6.55, 6.75, 6.9]: place(mix, drum(), at, db(-14))
for at, f0 in [(8.9, 523.3), (9.05, 659.3), (9.2, 784.0)]:
    n = int(0.3 * SR); tt = np.arange(n) / SR; place(mix, np.sin(2 * np.pi * f0 * tt) * np.exp(-tt / 0.12), at, db(-16))
mix /= max(1, np.abs(mix).max() / 0.95)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok")
