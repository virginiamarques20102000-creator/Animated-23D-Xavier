# Trilha, ambiente e efeitos do short "Sepé Tiaraju", sintetizados e mixados sob a narração (64,2 s).
# uso: python3 audio/sepe_mix.py public/sepe_narracao.mp3 out/sepe_mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 1926 / 30; N = int(DUR * SR); rng = np.random.default_rng(11); t = np.arange(N) / SR
def lp(x, f): return signal.sosfilt(signal.butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return signal.sosfilt(signal.butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return signal.sosfilt(signal.butter(2, [a, b], "band", fs=SR, output="sos"), x)
def db(v): return 10 ** (v / 20)
def norm(x): return x / (np.abs(x).max() + 1e-9)
def win(a, b, fade=0.8): return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)
def place(d, x, at, g=1.0):
    i = int(at * SR); n = min(len(x), len(d) - i)
    if n > 0 and i >= 0: d[i:i + n] += x[:n] * g
amb = np.zeros(N); sfx = np.zeros(N); mus = np.zeros(N)
# pampa wind + birds by day, crickets at sunset
wind = norm(hp(lp(np.cumsum(rng.standard_normal(N)) * 0.02, 700), 60)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.08 * t) ** 2)
amb += wind * db(-28)
for k in range(40):
    at = rng.uniform(0, 49); n = int(0.22 * SR); tt = np.arange(n) / SR
    place(amb, np.sin(2 * np.pi * (2400 + 1100 * np.sin(2 * np.pi * 11 * tt)) * tt) * np.hanning(n), at, db(-34) * (1 if not 17.8 < at < 33 else 0.2))
for k in range(int(14 * 2.3)):
    at = 50 + k / 2.3 + rng.uniform(0, 0.2); n = int(0.1 * SR); tt = np.arange(n) / SR
    place(amb, np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 30 * tt) > 0) * np.hanning(n), at, db(-38))
def whoosh(L, a=400, b=3500):
    n = int(L * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return norm(bp(rng.standard_normal(n), a, b) * e)
def musket():
    n = int(1.2 * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 900) * np.exp(-tt / 0.015) + lp(rng.standard_normal(n), 900) * np.exp(-tt / 0.12) + 0.9 * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.15)
    return norm(x + 0.5 * lp(rng.standard_normal(n), 500) * np.exp(-tt / 0.6))
def thud(L=0.3, f=220): n = int(L * SR); return norm(lp(rng.standard_normal(n), f)) * np.exp(-np.arange(n) / (0.06 * SR))
def arrow(): n = int(0.5 * SR); tt = np.arange(n) / SR; return norm(bp(rng.standard_normal(n), 1500, 6000) * np.sin(np.pi * tt / 0.5) ** 2)
# transitions
for at in [1.85, 8.65, 10.6, 17.7, 22.55, 33.35, 40.1, 50.0, 57.2]: place(sfx, whoosh(0.5), at - 0.25, db(-17))
# flags flapping during the treaty
n = int(8 * SR); place(amb, norm(bp(rng.standard_normal(n), 120, 900) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 1.6 * np.arange(n) / SR)))), 2.0, db(-30))
# the war (17.8 s): three volleys by eight muskets, arrows answering
for v, t0 in enumerate([18.2, 19.6, 21.0]):
    for k in range(8): place(sfx, musket(), t0 + 0.18 * k * (1 - 0.2 * v), db(-9 - 2 * (k % 3)))
for k in range(14): place(sfx, arrow(), 18.6 + k * 0.13, db(-20))
for k in range(12): place(sfx, arrow(), 20.4 + k * 0.13, db(-20))
# Sepé appears: a deep boom and a rising swell; the war cries are drums
place(sfx, thud(1.2, 120), 22.66, db(-8)); place(sfx, thud(0.5, 160), 25.2, db(-10))
# the march: drums in step (snare rolls), boots
for k in range(int((40.2 - 33.4) / 0.43)):
    at = 33.5 + k * 0.43; place(sfx, thud(0.09, 700), at, db(-15)); n = int(0.12 * SR); place(sfx, norm(hp(rng.standard_normal(n), 1800)) * np.exp(-np.arange(n) / (0.03 * SR)), at, db(-20))
