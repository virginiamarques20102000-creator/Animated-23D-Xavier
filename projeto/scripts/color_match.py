# Iguala a cor e o brilho do nosso vídeo às referências do usuário.
# Mede (sem a faixa de legenda) a média das sombras (20 % mais escuros), a média geral e a média das luzes (20 % mais
# claros) por canal, e a saturação; escreve um filtro ffmpeg (curves por canal + eq=saturation) que leva os nossos números
# para os da referência. Uso:
#   python3 scripts/color_match.py nosso.mp4 ref1.mp4 [ref2.mp4 ...] [--k 0.8] > out/grade_filter.txt
#   ffmpeg -i nosso.mp4 -vf "$(cat out/grade_filter.txt)" ...
import sys, subprocess
import numpy as np

def frames(path, n=24):
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={n / d},scale=135:240", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135, 3).astype(np.float64) / 255
    a = np.concatenate([a[:, :100], a[:, 150:]], 1)   # drop the caption band
    return a.reshape(-1, 3)

def stats(x):
    L = x @ [0.2126, 0.7152, 0.0722]
    lo, hi = L <= np.percentile(L, 20), L >= np.percentile(L, 80)
    mx, mn = x.max(1), x.min(1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0).mean()
    return dict(sh=x[lo].mean(0), mid=x.mean(0), hi=x[hi].mean(0), sat=sat, lum=L.mean())

args = [a for a in sys.argv[1:] if not a.startswith("--")]
k = float(sys.argv[sys.argv.index("--k") + 1]) if "--k" in sys.argv else 0.8
if "--k" in sys.argv: args.remove(sys.argv[sys.argv.index("--k") + 1])
ours, refs = stats(frames(args[0])), [stats(frames(r)) for r in args[1:]]
tgt = {key: np.mean([r[key] for r in refs], 0) for key in ("sh", "mid", "hi", "sat", "lum")}
curves = []
for c, name in enumerate("rgb"):
    xs = [0.0, ours["sh"][c], ours["mid"][c], ours["hi"][c], 1.0]
    ys = [0.0 + k * max(0.0, tgt["sh"][c] - ours["sh"][c]) * 0.35, ours["sh"][c] + k * (tgt["sh"][c] - ours["sh"][c]),
          ours["mid"][c] + k * (tgt["mid"][c] - ours["mid"][c]), ours["hi"][c] + k * (tgt["hi"][c] - ours["hi"][c]), 1.0]
    for i in range(1, 5): ys[i] = max(ys[i], ys[i - 1] + 0.01)   # keep it monotone
    ys = [min(1.0, y) for y in ys]
    curves.append(f"{name}='" + " ".join(f"{x:.3f}/{y:.3f}" for x, y in zip(xs, ys)) + "'")
satf = 1 + k * (tgt["sat"] / ours["sat"] - 1)
print(f"curves={':'.join(curves)},eq=saturation={satf:.3f}")
print(f"# ours lum {ours['lum']:.3f} sat {ours['sat']:.3f} | target lum {tgt['lum']:.3f} sat {tgt['sat']:.3f}", file=sys.stderr)
