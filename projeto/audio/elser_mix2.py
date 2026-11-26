# Trilha NOVA de "O homem que quase matou Hitler" (Georg Elser): nada reaproveitado dos outros vídeos.
# Ambientes "gravados" por síntese física (vozes de multidão com formantes, cascos, sinos, grilos, chuva em gotas,
# serrote, plaina, relógio de escape, carro 1930 por explosões de cilindro, trem a vapor), cada som num espaço
# acústico próprio (salão, rua, oficina, cela, longe) via reverb por convolução; banda bávara diegética na cervejaria.
# Música: harmônio, cítara (zither), caixinha de música, clarinete, pizzicato e tambor de moldura, em lá menor,
# abrindo para dó maior no fim. Sem pads/cordas/tímpanos dos vídeos anteriores e sem música triste no carro.
# uso: python3 audio/elser_mix2.py public/elser_narracao.mp3 out/elser/mix.wav
import subprocess, sys, wave
import numpy as np
from scipy import signal
SR = 48000; DUR = 571.32; N = int(DUR * SR); rng = np.random.default_rng(1939); F32 = np.float32
def _s(kind, f, o=2): return signal.butter(o, f, kind, fs=SR, output="sos")
def lp(x, f, o=2): return signal.sosfilt(_s("low", f, o), x)
def hp(x, f, o=2): return signal.sosfilt(_s("high", f, o), x)
def bp(x, a, b, o=2): return signal.sosfilt(_s("band", [a, b], o), x)
def db(v): return 10 ** (v / 20)
def norm(x): return x / (np.abs(x).max() + 1e-9)
def T(L): return np.arange(int(L * SR)) / SR
def nz(n): return rng.standard_normal(n)
def senv(n, fa, fb): t = np.arange(n) / SR; return np.minimum(1, t / max(fa, 1e-4)) * np.minimum(1, (n / SR - t) / max(fb, 1e-4))
def fade(x, a=0.003, b=0.02): return x * senv(len(x), a, b)
def knots(L, every, lo, hi, sm=1.0):  # suave curva aleatória
    k = int(L / every) + 3; v = rng.uniform(lo, hi, k); t = np.arange(int(L * SR)) / SR
    return np.interp(t, np.arange(k) * every, v)
def seamless(x, xf=1.0):
    m = int(xf * SR); n = len(x) - m; y = x[:n].copy(); r = np.linspace(0, 1, m); y[:m] = y[:m] * r + x[n:] * (1 - r); return y
CACHE = {}
def cached(key, f):
    if key not in CACHE: CACHE[key] = f()
    return CACHE[key]
def var(name, gen, k=8): return cached(("v", name), lambda: [gen() for _ in range(k)])[rng.integers(k)]

# ---------------- espaços acústicos ----------------
BUSES = ("dry", "room", "hall", "out", "far", "cell", "mus")
BUS = {k: (np.zeros(N, F32), np.zeros(N, F32)) for k in BUSES}
def put(bus, x, at, g=1.0, pan=None):
    if isinstance(x, (list, tuple)): return put2(bus, x, at, g)
    pan = rng.uniform(-0.45, 0.45) if pan is None else pan; a = (pan + 1) * np.pi / 4
    put2(bus, (x * np.cos(a) * 1.414, x * np.sin(a) * 1.414), at, g)
def put2(bus, pair, at, g=1.0):
    i = int(round(at * SR)); L, R = BUS[bus]
    for ch, x in zip((L, R), pair):
        x = np.asarray(x); j = i
        if j < 0: x = x[-j:]; j = 0
        n = min(len(x), N - j)
        if n > 0: ch[j:j + n] += (x[:n] * g).astype(F32)
def bed(bus, key, gen, a, b, g, fa=1.0, fb=1.0):
    n = int((b - a) * SR); pair = cached(("bed", key), lambda: (gen(), gen())); e = senv(n, fa, fb)
    off = rng.integers(0, len(pair[0]))
    put2(bus, [np.resize(np.roll(p, off), n) * e for p in pair], a, g)

# ---------------- vozes (multidão por formantes, não ruído filtrado) ----------------
VOW = [(780, 1240), (520, 1850), (320, 2250), (520, 900), (340, 780), (650, 1650), (450, 1450)]
def voice(L, excited=False, male=True, cont=1.0):
    n = int(L * SR); t = np.arange(n) / SR
    f0 = (rng.uniform(92, 135) if male else rng.uniform(175, 235)) * (1.3 if excited else 1.0)
    f = f0 * knots(L, 0.22, 0.86, 1.16) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t))
    ph = np.cumsum(f) / SR; src = lp((ph % 1) * 2 - 1, 2800) + 0.08 * nz(n)
    out = np.zeros(n); pos = int(rng.uniform(0, 1.5) * SR)
    while pos < n:
        end = min(n, pos + int(rng.uniform(1.0, 4.5 if excited else 3.2) * cont * SR))
        while pos < end:
            s = min(int(rng.uniform(0.11, 0.3 if excited else 0.24) * SR), n - pos)
            if s < 400: pos = n; break
            F1, F2 = VOW[rng.integers(len(VOW))]; seg = src[pos:pos + s]
            y = bp(seg, F1 * 0.8, F1 * 1.25) + 0.55 * bp(seg, F2 * 0.88, F2 * 1.12) + 0.12 * hp(seg, 2600)
            out[pos:pos + s] += y * np.sin(np.pi * np.arange(s) / s) ** 1.4 * rng.uniform(0.45, 1.0); pos += s
        pos = end + int(rng.uniform(0.25, 0.7 if excited else 1.6) * SR)
    return out
def clap():
    t = T(0.05); return fade(bp(nz(len(t)), rng.uniform(900, 1500), rng.uniform(3500, 6000)) * np.exp(-t / 0.007), 0.0005, 0.01)
def laugh_snd(male=None):
    male = rng.random() < 0.6 if male is None else male; f0 = rng.uniform(120, 160) if male else rng.uniform(220, 300); out = []
    for k in range(rng.integers(4, 8)):
        L = 0.15; t = T(L); f = f0 * (1.1 - 0.04 * k) * (1 - 0.15 * t / L); ph = np.cumsum(f) / SR
        s = lp((ph % 1) * 2 - 1, 2500) * 0.6 + 0.5 * nz(len(t)); y = bp(s, 650, 1000) + 0.6 * bp(s, 1300, 1900)
        out.append(y * np.sin(np.pi * t / L) ** 2); out.append(np.zeros(int(0.03 * SR)))
    return norm(np.concatenate(out))
def crowd_gen(excited=False, nv=13):
    L = 21; x = sum(voice(L, excited, rng.random() < 0.65) * rng.uniform(0.35, 1.0) for _ in range(nv))
    n = len(x)
    if excited:  # aplausos
        for c in range(26):
            at = rng.uniform(0, 0.3); r = rng.uniform(3.2, 4.4)
            while at < L - 0.1:
                i = int(at * SR); cl = clap(); x[i:i + len(cl)] += cl[: n - i] * 0.9; at += 1 / r * rng.uniform(0.92, 1.08)
    else:
        for k in range(3):
            lg = laugh_snd(); i = rng.integers(0, n - len(lg)); x[i:i + len(lg)] += lg * 0.5
    x = lp(x, 5000) + 0.05 * lp(nz(n), 500); return seamless(norm(x))
def crowd(bus, a, b, g, excited=False, fa=1.0, fb=1.0): bed(bus, "cheer" if excited else "crowd", lambda: crowd_gen(excited), a, b, db(g), fa, fb)
def orator_gen():  # discurso distante num alto-falante (sem palavras)
    x = voice(21, True, True, cont=2.5) * 1.6; x = hp(lp(x, 3200), 320); return seamless(norm(np.tanh(norm(x) * 2.5)))
def orator(a, b, g): bed("hall", "orator", orator_gen, a, b, db(g), 0.3, 0.6)

# ---------------- objetos ----------------
def modal(parts, L, click=0.3, cf=3000):
    t = T(L); x = sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / d) for f, a, d in parts)
    return x + click * hp(nz(len(t)), cf) * np.exp(-t / 0.0015)
def clink_snd():
    f = rng.uniform(1900, 3100); a = modal([(f, 1, 0.22), (f * 2.32, 0.5, 0.1), (f * 4.25, 0.25, 0.05), (f * 6.63, 0.12, 0.025)], 0.6, 0.4, 4000)
    f2 = f * rng.uniform(0.85, 1.15); b = modal([(f2, 0.8, 0.2), (f2 * 2.32, 0.4, 0.09)], 0.6, 0.3, 4000); d = int(rng.uniform(0.004, 0.012) * SR)
    a[d:] += b[:-d]; return norm(a)
def clinks(bus, a, b, rate, g):
    at = a
    while at < b: put(bus, var("clink", clink_snd), at, db(g - rng.uniform(0, 9)), rng.uniform(-0.8, 0.8)); at += rng.exponential(1 / rate)
