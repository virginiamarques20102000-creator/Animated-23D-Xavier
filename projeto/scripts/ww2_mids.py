# prints frame numbers at ~60% of each shot for shots starting in [a, b): python3 scripts/ww2_mids.py a b
import re, sys, glob
a, b = float(sys.argv[1]), float(sys.argv[2])
t0s = sorted(float(x) for f in glob.glob("src/videos/ww2/shots_*.ts") for x in re.findall(r"\{ t0: ([\d.]+)", open(f).read()))
t0s.append(580.6)
print(",".join(str(int(((t0s[i] + (t0s[i + 1] - t0s[i]) * 0.6)) * 30)) for i in range(len(t0s) - 1) if a <= t0s[i] < b))
