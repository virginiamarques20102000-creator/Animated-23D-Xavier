# Trilha original, ambiente e efeitos do vídeo "Lula e a crise de março de 2008" (221 s). Tempos = palavras de
# src/videos/crise/tempos_palavras.txt e os cortes dos planos (shots_*.ts). A voz entra intocada.
# uso: python3 audio/crise_mix.py voz.wav saida.wav
import sys, re, glob, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 221.0; N = int(DUR * SR); rng = np.random.default_rng(2008); t = np.arange(N) / SR
def lp(x, f): return signal.sosfilt(signal.butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return signal.sosfilt(signal.butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return signal.sosfilt(signal.butter(2, [a, b], "band", fs=SR, output="sos"), x)
def db(v): return 10 ** (v / 20)
def norm(x): return x / (np.abs(x).max() + 1e-9)
L = np.zeros(N); R = np.zeros(N); mus = np.zeros(N)
def place(x, at, g=1.0, pan=None):
    i = int(at * SR); n = min(len(x), N - i)
    if n <= 0 or i < 0: return
    p = rng.uniform(-0.5, 0.5) if pan is None else pan
    L[i:i + n] += x[:n] * g * np.sqrt((1 - p) / 2) * 1.41; R[i:i + n] += x[:n] * g * np.sqrt((1 + p) / 2) * 1.41
def tt(d): return np.arange(int(d * SR)) / SR
# ---------------- efeitos (cada um sorteia os parâmetros) ----------------
def whoosh(at, g=-22):
    d = rng.uniform(0.35, 0.6); x = tt(d); n = rng.standard_normal(len(x)); f0 = rng.uniform(500, 900)
    y = np.zeros(len(x)); fc = f0 + 2200 * np.sin(np.pi * x / d) ** 2
    for k in range(0, len(x), 2400): y[k:k + 2400] = bp(n[k:k + 2400], max(80, fc[k] * 0.5), fc[k] * 1.4)
    place(y * np.sin(np.pi * x / d) ** 2, at - d * 0.55, db(g))
def boom(at, g=-6, big=1.0):
    x = tt(3.2 * big); n = rng.standard_normal(len(x))
    body = lp(n, rng.uniform(120, 180)) * np.exp(-x * rng.uniform(1.2, 1.8) / big) * 3
    crack = hp(n, 1500) * np.exp(-x * 30); sub = np.sin(2 * np.pi * (48 - 18 * x) * x) * np.exp(-x * 2.5)
    deb = np.zeros(len(x))
    for k in range(40):
        i = int(rng.uniform(0.25, 2.2) * SR); m = 600
        if i + m < len(x): deb[i:i + m] += hp(rng.standard_normal(m), 2500) * np.exp(-np.arange(m) / 90) * rng.uniform(0.1, 0.4)
    place(norm(body + crack * 0.8 + sub * 0.9 + deb), at, db(g))
def hit(at, g=-12):
    x = tt(0.8); place(norm(np.sin(2 * np.pi * (70 - 30 * x) * x) * np.exp(-x * 7) + lp(rng.standard_normal(len(x)), 400) * np.exp(-x * 14) * 0.5), at, db(g), 0)
def shot(at, g=-20):
    x = tt(0.5); place(norm(hp(rng.standard_normal(len(x)), 800) * np.exp(-x * 25) + lp(rng.standard_normal(len(x)), 300) * np.exp(-x * 9)), at, db(g))
def click(at, g=-26):
    x = tt(0.12); place(norm(hp(rng.standard_normal(len(x)), 3000) * np.exp(-x * 120) + np.sin(2 * np.pi * 2100 * x) * np.exp(-x * 60) * 0.3), at, db(g))
def ring(a, b, g=-20):
    x = tt(b - a); on = (np.floor(x / 0.05) % 2 == 0) & ((x % 1.6) < 0.9)
    place(norm((np.sin(2 * np.pi * 1300 * x) + np.sin(2 * np.pi * 1700 * x)) * on) * np.minimum(1, (b - a - x) / 0.05), a, db(g), -0.2)
def rumble(a, b, g=-22, f=60):
    x = tt(b - a); y = lp(rng.standard_normal(len(x)), 220) * (1 + 0.4 * np.sin(2 * np.pi * 7 * x)) + 0.6 * np.sin(2 * np.pi * f * x + 2 * np.sin(2 * np.pi * 3 * x))
    tr = hp(rng.standard_normal(len(x)), 1800) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 11 * x))) * 0.25
    place(norm(y + tr) * np.minimum(1, x / 0.4) * np.minimum(1, (b - a - x) / 0.4), a, db(g))
def jet(a, d, g=-12, pan0=-0.8):
    x = tt(d); env = np.exp(-((x - d * 0.55) / (d * 0.22)) ** 2); y = bp(rng.standard_normal(len(x)), 300, 4000) + 0.4 * np.sin(2 * np.pi * (180 - 60 * x / d) * x)
    yy = norm(y) * env; i = int(a * SR); n = min(len(yy), N - i); pan = np.linspace(pan0, -pan0, n)
    L[i:i + n] += yy[:n] * db(g) * np.sqrt((1 - pan) / 2) * 1.41; R[i:i + n] += yy[:n] * db(g) * np.sqrt((1 + pan) / 2) * 1.41