def stein_snd(): return norm(modal([(rng.uniform(140, 190), 1, 0.05), (rng.uniform(380, 460), 0.6, 0.03)], 0.3, 0.5, 1500) + 0.3 * lp(nz(int(0.3 * SR)), 900) * np.exp(-T(0.3) / 0.06))
def knock(f1, f2, d, L=0.25, click=0.4): return modal([(f1, 1, d), (f2, 0.55, d * 0.6)], L, click, 2000)
def step_wood(): x = knock(rng.uniform(150, 220), rng.uniform(400, 560), 0.03); toe = knock(rng.uniform(260, 330), rng.uniform(700, 900), 0.015) * 0.4; d = int(0.06 * SR); x[d:] += toe[:-d]; return norm(x)
def step_stone():
    x = knock(rng.uniform(500, 800), rng.uniform(1200, 1800), 0.012, 0.2, 0.6); t = T(0.2); x += 0.4 * bp(nz(len(t)), 2000, 7000) * np.exp(-(t - 0.05) ** 2 / 0.0006)
    return norm(x)
def boot(): x = step_stone(); t = T(0.2); return norm(x + 1.6 * lp(nz(len(t)), 220) * np.exp(-t / 0.03))
def steps(bus, a, b, rate, g, kind="stone"):
    gen = {"stone": step_stone, "wood": step_wood, "boot": boot}[kind]; at = a; k = 0; pan = rng.uniform(-0.4, 0.4)
    while at < b: put(bus, var(kind, gen), at, db(g - (k % 2) * 2.5 - rng.uniform(0, 1.5)), pan); at += 1 / rate * rng.uniform(0.95, 1.05); k += 1
def march(bus, a, b, period, g, n=12):
    k = 0
    while a + k * period < b:
        for s in range(n): put(bus, var("boot", boot), a + k * period + rng.normal(0, 0.014), db(g - 9 - rng.uniform(0, 6) - (k % 2) * 1.5), rng.uniform(-0.9, 0.9))
        k += 1
def paper(bus, at, g, L=0.45):  # papel amassando/folheando: estalinhos densos
    n = int(L * SR); x = np.zeros(n); idx = rng.integers(0, n - 100, int(L * 260))
    for i in idx: x[i:i + 60] += nz(60) * np.exp(-np.arange(60) / 12) * rng.uniform(0.2, 1)
    x = bp(x, 1800, 8000) + 0.15 * bp(nz(n), 600, 3000) * np.sin(np.pi * np.arange(n) / n); put(bus, norm(x) * senv(n, 0.03, 0.1), at, db(g))
def stamp(bus, at, g): put(bus, norm(knock(rng.uniform(200, 250), 520, 0.05, 0.3, 0.8) + 0.4 * lp(nz(int(0.3 * SR)), 1800) * np.exp(-T(0.3) / 0.02)), at, db(g))
def typewriter(bus, a, b, g):
    at = a; k = 0
    while at < b:
        key = modal([(rng.uniform(1100, 1500), 0.6, 0.02), (rng.uniform(2600, 3400), 0.3, 0.008)], 0.12, 1.0, 5000); put(bus, key, at, db(g - rng.uniform(0, 4)), 0.1)
        at += rng.uniform(0.07, 0.19) + (0.25 if rng.random() < 0.08 else 0); k += 1
    put(bus, modal([(2637, 1, 0.5), (2637 * 2.76, 0.3, 0.2)], 1.0, 0.2), b, db(g - 2), 0.3)  # sininho do fim da linha
    t = T(0.35); put(bus, bp(nz(len(t)), 1000, 5000) * np.sin(np.pi * t / 0.35) * 0.5, b + 0.2, db(g - 4), 0.2)
def teleprinter(bus, a, b, g):
    at = a
    while at < b: put(bus, modal([(rng.uniform(900, 1300), 0.5, 0.015)], 0.08, 1.0, 4000), at, db(g - rng.uniform(0, 3)), -0.2); at += 1 / 6.7
    t = T(b - a); put(bus, (np.sin(2 * np.pi * 60 * t) + 0.4 * np.sin(2 * np.pi * 120 * t)) * senv(len(t), 0.2, 0.2) * 0.25, a, db(g - 6), -0.2)

# ---------------- relógio de escape (tic e tac diferentes) ----------------
def tick_snd(hi=True):
    p = [(3100, 1, 0.012), (4700, 0.6, 0.008), (7200, 0.3, 0.004)] if hi else [(2300, 1, 0.014), (3500, 0.6, 0.009), (5900, 0.3, 0.005)]
    return norm(modal([(f * rng.uniform(0.98, 1.02), a, d) for f, a, d in p], 0.08, 0.8, 4000))
def clock(bus, a, b, g, period=0.5, muff=False):
    k = 0
    while a + k * period < b:
        x = var("tick" if k % 2 == 0 else "tock", lambda: tick_snd(k % 2 == 0), 4)
        put(bus, lp(x, 1400) * 2 if muff else x, a + k * period, db(g - (0 if k % 2 == 0 else 2.5)), 0.15); k += 1
def watch(bus, a, b, g, period=0.2):  # mecanismo do timer: tique fininho + engrenagem
    k = 0
    while a + k * period < b: put(bus, hp(var("tick", lambda: tick_snd(True), 4), 4000), a + k * period, db(g - (k % 4 != 0) * 4), -0.1); k += 1
    t = T(b - a); put(bus, bp(np.sign(np.sin(2 * np.pi * 37 * t)) * nz(len(t)) * 0.3, 2000, 6000) * senv(len(t), 0.3, 0.3), a, db(g - 14), -0.1)

# ---------------- oficina ----------------
def saw(bus, a, b, g, period=0.62):
    k = 0
    while a + k * period < b:
        L = period * 0.92; t = T(L); push = k % 2 == 0; teeth = rng.uniform(110, 160) * (1.15 if push else 0.9)
        e = np.sin(np.pi * t / L) ** 0.8; fr = 1 + 0.5 * np.sign(np.sin(2 * np.pi * teeth * t + 2 * np.sin(2 * np.pi * 7 * t)))
        x = bp(nz(len(t)) * fr, 1500, 6500) * (0.6 + 0.4 * t / L) + 0.5 * hp(nz(len(t)) * fr, 3500) * t / L + 0.4 * lp(nz(len(t)) * fr, 500)
        put(bus, norm(x) * e, a + k * period, db(g - (0 if push else 4)), 0.1); k += 1
def plane_wood(bus, a, b, g, period=1.25):
    k = 0
    while a + k * period < b:
        L = 0.55; t = T(L); gr = 1 + 0.6 * np.sign(lp(nz(len(t)), 300))
        x = bp(nz(len(t)) * gr, 1500, 9000) * np.minimum(1, t / 0.04) * np.exp(-np.maximum(0, t - 0.4) / 0.04)
        put(bus, norm(x), a + k * period, db(g), -0.1); put(bus, knock(180, 420, 0.04), a + k * period + 0.62, db(g - 10), -0.1); k += 1
def mallet(bus, a, b, rate, g):
    k = 0
    while a + k / rate < b:
        x = knock(rng.uniform(200, 250), rng.uniform(520, 600), 0.05, 0.4, 0.5) + 0.5 * modal([(rng.uniform(2400, 3000), 0.6, 0.02)], 0.4, 0.2)
        put(bus, norm(x), a + k / rate + rng.uniform(-0.03, 0.03), db(g - rng.uniform(0, 3)), 0.15); k += 1
def chisel(bus, a, b, rate, g):  # cinzel raspando a pedra/madeira (dentro da coluna)
    k = 0
    while a + k / rate < b:
        L = rng.uniform(0.25, 0.45); t = T(L); x = bp(nz(len(t)) * (1 + np.sign(np.sin(2 * np.pi * rng.uniform(60, 120) * t))), 2000, 8000) * np.sin(np.pi * t / L)
        put(bus, norm(x), a + k / rate, db(g - rng.uniform(0, 4)), -0.2); k += 1
def creak(bus, at, g, L=0.8):
    t = T(L); rate = rng.uniform(35, 80) * (1 + 0.4 * np.sin(np.pi * t / L)); ph = np.cumsum(rate) / SR
    x = bp((np.diff(np.floor(ph), prepend=0) > 0) * 1.0 + 0.02 * nz(len(t)), 350, 1600); put(bus, norm(x) * senv(len(t), 0.1, 0.2), at, db(g))
def metal(bus, at, g, big=True):  # porta de ferro / grade
    p = [(140, 1, 1.6), (331, 0.7, 1.1), (612, 0.5, 0.7), (977, 0.35, 0.45), (1468, 0.2, 0.3)] if big else [(820, 1, 0.3), (1930, 0.5, 0.18), (3150, 0.3, 0.08)]
    put(bus, norm(modal([(f * rng.uniform(0.95, 1.05), a, d) for f, a, d in p], 2.4 if big else 0.6, 0.8, 1500)), at, db(g))
