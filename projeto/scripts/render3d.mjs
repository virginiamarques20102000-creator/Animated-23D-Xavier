// Render each 3D shot's frame range of Ww2Film3D to out/ww2_3d/s_<a>.mp4 (one bundle, resumable), then build a full-length
// 3D track (black filler between shots) at out/ww2_3d/track.mp4 for scripts/ww2_splice.sh.  usage: node scripts/render3d.mjs [conc] [only=a,b,...]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs"; import path from "node:path"; import { execSync } from "node:child_process";
const conc = Number(process.argv[2] || 4), only = process.argv[3]?.split(",").map(Number);
const D = "out/ww2_3d"; fs.mkdirSync(D, { recursive: true });
const src = ["a", "b"].map((k) => fs.readFileSync(`src/videos/ww2/three/shots3d_${k}.ts`, "utf8")).join("\n");
const shots = [...src.matchAll(/t0: ([0-9.]+), t1: ([0-9.]+)/g)].map((m) => [Math.ceil(Number(m[1]) * 30 - 1e-6), Math.ceil(Number(m[2]) * 30 - 1e-6) - 1]).sort((a, b) => a[0] - b[0]);
const browserExecutable = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "Ww2Film3D", browserExecutable, chromiumOptions });
for (const [a, b] of shots) {
  const out = `${D}/s_${String(a).padStart(5, "0")}.mp4`; if (only && !only.includes(a)) continue; if (!only && fs.existsSync(out)) continue;
  const t0 = Date.now();
  await renderMedia({ composition, serveUrl, codec: "h264", crf: 16, outputLocation: out + ".tmp.mp4", frameRange: [a, b], concurrency: conc, browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, logLevel: "error" });
  fs.renameSync(out + ".tmp.mp4", out); console.log("shot", a, b, ((Date.now() - t0) / 1000).toFixed(0) + "s", new Date().toTimeString().slice(0, 8));
}
// full-length track: filler black clips + shots, all 1920x1080 30 fps h264 yuv420p
const total = composition.durationInFrames, list = []; let cur = 0;
const black = (n, i) => { const f = `${D}/k_${i}.mp4`; execSync(`ffmpeg -y -v error -f lavfi -i color=black:s=1920x1080:r=30 -frames:v ${n} -c:v libx264 -crf 30 -pix_fmt yuv420p ${f}`); return f; };
shots.forEach(([a, b], i) => { if (a > cur) list.push(black(a - cur, i)); list.push(`${D}/s_${String(a).padStart(5, "0")}.mp4`); cur = b + 1; });
if (cur < total) list.push(black(total - cur, "end"));
fs.writeFileSync(`${D}/list.txt`, list.map((f) => `file '${path.resolve(f)}'`).join("\n"));
execSync(`ffmpeg -y -v error -f concat -safe 0 -i ${D}/list.txt -c copy ${D}/track.mp4`); console.log("TRACK DONE");