def heli(a, b, g=-18):
    x = tt(b - a); y = lp(rng.standard_normal(len(x)), 300) * (0.3 + 0.7 * (np.sin(2 * np.pi * 19 * x) > 0.6)) + hp(rng.standard_normal(len(x)), 2000) * 0.15
    place(norm(y) * np.minimum(1, x / 0.5) * np.minimum(1, (b - a - x) / 0.4), a, db(g))
def crowd(a, b, g=-22, cheer=False):
    x = tt(b - a); y = bp(rng.standard_normal(len(x)), 300, 2600 if cheer else 1300) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.1 * x)))
    place(norm(y) * np.minimum(1, x / 0.5) * np.minimum(1, (b - a - x) / 0.5), a, db(g), 0)
def rain(a, b, g=-24):
    x = tt(b - a); place(norm(hp(rng.standard_normal(len(x)), 1500) + lp(rng.standard_normal(len(x)), 500) * 0.3) * np.minimum(1, x / 0.5) * np.minimum(1, (b - a - x) / 0.5), a, db(g), 0)
def thunder(at, g=-8):
    x = tt(3.5); place(norm(lp(rng.standard_normal(len(x)), 140) * (np.exp(-x * 1.2) + 0.6 * np.exp(-((x - 0.5) / 0.3) ** 2)) + hp(rng.standard_normal(len(x)), 1000) * np.exp(-x * 20) * 0.5), at, db(g))
def jungle(a, b, g=-30, night=True):
    x = tt(b - a); y = np.zeros(len(x))
    if night:
        y += bp(rng.standard_normal(len(x)), 3800, 5200) * (0.5 + 0.5 * (np.sin(2 * np.pi * 26 * x) > 0)) * 0.5
    for k in range(int((b - a) * 2)):
        at = rng.uniform(0, b - a - 0.3); m = int(0.2 * SR); xx = np.arange(m) / SR; i = int(at * SR)
        y[i:i + m] += np.sin(2 * np.pi * (1800 + 900 * np.sin(2 * np.pi * 9 * xx)) * xx) * np.hanning(m) * 0.6
    place(norm(y) * np.minimum(1, x / 0.6) * np.minimum(1, (b - a - x) / 0.6), a, db(g), 0)
def tear(at, g=-14):
    x = tt(0.45); place(norm(hp(rng.standard_normal(len(x)), 900) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 90 * x))) * np.exp(-x * 4)), at, db(g))
def flip(at, g=-28):
    x = tt(0.09); place(norm(bp(rng.standard_normal(len(x)), 1500, 6000) * np.exp(-x * 50)), at, db(g))
def door(at, g=-12):
    x = tt(0.9); place(norm(lp(rng.standard_normal(len(x)), 250) * np.exp(-x * 9) + np.sin(2 * np.pi * 90 * x) * np.exp(-x * 12)), at, db(g))
def flap(a, b, g=-26):
    for k in np.arange(a, b, 0.11): x = tt(0.06); place(norm(lp(rng.standard_normal(len(x)), 900)) * np.hanning(len(x)), k, db(g))
def spot(at, g=-14):
    x = tt(0.6); place(norm(np.sin(2 * np.pi * 55 * x) * np.exp(-x * 8) + hp(rng.standard_normal(len(x)), 2500) * np.exp(-x * 60)), at, db(g), 0)