def bolt(bus, at, g):
    t = T(0.35); put(bus, norm(bp(nz(len(t)) * (1 + np.sign(np.sin(2 * np.pi * 70 * t))), 1000, 4000)) * senv(len(t), 0.02, 0.05), at, db(g)); metal(bus, at + 0.35, g - 6, False)
def keys(bus, at, g):
    for k in range(7): put(bus, modal([(rng.uniform(3000, 6500), 0.6, 0.05)], 0.2, 0.2), at + rng.uniform(0, 0.4), db(g - rng.uniform(0, 8)))

# ---------------- rua / natureza ----------------
def hooves(bus, a, b, g):
    cyc = 1.1; k = 0; pan = rng.uniform(-0.5, 0.5)
    while a + k * cyc < b:
        for j, dt in enumerate([0, 0.24, 0.55, 0.79]):
            x = knock(rng.uniform(700, 1100), rng.uniform(1500, 2100), 0.015, 0.15, 0.8); put(bus, x, a + k * cyc + dt + rng.normal(0, 0.01), db(g - (j % 2) * 3), pan)
        k += 1
    t = T(b - a); put(bus, lp(nz(len(t)) * (1 + np.sign(lp(nz(len(t)), 30))), 400) * senv(len(t), 0.5, 0.5) * 0.4, a, db(g - 6), pan)
def church_bell(f=196.0, L=7.0):
    return norm(modal([(f * r, a, d) for r, a, d in [(0.5, 0.7, 4.5), (1, 1, 3.2), (1.19, 0.6, 2.4), (1.5, 0.45, 1.9), (2.0, 0.4, 1.4), (2.51, 0.25, 0.9), (2.66, 0.2, 0.8), (3.01, 0.15, 0.6), (4.07, 0.1, 0.3)]], L, 0.3, 1500))
def bells(bus, at, n, g, f=196.0, gap=2.2):
    for k in range(n): put(bus, cached(("cb", f), lambda: church_bell(f)), at + k * gap, db(g), 0.4)
def tram_bell(bus, at, g):
    x = modal([(1350, 1, 0.5), (1350 * 2.76, 0.4, 0.2), (1350 * 5.4, 0.15, 0.08)], 0.9, 0.3); put(bus, x, at, db(g), -0.5); put(bus, x, at + 0.2, db(g - 2), -0.5)
def coo():
    out = []
    for L, f, gg in [(0.22, 430, 0.6), (0.5, 480, 1), (0.3, 410, 0.7)]:
        t = T(L); fr = f * (1 + 0.08 * np.sin(np.pi * t / L)); x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (0.7 + 0.3 * np.sin(2 * np.pi * 26 * t))
        out += [lp(x, 1200) * np.sin(np.pi * t / L) * gg, np.zeros(int(0.08 * SR))]
    return np.concatenate(out)
def sparrows(bus, a, b, n, g):
    for _ in range(n):
        at = rng.uniform(a, max(a, b - 0.6)); pan = rng.uniform(-0.8, 0.8)
        for k in range(rng.integers(2, 6)):
            L = rng.uniform(0.04, 0.07); t = T(L); f = rng.uniform(5000, 6800) - rng.uniform(1500, 2500) * t / L
            put(bus, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / L), at + k * rng.uniform(0.08, 0.12), db(g - rng.uniform(0, 5)), pan)
def pigeons(bus, a, b, n, g):
    for _ in range(n): put(bus, coo(), rng.uniform(a, max(a, b - 1.3)), db(g - rng.uniform(0, 4)))
def crickets_gen():
    L = 21; n = int(L * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for c in range(5):
        fc = rng.uniform(4200, 5400); per = rng.uniform(0.45, 0.9); e = np.zeros(n); at = rng.uniform(0, per)
        while at < L - 0.2:
            for p in range(3): i = int((at + p * 0.028) * SR); e[i:i + int(0.016 * SR)] += np.hanning(int(0.016 * SR))
            at += per * rng.uniform(0.97, 1.03)
        x += np.sin(2 * np.pi * fc * t) * e * rng.uniform(0.3, 1)
    return seamless(norm(x) + 0.02 * hp(nz(n), 3000))
def crickets(bus, a, b, g): bed(bus, "crickets", crickets_gen, a, b, db(g), 1.0, 1.0)
def dog(bus, at, g):
    for k in range(rng.integers(1, 3)):
        L = 0.16; t = T(L); f = rng.uniform(380, 520) * (1 - 0.3 * t / L); s = lp(((np.cumsum(f) / SR) % 1) * 2 - 1, 3000) + 0.4 * nz(len(t))
        put(bus, norm(bp(s, 500, 900) + 0.6 * bp(s, 1300, 2000)) * np.sin(np.pi * t / L) ** 0.5, at + k * 0.32, db(g), 0.6)
def owl(bus, at, g):
    for k, (L, f) in enumerate([(0.35, 380), (0.6, 360)]): t = T(L); put(bus, np.sin(2 * np.pi * f * t) * np.sin(np.pi * t / L) ** 2, at + k * 0.6, db(g), -0.6)
def caw(bus, at, g):
    for k in range(rng.integers(2, 4)):
        L = 0.32; t = T(L); f = rng.uniform(480, 560) * (1 - 0.2 * t / L); s = (((np.cumsum(f) / SR) % 1) * 2 - 1) * (1 + 0.5 * np.sin(2 * np.pi * 70 * t)) + 0.3 * nz(len(t))
        put(bus, norm(bp(s, 900, 1400) + 0.7 * bp(s, 2000, 2800)) * np.sin(np.pi * t / L) ** 0.7, at + k * 0.42, db(g), 0.5)
def wind_gen():
    L = 21; n = int(L * SR); gust = knots(L, 1.4, 0.15, 1.0) ** 1.6
    x = bp(np.cumsum(nz(n)) * 0.02, 60, 900) ; x = norm(x - lp(x, 40)) * gust
    wf = knots(L, 2.0, 550, 1100); wh = np.sin(2 * np.pi * np.cumsum(wf) / SR) * gust ** 3 * 0.12
    return seamless(norm(x + wh + 0.2 * hp(nz(n), 3000) * gust ** 2))
def wind(bus, a, b, g): bed(bus, "wind", wind_gen, a, b, db(g), 1.2, 1.2)
def rain_gen():
    L = 21; n = int(L * SR); x = 0.3 * bp(nz(n), 1500, 9000) + 0.25 * lp(nz(n), 500)
    for _ in range(int(L * 45)):
        d = int(0.03 * SR); t = np.arange(d) / SR; f0 = rng.uniform(1500, 4500); i = rng.integers(0, n - d)
        x[i:i + d] += np.sin(2 * np.pi * f0 * (1 - 0.35 * t / 0.03) * t) * np.exp(-t / 0.007) * rng.uniform(0.2, 1.2)
    return seamless(norm(x))
def rain(bus, a, b, g): bed(bus, "rain", rain_gen, a, b, db(g), 0.8, 0.8)
def city_gen():  # cidade de 1938: murmúrio distante, cascos e rodas ao longe, sem trânsito moderno
    L = 21; n = int(L * SR); x = 0.5 * lp(nz(n), 350) + 0.3 * lp(sum(voice(L, False, rng.random() < 0.5) for _ in range(5)), 1800)
    return seamless(norm(x))
def city(bus, a, b, g): bed(bus, "city", city_gen, a, b, db(g), 1.0, 1.0)
def roomtone_gen(): L = 21; n = int(L * SR); t = np.arange(n) / SR; return seamless(norm(0.6 * lp(nz(n), 250) + 0.2 * sum(np.sin(2 * np.pi * 50 * k * t) / k for k in (1, 2, 3))))
def roomtone(bus, a, b, g): bed(bus, "room", roomtone_gen, a, b, db(g), 0.6, 0.6)
def bulb(bus, a, b, g):
    t = T(b - a); x = sum(np.sin(2 * np.pi * 100 * k * t) / k ** 1.3 for k in range(1, 8)) * (1 + 0.3 * (lp(nz(len(t)), 8) > 0.02)); put(bus, norm(x) * senv(len(t), 0.3, 0.3), a, db(g), 0.3)
def fire_gen():
    L = 21; n = int(L * SR); x = 0.6 * lp(nz(n), 400) * knots(L, 0.7, 0.5, 1.0); cr = np.zeros(n)
    for _ in range(int(L * 30)):
        m = int(rng.uniform(0.002, 0.012) * SR); i = rng.integers(0, n - m); cr[i:i + m] += nz(m) * np.exp(-np.arange(m) / (m / 4)) * rng.pareto(2.5)
    return seamless(norm(x + 0.6 * hp(cr, 1000)))
def fire(bus, a, b, g): bed(bus, "fire", fire_gen, a, b, db(g), 0.6, 1.0)

# ---------------- motores ----------------
def engine(L, r0, r1, heavy=False, road=True, f_res=85):  # explosões dos cilindros (não um zumbido)
    n = int(L * SR); t = np.arange(n) / SR; r = r0 + (r1 - r0) * np.clip(t / max(L * 0.7, 1e-3), 0, 1) + rng.uniform(-0.5, 0.5) * np.sin(2 * np.pi * 0.7 * t)
    ph = np.cumsum(r) / SR; fire_i = np.flatnonzero(np.diff(np.floor(ph)) > 0); imp = np.zeros(n); imp[fire_i] = rng.uniform(0.6, 1.0, len(fire_i))
    kt = np.arange(int(0.08 * SR)) / SR; ker = np.sin(2 * np.pi * f_res * kt) * np.exp(-kt / (0.03 if heavy else 0.02)) + 0.5 * lp(nz(len(kt)), 1500) * np.exp(-kt / 0.006)
    x = signal.fftconvolve(imp, ker)[:n] + 0.05 * np.sin(2 * np.pi * r * 9 * t)
    if road: x += 0.35 * lp(nz(n) * (lp(nz(n), 25) > 0.05), 500)
    return norm(x)
def car(bus, a, b, g, mode="in", pan=0.0):
    L = b - a; x = engine(L, 13 if mode != "out" else 22, 22 if mode == "in" else 13 if mode == "out" else 14, road=mode != "idle")
    t = T(L)[: len(x)]; e = np.clip(t / (L * 0.8), 0.15, 1) if mode == "in" else np.clip(1 - t / (L * 0.9), 0.1, 1) if mode == "out" else senv(len(x), 0.4, 0.4)
    put(bus, x * e * senv(len(x), 0.2, 0.3), a, db(g), pan)
def bulbhorn(bus, at, g):
    for k in range(2):
        t = T(0.22); x = (((np.cumsum(np.full(len(t), 390.0)) / SR) % 1) * 2 - 1); put(bus, norm(bp(x, 700, 1600) + 0.4 * lp(x, 600)) * np.sin(np.pi * t / 0.22) ** 0.5, at + k * 0.3, db(g), 0.3)
def cardoor(bus, at, g):
    put(bus, norm(modal([(120, 1, 0.08), (260, 0.6, 0.05), (900, 0.3, 0.02)], 0.5, 0.7, 2500)), at, db(g), 0.2); metal(bus, at + 0.01, g - 12, False)
def train(bus, a, b, g):
    at = a; k = 0
    while at < b:
        L = 0.22; t = T(L); put(bus, norm(bp(nz(len(t)), 300, 2500)) * np.exp(-t / 0.07), at, db(g - (k % 4 != 0) * 3), -0.2); at += 0.27; k += 1
    k = 0
    while a + k * 0.9 < b: put(bus, knock(900, 1700, 0.02), a + k * 0.9, db(g - 4)); put(bus, knock(850, 1650, 0.02), a + k * 0.9 + 0.13, db(g - 6)); k += 1
    t = T(1.6); w = sum(np.sin(2 * np.pi * f * t) for f in (523, 659, 784)) + 0.6 * bp(nz(len(t)), 500, 2500); put(bus, w * senv(len(t), 0.1, 0.5) * 0.4, a + 0.3, db(g - 2), 0.4)
def prop_planes(bus, a, b, g):
    L = b - a; t = T(L); x = sum(lp(np.sign(np.sin(2 * np.pi * f * t + rng.uniform(0, 6))), 600) for f in (88, 90.5, 93, 176.5)) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.5 * t))
    put(bus, norm(x) * np.sin(np.pi * t / L) ** 1.2, a, db(g), 0.0)
