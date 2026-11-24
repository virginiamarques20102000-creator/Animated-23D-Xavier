"""Alinha o roteiro (uma frase por linha) ao áudio sem transcrição: pausas (silencedetect) + sílabas + programação dinâmica.
Uso: python3 audio/ww2_align.py public/ww2_narracao.mp3 out/ww2/roteiro.txt out/ww2"""
import sys, re, subprocess, json, numpy as np
mp3, txt, outd = sys.argv[1:4]
NUM = {"1912": "mil novecentos e doze", "1913": "mil novecentos e treze", "1914": "mil novecentos e quatorze", "1915": "mil novecentos e quinze", "1916": "mil novecentos e dezesseis", "22": "vinte e dois", "11": "onze", "10": "dez", "XX": "vinte", "Railway": "reiluei", "Company": "câmpani", "Southern": "sâdern", "Farquhar": "farcuar", "1939": "mil novecentos e trinta e nove", "1945": "mil novecentos e quarenta e cinco", "1918": "mil novecentos e dezoito", "1919": "mil novecentos e dezenove",
       "1933": "mil novecentos e trinta e três", "1938": "mil novecentos e trinta e oito", "1940": "mil novecentos e quarenta", "1941": "mil novecentos e quarenta e um",
       "1942": "mil novecentos e quarenta e dois", "1943": "mil novecentos e quarenta e três", "1944": "mil novecentos e quarenta e quatro", "1º": "primeiro",
       "30": "trinta", "70": "setenta", "85": "oitenta e cinco", "7": "sete", "6": "seis", "8": "oito", "9": "nove", "2": "dois"}
V = "aeiouáéíóúâêôãõàüy"
def syl(w):
    w = w.lower()
    w = re.sub(r"[^a-záéíóúâêôãõàüçy]", "", w)
    w = re.sub(r"(ão|ãe|õe|ai|ei|oi|ou|au|eu|éu|ui|iu|qu[aeio]|gu[ei])", lambda m: "a" if m.group(0)[0] != "q" and m.group(0)[0] != "g" else m.group(0)[0] + "a", w)
    return max(1, len(re.findall(f"[{V}]+", w)))
sents = [l.strip() for l in open(txt, encoding="utf8") if l.strip()]
words = [s.split() for s in sents]
def wsyl(w): return sum(syl(x) for x in NUM.get(re.sub(r"[,.:?]", "", w), w).split())
S = [[wsyl(w) for w in ws] for ws in words]
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp3, "-af", "silencedetect=n=-32dB:d=0.13", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; DUR = len(a) / 16000
pauses = [(s, e) for s, e in zip(st, en)]
if pauses and pauses[0][0] < 0.05: first = pauses.pop(0)[1]
else: first = 0.0
pauses.append((DUR, DUR))
M, N = len(pauses), len(sents)
R = 5.9
def cost(i, a0, j):  # sentence i spans from a0 to pause j start
    b = pauses[j][0]; dur = b - a0
    inner = [p for p in pauses[:j] if p[0] > a0]
    speech = dur - sum(p[1] - p[0] for p in inner)
    if speech <= 0.2: return 1e9
    rate = sum(S[i]) / speech
    c = (np.log(rate / R)) ** 2 * 40
    c += sum(max(0, (p[1] - p[0]) - 0.55) * 6 for p in inner)
    c -= min(1.2, pauses[j][1] - pauses[j][0]) * 2.5  # prefer long pauses at sentence ends
    return c
INF = 1e18
dp = np.full((N + 1, M), INF); bk = np.zeros((N + 1, M), int)
starts = lambda j: first if j < 0 else pauses[j][1]
for j in range(M):
    if pauses[j][0] > first: dp[1][j] = cost(0, first, j)
for i in range(2, N + 1):
    for j in range(M):
        best, bj = INF, -1
        for k in range(max(0, j - 30), j):
            if dp[i - 1][k] >= INF: continue
            c = dp[i - 1][k] + cost(i - 1, pauses[k][1], j)
            if c < best: best, bj = c, k
        dp[i][j], bk[i][j] = best, bj
j = M - 1; ends = []
for i in range(N, 0, -1): ends.append(j); j = bk[i][j]
ends = ends[::-1]
# energy envelope (50 ms)
hop = 800; env = np.array([20 * np.log10(np.sqrt(np.mean(a[k:k + hop] ** 2)) + 1e-9) for k in range(0, len(a) - hop, hop)])
res = []; lines = []
for i in range(N):
    t0 = first if i == 0 else pauses[ends[i - 1]][1]; t1 = pauses[ends[i]][0]
    k0, k1 = int(t0 * 20), int(t1 * 20); voiced = [k for k in range(k0, k1) if k < len(env) and env[k] > -36]
    if not voiced: voiced = list(range(k0, k1))
    tot = sum(S[i]); acc = 0; wt = []
    for w, s in zip(words[i], S[i]):
        idx = voiced[min(len(voiced) - 1, int(acc / tot * len(voiced)))]; wt.append(round(idx / 20, 2)); acc += s
    wt[0] = round(t0, 2)
    speech = (t1 - t0) - sum(p[1] - p[0] for p in pauses[:ends[i]] if p[0] > t0)
    res.append({"i": i, "t0": round(t0, 2), "t1": round(t1, 2), "rate": round(tot / max(0.1, speech), 2), "text": sents[i], "words": list(zip(words[i], wt))})
    lines.append(f"{i}: " + " ".join(f"{w}@{t:.2f}" for w, t in zip(words[i], wt)))
json.dump(res, open(f"{outd}/sentences.json", "w"), ensure_ascii=False, indent=1)
open(f"{outd}/tempos_palavras.txt", "w").write("\n".join(lines) + "\n")
for r in res: print(f"{r['i']:3d} {r['t0']:7.2f}-{r['t1']:7.2f} {r['rate']:5.2f} {'!!' if r['rate'] < 4.3 or r['rate'] > 7.6 else '  '} {r['text'][:70]}")
print("DUR", DUR)
