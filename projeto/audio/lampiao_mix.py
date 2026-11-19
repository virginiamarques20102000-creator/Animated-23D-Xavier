# Ambiente, efeitos e trilha do short "O fim de Lampião", sintetizados por código e mixados sob a narração.
# uso: python3 audio/lampiao_mix.py public/narracao.mp3 out/mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal

SR = 48000
DUR = 2210 / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR

def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return signal.sosfilt(signal.butter(o, [a, b], "band", fs=SR, output="sos"), x)
def db(v): return 10 ** (v / 20)
def win(a, b, fade=0.6):
    """0..1 gate for the span a..b seconds with soft fades"""
    g = np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)
    return g
def place(dst, x, at, gain=1.0):
    i = int(at * SR)
    if i >= len(dst): return
    n = min(len(x), len(dst) - i)
    dst[i:i + n] += x[:n] * gain

# shot spans (s), from story.ts
DAY = [(0, 13.1), (13.1, 27.1), (56.1, 63.2)]
NIGHT = (27.1, 52.4)
RIVER = [(7.7, 13.1), (63.2, DUR)]
GUNSHOTS = [41.2, 41.45, 41.6, 41.95, 42.25, 42.4, 42.8, 43.15, 43.35, 43.9, 44.3, 44.7, 45.05, 45.6, 46.3, 46.95, 47.55,
            48.3, 49.0, 49.55, 50.3, 50.95, 51.6, 52.1]

amb = np.zeros(N); sfx = np.zeros(N); mus = np.zeros(N)
# ---- wind of the sertão: brown noise, slowly breathing ----
wind = lp(np.cumsum(rng.standard_normal(N)) * 0.02, 700)
wind = hp(wind, 60) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t) ** 2)
wind /= np.abs(wind).max()
amb += wind * db(-30)
# ---- cicadas by day ----
cic = bp(rng.standard_normal(N), 4800, 6400) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.21 * t))
cic /= np.abs(cic).max()
amb += cic * db(-38) * sum(win(a, b) for a, b in DAY)
# ---- river ----
riv = lp(hp(rng.standard_normal(N), 150), 1800)
riv /= np.abs(riv).max()
amb += riv * db(-33) * sum(win(a, b, 1.0) for a, b in RIVER)
# ---- night crickets ----
cr = np.zeros(N)
for k in range(int((NIGHT[1] - NIGHT[0]) * 2.2)):
    at = NIGHT[0] + k / 2.2 + rng.uniform(0, 0.2)
    n = int(0.12 * SR); tt = np.arange(n) / SR
    ch = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 30 * tt) > 0) * np.hanning(n)
    place(cr, ch, at, rng.uniform(0.5, 1))
amb += cr * db(-34) * win(*NIGHT)
# ---- campfire crackle (shots 6, 9-11) ----
fire = np.zeros(N)
for a, b in [(27.1, 33.2), (42.1, 52.4)]:
    for _ in range(int((b - a) * 9)):
        n = int(rng.uniform(0.004, 0.015) * SR)
        place(fire, hp(rng.standard_normal(n), 1500) * np.exp(-np.arange(n) / (n / 4)), rng.uniform(a, b), rng.uniform(0.2, 1))
    amb += lp(rng.standard_normal(N), 300) * 0.0 # placeholder (keeps shapes simple)
sfx += fire * db(-24)
# ---- footsteps of the soldiers creeping (shot 7) ----
for k in range(int((38.0 - 33.2) * 3.2)):
    n = int(0.09 * SR)
    st = lp(rng.standard_normal(n), 900) * np.exp(-np.arange(n) / (0.02 * SR))
    place(sfx, st, 33.2 + k / 3.2 + rng.uniform(0, 0.08), db(-14) * rng.uniform(0.6, 1))