def tank(bus, a, b, g):
    L = b - a; x = engine(L, 9, 11, heavy=True, f_res=55); t = T(L)[: len(x)]; sq = np.sin(2 * np.pi * (2600 + 400 * np.sin(2 * np.pi * 0.8 * t)) * t) * (np.sin(2 * np.pi * 1.1 * t) > 0.85) * 0.15
    put(bus, (x + sq) * senv(len(x), 0.8, 0.8), a, db(g))
def artillery(at, g): put("far", norm(lp(nz(int(2.5 * SR)), 140) * np.exp(-T(2.5) / 0.5) + 0.6 * np.sin(2 * np.pi * 38 * T(2.5)) * np.exp(-T(2.5) / 0.3)), at, db(g - 4))
def radio(bus, a, b, g):
    t = T(b - a); n = len(t); pops = (rng.random(n) < 30 / SR) * rng.uniform(-1, 1, n); v = cached("rv", lambda: voice(21, True, True, 2.0)); v = np.resize(v, n)
    x = 0.5 * bp(nz(n), 900, 3500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t)) + bp(v, 450, 2800) * 1.4 + 3 * hp(pops, 1000) + 0.1 * np.sin(2 * np.pi * (900 + 600 * t / t[-1]) * t)
    put(bus, norm(x) * senv(n, 0.15, 0.2), a, db(g), -0.3)

# ---------------- explosão ----------------
def explosion(at, g=0):
    L = 5.0; t = T(L); sub = np.sin(2 * np.pi * (26 + 30 * np.exp(-t / 0.15)) * t) * np.exp(-t / 1.2)
    body = lp(nz(len(t)), 260) * np.exp(-t / 1.4) * np.minimum(1, t / 0.01); crk = hp(nz(len(t)), 2500) * np.exp(-t / 0.012)
    put("hall", norm(sub + 1.4 * body + 0.8 * crk), at, db(g), 0.0); put("dry", norm(sub + body), at, db(g - 4), 0.0)
def collapse(at, dur, g):
    for _ in range(int(dur * 9)): put("hall", knock(rng.uniform(70, 160), rng.uniform(200, 400), 0.08, 0.6, 0.6), at + rng.uniform(0, dur) ** 1.2, db(g - rng.uniform(0, 8)), rng.uniform(-0.8, 0.8))
    for _ in range(int(dur * 25)): put("hall", knock(rng.uniform(600, 1800), rng.uniform(1900, 3500), 0.01, 0.12, 0.8), at + rng.uniform(0, dur * 1.3), db(g - 10 - rng.uniform(0, 10)), rng.uniform(-0.9, 0.9))
    for _ in range(3): creak("hall", at + rng.uniform(-0.6, dur), g - 6, rng.uniform(0.6, 1.2))
def glass_break(bus, at, g):
    for k in range(24): f = rng.uniform(2500, 7500); put(bus, modal([(f, 0.6, 0.04), (f * 2.3, 0.3, 0.02)], 0.25, 0.8, 4000), at + rng.uniform(0, 0.7) ** 1.5, db(g - rng.uniform(0, 12)), rng.uniform(-0.9, 0.9))
def tinnitus(at, L, g): t = T(L); put("dry", np.sin(2 * np.pi * 3850 * t) * np.minimum(1, t / 0.3) * np.exp(-t / (L / 3)), at, db(g), 0.0)

# ================= música =================
A2 = 110.0
def hz(s, base=A2): return base * 2 ** (s / 12)
CH = {"Am": [0, 7, 12, 15], "F": [-4, 3, 8, 12], "C": [3, 10, 15, 19], "G": [-2, 5, 10, 14], "E": [-5, 2, 7, 11], "Bb": [1, 8, 13, 17], "Dm": [5, 12, 17, 20], "Em": [-5, 2, 7, 10], "Gsus": [-2, 5, 10, 12]}
def harmonium(semis, L, fa=0.8, fb=1.0, bright=1700):
    t = T(L); out = [np.zeros(len(t)), np.zeros(len(t))]
    for s in semis:
        f = hz(s)
        for ch, det in ((0, -0.0011), (1, 0.0012)):
            ph = 2 * np.pi * f * (1 + det) * t; out[ch] += sum(np.sin(k * ph + k) / k ** 1.1 for k in range(1, 9) if k * f < 5000)
    e = senv(len(t), fa, fb) * (0.92 + 0.08 * np.sin(2 * np.pi * 0.21 * t)); return [lp(o, bright) * e / len(semis) for o in out]
def harm(names, a, b, g, beat=None, bright=1700):
    if beat is None: put2("mus", harmonium(CH[names] if isinstance(names, str) else names, b - a, 1.0, 1.2, bright), a, db(g)); return
    k = 0
    while a + k * beat < b - 0.2:
        nm = names[k % len(names)]; s0 = a + k * beat; put2("mus", harmonium(CH[nm], min(beat + 0.6, b - s0 + 0.6), 0.35, 0.6, bright), s0, db(g)); k += 1