# the ride: galloping hooves (3-beat), muskets, the fall
for k in range(int((45.4 - 40.2) * 2.3)):
    at = 40.2 + k / 2.3
    for d in (0, 0.09, 0.2): place(sfx, thud(0.08, 500), at + d, db(-13))
for k in range(5): place(sfx, musket(), 44.4 + 0.2 * k, db(-10))
for k in range(5): place(sfx, musket(), 45.2 + 0.03 * k, db(-8))
place(sfx, thud(0.6, 180), 45.45, db(-2)); place(sfx, whoosh(0.9, 300, 2000), 45.5, db(-12)); place(sfx, thud(0.4, 200), 46.4, db(-4))
for k in range(5): place(sfx, musket(), 47.6 + 0.1 * k, db(-14))
# Caiboaté: rolling volleys, arrows, at sunset
for v in range(4):
    for k in range(12): place(sfx, musket(), 50.3 + v * 1.4 + k * 0.09, db(-11 - (k % 4)))
for k in range(10): place(sfx, arrow(), 50.5 + k * 0.13, db(-22))
# score: a low Guarani-flute-like melody over a drone; war drums under the battles; quiet at the end
def pad(freqs, a, b, gain):
    g = win(a, b, 2.0); x = sum(np.sin(2 * np.pi * f * t + i) / (i + 1) for i, f in enumerate(freqs)); return lp(x * (0.8 + 0.2 * np.sin(2 * np.pi * 0.12 * t)), 1100) * g * gain
mus += pad([73.4, 110, 146.8], 0, 17.8, db(-26))
mus += pad([65.4, 98, 130.8, 196], 17.6, 50.2, db(-25))
mus += pad([73.4, 110, 146.8, 220], 50, DUR, db(-24))
def drum(f0=60, L=0.6): n = int(L * SR); tt = np.arange(n) / SR; return norm(np.sin(2 * np.pi * f0 * tt * (1 - 0.25 * tt)) * np.exp(-tt / 0.16) + 0.3 * lp(rng.standard_normal(n), 300) * np.exp(-tt / 0.03))
for a, b2, step in [(17.8, 22.4, 0.5), (27.2, 33.0, 0.4), (40.2, 45.4, 0.36), (50.1, 55.6, 0.42)]:
    k = 0
    while a + k * step < b2: place(mus, drum(), a + k * step, db(-14 if k % 2 == 0 else -18)); k += 1
def flute(at, f, L, g):
    n = int(L * SR); tt = np.arange(n) / SR; vib = 1 + 0.007 * np.sin(2 * np.pi * 5 * tt)
    x = (np.sin(2 * np.pi * f * vib * tt) + 0.2 * np.sin(4 * np.pi * f * vib * tt)) * np.minimum(1, tt / 0.1) * np.minimum(1, (L - tt) / 0.3)
    place(mus, x + 0.12 * bp(rng.standard_normal(n), f, 3 * f) * np.minimum(1, tt / 0.1) * np.minimum(1, (L - tt) / 0.3), at, g)
for at, f, L in [(22.8, 293.7, 1.0), (23.9, 349.2, 0.8), (24.8, 440.0, 1.6), (56.0, 440.0, 1.4), (57.6, 392.0, 1.0), (58.8, 349.2, 1.2), (60.3, 293.7, 1.6), (62.1, 220.0, 2.0)]:
    flute(at, f, L, db(-20))
# voice
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64); v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
env = lp(np.abs(v), 4); env /= env.max() + 1e-9; duck = 1 - 0.5 * np.clip(env * 3, 0, 1)
mix = v + (amb + mus * db(2)) * duck + sfx * db(-7) * (1 - 0.3 * np.clip(env * 3, 0, 1))
mix /= max(1.0, np.abs(mix).max() / 0.97)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", round(N / SR, 2))