# ---- reverb impulse (dry ravine) ----
irn = int(1.2 * SR)
ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / (0.25 * SR)); ir = lp(ir, 3500); ir /= np.abs(ir).sum() ** 0.5 * 6
def gunshot():
    n = int(0.6 * SR); tt = np.arange(n) / SR
    crack = hp(rng.standard_normal(n), 1200) * np.exp(-tt / 0.012)
    body = lp(rng.standard_normal(n), 1400) * np.exp(-tt / 0.06)
    thump = np.sin(2 * np.pi * 70 * tt * (1 - tt)) * np.exp(-tt / 0.08)
    x = crack * 0.9 + body * 0.8 + thump * 0.9
    x = x + signal.fftconvolve(x, ir)[:n] * 2.5
    return x / np.abs(x).max()
for k, g in enumerate(GUNSHOTS):
    place(sfx, gunshot(), g, db(-4) * rng.uniform(0.7, 1.0) * (1.0 if k % 3 else 0.85))
# ---- impacts: the flash ("tudo mudou"), Lampião and Maria Bonita struck ----
def boom(len_s=2.0, f0=55):
    n = int(len_s * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f0 * tt * (1 - 0.2 * tt)) * np.exp(-tt / 0.5) + lp(rng.standard_normal(n), 200) * np.exp(-tt / 0.3) * 0.6
    return x / np.abs(x).max()
def whoosh(len_s=0.8):
    n = int(len_s * SR); e = np.linspace(0, 1, n) ** 2
    x = bp(rng.standard_normal(n), 400, 3000) * e
    return x / np.abs(x).max()
place(sfx, whoosh(), 12.08 - 0.8, db(-12)); place(sfx, boom(), 12.08, db(-6))
place(sfx, boom(2.5, 45), 47.55, db(-5)); place(sfx, boom(2.5, 42), 50.3, db(-7))
place(sfx, whoosh(0.6), 56.1 - 0.5, db(-16)); place(sfx, boom(3.0, 38), 56.31, db(-9))
# ---- original score: a dark sertão drone (D minor), a tension pulse, a quiet ending ----
def pad(freqs, a, b, gain):
    g = win(a, b, 2.0)
    x = sum(np.sin(2 * np.pi * f * t + i) * (1 / (i + 1)) for i, f in enumerate(freqs))
    x = x * (0.8 + 0.2 * np.sin(2 * np.pi * 0.15 * t))
    return lp(x, 1200) * g * gain
mus += pad([73.4, 110, 146.8, 174.6], 0, 27.5, db(-27))
mus += pad([65.4, 98, 130.8, 155.6], 27.0, 52.6, db(-27))
mus += pad([73.4, 110, 146.8, 174.6, 220], 52.4, DUR, db(-25))
# heartbeat pulse from "alguém descobriu" until the shooting
hb = np.zeros(N)
for k in range(int((41.2 - 27.3) * 1.4)):
    at = 27.3 + k / 1.4
    for d, gn in [(0, 1.0), (0.22, 0.7)]:
        n = int(0.25 * SR); tt = np.arange(n) / SR
        place(hb, np.sin(2 * np.pi * 48 * tt) * np.exp(-tt / 0.06), at + d, gn)
mus += hb * db(-12) * np.clip((t - 27.3) / 8, 0, 1)
# a slow viola-like melody at the end (sertão, minor)
mel = [(63.6, 293.7), (64.8, 261.6), (66.0, 220.0), (67.6, 233.1), (69.0, 220.0), (70.4, 196.0), (71.6, 220.0)]
for at, f in mel:
    n = int(1.6 * SR); tt = np.arange(n) / SR
    tone = sum(np.sin(2 * np.pi * f * h * tt) / h for h in (1, 2, 3, 4)) * (1 - np.exp(-tt / 0.01)) * np.exp(-tt / 0.7)
    place(mus, tone, at, db(-24))

# ---- voice ----
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64)
v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
# duck music and ambience under the voice (envelope follower)
env = lp(np.abs(v), 4); env /= env.max() + 1e-9
duck = 1 - 0.55 * np.clip(env * 3, 0, 1)
bed = (amb + mus * db(3)) * duck + sfx * db(-6)
mix = v + bed
mix /= max(1.0, np.abs(mix).max() / 0.97)
out = np.stack([mix, mix], 1)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", sys.argv[2], round(N / SR, 2), "s")
