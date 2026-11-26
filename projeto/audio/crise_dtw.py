"""Alinha roteiro ao áudio por DTW: espeak-ng pt-br sintetiza cada frase, MFCC normalizado, DTW de fim aberto.
Uso: python3 audio/crise_dtw.py voz.wav roteiro.txt saida_dir"""
import sys, subprocess, tempfile, json, re, numpy as np, librosa
wav, txt, outd = sys.argv[1:4]
SR = 16000; HOP = 160
sents = [l.strip() for l in open(txt, encoding="utf8") if l.strip()]
def say(text):
    f = tempfile.mktemp(suffix=".wav")
    text = text.replace("2008", "dois mil e oito")
    subprocess.run(["espeak-ng", "-v", "pt-br", "-s", "165", "-w", f, text], check=True)
    y, _ = librosa.load(f, sr=SR); y, _ = librosa.effects.trim(y, top_db=35); return y
def feat(y):
    m = librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=HOP, n_fft=512)[1:]
    m = (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6); return m
# synthetic with word marks: synthesize words cumulatively is costly; do per-word synth lengths to split sentence proportionally
segs = []; bounds = []; pos = 0
for s in sents:
    y = say(s); segs.append(y); bounds.append((pos, pos + len(y))); pos += len(y) + int(0.3 * SR); segs.append(np.zeros(int(0.3 * SR)))
syn = np.concatenate(segs)
real, _ = librosa.load(wav, sr=SR)
A = feat(syn); B = feat(real)
# subsampled DTW (frames 10ms -> 20ms)
SUB = 4; A = A[:, ::SUB]; B = B[:, ::SUB]
D = librosa.sequence.dtw(X=A, Y=B, metric="cosine", backtrack=False)
last = D[-1] / (A.shape[1] + np.arange(1, B.shape[1] + 1))
jend = int(np.argmin(last[A.shape[1] // 2:]) + A.shape[1] // 2)
print("END at", jend * SUB * HOP / SR, "s")
D, wp = librosa.sequence.dtw(X=A, Y=B[:, :jend + 1], metric="cosine")
# subseq: free start/end in Y. we want start at 0 -> ok approx
wp = wp[::-1]
mapA = {}
for a, b in wp: mapA.setdefault(a, b)
fr = SR / HOP / SUB
# word marks: each word synthesized alone, its share of the sentence = share of summed word durations
def wdur(w):
    w = re.sub(r"[,.:?!]", "", w)
    if not w: return 0.05
    return len(say(w)) / SR + 0.04
lines = []
res = []
for i, (s0, s1) in enumerate(bounds):
    a0 = int(s0 / HOP / SUB); a1 = min(A.shape[1] - 1, int(s1 / HOP / SUB))
    t0 = mapA.get(a0, 0) / fr; t1 = mapA.get(a1, 0) / fr
    ws = sents[i].split(); du = np.array([wdur(w) for w in ws]); cs = np.concatenate([[0], np.cumsum(du)])[:-1] / du.sum()
    wt = []
    for c in cs:
        a = int((s0 + c * (s1 - s0)) / HOP / SUB); wt.append(round(mapA.get(min(a, A.shape[1] - 1), 0) / fr, 2))
    lines.append(f"{i}: " + " ".join(f"{w}@{t:.2f}" for w, t in zip(ws, wt)))
    res.append({"i": i, "t0": round(t0, 2), "t1": round(t1, 2), "text": sents[i], "words": list(zip(ws, wt))})
    print(f"{i:3d} {t0:7.2f} {t1:7.2f} {sents[i][:60]}")
json.dump(res, open(f"{outd}/dtw.json", "w"), ensure_ascii=False, indent=1)
open(f"{outd}/tempos_palavras.txt", "w").write("\n".join(lines) + "\n")