# cortes dos planos -> whoosh nos cortes secos
cuts = sorted({float(m) for f in glob.glob("src/videos/crise/shots_*.ts") for m in re.findall(r"\{ t0: ([\d.]+)", open(f).read())})
for c in cuts[1:]: whoosh(c, -24 if c < 94 or c > 115 else -21)
# eventos
heli(0.0, 3.0, -30); ring(5.1, 7.7, -22); hit(9.5, -14); click(10.9); click(12.0); click(13.7); hit(13.2, -16)
for k in np.arange(15.5, 20.0, 0.9): click(k + rng.uniform(0, 0.3))
heli(20.35, 21.8, -16); rumble(31.55, 33.0, -16); boom(31.9, -20, 0.6); jungle(33.0, 34.4, -26, False)
for k in np.arange(40.45, 41.55, 0.11): flip(k)
hit(41.55, -12); crowd(43.56, 48.2, -24, True); crowd(49.94, 54.0, -20, True)
for k in [55.6, 56.6, 57.0, 61.0, 61.9, 62.6, 66.0, 67.0]: click(k)
spot(71.1, -12); hit(78.6, -14); hit(79.65, -16)
for k in np.arange(80.9, 83.2, 0.14): shot(k + rng.uniform(0, 0.05), -24)
jungle(83.3, 87.3, -28, False); jungle(94.08, 98.5, -24, True); jet(98.3, 2.4, -10, -0.8); heli(98.5, 100.2, -20)
for k, big in [(100.24, 1.3), (100.7, 1.0), (101.52, 1.2), (102.3, 1.0), (103.0, 0.9)]: boom(k, -4 if big > 1.1 else -7, big)
hit(103.8, -18); jungle(105.26, 109.1, -30, True); click(106.6, -18)
for k in np.arange(114.6, 117.2, 0.45): click(k + rng.uniform(0, 0.2), -22)
hit(115.9, -16); hit(118.4, -12); hit(124.45, -16); hit(128.35, -14)
for k in [126.8, 127.6, 129.0]: click(k)
flap(131.6, 133.8, -30); ring(137.78, 139.2, -28)
hit(144.7, -20); rumble(146.8, 150.8, -30, 40)
hit(160.05, -18); flap(162.9, 164.6, -22); rumble(164.8, 167.0, -18)
spot(167.7, -10); crowd(167.7, 170.4, -26, True); hit(170.05, -12)
for k in [172.4, 173.0, 174.0]: click(k)
hit(175.0, -8); hit(175.6, -14); door(180.6, -14); hit(181.7, -12)
rumble(183.0, 186.4, -12); rumble(196.16, 200.3, -14); rain(186.43, 190.55, -22); thunder(188.36, -10)
tear(201.6, -12); hit(201.6, -18); rumble(205.8, 208.9, -28, 40); hit(216.4, -14)

# ---------------- trilha original (ré menor; tensão cresce no ataque e quando Chávez entra) ----------------
def note(f, d, a=0.5, kind="pad"):
    x = tt(d)
    if kind == "pad": y = sum(np.sin(2 * np.pi * f * k * x + k) / k ** 1.5 for k in range(1, 6)) * np.minimum(1, x / 0.8) * np.minimum(1, (d - x) / 0.8)
    elif kind == "piano": y = sum(np.sin(2 * np.pi * f * k * x) * np.exp(-x * (2 + k)) / k for k in range(1, 5))
    elif kind == "bass": y = (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 1.5)
    else: y = norm(lp(rng.standard_normal(len(x)), 180)) * np.exp(-x * 9) + np.sin(2 * np.pi * 50 * x) * np.exp(-x * 10)
    return y * a
def mp(x, at):
    i = int(at * SR); n = min(len(x), N - i)
    if n > 0: mus[i:i + n] += x[:n]
F = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [(50, [62, 65, 69]), (46, [62, 65, 70]), (43, [62, 67, 70]), (45, [61, 64, 69])]          # Dm Bb Gm A
warm = [(48, [64, 67, 72]), (53, [65, 69, 72]), (50, [65, 69, 74]), (55, [62, 67, 71])]          # C F Dm G (PT, aliados)
bar = 2.4
for k, a in enumerate(np.arange(0, DUR, bar)):
    warmz = 43 <= a < 70; P = warm if warmz else prog; root, ch = P[k % 4]
    inten = 1.0 + (0.8 if 94 <= a < 121 or 167 <= a < 209 else 0) + (0.4 if 3 <= a < 37 else 0)
    mp(note(F(root - 12), bar, 0.5, "bass"), a)
    for m in ch: mp(note(F(m - 12), bar + 0.4, 0.09), a)
    for j, b in enumerate(np.arange(0, bar, bar / 4 if inten > 1.5 else bar / 2)):
        mp(note(F(ch[(j + k) % 3] + 12), 1.2, 0.12 if warmz else 0.09, "piano"), a + b)
    if inten > 1.2:
        for b in np.arange(0, bar, bar / 4): mp(note(0, 0.4, 0.35 * (inten - 1), "drum"), a + b)
mus = lp(mus, 6000)
mus *= np.minimum(1, t / 1.5) * np.clip((DUR - t) / 2.5, 0, 1)

# ---------------- mixagem: voz intocada; música abaixa sob a voz; efeitos -6 dB ----------------
with wave.open(sys.argv[1]) as w: v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768; vsr = w.getframerate()
if vsr != SR: v = signal.resample_poly(v, SR, vsr)
v = np.pad(v[:N], (0, max(0, N - len(v)))); v *= np.clip((220.55 - t) / 0.25, 0, 1)  # a frase seguinte (parte 2) começa em ~220,6 s
ev = np.sqrt(np.abs(lp(v ** 2, 4))); ev = ev / (ev.max() + 1e-9); duck = 1 - 0.55 * np.clip(ev * 6, 0, 1)
mus = norm(mus) * db(-17 + 3) * duck
sfxL, sfxR = L * db(-6), R * db(-6)
outL = v + mus + sfxL; outR = v + mus + sfxR
pk = max(np.abs(outL).max(), np.abs(outR).max())
if pk > 0.98: outL *= 0.98 / pk; outR *= 0.98 / pk
st = np.stack([outL, outR], 1)
with wave.open(sys.argv[2], "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", len(cuts), "cortes")
