// Render do ElserFilm sem Remotion: blocos de quadros -> mp4 (retomável). uso: node scripts/elser_render.mjs <quadroIni> <quadroFim> <pasta>
import { build } from "esbuild"; import { createRequire } from "node:module"; import fs from "node:fs"; import path from "node:path"; import { spawn } from "node:child_process";
const { chromium } = createRequire(import.meta.url)("playwright");
const [a, b, dir = "out/elser/chunks"] = process.argv.slice(2); const A = +a, B = +b, CH = +(process.env.CH || 300); fs.mkdirSync(dir, { recursive: true });
const tmp = path.resolve("out/elser/_render"); fs.mkdirSync(tmp, { recursive: true });
if (!fs.existsSync(tmp + "/b.js")) { fs.writeFileSync(tmp + "/entry.ts", `import { renderFrame } from "../../../src/videos/elser/story"; import { VW, VH } from "../../../src/videos/ww2/engine";
const c = document.createElement("canvas"); c.width = VW; c.height = VH; document.body.appendChild(c); const g = c.getContext("2d")!;
(window as any).frame = (f: number) => new Promise<string>((res) => { g.setTransform(1,0,0,1,0,0); renderFrame(g, f / 30); c.toBlob((bl) => { const r = new FileReader(); r.onload = () => res((r.result as string).split(",")[1]); r.readAsDataURL(bl!); }, "image/jpeg", 0.93); });`);
  await build({ entryPoints: [tmp + "/entry.ts"], bundle: true, format: "iife", outfile: tmp + "/b.js", logLevel: "error" }); fs.writeFileSync(tmp + "/i.html", `<html><body style="margin:0"><script src="b.js"></script></body></html>`); }
const nav = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] }); const pg = await nav.newPage(); pg.on("pageerror", (e) => console.log("ERR", e.message)); await pg.goto("file://" + tmp + "/i.html");
for (let s = A; s <= B; s += CH) {
  const e = Math.min(B, s + CH - 1), out = path.join(dir, `c_${String(s).padStart(5, "0")}.mp4`); if (fs.existsSync(out)) continue;
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out + ".tmp.mp4"]);
  const t0 = Date.now();
  for (let f = s; f <= e; f++) { const d = await pg.evaluate((f) => window.frame(f), f); if (!ff.stdin.write(Buffer.from(d, "base64"))) await new Promise((r) => ff.stdin.once("drain", r)); }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r)); fs.renameSync(out + ".tmp.mp4", out);
  console.log(`chunk ${s}-${e} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await nav.close(); console.log("DONE", A, B);
