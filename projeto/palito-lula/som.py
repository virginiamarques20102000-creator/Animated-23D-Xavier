"""Trilha e efeitos do short do Lula, tudo sintetizado por código, nos tempos das palavras (voz/tempos.json)."""
import json, wave, numpy as np
SR = 48000
T = json.load(open("voz/tempos.json"))
P = [p for f in T["frases"] for p in f["palavras"]]
def Wd(w, n=0):
    import unicodedata
    nm = lambda s: "".join(c for c in unicodedata.normalize("NFD", s.lower()) if c.isalnum())
    return [p["s"] for p in P if nm(p["w"]).startswith(nm(w))][n]
D = T["duracao"]; N = int(D * SR); t = np.arange(N) / SR
rng = np.random.default_rng(7)
def env(n, a, d): x = np.arange(n) / SR; return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)
def put(buf, t0, x, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x));
    if i < len(buf): buf[i:j] += g * x[: j - i]
# música: acordes I–V–vi–IV em sol maior, pad suave + baixo + clap leve, 112 bpm
mus = np.zeros(N); beat = 60 / 112
acordes = [[196, 247, 294], [147, 185, 220], [165, 196, 247], [131, 165, 196]]
for k in range(int(D / (4 * beat)) + 1):
    ac = acordes[k % 4]; t0 = k * 4 * beat; n = int(4 * beat * SR)
    x = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x) for f in ac) * np.minimum(1, x / 0.3) * np.exp(-x / 3)
    put(mus, t0, pad * 0.05)
    for b in range(4):
        nb = int(beat * SR); xb = np.arange(nb) / SR
        put(mus, t0 + b * beat, np.sin(2 * np.pi * ac[0] / 2 * xb) * env(nb, 0.005, 0.25) * 0.16)
        if b % 2: put(mus, t0 + b * beat, rng.normal(0, 1, nb) * env(nb, 0.001, 0.04) * 0.05)
        put(mus, t0 + b * beat + beat / 2, rng.normal(0, 1, nb // 4) * env(nb // 4, 0.001, 0.015) * 0.025)
sfx = np.zeros(N)
def whoosh(d=0.45):
    n = int(d * SR); x = rng.normal(0, 1, n); y = np.convolve(x, np.ones(30) / 30, "same")
    return y * np.sin(np.pi * np.arange(n) / n) ** 2 * 0.5
def boom():
    n = int(0.8 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * (55 + 90 * np.exp(-x * 20)) * x) * env(n, 0.002, 0.25) + rng.normal(0, 1, n) * env(n, 0.001, 0.05) * 0.5) * 0.9
def pop_():
    n = int(0.12 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (500 + 900 * np.exp(-x * 40)) * x) * env(n, 0.002, 0.04) * 0.5
def ding(f=1320):
    n = int(1.2 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 2.01 * x)) * env(n, 0.003, 0.35) * 0.3
def festa(d=2.0):
    n = int(d * SR); x = rng.normal(0, 1, n); y = np.convolve(x, np.ones(8) / 8, "same")
    return y * np.minimum(1, np.arange(n) / (0.1 * SR)) * np.exp(-np.arange(n) / (0.9 * SR)) * 0.35
frases = [f["s"] for f in T["frases"]]
for s in [Wd("presidente")] + frases[1:]: put(sfx, s - 0.3, whoosh())
put(sfx, Wd("prensa") - 0.02, boom())
for w, n in [("três", 1), ("eleições", 0), ("seguidas", 0)]: put(sfx, Wd(w, n), pop_())
put(sfx, Wd("quarta") - 0.05, pop_())
put(sfx, Wd("ganhou"), ding()); put(sfx, Wd("ganhou"), festa())
put(sfx, Wd("voltou"), ding(990)); put(sfx, Wd("voltou"), festa(1.6))
put(sfx, Wd("partido"), whoosh(0.8), 0.7)
with wave.open("voz/voz.wav") as f: voz = np.frombuffer(f.readframes(f.getnframes()), np.int16) / 32768
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]
# a música abaixa embaixo da voz (ducking pela energia da voz)
e = np.convolve(np.abs(voz), np.ones(4800) / 4800, "same"); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = voz + mus * duck * 1.0 + sfx * 0.55
fade = np.minimum(1, (D - t) / 0.8); mix *= fade
mix = mix / np.abs(mix).max() * 0.9
st = np.stack([mix, mix], 1)
with wave.open("voz/mix.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
print("mix pronto: voz/mix.wav", round(D, 2), "s")