def pluck(f, L=2.5, pos=0.15, decay=2.0, inh=0.0002, bright=1.0):
    def g():
        t = T(L); x = np.zeros(len(t))
        for k in range(1, 26):
            if k * f > 9000: break
            fk = k * f * np.sqrt(1 + inh * k * k); a = abs(np.sin(np.pi * k * pos)) / k ** (1.5 - 0.4 * bright); x += a * np.sin(2 * np.pi * fk * t) * np.exp(-t / (decay / (1 + 0.12 * k ** 1.3)))
        x += 0.03 * hp(nz(len(t)), 3000) * np.exp(-t / 0.003); return norm(fade(x, 0.001, 0.1))
    return cached(("pl", round(f, 2), L, pos, decay), g)
def zither(s, at, g, L=3.0, pan=None): put("mus", pluck(hz(s, 220), L, 0.12, 2.6, 0.0003, 1.0), at, db(g), pan)
def pizz(s, at, g, pan=None): put("mus", pluck(hz(s), 1.0, 0.28, 0.45, 0.0, 0.3), at, db(g), pan)
def mbox_note(s, at, g, base=880.0, detune=0.0):
    f = base * 2 ** ((s + detune) / 12); put("mus", cached(("mb", round(f, 1)), lambda: norm(modal([(f, 1, 1.4), (f * 6.27, 0.22, 0.1), (f * 17.55, 0.06, 0.03)], 1.8, 0.15, 6000))), at, db(g), rng.uniform(-0.3, 0.3))
MB = {"Am": [0, 3, 7, 12, 7, 3, 7, 12], "F": [-4, 0, 3, 8, 3, 0, 3, 8], "C": [3, 7, 10, 15, 10, 7, 10, 15], "E": [-5, -1, 2, 7, 2, -1, 2, 7], "G": [-2, 2, 5, 10, 5, 2, 5, 10], "Bb": [-11, -7, -4, 1, -4, -7, -4, 1]}
def mbox(a, prog, g, step=0.3, slow=0.0, detune=0.0, base=880.0):
    at = a; st = step
    for nm in prog:
        for s in MB[nm]: mbox_note(s, at, g, base, detune * rng.uniform(-1, 1)); at += st; st *= 1 + slow
    return at
def clarinet(s, at, L, g, base=220.0):
    f = hz(s, base); t = T(L); vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / 0.6); ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(a * np.sin(k * ph) for k, a in [(1, 1), (2, 0.04), (3, 0.38), (4, 0.03), (5, 0.2), (7, 0.1), (9, 0.05)]) + 0.03 * bp(nz(len(t)), f * 2, f * 4)
    put("mus", lp(x, 3500) * senv(len(t), 0.09, 0.25), at, db(g), 0.15)
