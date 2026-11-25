// Fotos rápidas do ElserFilm sem Remotion: esbuild + Chromium (Playwright), canvas.toDataURL.
// uso: node scripts/elser_stills.mjs <pasta_saida> <t1,t2,...> [escala 0.5]
import { build } from "esbuild";
import { createRequire } from "node:module";
import fs from "node:fs"; import path from "node:path";
const require_ = createRequire(import.meta.url); const { chromium } = require_("playwright");
const [out, ts, esc = "0.5"] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const tmp = path.resolve("out/elser/_stills"); fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(tmp + "/entry.ts", `import { renderFrame, SHOT_LIST } from "../../../src/videos/elser/story"; (window as any).SL = SHOT_LIST; import { VW, VH } from "../../../src/videos/ww2/engine";
const c = document.createElement("canvas"); c.width = VW; c.height = VH; document.body.appendChild(c); const g = c.getContext("2d")!;
const s = document.createElement("canvas"); const k = ${+esc}; s.width = VW * k; s.height = VH * k; const sg = s.getContext("2d")!;
(window as any).shot = (t: number) => { g.setTransform(1,0,0,1,0,0); renderFrame(g, t); sg.drawImage(c, 0, 0, s.width, s.height); return s.toDataURL("image/jpeg", 0.85); };`);
await build({ entryPoints: [tmp + "/entry.ts"], bundle: true, format: "iife", outfile: tmp + "/b.js", logLevel: "error" });
fs.writeFileSync(tmp + "/i.html", `<html><body style="margin:0"><script src="b.js"></script></body></html>`);
const nav = await chromium.launch(); const pg = await nav.newPage();
pg.on("pageerror", (e) => console.log("ERR", e.message)); pg.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 300)); });
await pg.goto("file://" + tmp + "/i.html");
let TL = ts.startsWith("mids") ? (await pg.evaluate(() => window.SL)).map((s) => +(s.t0 + (s.t1 - s.t0) * 0.6).toFixed(2)) : ts.split(",").map(Number);
if (ts.startsWith("mids:")) { const [a, b] = ts.slice(5).split("-").map(Number); TL = TL.filter((t) => t >= a && t <= b); }
for (const t of TL) { const t0 = Date.now(); const d = await pg.evaluate((t) => window.shot(t), t);
  fs.writeFileSync(path.join(out, `t${t.toFixed(2).padStart(7, "0")}.jpg`), Buffer.from(d.split(",")[1], "base64")); process.stdout.write(`${t}:${Date.now() - t0}ms `); }
console.log(); await nav.close();