ELSER = [(0, 0, 1), (1, 3, 0.5), (1.5, 5, 0.5), (2, 7, 1.5), (3.5, 5, 0.5), (4, 3, 1), (5, 2, 0.5), (5.5, 0, 0.5), (6, -1, 2), (8, 0, 1), (9, 3, 0.5), (9.5, 5, 0.5), (10, 7, 1), (11, 8, 1), (12, 7, 1), (13, 5, 0.5), (13.5, 3, 0.5), (14, 2, 2)]
_MAJ = {0: 3, 2: 5, 3: 7, 5: 8, 7: 10, 8: 12, 10: 14, 11: 14}
ELSER_C = [(b, 12 * (s // 12) + _MAJ[s % 12], d) for b, s, d in ELSER]  # mesmo tema, graus de dó maior
def melody(inst, a, beat, g, line=ELSER, upto=None, tr=0):
    for b, s, d in line[:upto]:
        if inst == "zither": zither(s + tr, a + b * beat, g, max(2.2, d * beat + 1.2), 0.1)
        else: clarinet(s + tr, a + b * beat, d * beat * 0.95, g)
def arp(chs, a, b, g, step=0.27, pat=(0, 1, 2, 3, 2, 1)):
    k = 0; at = a
    while at < b:
        nm = chs[(k // len(pat)) % len(chs)]; s = CH[nm][pat[k % len(pat)]] + 12; zither(s, at, g - (k % len(pat) != 0) * 2, 2.4, -0.3 + 0.6 * (k % 2)); at += step; k += 1
def ostinato(a, b, g, step=0.3, notes=(0, 12, 0, 12, 1, 13, 0, 12)):
    k = 0
    while a + k * step < b: pizz(notes[k % len(notes)] - 12, a + k * step, g - (k % 2) * 3, -0.2); k += 1
def _frame(f):
    t = T(1.4); fr = f * (1 + 0.08 * np.exp(-t / 0.05)); ph = 2 * np.pi * np.cumsum(fr) / SR
    return norm(np.sin(ph) * np.exp(-t / 0.35) + 0.4 * np.sin(1.59 * ph) * np.exp(-t / 0.15) + 0.25 * np.sin(2.14 * ph) * np.exp(-t / 0.08) + 0.35 * lp(nz(len(t)), 1500) * np.exp(-t / 0.006))
def drum(at, g, f=68): put("mus", cached(("fd", f), lambda: _frame(f)), at, db(g), 0.0)
def drums(a, b, g, period, pat=(1, 0, 0.6, 0)):
    k = 0
    while a + k * period < b:
        v = pat[k % len(pat)]
        if v: drum(a + k * period, g + 20 * np.log10(v), 68 if v >= 1 else 92)
        k += 1
def rim(at, g): put("mus", cached("rim", lambda: norm(modal([(1800, 1, 0.008), (3100, 0.6, 0.005)], 0.06, 0.6, 4000))), at, db(g), 0.25)
def rims(a, b, g, step=0.25):
    k = 0
    while a + k * step < b: rim(a + k * step, g - (k % 4 != 0) * 5); k += 1
def lowhorn(s, at, L, g):
    f = hz(s, 55); t = T(L); ph = 2 * np.pi * f * t; br = np.minimum(1, t / (L * 0.5))
    x = sum(np.sin(k * ph) / k ** (1.6 - 0.5 * br) for k in range(1, 11)); put("mus", lp(x, 1200) * senv(len(t), 0.4, 0.6), at, db(g), 0.0)
def bellhit(at, g, f=220.0):
    put("mus", cached(("bh", f), lambda: church_bell(f, 5.0)), at, db(g), 0.0)
def subdrop(at, g): t = T(1.8); put("mus", np.sin(2 * np.pi * np.cumsum(28 + 40 * np.exp(-t / 0.25)) / SR) * np.exp(-t / 0.7) * np.minimum(1, t / 0.005), at, db(g), 0.0)
def swell(end, L, g):  # sopro reverso que puxa para o corte
    t = T(L); x = hp(nz(len(t)), 1500) * (t / L) ** 3 + 0.4 * np.sin(2 * np.pi * (200 + 600 * (t / L) ** 2) * t) * (t / L) ** 4; put("mus", fade(x, 0.01, 0.005), end - L, db(g), 0.0)
def hit(at, g=-14, f=220.0): swell(at, 0.9, g - 8); bellhit(at, g, f); subdrop(at, g - 2)
def oompah_gen():  # banda bávara (tuba + acordeão + trompete) — 8 compassos de polca em si bemol
    beat = 0.536; bars = 8; L = bars * 2 * beat + 1.2; n = int(L * SR); x = np.zeros(n); Bb = 116.54
    prog = ["I", "I", "V", "V", "V", "V", "I", "I"]; chords = {"I": [0, 4, 7], "V": [7, 11, 14, 17]}; roots = {"I": (0, 7), "V": (7, 2)}
    def tone(f, Lt, harm=8, ex=1.2, att=0.02):
        t = np.arange(int(Lt * SR)) / SR; y = sum(np.sin(2 * np.pi * f * k * t) / k ** ex * np.minimum(1, t / (att * k ** 0.5)) for k in range(1, harm + 1) if f * k < 6000)
        return y * senv(len(t), 0.005, 0.06)
    def add(y, at): i = int(at * SR); m = min(len(y), n - i); x[i:i + m] += y[:m]
    mel = [(0, 7, 1), (1, 9, 0.5), (1.5, 11, 0.5), (2, 12, 1), (3, 12, 1), (4, 14, 0.5), (4.5, 12, 0.5), (5, 11, 1), (6, 9, 1), (7, 7, 1),
           (8, 9, 0.5), (8.5, 11, 0.5), (9, 12, 1), (10, 14, 1), (11, 12, 1), (12, 7, 1), (13, 4, 1), (14, 0, 2)]
    for bi, ch in enumerate(prog):
        for bt in range(2):
            at = (bi * 2 + bt) * beat; r = roots[ch][bt]; add(tone(Bb / 2 * 2 ** (r / 12), beat * 0.8, 6, 1.0, 0.03) * 1.2, at)
            for s in chords[ch]: add(tone(Bb * 2 ** (s / 12), beat * 0.35, 10, 1.0, 0.004) * 0.25, at + beat / 2)
    for b0, s, d in mel: add(tone(Bb * 2 * 2 ** (s / 12), d * beat * 0.9, 9, 0.9, 0.03) * 0.35, b0 * beat)
    return seamless(norm(lp(x, 2600)), 1.0)
def oompah(a, b, g): bed("hall", "oompah", oompah_gen, a, b, db(g), 1.5, 1.5)

# ================= eventos (tempos das palavras) =================
B = 311.84
# --- gancho
city("out", 0, 3.9, -34); bells("far", 0.3, 2, -26, 196, 2.6)
clock("room", 3.9, 7.2, -16, 0.5); hit(5.45, -12, 220)
rain("out", 7.15, 10.0, -26); steps("out", 7.4, 9.9, 1.7, -24, "stone")
crowd("out", 10.0, 12.6, -26, True, 0.5, 0.5); march("out", 10.2, 12.6, 0.55, -18)
clock("room", 12.63, 16.2, -14, 0.5)
fire("out", 16.23, 18.3, -22); artillery(16.4, -6); artillery(17.3, -8); tank("out", 16.3, 18.2, -20)
sparrows("out", 18.3, 22.0, 7, -30); city("out", 18.3, 22.0, -34)
march("out", 22.1, 24.6, 0.62, -14)
paper("room", 25.0, -22); roomtone("room", 24.7, 27.3, -34)
wind("out", 27.3, 30.0, -26); sparrows("out", 27.5, 29.8, 2, -34)
roomtone("room", 30.1, 34.9, -36); saw("room", 30.1, 32.4, -18); plane_wood("room", 32.5, 34.8, -18)
rain("out", 34.9, 37.4, -30); explosion(38.1, -10); glass_break("out", 38.2, -22)
crowd("out", 38.9, 40.2, -24, True, 0.2, 0.4); prop_planes("out", 40.2, 42.1, -14)
paper("room", 44.9, -16); paper("room", 45.5, -18); clock("room", 44.8, 46.3, -18, 0.25)
city("out", 46.3, 50.9, -34); paper("room", 46.6, -20)
march("out", 50.9, 57.2, 0.6, -14); crowd("out", 51, 57, -32)
[stamp("room", 58.4 + k * 0.45, -10) for k in range(4)]
rain("out", 58.9, 60.4, -26); car("out", 58.9, 60.3, -18, "in"); cardoor("out", 59.6, -12)
paper("room", 60.5, -22); paper("room", 61.4, -22)
# carro chega: banda de metais da cidade + aplausos (sem música triste)
crowd("out", 63.1, 65.9, -18, True, 0.3, 0.6); car("out", 63.1, 65.8, -20, "idle"); bulbhorn("out", 63.4, -18)
wind("out", 65.8, 68.4, -28); artillery(66.6, -10); artillery(67.7, -12)
fire("out", 68.4, 71.8, -22); [collapse(68.9, 0.6, -22)]
crowd("out", 71.9, 75.9, -22, True, 0.4, 0.6)
city("out", 75.9, 77.4, -34); pigeons("out", 75.9, 77.3, 1, -28); tram_bell("out", 76.3, -26)
roomtone("room", 77.4, 81.8, -36); mallet("room", 77.4, 79.7, 1.6, -18); plane_wood("room", 79.7, 81.8, -18)
city("out", 81.8, 87.0, -33); steps("out", 83.3, 87, 1.8, -24, "stone"); hooves("out", 81.9, 85.5, -28)
radio("room", 87.1, 89.6, -24); paper("room", 87.4, -20)
march("out", 89.7, 92.5, 0.6, -14); tank("out", 92.5, 94.7, -18); artillery(93.4, -6); artillery(93.9, -8)
roomtone("room", 94.8, 105.4, -34); clock("room", 94.8, 105.4, -26, 1.0)
[stamp("room", at, -14) for at in [96.9, 98.3, 98.6, 98.9]]
[clinks("room", 100.15 + i * 0.18, 100.2 + i * 0.18, 30, -18) for i in range(4)]
sparrows("out", 101, 104.5, 5, -30); wind("out", 101, 104.8, -32)
metal("room", 107.0, -18, False)
wind("out", 110.1, 113.2, -24); owl("far", 111.2, -26)
steps("out", 113.3, 116.5, 2.0, -26, "stone"); march("out", 116.5, 119.3, 0.55, -14)
[paper("room", 121.4 + k * 0.35, -18) for k in range(5)]
rain("out", 124.9, 130.0, -32); car("out", 124.9, 126.6, -20, "in"); bulbhorn("out", 125.1, -22); crowd("out", 125.3, 127.8, -20, True, 0.4, 0.6)
bells("far", 130.9, 3, -24, 220, 1.6)
crowd("hall", 132.0, 140.2, -20); oompah(131.8, 140.2, -22); clinks("hall", 132.0, 140.0, 2.5, -18); [put("hall", var("stein", stein_snd), 132.4 + k * 0.7, db(-20)) for k in range(8)]
march("out", 134.2, 138.8, 0.58, -16)
clinks("hall", 139.3, 139.4, 30, -10)
crowd("hall", 140.2, 152.9, -30); orator(140.4, 152.6, -30); clock("room", 143.9, 147.6, -22, 0.5)
# --- o plano
crowd("hall", 152.9, 161.3, -36); roomtone("room", 152.9, 161.3, -36)
clock("room", 161.3, 163.7, -18, 0.5)
roomtone("room", 163.8, 177.0, -34); mallet("room", 163.8, 166.2, 1.3, -24); explosion(166.6, -22); paper("room", 168.0, -16)
watch("room", 168.8, 177.0, -20); [metal("room", 169 + k * 0.7, -26, False) for k in range(10)]
city("out", 177.9, 182.5, -30); steps("out", 177.9, 182.4, 1.8, -22, "stone"); hooves("out", 178.4, 182.0, -30); tram_bell("out", 180.2, -26)
crowd("hall", 182.5, 185.4, -28); clinks("hall", 182.6, 185.2, 2, -22); steps("hall", 182.6, 184.7, 1.6, -26, "wood")
roomtone("hall", 185.4, 197.6, -34); [creak("hall", 186.0 + k * 0.9, -22, 0.5) for k in range(2)]; steps("hall", 185.4, 188.1, 1.2, -26, "wood")
for a0, b0 in [(189.4, 197.5), (216.2, 218.3)]: chisel("hall", a0, b0, 1.4, -22)
mallet("hall", 190.0, 197.0, 0.7, -26); clock("hall", 197.8, 199.9, -26, 1.0)
roomtone("hall", 199.9, 216.2, -34); steps("hall", 203.4, 205.9, 1.6, -18, "wood")
metal("hall", 206.45, -8, False); stein_snd and put("hall", stein_snd(), 206.5, db(-10))
steps("hall", 209.2, 211.0, 1.4, -18, "boot"); bolt("hall", 211.8, -8)
roomtone("hall", 216.2, 236.4, -34); chisel("hall", 218.3, 221.8, 1.4, -22); mallet("hall", 218.6, 221.6, 0.8, -24)
paper("hall", 222.0, -16); watch("hall", 223.2, 229.0, -16); [metal("hall", 226.2 + k * 0.12, -24, False) for k in range(4)]
crowd("hall", 229, 236.3, -38); clock("hall", 229, 236.3, -28, 1.0)
put("hall", knock(160, 380, 0.06, 0.4), 239.2, db(-14)); metal("hall", 239.25, -20, False)
wind("out", 240.5, 244.1, -30); clock("room", 240.5, 244.1, -26, 1.0)
paper("room", 244.3, -18)
crowd("hall", 248.5, 257.9, -20); oompah(248.4, 258.1, -20); clinks("hall", 248.7, 257.6, 3, -18); steps("hall", 252.2, 254.4, 2.2, -26, "wood")
crowd("hall", 257.9, 260.2, -12, True, 0.2, 0.6); march("hall", 257.9, 259.3, 0.5, -16, 6)
crowd("hall", 259.9, 273.4, -34); orator(260.0, 291.6, -26); watch("hall", 264.7, 268.5, -14, 0.2)
tinn = None
clock("room", 277.0, 279.8, -20, 0.5); crowd("hall", 279.8, 289.9, -36)
crowd("hall", 291.7, 294.6, -18, True, 0.2, 0.5)
clock("room", 294.8, 301.6, -22, 0.5); steps("hall", 297.8, 300.0, 1.8, -22, "boot"); cardoor("out", 300.0, -14); car("out", 300.2, 301.8, -18, "out")
watch("hall", 301.7, B - 0.02, -14, 0.2); crowd("hall", 305.5, 311.0, -26)
# --- A EXPLOSÃO
explosion(B, 0); collapse(B + 0.15, 2.2, -8); glass_break("hall", B + 0.1, -12); crowd("hall", B + 0.2, B + 1.9, -18, True, 0.05, 0.6)
tinnitus(B + 0.4, 5.0, -26)
fire("hall", 312.8, 331.8, -24)
[put("hall", knock(rng.uniform(70, 110), 260, 0.1, 0.8, 0.5), at, db(-6)) for at in [316.8, 318.65, 319.6, 320.25]]; collapse(316.6, 2.0, -12); collapse(318.7, 1.5, -14)
crowd("hall", 322.4, 331.8, -34); wind("out", 326.2, 331.8, -32)
train("out", 331.8, 334.4, -16)
clock("room", 334.4, 337.8, -14, 0.5)
roomtone("room", 337.8, 349.0, -34); [paper("room", 339.0 + k * 0.2, -22) for k in range(6)]; clock("room", 341.9, 344.7, -20, 0.5); crowd("hall", 344.7, 349.0, -32)
steps("out", 349.0, 351.2, 1.8, -20, "boot"); cardoor("out", 351.3, -8)
wind("out", 352.9, 356.4, -26); steps("out", 353.0, 356.3, 1.5, -26, "stone"); crickets("out", 352.9, 356.4, -34)
artillery(357.1, -14); city("out", 356.4, 359.1, -36)
roomtone("cell", 359.1, 362.8, -30); bulb("cell", 359.1, 362.8, -34); clock("cell", 359.1, 362.8, -28, 1.0)
wind("out", 362.8, 367.3, -30); crickets("out", 362.8, 375.3, -32); dog("far", 364.0, -24); owl("far", 365.6, -28)
wind("out", 367.3, 375.3, -26); steps("out", 367.3, 370.2, 1.4, -24, "stone"); steps("out", 370.2, 371.8, 3.0, -18, "boot"); bolt("out", 371.75, -14); dog("far", 373.0, -22)
roomtone("cell", 375.3, 389.0, -32); bulb("cell", 375.3, 389.0, -36); [stamp("cell", 375.6 + k * 0.67, -18) for k in range(6)]
metal("cell", 379.5, -18, False); [metal("cell", 382.9 + k * 0.45, -18, False) for k in range(4)]; paper("cell", 386.4, -14)
teleprinter("room", 389.1, 390.6, -16); clock("room", 390.5, 392.8, -20, 0.5)
stamp("room", 394.7, -4)
rain("out", 396.5, 399.3, -24); car("out", 396.5, 398.1, -18, "in"); [cardoor("out", 397.6 + k * 0.3, -16) for k in range(3)]
roomtone("cell", 399.2, 409.8, -30); bulb("cell", 399.2, 401.8, -30); put("cell", knock(110, 260, 0.08, 0.5), 400.65, db(-8))
put("cell", knock(120, 280, 0.08, 0.5), 403.45, db(-6)); stamp("cell", 405.6, -8)
wind("out", 406.1, 409.8, -30); radio("room", 409.9, 414.5, -26)
roomtone("room", 417.6, 433.5, -36)
keys("cell", 421.2, -20); bolt("cell", 422.0, -16); clock("cell", 421.0, 426.1, -24, 1.0)
wind("out", 426.1, 427.7, -24); radio("room", 427.7, 430.4, -28)
wind("out", 433.5, 440.1, -32); roomtone("cell", 440.1, 451.4, -30); bulb("cell", 440.1, 446.0, -32); put("cell", knock(110, 250, 0.08, 0.5), 442.1, db(-8)); [paper("cell", 443.0 + k * 0.2, -16) for k in range(4)]
typewriter("cell", 446.1, 449.7, -20); stamp("cell", 449.9, -6)
prop_planes("out", 451.4, 456.6, -14); artillery(453.4, -4); artillery(455.6, -6); tank("out", 451.6, 456.6, -20)
wind("out", 456.7, 459.0, -32); metal("cell", 457.0, -18, True)
fire("out", 462.7, 467.5, -20); prop_planes("out", 462.7, 467.5, -22); [artillery(at, -10) for at in [459.9, 460.6, 463.5, 465.8]]
wind("out", 467.5, 474.6, -32); metal("cell", 470.7, -14, True); keys("cell", 471.5, -22); wind("out", 474.6, 478.2, -28)
wind("out", 478.2, 480.9, -28); tank("out", 480.9, 484.4, -18); artillery(482.0, -10); wind("out", 484.5, 487.8, -32)
wind("out", 487.8, 495.3, -30); caw("far", 492.0, -24); caw("far", 494.0, -28); dog("far", 490.5, -28)
[paper("room", 495.8 + k * 0.4, -18) for k in range(4)]; roomtone("room", 495.3, 499.1, -34)
wind("out", 499.1, 503.5, -34); roomtone("cell", 503.5, 507.2, -32); artillery(504.6, -18)
sparrows("out", 507.2, 512.6, 6, -30); city("out", 507.2, 512.7, -36); city("out", 512.7, 518.9, -34); pigeons("out", 513.0, 518.5, 2, -28); bells("far", 514.5, 3, -26, 196, 2.4)
roomtone("room", 518.9, 522.7, -36); clock("room", 518.9, 522.6, -28, 1.0)
crowd("out", 522.7, 528.8, -34)
sparrows("out", 528.9, 531.4, 5, -28); march("out", 532.5, 533.8, 0.25, -20, 6)
crowd("out", 535.3, 538.5, -28, True, 0.5, 0.8); wind("out", 538.6, 544.4, -28)
roomtone("room", 544.4, 550.2, -36); plane_wood("room", 544.4, 546.7, -20); clock("room", 546.7, 550.2, -18, 0.5); wind("out", 550.2, 562.1, -32)
clock("room", 562.1, 566.2, -14, 0.5)

# --- música (lá menor; dó maior no fim)
harm([-12, -5, 0], 0, 7.4, -30, bright=900); mbox(0.6, ["Am", "F", "E"], -24, 0.3)
ostinato(7.2, 16.2, -26, 0.32); harm(["Am", "Bb", "Am", "E"], 7.1, 16.2, -30, 2.3); drum(10.0, -16); drum(12.6, -18)
[drum(at, -12) for at in (16.3, 16.9, 17.5)]; lowhorn(0, 16.2, 2.2, -24); lowhorn(1, 16.2, 2.2, -27)
arp(["C", "G"], 18.4, 22.0, -26, 0.3)
lowhorn(0, 22.0, 8.0, -30); [pizz(s, at, -22) for s, at in [(0, 22.2), (0, 23.4), (-2, 24.3), (1, 26.85), (0, 28.2)]]; drum(24.3, -18); drum(26.85, -18)
melody("zither", 30.2, 0.55, -20, ELSER, 9); harm(["Am", "F", "C", "G"], 30.1, 34.9, -32, 1.1)
ostinato(34.9, 42.1, -25, 0.27); harm(["Am", "Bb"], 34.9, 42.1, -30, 1.8); drum(37.3, -16); drum(37.7, -18)
swell(44.7, 0.8, -24); mbox(44.75, ["E"], -26, 0.2, 0.06); harm([-5, 2, 7], 42.1, 50.9, -31, bright=800)
drums(50.9, 63.0, -18, 0.6, (1, 0, 0.5, 0.5)); ostinato(51.0, 63.0, -27, 0.3, (0, 0, 1, 0, 0, 0, -1, 0)); lowhorn(0, 51.0, 6.0, -28); lowhorn(1, 57.3, 5.8, -28)
hit(60.4, -18, 196); hit(61.3, -20, 175)
harm([-24, -23, -12], 65.9, 71.9, -28, bright=500); drum(66.6, -16); drum(67.7, -18); rims(68.4, 71.8, -26, 0.5)
melody("clarinet", 72.0, 0.45, -24, ELSER, 5, -12)
melody("zither", 77.4, 0.6, -21, ELSER); harm(["Am", "F", "C", "G"], 75.9, 87.1, -32, 1.2)
ostinato(87.1, 89.7, -26, 0.3); harm(["Dm", "E"], 87.1, 89.7, -30, 1.3)
drums(89.7, 94.7, -16, 0.6, (1, 0.5, 1, 0)); lowhorn(0, 89.7, 5.0, -26)
harm([-12, 0, 3], 94.8, 100.9, -31, bright=900); [subdrop(94.9 + k * 1.7, -26) for k in range(3)]; mbox(96.8, ["Am", "F"], -26, 0.26)
harm(["C", "G"], 100.9, 105.5, -28, 2.3, 1500); arp(["C", "G"], 101.0, 105.4, -27, 0.28)
[drum(107.1 + k * 0.6, -18) for k in range(4)]; harm([-12, -11], 105.5, 110.1, -30, bright=600)
mbox_note(0, 110.3, -22); harm([-12, -5], 110.1, 113.2, -32, bright=700)
harm(["Am", "E"], 113.2, 123.8, -31, 2.6); ostinato(119.4, 123.8, -26, 0.3)
hit(124.05, -16, 220)
march_d = drums(134.2, 138.8, -18, 0.58, (1, 0.6))
harm([-12, -5, 0], 140.2, 152.9, -33, bright=700)
harm(["Am", "F"], 152.9, 161.3, -31, 3.0); mbox(153.0, ["Am", "F", "C", "E"], -26, 0.26)
ostinato(161.3, 168.8, -25, 0.3); drum(163.8, -16); drum(166.6, -14)
mbox(168.8, ["Am", "F", "C", "E", "Am", "F", "C", "E", "Am", "F"], -24, 0.1); rims(168.8, 177.0, -24, 0.2)
melody("zither", 178.0, 0.5, -22, ELSER, 9); harm(["Am", "F", "C", "G"], 177.9, 185.3, -32, 1.0)
harm([-12, -5], 185.3, 200.4, -33, bright=600); [clarinet(s, at, 2.5, -27, 110) for s, at in [(12, 189.6), (15, 192.6), (14, 195.4)]]
[subdrop(200.6 + k * 1.2, -26) for k in range(12)]; ostinato(203.4, 216.2, -28, 0.45); hit(206.45, -20, 233)
ostinato(216.3, 229.0, -26, 0.3); mbox(218.4, ["Am", "F", "C", "E"], -27, 0.3); harm(["Am", "Bb"], 229.0, 236.4, -29, 1.8)
harm([-12, -5, 0], 236.4, 248.4, -32, bright=700); hit(244.45, -12, 196)
ostinato(260.9, 273.4, -26, 0.25); rims(264.7, 273.3, -26, 0.25); [drum(268.6 + k * 0.5, -20) for k in range(9)]
hit(273.43, -16, 233); harm([1, 0, 12], 273.4, 294.7, -32, bright=700)
ostinato(277.0, 294.7, -26, 0.2, (0, 12, 1, 13)); rims(277.0, 294.7, -28, 0.2)
ostinato(294.7, B - 0.05, -24, 0.18, (0, 12, 1, 13)); [drum(301.7 + k * 0.72, -18 + k * 0.4) for k in range(14)]; swell(B - 0.02, 3.2, -19)
[bellhit(318.0 + k * 4.4, -22, 110) for k in range(3)]; harm([-24, -12], 316.0, 331.8, -30, bright=400)
mbox(332.0, ["Am", "F", "E", "Am"], -22, 0.3, 0.06, 0.7)
harm(["Am", "F", "G", "E"], 337.8, 352.9, -30, 2.7); drum(344.7, -16)
harm([-12, -5], 352.9, 375.3, -33, bright=600); [clarinet(s, at, 2.2, -27, 110) for s, at in [(12, 353.4), (13, 356.6), (12, 359.4), (8, 363.0)]]; ostinato(362.8, 375.2, -28, 0.6); drum(371.0, -14)
ostinato(375.3, 396.4, -26, 0.25, (0, 0, 1, 0)); lowhorn(0, 379.2, 6, -28); lowhorn(1, 385.4, 4, -28); hit(387.35, -16, 220)
ostinato(396.5, 417.6, -25, 0.25, (0, 12, 1, 0)); [drum(399.2 + k * 0.8, -18) for k in range(7)]; lowhorn(1, 401.8, 8, -28); hit(415.65, -16, 233)
harm(["Am", "F", "C", "G"], 417.7, 433.5, -30, 2.0, 1500); melody("zither", 421.2, 0.55, -20, ELSER); mbox(426.3, ["C", "G", "Am", "F"], -28, 0.3)
harm([-12, -5], 433.5, 451.4, -33, bright=600); [clarinet(s, at, 3.0, -28, 110) for s, at in [(12, 434.0), (10, 437.5), (8, 441.0), (7, 446.5)]]
drums(451.4, 467.5, -16, 0.45, (1, 0, 0.6, 0.6, 1, 0, 0.6, 0)); lowhorn(0, 451.5, 8, -26); lowhorn(1, 459.6, 7.8, -26); hit(459.9, -16, 175)
harm([-12, -5, 0], 467.5, 487.8, -33, bright=600); [mbox_note(s, 468.0 + k * 1.9, -28) for k, s in enumerate([12, 7, 3, 0, 3, 7, 12, 10, 7, 3])]; drum(478.3, -16)
bellhit(488.2, -18, 147); bellhit(492.35, -20, 147); melody("clarinet", 489.0, 0.7, -25, ELSER, 9, -12); harm([-12, -5, 0], 487.8, 499.1, -33, bright=600)
harm(["Am", "F"], 499.1, 512.6, -31, 3.3)
harm(["C", "G", "Am", "F"], 512.7, 522.6, -29, 2.4, 1600); melody("zither", 513.0, 0.52, -20, ELSER_C, 9)
harm([-9, -2, 3], 522.6, 541.0, -32, bright=800); mbox(522.8, ["C", "G"], -27, 0.3); [pizz(s, at, -24) for s, at in [(3, 529.0), (-2, 531.5), (0, 535.4), (-4, 538.7)]]
harm(["C", "G", "Am", "F"], 541.0, 562.1, -28, 2.6, 1800); arp(["C", "G", "Am", "F"], 541.0, 562.0, -27, 0.32, (0, 1, 2, 3, 2, 1, 2, 1)); melody("clarinet", 550.3, 0.6, -24, ELSER_C, None, -12)
mbox_note(15, 562.4, -22); mbox_note(10, 563.4, -24); mbox_note(3, 565.1, -26); hit(563.4, -16, 196)
harm("C", 566.3, DUR, -26, None, 2000); [zither(s, 566.4 + k * 0.08, -20, 4.5) for k, s in enumerate([3, 10, 15, 19, 22])]; mbox(567.7, ["C"], -24, 0.35)
bellhit(570.1, -20, 262)

# ================= voz + espaços + mix =================
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
voice_v = np.frombuffer(raw, np.float32).astype(np.float64); v = np.zeros(N); v[:min(N, len(voice_v))] = voice_v[:N]
e = lp(np.abs(v), 4); e /= e.max() + 1e-9
def IR(L, damp, er=(), metal_=False, pre=0.012):
    n = int(L * SR); t = np.arange(n) / SR; out = []
    for c in range(2):
        x = nz(n) * np.exp(-t * 6.9 / L); x = lp(x, damp) + 0.3 * hp(nz(n) * np.exp(-t * 6.9 / (L * 0.4)), damp)
        if metal_: x = x + 0.6 * (bp(x, 380, 440) + bp(x, 880, 960) + bp(x, 1650, 1780))
        x[: int(pre * SR)] = 0
        for dt, g in er: x[int(dt * SR * rng.uniform(0.95, 1.05))] += g * np.sqrt(np.sum(x ** 2)) * 0.2
        out.append(x / np.sqrt(np.sum(x ** 2)))
    return out
SPACE = {"dry": (IR(0.3, 5000), 0.10), "room": (IR(0.7, 4500, ((0.007, 1), (0.013, 0.7))), 0.30), "hall": (IR(2.4, 3800, ((0.021, 1), (0.037, 0.8))), 0.42),
         "out": (IR(1.0, 4000, ((0.11, 1.2), (0.23, 0.7))), 0.22), "far": (IR(3.5, 2200), 0.75), "cell": (IR(1.1, 3500, metal_=True), 0.40), "mus": (IR(2.8, 5000), 0.28)}
def render(k):
    (iL, iR), w = SPACE[k]; L, R = BUS[k]; L = L.astype(np.float64); R = R.astype(np.float64)
    if k == "far": L = lp(L, 2500); R = lp(R, 2500)
    wl = signal.oaconvolve(L, iL)[:N]; wr = signal.oaconvolve(R, iR)[:N]
    return L * (1 - w * 0.5) + wl * w, R * (1 - w * 0.5) + wr * w
fxL = np.zeros(N); fxR = np.zeros(N)
for k in BUSES[:-1]: a, b = render(k); fxL += a; fxR += b; print("bus", k, flush=True)
muL, muR = render("mus")
vr = np.sqrt(np.mean(v[np.abs(e) > 0.15] ** 2)); act = np.abs(e) > 0.15
def rms(x): return np.sqrt(np.mean(x ** 2))
gm = vr * db(-19) / (rms(muL + muR) / 2 + 1e-9); gf = vr * db(-17) / (rms(fxL + fxR) / 2 + 1e-9)
print("voz rms", vr, "ganho musica dB", 20 * np.log10(gm), "ganho fx dB", 20 * np.log10(gf))
dm = 1 - 0.5 * np.clip(e * 3, 0, 1); df = 1 - 0.35 * np.clip(e * 3, 0, 1)
mixL = v + muL * gm * dm + fxL * gf * df; mixR = v + muR * gm * dm + fxR * gf * df
def soft(x, th=0.85): a = np.abs(x); return np.where(a > th, np.sign(x) * (th + (1 - th) * np.tanh((a - th) / (1 - th))), x)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); print("pico", pk)
mixL = soft(mixL / max(1, pk / 1.3)); mixR = soft(mixR / max(1, pk / 1.3))
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([mixL, mixR], 1), -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", round(N / SR, 2))
